import { describe, it, expect, vi, beforeEach } from "vitest";
import { evaluateAnswerTool } from "../evaluate-answer.tool.js";
import { validateWithSchema } from "../../security/schemas.js";
import { EvaluationSchema } from "../../security/schemas.js";
import type { ParsedJob } from "../../agents/types.js";

const jobProfile: ParsedJob = {
  role: "Backend Developer",
  level: "middle",
  skills: ["Node.js", "TypeScript"],
  softSkills: [],
  keywords: ["api"],
  domain: "tech",
  minYearsExperience: null,
};

describe("evaluateAnswerTool", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns EvaluationResult with valid score", async () => {
    const mockResponse = {
      choices: [{ message: { content: JSON.stringify({ score: 8, accuracy: 3, depth: 2, relevance: 2, examples: 1, strengths: ["good"], weaknesses: ["minor"], recommendation: "strong candidate", antiCheatFlags: [], perfectAnswerSummary: "Include concrete examples" }) } }],
    };
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify(mockResponse), { status: 200 }));

    const result = await evaluateAnswerTool({
      question: "Explain async/await",
      answer: "Async/await is syntax for promises",
      jobProfile,
      config: { apiKey: "test", baseUrl: "https://api.deepseek.com", model: "deepseek-chat" },
    });
    expect(result.score).toBe(8);
    expect(result.strengths).toEqual(["good"]);
    expect(result.recommendation).toBe("strong candidate");
  });

  it("clamps invalid score to valid range", async () => {
    const mockResponse = {
      choices: [{ message: { content: JSON.stringify({ score: 15, accuracy: 5, depth: 5, relevance: 3, examples: 2, strengths: [], weaknesses: [], recommendation: "ok", antiCheatFlags: [], perfectAnswerSummary: "ok" }) } }],
    };
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify(mockResponse), { status: 200 }));

    const result = await evaluateAnswerTool({
      question: "q",
      answer: "a",
      jobProfile,
      config: { apiKey: "test", baseUrl: "https://api.deepseek.com", model: "deepseek-chat" },
    });
    expect(result.score).toBe(10);
  });

  it("clamps score below 1", async () => {
    const mockResponse = {
      choices: [{ message: { content: JSON.stringify({ score: -5, accuracy: 0, depth: 0, relevance: 0, examples: 0, strengths: [], weaknesses: [], recommendation: "poor", antiCheatFlags: [], perfectAnswerSummary: "poor" }) } }],
    };
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify(mockResponse), { status: 200 }));

    const result = await evaluateAnswerTool({
      question: "q",
      answer: "a",
      jobProfile,
      config: { apiKey: "test", baseUrl: "https://api.deepseek.com", model: "deepseek-chat" },
    });
    expect(result.score).toBe(1);
  });

  it("returns arrays for strengths and weaknesses", async () => {
    const mockResponse = {
      choices: [{ message: { content: JSON.stringify({ score: 5, accuracy: 2, depth: 1, relevance: 1, examples: 1, strengths: ["s1", "s2"], weaknesses: ["w1", "w2", "w3"], recommendation: "ok", antiCheatFlags: [], perfectAnswerSummary: "ok" }) } }],
    };
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify(mockResponse), { status: 200 }));

    const result = await evaluateAnswerTool({
      question: "q",
      answer: "a",
      jobProfile,
      config: { apiKey: "test", baseUrl: "https://api.deepseek.com", model: "deepseek-chat" },
    });
    expect(Array.isArray(result.strengths)).toBe(true);
    expect(Array.isArray(result.weaknesses)).toBe(true);
    expect(result.strengths).toHaveLength(2);
    expect(result.weaknesses).toHaveLength(3);
  });

  it("output conforms to EvaluationSchema", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({
      choices: [{ message: { content: JSON.stringify({ score: 7, accuracy: 2, depth: 2, relevance: 2, examples: 1, strengths: ["good"], weaknesses: ["minor"], recommendation: "strong", antiCheatFlags: [], perfectAnswerSummary: "ok" }) } }],
    }), { status: 200 }));

    const result = await evaluateAnswerTool({
      question: "q",
      answer: "a",
      jobProfile,
      config: { apiKey: "test", baseUrl: "https://api.deepseek.com", model: "deepseek-chat" },
    });
    expect(() => validateWithSchema(EvaluationSchema, result)).not.toThrow();
  });
});
