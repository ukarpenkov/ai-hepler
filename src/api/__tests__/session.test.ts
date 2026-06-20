import { describe, it, expect, vi, beforeEach, afterAll } from "vitest";

vi.mock("../../storage/redis.js", () => ({
  createRedisClient: vi.fn(() => ({})),
  closeRedisClient: vi.fn(),
}));

vi.mock("../../storage/session-store.js", () => ({
  getSession: vi.fn(),
}));

const Fastify = (await import("fastify")).default;
const { getSession } = await import("../../storage/session-store.js");
const { sessionRoutes } = await import("../routes/session.js");

const mockSession = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  jobProfile: { role: "Dev", level: "middle", skills: ["TS"], keywords: [], domain: "web" },
  history: [{ role: "assistant" as const, content: "Q1", timestamp: "" }],
  weakSkills: ["React"],
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

describe("GET /session/:id", () => {
  let app: ReturnType<typeof Fastify>;

  beforeEach(async () => {
    vi.restoreAllMocks();
    app = Fastify();
    app.redis = {} as never;
    await app.register(sessionRoutes);
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it("returns 200 with session data", async () => {
    vi.mocked(getSession).mockResolvedValue(mockSession);

    const response = await app.inject({
      method: "GET",
      url: "/session/550e8400-e29b-41d4-a716-446655440000",
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.payload);
    expect(body.id).toBe("550e8400-e29b-41d4-a716-446655440000");
    expect(body.jobProfile.role).toBe("Dev");
    expect(body.weakSkills).toEqual(["React"]);
  });

  it("returns 404 for nonexistent session", async () => {
    vi.mocked(getSession).mockResolvedValue(null);

    const response = await app.inject({
      method: "GET",
      url: "/session/550e8400-e29b-41d4-a716-446655440000",
    });

    expect(response.statusCode).toBe(404);
  });

  it("returns 400 for invalid UUID", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/session/not-a-uuid",
    });

    expect(response.statusCode).toBe(400);
  });
});
