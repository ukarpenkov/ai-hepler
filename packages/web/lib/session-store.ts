import { openDB, type IDBPDatabase } from "idb";

const DB_NAME = "interview-simulator";
const DB_VERSION = 1;
const STORE_NAME = "sessions";

interface SessionRecord {
  id: string;
  jobProfile: {
    role: string;
    level: string;
    skills: string[];
    keywords: string[];
    domain: string;
  } | null;
  history: Array<{
    role: "user" | "assistant";
    content: string;
    timestamp: string;
  }>;
  weakSkills: string[];
  createdAt: string;
  updatedAt: string;
}

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
          store.createIndex("createdAt", "createdAt");
        }
      },
    });
  }
  return dbPromise;
}

export async function createSession(): Promise<SessionRecord> {
  const db = await getDB();
  const now = new Date().toISOString();
  const session: SessionRecord = {
    id: crypto.randomUUID(),
    jobProfile: null,
    history: [],
    weakSkills: [],
    createdAt: now,
    updatedAt: now,
  };
  await db.put(STORE_NAME, session);
  return session;
}

export async function getSession(id: string): Promise<SessionRecord | null> {
  const db = await getDB();
  return (await db.get(STORE_NAME, id)) ?? null;
}

export async function updateSession(
  id: string,
  data: Partial<SessionRecord>
): Promise<void> {
  const db = await getDB();
  const existing = await db.get(STORE_NAME, id);
  if (!existing) return;
  const updated = { ...existing, ...data, updatedAt: new Date().toISOString() };
  await db.put(STORE_NAME, updated);
}

export async function listSessions(): Promise<
  Pick<SessionRecord, "id" | "jobProfile" | "createdAt">[]
> {
  const db = await getDB();
  const all = await db.getAll(STORE_NAME);
  return all
    .map((s) => ({ id: s.id, jobProfile: s.jobProfile, createdAt: s.createdAt }))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function deleteSession(id: string): Promise<void> {
  const db = await getDB();
  await db.delete(STORE_NAME, id);
}

export type { SessionRecord };
