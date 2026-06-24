import { describe, it, expect, vi, beforeEach } from "vitest";
import { coachAgent } from "../coach.agent.js";
import type { EvaluationResult, ParsedJob } from "../types.js";

describe("coachAgent", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns AgentOutput with CoachResult", async () => {
    const mockCoach = {
      explanation: "The correct answer involves...",
      improvedAnswer: "An improved version would be...",
      tips: ["Practice more", "Read documentation", "Build projects"],
    };

    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          choices: [{ message: { content: JSON.stringify(mockCoach) } }],
        }),
        { status: 200 }
      )
    );

    const jobProfile: ParsedJob = {
      role: "Frontend Developer",
      level: "middle",
      skills: ["React"],
      softSkills: [],
      keywords: ["frontend"],
      domain: "web",
      language: "en", minYearsExperience: null,
    };
    const evaluation: EvaluationResult = {
      score: 6,
      accuracy: 2,
      depth: 2,
      relevance: 1,
      examples: 1,
      strengths: ["Good basics"],
      weaknesses: ["Needs depth"],
      recommendation: "Study advanced patterns",
      antiCheatFlags: [],
      perfectAnswerSummary: "Show deeper understanding",
    };

    const result = await coachAgent({
      question: "What are React hooks?",
      answer: "Hooks let you use state in function components.",
      evaluation,
      jobProfile,
      config: { apiKey: "key", baseUrl: "https://api.deepseek.com", model: "deepseek-chat" },
    });

    expect(result.agentName).toBe("coach");
    const parsed = JSON.parse(result.result);
    expect(parsed.explanation).toBe("The correct answer involves...");
    expect(parsed.tips).toHaveLength(3);
  });
});
