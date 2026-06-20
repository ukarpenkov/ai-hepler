import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createSession,
  getSession,
  updateSession,
  deleteSession,
} from "../session-store.js";

function mockRedis() {
  const store = new Map<string, string>();
  return {
    set: vi.fn(async (key: string, value: string) => {
      store.set(key, value);
    }),
    get: vi.fn(async (key: string) => store.get(key) ?? null),
    del: vi.fn(async (key: string) => {
      store.delete(key);
    }),
    _store: store,
  };
}

describe("session-store", () => {
  let redis: ReturnType<typeof mockRedis>;

  beforeEach(() => {
    redis = mockRedis();
  });

  it("createSession creates a session with id and timestamps", async () => {
    const session = await createSession(redis as never);
    expect(session.id).toBeDefined();
    expect(session.createdAt).toBeDefined();
    expect(session.updatedAt).toBe(session.createdAt);
    expect(session.jobProfile).toBeNull();
    expect(session.history).toEqual([]);
    expect(session.weakSkills).toEqual([]);
    expect(redis.set).toHaveBeenCalled();
  });

  it("getSession returns null for non-existent id", async () => {
    const result = await getSession(redis as never, "non-existent");
    expect(result).toBeNull();
  });

  it("getSession returns session after create", async () => {
    const created = await createSession(redis as never);
    const fetched = await getSession(redis as never, created.id);
    expect(fetched).toEqual(created);
  });

  it("updateSession updates only provided fields", async () => {
    const created = await createSession(redis as never);
    await updateSession(redis as never, created.id, { weakSkills: ["typescript"] });
    const updated = await getSession(redis as never, created.id);
    expect(updated?.weakSkills).toEqual(["typescript"]);
    expect(updated?.id).toBe(created.id);
    expect(updated?.history).toEqual([]);
  });

  it("deleteSession calls del", async () => {
    const created = await createSession(redis as never);
    await deleteSession(redis as never, created.id);
    expect(redis.del).toHaveBeenCalledWith(`session:${created.id}`);
  });
});
