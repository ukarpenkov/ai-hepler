import { describe, it, expect, vi, beforeEach } from "vitest";
import { parseJobDescriptionTool } from "../parse-job-description.tool.js";

describe("parseJobDescriptionTool", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns ParsedJob on success", async () => {
    const mockResponse = {
      choices: [{ message: { content: JSON.stringify({ role: "Frontend Developer", level: "senior", skills: ["React", "TypeScript"], keywords: ["frontend", "ui"], domain: "web" }) } }],
    };
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify(mockResponse), { status: 200 }));

    const result = await parseJobDescriptionTool("We need a senior frontend developer with React experience", { apiKey: "test" });
    expect(result.role).toBe("Frontend Developer");
    expect(result.level).toBe("senior");
    expect(result.skills).toEqual(["React", "TypeScript"]);
  });

  it("throws on invalid JSON from LLM", async () => {
    const mockResponse = {
      choices: [{ message: { content: "not json" } }],
    };
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify(mockResponse), { status: 200 }));

    await expect(parseJobDescriptionTool("test", { apiKey: "test" })).rejects.toThrow("Invalid JSON in LLM response");
  });

  it("throws on HTTP error", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("error", { status: 500, statusText: "Internal Server Error" }));

    await expect(parseJobDescriptionTool("test", { apiKey: "test" })).rejects.toThrow("OpenRouter API error: 500");
  });
});
