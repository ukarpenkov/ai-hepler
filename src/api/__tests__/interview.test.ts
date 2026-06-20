import { describe, it, expect, vi, beforeEach, afterAll } from "vitest";

process.env.OPENROUTER_API_KEY = "test-key";

vi.mock("../../storage/redis.js", () => ({
  createRedisClient: vi.fn(() => ({})),
  closeRedisClient: vi.fn(),
}));

vi.mock("../../storage/session-store.js", () => ({
  getSession: vi.fn(),
}));

vi.mock("../../agents/orchestrator.js", () => ({
  startInterview: vi.fn(),
  processAnswer: vi.fn(),
}));

const Fastify = (await import("fastify")).default;
const { getSession } = await import("../../storage/session-store.js");
const { startInterview, processAnswer } = await import("../../agents/orchestrator.js");
const { interviewRoutes } = await import("../routes/interview.js");

const mockSession = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  jobProfile: { role: "Dev", level: "middle", skills: ["TS"], keywords: [], domain: "web" },
  history: [],
  weakSkills: [],
  createdAt: "",
  updatedAt: "",
};

describe("interview routes", () => {
  let app: ReturnType<typeof Fastify>;

  beforeEach(async () => {
    vi.restoreAllMocks();
    app = Fastify();
    app.redis = {} as never;
    await app.register(interviewRoutes);
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  describe("POST /interview/start", () => {
    it("returns 200 with question on valid sessionId", async () => {
      vi.mocked(getSession).mockResolvedValue(mockSession);
      vi.mocked(startInterview).mockResolvedValue({
        question: "What is TypeScript?",
        topic: "TS",
        difficulty: "medium",
      });

      const response = await app.inject({
        method: "POST",
        url: "/interview/start",
        payload: { sessionId: "550e8400-e29b-41d4-a716-446655440000" },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.question.question).toBe("What is TypeScript?");
    });

    it("returns 404 for nonexistent session", async () => {
      vi.mocked(getSession).mockResolvedValue(null);

      const response = await app.inject({
        method: "POST",
        url: "/interview/start",
        payload: { sessionId: "550e8400-e29b-41d4-a716-446655440000" },
      });

      expect(response.statusCode).toBe(404);
    });

    it("returns 400 for invalid UUID", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/interview/start",
        payload: { sessionId: "not-a-uuid" },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe("POST /interview/answer", () => {
    it("returns 200 with full result on valid answer", async () => {
      vi.mocked(getSession).mockResolvedValue(mockSession);
      vi.mocked(processAnswer).mockResolvedValue({
        evaluation: { score: 7, strengths: [], weaknesses: [], recommendation: "" },
        coach: { explanation: "", improvedAnswer: "", tips: [] },
        memory: { weakSkills: [], answeredTopics: [] },
        nextQuestion: { question: "Q2?", topic: "React", difficulty: "easy" },
      });

      const response = await app.inject({
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

    it("returns 400 for empty answer", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/interview/answer",
        payload: {
          sessionId: "550e8400-e29b-41d4-a716-446655440000",
          answer: "",
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it("returns 400 for short answer", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/interview/answer",
        payload: {
          sessionId: "550e8400-e29b-41d4-a716-446655440000",
          answer: "short",
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });
});
