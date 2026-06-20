import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateQuestionTool } from "../generate-question.tool.js";
import type { ParsedJob } from "../../agents/types.js";

const jobProfile: ParsedJob = {
  role: "Backend Developer",
  level: "middle",
  skills: ["Node.js", "TypeScript"],
  keywords: ["api", "rest"],
  domain: "tech",
};

describe("generateQuestionTool", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns QuestionResult on success", async () => {
    const mockResponse = {
      choices: [{ message: { content: JSON.stringify({ question: "Explain closures", topic: "javascript", difficulty: "medium" }) } }],
    };
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify(mockResponse), { status: 200 }));

    const result = await generateQuestionTool({
      jobProfile,
      weakSkills: ["javascript"],
      previousQuestions: [],
      config: { apiKey: "test" },
    });
    expect(result.question).toBe("Explain closures");
    expect(result.topic).toBe("javascript");
    expect(result.difficulty).toBe("medium");
  });

  it("generates easy/medium question with empty weakSkills", async () => {
    const mockResponse = {
      choices: [{ message: { content: JSON.stringify({ question: "What is Node.js?", topic: "general", difficulty: "easy" }) } }],
    };
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify(mockResponse), { status: 200 }));

    const result = await generateQuestionTool({
      jobProfile,
      weakSkills: [],
      previousQuestions: [],
      config: { apiKey: "test" },
    });
    expect(result.difficulty).toBe("easy");
  });
});
