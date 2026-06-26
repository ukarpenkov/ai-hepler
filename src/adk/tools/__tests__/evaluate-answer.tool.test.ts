import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { evaluateAnswerTool } from "../evaluate-answer.tool.js";
import { FunctionTool } from "@google/adk";

describe("evaluateAnswerTool", () => {
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
    expect(evaluateAnswerTool).toBeInstanceOf(FunctionTool);
  });

  it("has correct name", () => {
    expect(evaluateAnswerTool.name).toBe("evaluateAnswer");
  });

  it("has description", () => {
    expect(evaluateAnswerTool.description).toContain(
      "Evaluates an interview answer",
    );
  });

  it("returns score 1 without calling LLM when answer copies the question", async () => {
    const question = "Explain how you would design a URL shortening service with scaling in mind.";
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const result = await evaluateAnswerTool.runAsync({
      args: {
        question,
        answer: question,
        jobProfile: {
          role: "Backend Developer",
          level: "middle",
          skills: ["Node.js"],
          softSkills: [],
          keywords: [],
          domain: "web",
          language: "en",
          minYearsExperience: 3,
        },
      },
    } as never);

    expect(fetchMock).not.toHaveBeenCalled();
    const resultObj = result as Record<string, unknown>;
    expect(resultObj.score).toBe(1);
    expect(resultObj.antiCheatFlags).toContain("paraphrasing_question");
  });

  it("calls LLM when answer quotes the question but adds substance", async () => {
    const question =
      "Design a URL shortening service like TinyURL. Walk me through your approach, including database schema, API design, and scaling.";
    const answer = `${question} I would use base62 codes, PostgreSQL for durable storage, Redis for hot redirects, and shard reads as traffic grows.`;
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  score: 6,
                  accuracy: 2,
                  depth: 2,
                  relevance: 1,
                  examples: 1,
                  strengths: ["Shows a reasonable architectural direction"],
                  weaknesses: ["Could expand on API design details"],
                  recommendation:
                    "Good effort — you outlined a credible storage and scaling path. To improve, walk through API endpoints and failure modes more explicitly.",
                  antiCheatFlags: [],
                  perfectAnswerSummary: "Include API contract, schema, and scaling tradeoffs",
                }),
              },
            },
          ],
        }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await evaluateAnswerTool.runAsync({
      args: {
        question,
        answer,
        jobProfile: {
          role: "Backend Developer",
          level: "middle",
          skills: ["Node.js"],
          softSkills: [],
          keywords: [],
          domain: "web",
          language: "en",
          minYearsExperience: 3,
        },
      },
    } as never);

    expect(fetchMock).toHaveBeenCalled();
    expect((result as Record<string, unknown>).score).toBe(6);
  });

  it("calls LLM API with correct parameters", async () => {
    const mockResponse = {
      choices: [
        {
          message: {
            content: JSON.stringify({
              score: 8,
              accuracy: 3,
              depth: 2,
              relevance: 2,
              examples: 1,
              strengths: ["Good technical knowledge"],
              weaknesses: ["Could provide more examples"],
              recommendation: "Strong candidate",
              antiCheatFlags: [],
              perfectAnswerSummary: "Should include more concrete examples",
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

    const result = await evaluateAnswerTool.runAsync({
      args: {
        question: "What is REST API?",
        answer: "REST is an architectural style for designing web services",
        jobProfile: {
          role: "Backend Developer",
          level: "middle",
          skills: ["Node.js", "TypeScript"],
          softSkills: [],
          keywords: [],
          domain: "fintech",
          language: "en",
          minYearsExperience: 3,
        },
      },
    } as never);

    expect(fetch).toHaveBeenCalledWith(
      "https://api.deepseek.com/chat/completions",
      expect.objectContaining({
        method: "POST",
      }),
    );

    const resultObj = result as Record<string, unknown>;
    expect(resultObj.score).toBe(8);
    expect(resultObj.accuracy).toBe(3);
    expect(resultObj.strengths).toContain("Good technical knowledge");
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
      evaluateAnswerTool.runAsync({
        args: {
          question: "What is REST?",
          answer: "REST is an API",
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
        },
      } as never),
    ).rejects.toThrow("No JSON found in LLM response");
  });

  it("handles API error response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
      }),
    );

    await expect(
      evaluateAnswerTool.runAsync({
        args: {
          question: "What is REST?",
          answer: "REST is an API",
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
        },
      } as never),
    ).rejects.toThrow("LLM API error: 500 Internal Server Error");
  });

  it("throws error when DEEPSEEK_API_KEY is not set", async () => {
    process.env.DEEPSEEK_API_KEY = "";

    await expect(
      evaluateAnswerTool.runAsync({
        args: {
          question: "What is REST?",
          answer: "REST is an API",
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
        },
      } as never),
    ).rejects.toThrow("DEEPSEEK_API_KEY environment variable is required");
  });

  it("clamps score to valid range", async () => {
    const mockResponse = {
      choices: [
        {
          message: {
            content: JSON.stringify({
              score: 15,
              accuracy: 5,
              depth: 5,
              relevance: 5,
              examples: 5,
              strengths: ["Too high"],
              weaknesses: [],
              recommendation: "Score too high",
              antiCheatFlags: [],
              perfectAnswerSummary: "Test",
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

    const result = await evaluateAnswerTool.runAsync({
      args: {
        question: "What is REST?",
        answer: "REST is an API",
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
      },
    } as never);

    const resultObj = result as Record<string, unknown>;
    expect(resultObj.score).toBe(10);
    expect(resultObj.accuracy).toBe(3);
    expect(resultObj.depth).toBe(3);
    expect(resultObj.relevance).toBe(2);
    expect(resultObj.examples).toBe(2);
  });
});
