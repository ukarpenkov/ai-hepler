import { describe, it, expect, vi, beforeEach } from "vitest";

const mockStore = new Map<string, string>();
const mockSet = vi.fn(async (key: string, value: string) => {
  mockStore.set(key, value);
  return "OK";
});
const mockGet = vi.fn(async (key: string) => mockStore.get(key) ?? null);
const mockDel = vi.fn(async (key: string) => {
  mockStore.delete(key);
  return 1;
});
const mockQuit = vi.fn(async () => "OK");

vi.mock("ioredis", () => ({
  Redis: vi.fn().mockImplementation(() => ({
    set: mockSet,
    get: mockGet,
    del: mockDel,
    quit: mockQuit,
  })),
}));

import { createRedisClient, closeRedisClient } from "../redis.js";

describe("createRedisClient", () => {
  beforeEach(() => {
    mockStore.clear();
    vi.clearAllMocks();
  });

  it("creates a Redis client instance", () => {
    const client = createRedisClient("redis://localhost:6379");
    expect(client).toBeDefined();
  });
});

describe("closeRedisClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls quit on the client", async () => {
    const client = createRedisClient("redis://localhost:6379");
    await closeRedisClient(client);
    expect(mockQuit).toHaveBeenCalledOnce();
  });

  it("does nothing when client is null", async () => {
    await closeRedisClient(null);
    expect(mockQuit).not.toHaveBeenCalled();
  });
});

describe("Redis error handling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("propagates errors from Redis set", async () => {
    mockSet.mockRejectedValueOnce(new Error("Connection refused"));
    const client = createRedisClient("redis://localhost:6379");
    await expect(client.set("key", "value")).rejects.toThrow("Connection refused");
  });

  it("propagates errors from Redis get", async () => {
    mockGet.mockRejectedValueOnce(new Error("Connection refused"));
    const client = createRedisClient("redis://localhost:6379");
    await expect(client.get("key")).rejects.toThrow("Connection refused");
  });

  it("propagates errors from Redis del", async () => {
    mockDel.mockRejectedValueOnce(new Error("Connection refused"));
    const client = createRedisClient("redis://localhost:6379");
    await expect(client.del("key")).rejects.toThrow("Connection refused");
  });
});
