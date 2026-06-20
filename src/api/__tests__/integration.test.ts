import { describe, it, expect, vi, beforeAll, afterAll, beforeEach } from "vitest";

process.env.DEEPSEEK_API_KEY = "test-key";

const mockRedisStore = new Map<string, string>();

vi.mock("ioredis", () => {
  return {
    Redis: vi.fn().mockImplementation(() => ({
      set: vi.fn(async (key: string, value: string) => {
        mockRedisStore.set(key, value);
      }),
      get: vi.fn(async (key: string) => mockRedisStore.get(key) ?? null),
      del: vi.fn(async (key: string) => {
        mockRedisStore.delete(key);
      }),
      quit: vi.fn(async () => {}),
    })),
  };
});

const jobProfileResponse = {
  role: "Frontend Developer",
  level: "middle",
  skills: ["TypeScript", "React", "CSS"],
  keywords: ["frontend", "web"],
  domain: "web",
};

const questionResponse = {
  question: "Explain the difference between TypeScript interfaces and types.",
  topic: "TypeScript",
  difficulty: "medium",
};

const evaluationResponse = {
  score: 7,
  strengths: ["Good understanding of basics"],
  weaknesses: ["Could mention more advanced features"],
  recommendation: "Study generics and utility types",
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
};

let fetchCallCount = 0;

describe("API integration test", () => {
  beforeAll(() => {
    vi.stubGlobal("fetch", vi.fn(async () => {
      fetchCallCount++;
      const body = JSON.stringify({
        choices: [{ message: { content: "" } }],
      });

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

      return new Response(body, { status: 200, headers: { "Content-Type": "application/json" } });
    }) as typeof fetch);
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    mockRedisStore.clear();
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
    expect(parseBody.sessionId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
    );
    expect(parseBody.jobProfile.role).toBe("Frontend Developer");
    expect(parseBody.jobProfile.level).toBe("middle");
    expect(parseBody.jobProfile.skills).toEqual(["TypeScript", "React", "CSS"]);

    const sessionId = parseBody.sessionId;

    const startResponse = await server.inject({
      method: "POST",
      url: "/interview/start",
      payload: { sessionId },
    });

    expect(startResponse.statusCode).toBe(200);
    const startBody = JSON.parse(startResponse.payload);
    expect(startBody.question.question).toBe("Explain the difference between TypeScript interfaces and types.");
    expect(startBody.question.topic).toBe("TypeScript");
    expect(startBody.question.difficulty).toBe("medium");

    const answerResponse = await server.inject({
      method: "POST",
      url: "/interview/answer",
      payload: {
        sessionId,
        answer: "TypeScript interfaces define object shapes, while types are more flexible and support unions and intersections.",
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

    const sessionResponse = await server.inject({
      method: "GET",
      url: `/session/${sessionId}`,
    });

    expect(sessionResponse.statusCode).toBe(200);
    const sessionBody = JSON.parse(sessionResponse.payload);
    expect(sessionBody.id).toBe(sessionId);
    expect(sessionBody.jobProfile.role).toBe("Frontend Developer");
    expect(sessionBody.history.length).toBeGreaterThan(0);

    await server.close();
  });
});
