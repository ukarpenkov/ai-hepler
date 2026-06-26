import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { generateQuestionTool } from "../generate-question.tool.js";
import { FunctionTool } from "@google/adk";

describe("generateQuestionTool", () => {
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
    expect(generateQuestionTool).toBeInstanceOf(FunctionTool);
  });

  it("has correct name", () => {
    expect(generateQuestionTool.name).toBe("generateQuestion");
  });

  it("has description", () => {
    expect(generateQuestionTool.description).toContain(
      "Generates an interview question",
    );
  });

  it("calls LLM API with correct parameters", async () => {
    const mockResponse = {
      choices: [
        {
          message: {
            content: JSON.stringify({
              question: "Explain the difference between REST and GraphQL",
              topic: "API Design",
              difficulty: "medium",
              questionType: "theoretical_explanation",
              expectedAnswerCriteria: [
                "REST uses multiple endpoints",
                "GraphQL uses single endpoint",
              ],
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

    const jobProfile = {
      role: "Backend Developer",
      level: "middle" as const,
      skills: ["Node.js", "TypeScript", "PostgreSQL"],
      softSkills: ["communication"],
      keywords: ["REST API", "microservices"],
      domain: "fintech",
      language: "en",
      minYearsExperience: 3,
    };

    const result = await generateQuestionTool.runAsync({
      args: {
        jobProfile,
        weakSkills: ["system design"],
        previousQuestions: [],
      },
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
    expect(body.messages[1].content).toContain("REST API");
    expect(body.messages[1].content).toContain("Weak areas");

    const resultObj = result as Record<string, unknown>;
    expect(resultObj.question).toBe(
      "Explain the difference between REST and GraphQL",
    );
    expect(resultObj.topic).toBe("API Design");
    expect(resultObj.difficulty).toBe("medium");
    expect(resultObj.questionType).toBe("theoretical_explanation");
    expect(resultObj.expectedAnswerCriteria).toHaveLength(2);
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
      generateQuestionTool.runAsync({
        args: {
          jobProfile: {
            role: "Developer",
            level: "junior",
            skills: ["JavaScript"],
            softSkills: [],
            keywords: [],
            domain: "web",
            language: "en",
            minYearsExperience: null,
          },
          weakSkills: [],
          previousQuestions: [],
        },
      } as never),
    ).rejects.toThrow("No JSON found in LLM response");
  });

  it("handles missing required fields", async () => {
    const mockResponse = {
      choices: [
        {
          message: {
            content: JSON.stringify({
              question: "What is Node.js?",
              topic: "Node.js",
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
      generateQuestionTool.runAsync({
        args: {
          jobProfile: {
            role: "Developer",
            level: "junior",
            skills: ["JavaScript"],
            softSkills: [],
            keywords: [],
            domain: "web",
            language: "en",
            minYearsExperience: null,
          },
          weakSkills: [],
          previousQuestions: [],
        },
      } as never),
    ).rejects.toThrow("Missing required fields in question result");
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
      generateQuestionTool.runAsync({
        args: {
          jobProfile: {
            role: "Developer",
            level: "junior",
            skills: ["JavaScript"],
            softSkills: [],
            keywords: [],
            domain: "web",
            language: "en",
            minYearsExperience: null,
          },
          weakSkills: [],
          previousQuestions: [],
        },
      } as never),
    ).rejects.toThrow("LLM API error: 429 Too Many Requests");
  });

  it("throws error when DEEPSEEK_API_KEY is not set", async () => {
    process.env.DEEPSEEK_API_KEY = "";

    await expect(
      generateQuestionTool.runAsync({
        args: {
          jobProfile: {
            role: "Developer",
            level: "junior",
            skills: ["JavaScript"],
            softSkills: [],
            keywords: [],
            domain: "web",
            language: "en",
            minYearsExperience: null,
          },
          weakSkills: [],
          previousQuestions: [],
        },
      } as never),
    ).rejects.toThrow("DEEPSEEK_API_KEY environment variable is required");
  });
});
