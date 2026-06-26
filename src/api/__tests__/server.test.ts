import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";

process.env.DEEPSEEK_API_KEY = "test-key";

vi.mock("../../storage/redis.js", () => ({
  createRedisClient: vi.fn(() => ({})),
  closeRedisClient: vi.fn(),
}));

vi.mock("../../storage/session-store.js", () => ({
  createSession: vi.fn(),
  getSession: vi.fn(),
}));

vi.mock("../../adk/runner.js", () => ({
  jobParserRunner: {
    runEphemeral: vi.fn(),
  },
  interviewerRunner: {
    runEphemeral: vi.fn(),
  },
  interviewRunner: {
    runEphemeral: vi.fn(),
  },
  sessionService: {},
}));

const { server } = await import("../server.js");
const { jobParserRunner, interviewerRunner, interviewRunner } = await import("../../adk/runner.js");

const mockCoachFeedback = {
  explanation:
    "Your answer shows basic TypeScript knowledge but could include more depth about structural typing and practical use cases.",
  improvedAnswer:
    "TypeScript is a typed superset of JavaScript that adds static types, interfaces, generics, and compile-time checks while compiling to plain JavaScript for runtime execution.",
  tips: [
    "Mention how TypeScript catches errors before runtime through the compiler.",
    "Compare interfaces and type aliases with a concrete example.",
    "Explain how TypeScript improves maintainability in large codebases.",
  ],
};

const mockJobProfile = { role: "Dev", level: "middle" as const, skills: ["TS"], softSkills: [], keywords: [], domain: "web", language: "en", minYearsExperience: null };

function makeEvent(stateDelta: Record<string, unknown>) {
  return {
    actions: {
      stateDelta,
      artifactDelta: {},
      requestedAuthConfigs: {},
      requestedToolConfirmations: {},
    },
    content: { parts: [{ text: "" }] },
    id: "test-event",
    invocationId: "test-invocation",
    timestamp: Date.now(),
  };
}

describe("server", () => {
  beforeAll(async () => {
    await server.ready();
  });

  afterAll(async () => {
    await server.close();
  });

  it("GET /health returns 200 with status ok", async () => {
    const response = await server.inject({
      method: "GET",
      url: "/health",
    });

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.payload)).toEqual({ status: "ok" });
  });

  it("CORS headers are present", async () => {
    const response = await server.inject({
      method: "OPTIONS",
      url: "/health",
      headers: {
        origin: "http://localhost:3000",
        "access-control-request-method": "GET",
      },
    });

    expect(response.headers["access-control-allow-origin"]).toBeDefined();
  });

  describe("route registration", () => {
    it("POST /job/parse is available", async () => {
      async function* mockGenerator() {
        yield makeEvent({ parsedJob: mockJobProfile });
      }
      vi.mocked(jobParserRunner.runEphemeral).mockImplementation(() => mockGenerator());

      const response = await server.inject({
        method: "POST",
        url: "/job/parse",
        payload: { text: "We are looking for a middle developer with TypeScript and React experience for our web platform." },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.jobProfile.role).toBe("Dev");
      expect(body.sessionId).toBeUndefined();
    });

    it("POST /interview/start is available", async () => {
      async function* mockGenerator() {
        yield makeEvent({
          currentQuestion: { question: "What is TypeScript?", topic: "TS", difficulty: "medium", questionType: "theoretical_explanation", expectedAnswerCriteria: [] },
        });
      }
      vi.mocked(interviewerRunner.runEphemeral).mockImplementation(() => mockGenerator());

      const response = await server.inject({
        method: "POST",
        url: "/interview/start",
        payload: {
          sessionId: "550e8400-e29b-41d4-a716-446655440000",
          jobProfile: mockJobProfile,
          weakSkills: [],
          history: [],
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.question.question).toBe("What is TypeScript?");
    });

    it("POST /interview/answer is available", async () => {
      async function* mockGenerator() {
        yield makeEvent({
          evaluation: { score: 7, accuracy: 2, depth: 2, relevance: 2, examples: 1, strengths: [], weaknesses: [], recommendation: "", antiCheatFlags: [], perfectAnswerSummary: "good" },
          coachFeedback: mockCoachFeedback,
          memoryUpdate: { weakSkills: [], answeredTopics: [] },
          currentQuestion: { question: "Q2?", topic: "React", difficulty: "easy", questionType: "theoretical_explanation", expectedAnswerCriteria: [] },
        });
      }
      vi.mocked(interviewRunner.runEphemeral).mockImplementation(() => mockGenerator());

      const response = await server.inject({
        method: "POST",
        url: "/interview/answer",
        payload: {
          sessionId: "550e8400-e29b-41d4-a716-446655440000",
          answer: "TypeScript is a typed superset of JavaScript.",
          sessionData: { jobProfile: mockJobProfile, history: [], weakSkills: [] },
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.evaluation.score).toBe(7);
    });

    it("GET /session/:id returns 404 (sessions are client-side now)", async () => {
      const response = await server.inject({
        method: "GET",
        url: "/session/550e8400-e29b-41d4-a716-446655440000",
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe("rate limiter", () => {
    it("includes rate limit headers", async () => {
      const response = await server.inject({
        method: "GET",
        url: "/health",
      });

      expect(response.headers["x-ratelimit-limit"]).toBeDefined();
      expect(response.headers["x-ratelimit-remaining"]).toBeDefined();
      expect(response.headers["x-ratelimit-reset"]).toBeDefined();
    });
  });
});
