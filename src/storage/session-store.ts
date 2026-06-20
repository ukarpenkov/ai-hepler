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

const SESSION_TTL = 86400;

export async function createSession(client: Redis): Promise<SessionData> {
  const now = new Date().toISOString();
  const session: SessionData = {
    id: randomUUID(),
    jobProfile: null,
    history: [],
    weakSkills: [],
    createdAt: now,
    updatedAt: now,
  };
  await client.set(`session:${session.id}`, JSON.stringify(session), "EX", SESSION_TTL);
  return session;
}

export async function getSession(client: Redis, id: string): Promise<SessionData | null> {
  const data = await client.get(`session:${id}`);
  if (!data) return null;
  return JSON.parse(data) as SessionData;
}

export async function updateSession(
  client: Redis,
  id: string,
  data: Partial<SessionData>
): Promise<void> {
  const existing = await getSession(client, id);
  if (!existing) return;
  const updated = { ...existing, ...data, updatedAt: new Date().toISOString() };
  await client.set(`session:${id}`, JSON.stringify(updated), "EX", SESSION_TTL);
}

export async function deleteSession(client: Redis, id: string): Promise<void> {
  await client.del(`session:${id}`);
}
