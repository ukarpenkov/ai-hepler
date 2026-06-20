import { randomUUID } from "node:crypto";
import type { Redis } from "ioredis";

export interface JobProfile {
  role: string;
  level: string;
  skills: string[];
  keywords: string[];
  domain: string;
}

export interface InterviewMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface SessionData {
  id: string;
  jobProfile: JobProfile | null;
  history: InterviewMessage[];
  weakSkills: string[];
  createdAt: string;
  updatedAt: string;
}

const SESSION_TTL_MS = 86400 * 1000;

const memoryStore = new Map<string, { data: SessionData; expiresAt: number }>();

function isExpired(entry: { expiresAt: number }): boolean {
  return Date.now() > entry.expiresAt;
}

export async function createSession(client: Redis | null): Promise<SessionData> {
  const now = new Date().toISOString();
  const session: SessionData = {
    id: randomUUID(),
    jobProfile: null,
    history: [],
    weakSkills: [],
    createdAt: now,
    updatedAt: now,
  };

  if (client) {
    await client.set(`session:${session.id}`, JSON.stringify(session), "EX", 86400);
  } else {
    memoryStore.set(session.id, { data: session, expiresAt: Date.now() + SESSION_TTL_MS });
  }

  return session;
}

export async function getSession(client: Redis | null, id: string): Promise<SessionData | null> {
  if (client) {
    const data = await client.get(`session:${id}`);
    if (!data) return null;
    return JSON.parse(data) as SessionData;
  }

  const entry = memoryStore.get(id);
  if (!entry || isExpired(entry)) {
    if (entry) memoryStore.delete(id);
    return null;
  }
  return entry.data;
}

export async function updateSession(
  client: Redis | null,
  id: string,
  data: Partial<SessionData>
): Promise<void> {
  if (client) {
    const existing = await getSession(client, id);
    if (!existing) return;
    const updated = { ...existing, ...data, updatedAt: new Date().toISOString() };
    await client.set(`session:${id}`, JSON.stringify(updated), "EX", 86400);
    return;
  }

  const entry = memoryStore.get(id);
  if (!entry || isExpired(entry)) {
    if (entry) memoryStore.delete(id);
    return;
  }
  entry.data = { ...entry.data, ...data, updatedAt: new Date().toISOString() };
}

export async function deleteSession(client: Redis | null, id: string): Promise<void> {
  if (client) {
    await client.del(`session:${id}`);
    return;
  }
  memoryStore.delete(id);
}
