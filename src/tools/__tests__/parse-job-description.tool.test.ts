import { describe, it, expect, vi, beforeEach } from "vitest";
import { parseJobDescriptionTool } from "../parse-job-description.tool.js";
import { validateWithSchema } from "../../security/schemas.js";
import { JobProfileSchema } from "../../security/schemas.js";

describe("parseJobDescriptionTool", () => {
  const testConfig = { apiKey: "test", baseUrl: "https://api.deepseek.com", model: "deepseek-chat" };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns ParsedJob on success", async () => {
    const mockResponse = {
      choices: [{ message: { content: JSON.stringify({ role: "Frontend Developer", level: "senior", skills: ["React", "TypeScript"], keywords: ["frontend", "ui"], domain: "web" }) } }],
    };
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify(mockResponse), { status: 200 }));

    const result = await parseJobDescriptionTool("We need a senior frontend developer with React experience", testConfig);
    expect(result.role).toBe("Frontend Developer");
    expect(result.level).toBe("senior");
    expect(result.skills).toEqual(["React", "TypeScript"]);
  });

  it("calls correct URL with config baseUrl", async () => {
    const mockResponse = {
      choices: [{ message: { content: JSON.stringify({ role: "Dev", level: "junior", skills: ["JS"], keywords: ["dev"], domain: "web" }) } }],
    };
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify(mockResponse), { status: 200 }));

    await parseJobDescriptionTool("test", testConfig);
    expect(fetchSpy).toHaveBeenCalledWith(
      "https://api.deepseek.com/chat/completions",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("throws on invalid JSON from LLM", async () => {
    const mockResponse = {
      choices: [{ message: { content: "not json" } }],
    };
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify(mockResponse), { status: 200 }));

    await expect(parseJobDescriptionTool("test", testConfig)).rejects.toThrow("Invalid JSON in LLM response");
  });

  it("throws on HTTP error", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("error", { status: 500, statusText: "Internal Server Error" }));

    await expect(parseJobDescriptionTool("test", testConfig)).rejects.toThrow("LLM API error: 500");
  });

  it("output conforms to JobProfileSchema", async () => {
    const mockResponse = {
      choices: [{ message: { content: JSON.stringify({ role: "Dev", level: "middle", skills: ["JS"], keywords: ["dev"], domain: "web" }) } }],
    };
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify(mockResponse), { status: 200 }));

    const result = await parseJobDescriptionTool("test text for validation", testConfig);
    const validated = validateWithSchema(JobProfileSchema, result);
    expect(validated.role).toBe("Dev");
    expect(validated.level).toBe("middle");
  });
});
