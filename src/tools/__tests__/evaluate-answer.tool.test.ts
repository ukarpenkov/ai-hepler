import { describe, it, expect, vi, beforeEach } from "vitest";
import { evaluateAnswerTool } from "../evaluate-answer.tool.js";
import type { ParsedJob } from "../../agents/types.js";

const jobProfile: ParsedJob = {
  role: "Backend Developer",
  level: "middle",
  skills: ["Node.js", "TypeScript"],
  keywords: ["api"],
  domain: "tech",
};

describe("evaluateAnswerTool", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns EvaluationResult with valid score", async () => {
    const mockResponse = {
      choices: [{ message: { content: JSON.stringify({ score: 8, strengths: ["good"], weaknesses: ["minor"], recommendation: "strong candidate" }) } }],
    };
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify(mockResponse), { status: 200 }));

    const result = await evaluateAnswerTool({
      question: "Explain async/await",
      answer: "Async/await is syntax for promises",
      jobProfile,
      config: { apiKey: "test" },
    });
    expect(result.score).toBe(8);
    expect(result.strengths).toEqual(["good"]);
    expect(result.recommendation).toBe("strong candidate");
  });

  it("clamps invalid score to valid range", async () => {
    const mockResponse = {
      choices: [{ message: { content: JSON.stringify({ score: 15, strengths: [], weaknesses: [], recommendation: "ok" }) } }],
    };
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify(mockResponse), { status: 200 }));

    const result = await evaluateAnswerTool({
      question: "q",
      answer: "a",
      jobProfile,
      config: { apiKey: "test" },
    });
    expect(result.score).toBe(10);
  });

  it("clamps score below 1", async () => {
    const mockResponse = {
      choices: [{ message: { content: JSON.stringify({ score: -5, strengths: [], weaknesses: [], recommendation: "poor" }) } }],
    };
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify(mockResponse), { status: 200 }));

    const result = await evaluateAnswerTool({
      question: "q",
      answer: "a",
      jobProfile,
      config: { apiKey: "test" },
    });
    expect(result.score).toBe(1);
  });
});
