import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateQuestionTool } from "../generate-question.tool.js";
import { validateWithSchema } from "../../security/schemas.js";
import { QuestionSchema } from "../../security/schemas.js";
import type { ParsedJob } from "../../agents/types.js";

const jobProfile: ParsedJob = {
  role: "Backend Developer",
  level: "middle",
  skills: ["Node.js", "TypeScript"],
  softSkills: [],
  keywords: ["api", "rest"],
  domain: "tech",
  minYearsExperience: null,
};

describe("generateQuestionTool", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns QuestionResult on success", async () => {
    const mockResponse = {
      choices: [{ message: { content: JSON.stringify({ question: "Explain closures", topic: "javascript", difficulty: "medium", questionType: "theoretical_explanation", expectedAnswerCriteria: ["Define closure", "Give example"] }) } }],
    };
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify(mockResponse), { status: 200 }));

    const result = await generateQuestionTool({
      jobProfile,
      weakSkills: ["javascript"],
      previousQuestions: [],
      config: { apiKey: "test", baseUrl: "https://api.deepseek.com", model: "deepseek-chat" },
    });
    expect(result.question).toBe("Explain closures");
    expect(result.topic).toBe("javascript");
    expect(result.difficulty).toBe("medium");
  });

  it("generates easy/medium question with empty weakSkills", async () => {
    const mockResponse = {
      choices: [{ message: { content: JSON.stringify({ question: "What is Node.js?", topic: "general", difficulty: "easy", questionType: "theoretical_explanation", expectedAnswerCriteria: [] }) } }],
    };
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify(mockResponse), { status: 200 }));

    const result = await generateQuestionTool({
      jobProfile,
      weakSkills: [],
      previousQuestions: [],
      config: { apiKey: "test", baseUrl: "https://api.deepseek.com", model: "deepseek-chat" },
    });
    expect(result.difficulty).toBe("easy");
  });

  it("includes weakSkills in prompt", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({
      choices: [{ message: { content: JSON.stringify({ question: "q", topic: "t", difficulty: "hard", questionType: "practical_implementation", expectedAnswerCriteria: [] }) } }],
    }), { status: 200 }));

    await generateQuestionTool({
      jobProfile,
      weakSkills: ["docker", "kubernetes"],
      previousQuestions: [],
      config: { apiKey: "test", baseUrl: "https://api.deepseek.com", model: "deepseek-chat" },
    });

    const body = JSON.parse(fetchSpy.mock.calls[0][1]?.body as string);
    expect(body.messages[1].content).toContain("docker");
    expect(body.messages[1].content).toContain("kubernetes");
  });

  it("handles different difficulty levels", async () => {
    for (const difficulty of ["easy", "medium", "hard"]) {
      vi.restoreAllMocks();
      vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({
        choices: [{ message: { content: JSON.stringify({ question: "q", topic: "t", difficulty, questionType: "theoretical_explanation", expectedAnswerCriteria: [] }) } }],
      }), { status: 200 }));

      const result = await generateQuestionTool({
        jobProfile,
        weakSkills: [],
        previousQuestions: [],
        config: { apiKey: "test", baseUrl: "https://api.deepseek.com", model: "deepseek-chat" },
      });
      expect(result.difficulty).toBe(difficulty);
    }
  });

  it("output conforms to QuestionSchema", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({
      choices: [{ message: { content: JSON.stringify({ question: "What is REST?", topic: "architecture", difficulty: "medium", questionType: "theoretical_explanation", expectedAnswerCriteria: [] }) } }],
    }), { status: 200 }));

    const result = await generateQuestionTool({
      jobProfile,
      weakSkills: [],
      previousQuestions: [],
      config: { apiKey: "test", baseUrl: "https://api.deepseek.com", model: "deepseek-chat" },
    });
    expect(() => validateWithSchema(QuestionSchema, {
      id: "test-id",
      text: result.question,
      topic: result.topic,
      difficulty: 5,
    })).not.toThrow();
  });
});
