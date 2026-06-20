import { describe, it, expect, vi, beforeEach } from "vitest";
import { evaluatorAgent } from "../evaluator.agent.js";
import type { ParsedJob } from "../types.js";

vi.mock("../../tools/evaluate-answer.tool.js", () => ({
  evaluateAnswerTool: vi.fn(),
}));

import { evaluateAnswerTool } from "../../tools/evaluate-answer.tool.js";

describe("evaluatorAgent", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns AgentOutput with EvaluationResult", async () => {
    const mockEval = {
      score: 8,
      strengths: ["Good communication"],
      weaknesses: ["Missing examples"],
      recommendation: "Add more concrete examples",
    };
    vi.mocked(evaluateAnswerTool).mockResolvedValue(mockEval);

    const jobProfile: ParsedJob = {
      role: "Backend Developer",
      level: "senior",
      skills: ["Node.js"],
      keywords: ["api"],
      domain: "backend",
    };

    const result = await evaluatorAgent({
      question: "Describe your experience with Node.js",
      answer: "I have 5 years of experience with Node.js...",
      jobProfile,
      config: { apiKey: "key" },
    });

    expect(result.agentName).toBe("evaluator");
    expect(JSON.parse(result.result)).toEqual(mockEval);
    expect(evaluateAnswerTool).toHaveBeenCalledOnce();
  });
});
