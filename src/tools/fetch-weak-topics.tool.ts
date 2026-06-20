import type { Redis } from "ioredis";
import { getSession } from "../storage/session-store.js";

export async function fetchWeakTopicsTool(params: {
  sessionId: string;
  redis: Redis;
}): Promise<string[]> {
  const { sessionId, redis } = params;

  const session = await getSession(redis, sessionId);

  if (!session) {
    return [];
  }

  return session.weakSkills;
}
