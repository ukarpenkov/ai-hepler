import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { parseJobTool } from "../parse-job.tool.js";
import { FunctionTool } from "@google/adk";

describe("parseJobTool", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.restoreAllMocks();
    process.env = { ...originalEnv };
    process.env.DEEPSEEK_API_KEY = "test-api-key";
    process.env.LLM_BASE_URL = "https://api.deepseek.com";
    process.env.LLM_MODEL = "deepseek-chat";
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("is a FunctionTool instance", () => {
    expect(parseJobTool).toBeInstanceOf(FunctionTool);
  });

  it("has correct name", () => {
    expect(parseJobTool.name).toBe("parseJobDescription");
  });

  it("has description", () => {
    expect(parseJobTool.description).toContain("Extracts structured job profile");
  });

  it("calls LLM API with correct parameters", async () => {
    const mockResponse = {
      choices: [
        {
          message: {
            content: JSON.stringify({
              role: "Backend Developer",
              level: "middle",
              skills: ["Python", "FastAPI", "PostgreSQL"],
              softSkills: ["teamwork"],
              keywords: ["REST API", "microservices"],
              domain: "fintech",
              language: "en",
              minYearsExperience: 3,
            }),
          },
        },
      ],
    };

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      }),
    );

    const result = await parseJobTool.runAsync({
      args: { jobText: "We are looking for a Python developer..." },
    } as never);

    expect(fetch).toHaveBeenCalledWith(
      "https://api.deepseek.com/chat/completions",
      expect.objectContaining({
        method: "POST",
        headers: {
          Authorization: "Bearer test-api-key",
          "Content-Type": "application/json",
        },
      }),
    );

    const body = JSON.parse(
      (fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body,
    );
    expect(body.model).toBe("deepseek-chat");
    expect(body.messages).toHaveLength(2);
    expect(body.messages[0].role).toBe("system");
    expect(body.messages[1].role).toBe("user");
    expect(body.messages[1].content).toContain("job description");

    const resultObj = result as Record<string, unknown>;
    expect(resultObj.role).toBe("Backend Developer");
    expect(resultObj.level).toBe("middle");
    expect(resultObj.skills).toEqual(["Python", "FastAPI", "PostgreSQL"]);
    expect(resultObj.domain).toBe("fintech");
    expect(resultObj.minYearsExperience).toBe(3);
  });

  it("handles invalid JSON response", async () => {
    const mockResponse = {
      choices: [{ message: { content: "This is not valid JSON" } }],
    };

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      }),
    );

    await expect(
      parseJobTool.runAsync({
        args: { jobText: "Some job description" },
      } as never),
    ).rejects.toThrow("No JSON found in LLM response");
  });

  it("handles missing required fields", async () => {
    const mockResponse = {
      choices: [
        {
          message: {
            content: JSON.stringify({
              role: "Developer",
              level: "junior",
              skills: ["JavaScript"],
            }),
          },
        },
      ],
    };

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      }),
    );

    await expect(
      parseJobTool.runAsync({
        args: { jobText: "Some job description" },
      } as never),
    ).rejects.toThrow("Missing required fields in parsed job");
  });

  it("handles API error response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 429,
        statusText: "Too Many Requests",
      }),
    );

    await expect(
      parseJobTool.runAsync({
        args: { jobText: "Some job description" },
      } as never),
    ).rejects.toThrow("LLM API error: 429 Too Many Requests");
  });

  it("throws error when DEEPSEEK_API_KEY is not set", async () => {
    process.env.DEEPSEEK_API_KEY = "";

    await expect(
      parseJobTool.runAsync({
        args: { jobText: "Some job description" },
      } as never),
    ).rejects.toThrow("DEEPSEEK_API_KEY environment variable is required");
  });
});
