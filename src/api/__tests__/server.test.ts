import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";

process.env.OPENROUTER_API_KEY = "test-key";

vi.mock("../../storage/redis.js", () => ({
  createRedisClient: vi.fn(() => ({})),
  closeRedisClient: vi.fn(),
}));

vi.mock("../../storage/session-store.js", () => ({
  createSession: vi.fn(),
  getSession: vi.fn(),
}));

vi.mock("../../agents/orchestrator.js", () => ({
  parseJob: vi.fn(),
  startInterview: vi.fn(),
  processAnswer: vi.fn(),
}));

const { server } = await import("../server.js");
const { createSession, getSession } = await import("../../storage/session-store.js");
const { parseJob, startInterview, processAnswer } = await import("../../agents/orchestrator.js");

const mockSession = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  jobProfile: { role: "Dev", level: "middle", skills: ["TS"], keywords: [], domain: "web" },
  history: [],
  weakSkills: [],
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

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
      vi.mocked(createSession).mockResolvedValue(mockSession);
      vi.mocked(parseJob).mockResolvedValue({
        role: "Dev",
        level: "middle",
        skills: ["TS"],
        keywords: [],
        domain: "web",
      });

      const response = await server.inject({
        method: "POST",
        url: "/job/parse",
        payload: { text: "We are looking for a middle developer with TypeScript and React experience for our web platform." },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.sessionId).toBe("550e8400-e29b-41d4-a716-446655440000");
      expect(body.jobProfile.role).toBe("Dev");
    });

    it("POST /interview/start is available", async () => {
      vi.mocked(getSession).mockResolvedValue(mockSession);
      vi.mocked(startInterview).mockResolvedValue({
        question: "What is TypeScript?",
        topic: "TS",
        difficulty: "medium",
      });

      const response = await server.inject({
        method: "POST",
        url: "/interview/start",
        payload: { sessionId: "550e8400-e29b-41d4-a716-446655440000" },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.question.question).toBe("What is TypeScript?");
    });

    it("POST /interview/answer is available", async () => {
      vi.mocked(getSession).mockResolvedValue(mockSession);
      vi.mocked(processAnswer).mockResolvedValue({
        evaluation: { score: 7, strengths: [], weaknesses: [], recommendation: "" },
        coach: { explanation: "", improvedAnswer: "", tips: [] },
        memory: { weakSkills: [], answeredTopics: [] },
        nextQuestion: { question: "Q2?", topic: "React", difficulty: "easy" },
      });

      const response = await server.inject({
        method: "POST",
        url: "/interview/answer",
        payload: {
          sessionId: "550e8400-e29b-41d4-a716-446655440000",
          answer: "TypeScript is a typed superset of JavaScript.",
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.evaluation.score).toBe(7);
    });

    it("GET /session/:id is available", async () => {
      vi.mocked(getSession).mockResolvedValue(mockSession);

      const response = await server.inject({
        method: "GET",
        url: "/session/550e8400-e29b-41d4-a716-446655440000",
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.id).toBe("550e8400-e29b-41d4-a716-446655440000");
      expect(body.jobProfile.role).toBe("Dev");
    });
  });
});
