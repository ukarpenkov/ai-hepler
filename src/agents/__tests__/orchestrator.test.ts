import { describe, it, expect, vi, beforeEach } from "vitest";
import { parseJob, startInterview, processAnswer } from "../orchestrator.js";
import type { SessionData } from "../../storage/session-store.js";

vi.mock("../job-parser.agent.js", () => ({
  jobParserAgent: vi.fn(),
}));

vi.mock("../interviewer.agent.js", () => ({
  interviewerAgent: vi.fn(),
}));

vi.mock("../evaluator.agent.js", () => ({
  evaluatorAgent: vi.fn(),
}));

vi.mock("../coach.agent.js", () => ({
  coachAgent: vi.fn(),
}));

vi.mock("../memory.agent.js", () => ({
  memoryAgent: vi.fn(),
}));

vi.mock("../../storage/session-store.js", () => ({
  getSession: vi.fn(),
  updateSession: vi.fn(),
}));

import { jobParserAgent } from "../job-parser.agent.js";
import { interviewerAgent } from "../interviewer.agent.js";
import { evaluatorAgent } from "../evaluator.agent.js";
import { coachAgent } from "../coach.agent.js";
import { memoryAgent } from "../memory.agent.js";
import { getSession, updateSession } from "../../storage/session-store.js";

const mockSession: SessionData = {
  id: "s1",
  jobProfile: { role: "Dev", level: "middle", skills: ["TS"], keywords: [], domain: "web" },
  history: [],
  weakSkills: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe("orchestrator", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("parseJob calls jobParserAgent and saves to session", async () => {
    vi.mocked(jobParserAgent).mockResolvedValue({
      agentName: "job-parser",
      result: JSON.stringify({ role: "Dev", level: "middle", skills: ["TS"], keywords: [], domain: "web" }),
    });

    const result = await parseJob("job text here", "s1", {} as never, { apiKey: "key" });
    expect(result.role).toBe("Dev");
    expect(jobParserAgent).toHaveBeenCalledOnce();
    expect(updateSession).toHaveBeenCalledOnce();
  });

  it("startInterview calls interviewerAgent with weakSkills", async () => {
    vi.mocked(getSession).mockResolvedValue(mockSession);
    vi.mocked(interviewerAgent).mockResolvedValue({
      agentName: "interviewer",
      result: JSON.stringify({ question: "Q1?", topic: "TS", difficulty: "medium" }),
    });

    const result = await startInterview("s1", {} as never, { apiKey: "key" });
    expect(result.question).toBe("Q1?");
    expect(interviewerAgent).toHaveBeenCalledOnce();
  });

  it("processAnswer calls the agent chain", async () => {
    const sessionWithHistory = {
      ...mockSession,
      history: [{ role: "assistant" as const, content: JSON.stringify({ question: "Q1?", topic: "TS", difficulty: "medium" }), timestamp: "" }],
    };
    vi.mocked(getSession)
      .mockResolvedValueOnce(sessionWithHistory)
      .mockResolvedValueOnce({ ...mockSession, weakSkills: ["TS"] });
    vi.mocked(evaluatorAgent).mockResolvedValue({
      agentName: "evaluator",
      result: JSON.stringify({ score: 7, strengths: [], weaknesses: [], recommendation: "" }),
    });
    vi.mocked(coachAgent).mockResolvedValue({
      agentName: "coach",
      result: JSON.stringify({ explanation: "", improvedAnswer: "", tips: [] }),
    });
    vi.mocked(memoryAgent).mockResolvedValue({
      agentName: "memory",
      result: JSON.stringify({ weakSkills: [], answeredTopics: ["TS"] }),
    });
    vi.mocked(interviewerAgent).mockResolvedValue({
      agentName: "interviewer",
      result: JSON.stringify({ question: "Q2?", topic: "React", difficulty: "easy" }),
    });

    const result = await processAnswer("s1", "my answer", {} as never, { apiKey: "key" });
    expect(result.evaluation.score).toBe(7);
    expect(result.nextQuestion.question).toBe("Q2?");
    expect(evaluatorAgent).toHaveBeenCalledOnce();
    expect(coachAgent).toHaveBeenCalledOnce();
    expect(memoryAgent).toHaveBeenCalledOnce();
  });
});
