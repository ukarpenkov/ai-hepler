import { describe, it, expect, beforeEach } from "vitest";
import Fastify from "fastify";
import { createRateLimiter, rateLimitStore } from "./rateLimiter.js";

describe("createRateLimiter", () => {
  beforeEach(() => {
    rateLimitStore.clear();
  });

  it("returns a Fastify plugin", () => {
    expect(typeof createRateLimiter).toBe("function");
  });

  it("returns 429 after exceeding max requests", async () => {
    const app = Fastify();
    await app.register(createRateLimiter, {
      windowMs: 60000,
      maxRequests: 3,
    });

    app.get("/test", async () => ({ ok: true }));

    for (let i = 0; i < 3; i++) {
      const res = await app.inject({ method: "GET", url: "/test" });
      expect(res.statusCode).toBe(200);
    }

    const res = await app.inject({ method: "GET", url: "/test" });
    expect(res.statusCode).toBe(429);
    const body = JSON.parse(res.payload);
    expect(body.error).toBe("Rate limit exceeded");
    expect(body.retryAfter).toBeGreaterThan(0);

    await app.close();
  });

  it("includes rate limit headers", async () => {
    const app = Fastify();
    await app.register(createRateLimiter, {
      windowMs: 60000,
      maxRequests: 10,
    });

    app.get("/test", async () => ({ ok: true }));

    const res = await app.inject({ method: "GET", url: "/test" });
    expect(res.headers["x-ratelimit-limit"]).toBe("10");
    expect(res.headers["x-ratelimit-remaining"]).toBe("9");
    expect(res.headers["x-ratelimit-reset"]).toBeDefined();

    await app.close();
  });

  it("resets counter after window expires", async () => {
    const app = Fastify();
    await app.register(createRateLimiter, {
      windowMs: 100,
      maxRequests: 2,
    });

    app.get("/test", async () => ({ ok: true }));

    const res1 = await app.inject({ method: "GET", url: "/test" });
    expect(res1.statusCode).toBe(200);
    const res2 = await app.inject({ method: "GET", url: "/test" });
    expect(res2.statusCode).toBe(200);
    const res3 = await app.inject({ method: "GET", url: "/test" });
    expect(res3.statusCode).toBe(429);

    await new Promise((r) => setTimeout(r, 150));

    const res4 = await app.inject({ method: "GET", url: "/test" });
    expect(res4.statusCode).toBe(200);

    await app.close();
  });

  it("tracks different IPs independently", async () => {
    const app = Fastify();
    await app.register(createRateLimiter, {
      windowMs: 60000,
      maxRequests: 1,
    });

    app.get("/test", async () => ({ ok: true }));

    const res1 = await app.inject({
      method: "GET",
      url: "/test",
      remoteAddress: "1.1.1.1",
    });
    expect(res1.statusCode).toBe(200);

    const res2 = await app.inject({
      method: "GET",
      url: "/test",
      remoteAddress: "1.1.1.1",
    });
    expect(res2.statusCode).toBe(429);

    const res3 = await app.inject({
      method: "GET",
      url: "/test",
      remoteAddress: "2.2.2.2",
    });
    expect(res3.statusCode).toBe(200);

    await app.close();
  });
});
