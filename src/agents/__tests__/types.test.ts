import { describe, it, expect } from "vitest";
import type {
  AgentName,
  AgentInput,
  AgentOutput,
  ParsedJob,
  EvaluationResult,
  QuestionResult,
  CoachResult,
  MemoryUpdate,
  InterviewState,
} from "../types.js";

describe("agents/types", () => {
  it("compiles all type imports", () => {
    const agentName: AgentName = "job-parser";
    expect(agentName).toBe("job-parser");

    const input: AgentInput = { sessionId: "1", content: "test" };
    expect(input.sessionId).toBe("1");

    const output: AgentOutput = { agentName: "coach", result: "{}" };
    expect(output.agentName).toBe("coach");

    const job: ParsedJob = { role: "dev", level: "senior", skills: [], keywords: [], domain: "tech" };
    expect(job.level).toBe("senior");

    const eval_: EvaluationResult = { score: 8, strengths: [], weaknesses: [], recommendation: "good" };
    expect(eval_.score).toBe(8);

    const question: QuestionResult = { question: "q", topic: "t", difficulty: "medium" };
    expect(question.difficulty).toBe("medium");

    const coach: CoachResult = { explanation: "e", improvedAnswer: "a", tips: [] };
    expect(coach.tips).toEqual([]);

    const memory: MemoryUpdate = { weakSkills: [], answeredTopics: [] };
    expect(memory.answeredTopics).toEqual([]);

    const state: InterviewState = { sessionId: "1", currentQuestion: null, questionCount: 0, scores: [] };
    expect(state.questionCount).toBe(0);
  });
});
