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
      questionType: "theoretical_explanation" as const,
      expectedAnswerCriteria: [],
    };
    vi.mocked(generateQuestionTool).mockResolvedValue(mockQuestion);

    const input: AgentInput = { sessionId: "s1", content: "" };
    const jobProfile: ParsedJob = {
      role: "Frontend Developer",
      level: "middle",
      skills: ["React"],
      softSkills: [],
      keywords: ["frontend"],
      domain: "web",
      language: "en", minYearsExperience: null,
    };

    const result = await interviewerAgent({
      input,
      jobProfile,
      weakSkills: ["React"],
      previousQuestions: [],
      config: { apiKey: "key", baseUrl: "https://api.deepseek.com", model: "deepseek-chat" },
    });

    expect(result.agentName).toBe("interviewer");
    expect(JSON.parse(result.result)).toEqual(mockQuestion);
    expect(generateQuestionTool).toHaveBeenCalledOnce();
  });
});
