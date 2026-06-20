import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

describe("config", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    vi.resetModules();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("returns values from env vars", async () => {
    process.env.OPENROUTER_API_KEY = "test-key";
    process.env.REDIS_URL = "redis://custom:6380";
    process.env.PORT = "4000";
    process.env.NODE_ENV = "production";

    const { default: cfg } = await import("../../config.js");
    expect(cfg.openrouterApiKey).toBe("test-key");
    expect(cfg.redisUrl).toBe("redis://custom:6380");
    expect(cfg.port).toBe(4000);
    expect(cfg.nodeEnv).toBe("production");
  });

  it("throws when OPENROUTER_API_KEY is missing", async () => {
    delete process.env.OPENROUTER_API_KEY;

    await expect(import("../../config.js")).rejects.toThrow(
      "OPENROUTER_API_KEY environment variable is required"
    );
  });
});
