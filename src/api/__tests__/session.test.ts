import { describe, it, expect, beforeEach, afterAll } from "vitest";

const Fastify = (await import("fastify")).default;
const { sessionRoutes } = await import("../routes/session.js");

describe("session routes (client-side storage)", () => {
  let app: ReturnType<typeof Fastify>;

  beforeEach(async () => {
    app = Fastify();
    await app.register(sessionRoutes);
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it("GET /sessions returns empty array", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/sessions",
    });

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.payload)).toEqual([]);
  });

  it("GET /session/:id returns 404", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/session/550e8400-e29b-41d4-a716-446655440000",
    });

    expect(response.statusCode).toBe(404);
  });
});
