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

  it("returns deepseekApiKey from DEEPSEEK_API_KEY", async () => {
    process.env.DEEPSEEK_API_KEY = "test-key";

    const { default: cfg } = await import("../../config.js");
    expect(cfg.deepseekApiKey).toBe("test-key");
  });

  it("returns default llmBaseUrl", async () => {
    process.env.DEEPSEEK_API_KEY = "test-key";

    const { default: cfg } = await import("../../config.js");
    expect(cfg.llmBaseUrl).toBe("https://api.deepseek.com");
  });

  it("returns default llmModel", async () => {
    process.env.DEEPSEEK_API_KEY = "test-key";

    const { default: cfg } = await import("../../config.js");
    expect(cfg.llmModel).toBe("deepseek-chat");
  });

  it("returns redisUrl as undefined when REDIS_URL is not set", async () => {
    process.env.DEEPSEEK_API_KEY = "test-key";
    delete process.env.REDIS_URL;

    const { default: cfg } = await import("../../config.js");
    expect(cfg.redisUrl).toBeUndefined();
  });

  it("returns redisUrl from REDIS_URL when set", async () => {
    process.env.DEEPSEEK_API_KEY = "test-key";
    process.env.REDIS_URL = "redis://custom:6380";

    const { default: cfg } = await import("../../config.js");
    expect(cfg.redisUrl).toBe("redis://custom:6380");
  });

  it("throws when DEEPSEEK_API_KEY is missing", async () => {
    delete process.env.DEEPSEEK_API_KEY;

    await expect(import("../../config.js")).rejects.toThrow(
      "DEEPSEEK_API_KEY environment variable is required"
    );
  });
});
