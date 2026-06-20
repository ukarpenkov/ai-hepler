import { describe, it, expect, beforeAll, afterAll } from "vitest";

process.env.OPENROUTER_API_KEY = "test-key";

const { server } = await import("../server.js");

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
});
