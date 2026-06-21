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

  it("returns apiKey from OPENROUTER_API_KEY", async () => {
    process.env.OPENROUTER_API_KEY = "openrouter-key";

    const { default: cfg } = await import("../../config.js");
    expect(cfg.apiKey).toBe("openrouter-key");
  });

  it("returns apiKey from DEEPSEEK_API_KEY when OPENROUTER_API_KEY not set", async () => {
    delete process.env.OPENROUTER_API_KEY;
    process.env.DEEPSEEK_API_KEY = "deepseek-key";

    const { default: cfg } = await import("../../config.js");
    expect(cfg.apiKey).toBe("deepseek-key");
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

  it("throws when both API keys are missing", async () => {
    delete process.env.OPENROUTER_API_KEY;
    delete process.env.DEEPSEEK_API_KEY;

    await expect(import("../../config.js")).rejects.toThrow(
      "OPENROUTER_API_KEY or DEEPSEEK_API_KEY environment variable is required"
    );
  });
});
