import { describe, it, expect, vi, beforeAll, afterAll, beforeEach } from "vitest";

process.env.DEEPSEEK_API_KEY = "test-key";

vi.mock("ioredis", () => {
  return {
    Redis: vi.fn().mockImplementation(() => ({
      set: vi.fn(async () => {}),
      get: vi.fn(async () => null),
      del: vi.fn(async () => {}),
      quit: vi.fn(async () => {}),
    })),
  };
});

const jobProfileResponse = {
  role: "Frontend Developer",
  level: "middle",
  skills: ["TypeScript", "React", "CSS"],
  softSkills: [],
  keywords: ["frontend", "web"],
  domain: "web",
  language: "en", minYearsExperience: null,
};

const questionResponse = {
  question: "Explain the difference between TypeScript interfaces and types.",
  topic: "TypeScript",
  difficulty: "medium",
  questionType: "theoretical_explanation",
  expectedAnswerCriteria: ["Mention interfaces are extendable", "Mention types support unions"],
};

const evaluationResponse = {
  score: 7,
  accuracy: 3,
  depth: 2,
  relevance: 2,
  examples: 0,
  strengths: ["Good understanding of basics"],
  weaknesses: ["Could mention more advanced features"],
  recommendation: "Study generics and utility types",
  antiCheatFlags: [],
  perfectAnswerSummary: "Include advanced features like generics",
};

const coachResponse = {
  explanation: "Interfaces are extendable, types support unions and intersections.",
  improvedAnswer: "TypeScript interfaces define object shapes and can be extended, while types are more flexible supporting unions, intersections, and mapped types.",
  tips: ["Practice using utility types", "Read the TypeScript handbook", "Build small projects"],
};

const nextQuestionResponse = {
  question: "What are React hooks?",
  topic: "React",
  difficulty: "easy",
  questionType: "theoretical_explanation",
  expectedAnswerCriteria: [],
};

let fetchCallCount = 0;

describe("API integration test", () => {
  beforeAll(() => {
    vi.stubGlobal("fetch", vi.fn(async () => {
      fetchCallCount++;

      if (fetchCallCount === 1) {
        return new Response(JSON.stringify({
          choices: [{ message: { content: JSON.stringify(jobProfileResponse) } }],
        }), { status: 200, headers: { "Content-Type": "application/json" } });
      }

      if (fetchCallCount === 2) {
        return new Response(JSON.stringify({
          choices: [{ message: { content: JSON.stringify(questionResponse) } }],
        }), { status: 200, headers: { "Content-Type": "application/json" } });
      }

      if (fetchCallCount === 3) {
        return new Response(JSON.stringify({
          choices: [{ message: { content: JSON.stringify(evaluationResponse) } }],
        }), { status: 200, headers: { "Content-Type": "application/json" } });
      }

      if (fetchCallCount === 4) {
        return new Response(JSON.stringify({
          choices: [{ message: { content: JSON.stringify(coachResponse) } }],
        }), { status: 200, headers: { "Content-Type": "application/json" } });
      }

      if (fetchCallCount === 5) {
        return new Response(JSON.stringify({
          choices: [{ message: { content: JSON.stringify(nextQuestionResponse) } }],
        }), { status: 200, headers: { "Content-Type": "application/json" } });
      }

      return new Response(JSON.stringify({
        choices: [{ message: { content: "" } }],
      }), { status: 200, headers: { "Content-Type": "application/json" } });
    }) as typeof fetch);
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    fetchCallCount = 0;
  });

  it("full interview flow works end-to-end", async () => {
    const { server } = await import("../server.js");
    await server.ready();

    const parseResponse = await server.inject({
      method: "POST",
      url: "/job/parse",
      payload: {
        text: "We are looking for a middle Frontend Developer with TypeScript, React, and CSS experience for our web platform.",
      },
    });

    expect(parseResponse.statusCode).toBe(200);
    const parseBody = JSON.parse(parseResponse.payload);
    expect(parseBody.jobProfile.role).toBe("Frontend Developer");
    expect(parseBody.jobProfile.level).toBe("middle");
    expect(parseBody.jobProfile.skills).toEqual(["TypeScript", "React", "CSS"]);

    const jobProfile = parseBody.jobProfile;
    const sessionId = "550e8400-e29b-41d4-a716-446655440000";

    const startResponse = await server.inject({
      method: "POST",
      url: "/interview/start",
      payload: { sessionId, jobProfile, weakSkills: [], history: [] },
    });

    expect(startResponse.statusCode).toBe(200);
    const startBody = JSON.parse(startResponse.payload);
    expect(startBody.question.question).toBe("Explain the difference between TypeScript interfaces and types.");
    expect(startBody.question.topic).toBe("TypeScript");
    expect(startBody.question.difficulty).toBe("medium");

    const updatedHistory = startBody.updatedHistory;

    const answerResponse = await server.inject({
      method: "POST",
      url: "/interview/answer",
      payload: {
        sessionId,
        answer: "TypeScript interfaces define object shapes, while types are more flexible and support unions and intersections.",
        sessionData: { jobProfile, history: updatedHistory, weakSkills: [] },
      },
    });

    expect(answerResponse.statusCode).toBe(200);
    const answerBody = JSON.parse(answerResponse.payload);
    expect(answerBody.evaluation.score).toBeGreaterThanOrEqual(1);
    expect(answerBody.evaluation.score).toBeLessThanOrEqual(10);
    expect(answerBody.coach.explanation).toBe("Interfaces are extendable, types support unions and intersections.");
    expect(answerBody.coach.improvedAnswer).toBeDefined();
    expect(Array.isArray(answerBody.coach.tips)).toBe(true);
    expect(answerBody.nextQuestion.question).toBe("What are React hooks?");
    expect(answerBody.nextQuestion.topic).toBe("React");
    expect(answerBody.nextQuestion.difficulty).toBe("easy");
    expect(answerBody.updatedHistory).toBeDefined();
    expect(answerBody.updatedWeakSkills).toBeDefined();

    await server.close();
  });
});
