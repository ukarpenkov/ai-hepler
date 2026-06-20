import { describe, it, expect, vi, beforeEach } from "vitest";
import { interviewerAgent } from "../interviewer.agent.js";
import type { AgentInput, ParsedJob } from "../types.js";

vi.mock("../../tools/generate-question.tool.js", () => ({
  generateQuestionTool: vi.fn(),
}));

import { generateQuestionTool } from "../../tools/generate-question.tool.js";

describe("interviewerAgent", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns AgentOutput with QuestionResult", async () => {
    const mockQuestion = {
      question: "Explain React hooks",
      topic: "React",
      difficulty: "medium" as const,
    };
    vi.mocked(generateQuestionTool).mockResolvedValue(mockQuestion);

    const input: AgentInput = { sessionId: "s1", content: "" };
    const jobProfile: ParsedJob = {
      role: "Frontend Developer",
      level: "middle",
      skills: ["React"],
      keywords: ["frontend"],
      domain: "web",
    };

    const result = await interviewerAgent({
      input,
      jobProfile,
      weakSkills: ["React"],
      previousQuestions: [],
      config: { apiKey: "key" },
    });

    expect(result.agentName).toBe("interviewer");
    expect(JSON.parse(result.result)).toEqual(mockQuestion);
    expect(generateQuestionTool).toHaveBeenCalledOnce();
  });
});
