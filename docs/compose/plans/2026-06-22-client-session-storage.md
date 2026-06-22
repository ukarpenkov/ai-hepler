# Client-Side Session Storage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use compose:subagent (recommended) or compose:execute to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move interview session storage from backend Redis to client-side IndexedDB, enabling users to browse past sessions from browser storage.

**Architecture:** Client becomes the source of truth for session data. Backend remains a stateless AI processing service — receives session context in request bodies, returns results, never persists sessions. Frontend stores all session data in IndexedDB via a wrapper library.

**Tech Stack:** IndexedDB (via `idb` library), Next.js frontend, Fastify backend (modified to accept session data in requests)

---

## File Structure

| Action | File | Purpose |
|--------|------|---------|
| Create | `packages/web/lib/session-store.ts` | IndexedDB wrapper (CRUD for sessions) |
| Create | `packages/web/lib/types.ts` | Update SessionData type to match backend |
| Modify | `src/agents/orchestrator.ts` | Add stateless `processAnswerStateless()` that accepts session data |
| Modify | `src/api/routes/job.ts` | Remove Redis session creation, return parsed job only |
| Modify | `src/api/routes/interview.ts` | Accept session data in request body, use stateless orchestrator |
| Modify | `src/api/routes/session.ts` | Remove Redis session endpoints (keep for backward compat) |
| Modify | `packages/web/lib/api.ts` | Update API calls to send session data |
| Modify | `packages/web/app/page.tsx` | Load sessions from IndexedDB, save after parse |
| Modify | `packages/web/app/interview/page.tsx` | Load/save session from IndexedDB |
| Modify | `packages/web/components/ChatWindow.tsx` | Save session updates to IndexedDB after each answer |
| Modify | `packages/web/components/Sidebar.tsx` | Load sessions from IndexedDB, add click handler |
| Create | `packages/web/app/history/page.tsx` | Full history page (optional, can skip if sidebar is enough) |

---

### Task 1: Create IndexedDB Session Store

**Covers:** Client-side storage foundation

**Files:**
- Create: `packages/web/lib/session-store.ts`

- [ ] **Step 1: Install `idb` library**

Run in `packages/web/`:
```bash
npm install idb
```

- [ ] **Step 2: Create the session store module**

```typescript
// packages/web/lib/session-store.ts
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
```

- [ ] **Step 3: Verify build**

Run in `packages/web/`:
```bash
npx tsc --noEmit
```
Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add packages/web/lib/session-store.ts packages/web/package.json packages/web/package-lock.json
git commit -m "feat(web): add IndexedDB session store"
```

---

### Task 2: Update Backend to Accept Session Data in Requests

**Covers:** Backend becomes stateless for session storage

**Files:**
- Modify: `src/agents/orchestrator.ts`
- Modify: `src/api/routes/job.ts`
- Modify: `src/api/routes/interview.ts`

- [ ] **Step 1: Add stateless orchestrator function**

In `src/agents/orchestrator.ts`, add a new function that accepts session data as parameter instead of looking it up from Redis:

```typescript
// Add after the existing processAnswer function (line 125)

export async function processAnswerStateless(
  sessionData: {
    jobProfile: ParsedJob;
    history: Array<{ role: string; content: string; timestamp: string }>;
    weakSkills: string[];
  },
  answer: string,
  config: { apiKey: string; baseUrl: string; model: string }
): Promise<{
  evaluation: EvaluationResult;
  coach: CoachResult;
  memory: MemoryUpdate;
  nextQuestion: QuestionResult;
  updatedHistory: Array<{ role: string; content: string; timestamp: string }>;
  updatedWeakSkills: string[];
}> {
  const lastMessage = sessionData.history
    .filter((m) => m.role === "assistant")
    .pop();
  const currentQuestion: QuestionResult = lastMessage
    ? JSON.parse(lastMessage.content)
    : { question: "", topic: "", difficulty: "easy" };

  const evalOutput = await evaluatorAgent({
    question: currentQuestion.question,
    answer,
    jobProfile: sessionData.jobProfile,
    config,
  });
  const evaluation: EvaluationResult = JSON.parse(evalOutput.result);

  const coachOutput = await coachAgent({
    question: currentQuestion.question,
    answer,
    evaluation,
    jobProfile: sessionData.jobProfile,
    config,
  });
  const coachResult: CoachResult = JSON.parse(coachOutput.result);

  // Update weak skills based on evaluation
  const updatedWeakSkills = [...sessionData.weakSkills];
  if (evaluation.score < 5) {
    if (!updatedWeakSkills.includes(currentQuestion.topic)) {
      updatedWeakSkills.push(currentQuestion.topic);
    }
  } else if (evaluation.score >= 7) {
    const idx = updatedWeakSkills.indexOf(currentQuestion.topic);
    if (idx !== -1) updatedWeakSkills.splice(idx, 1);
  }

  const questionOutput = await interviewerAgent({
    input: { sessionId: "stateless", content: "" },
    jobProfile: sessionData.jobProfile,
    weakSkills: updatedWeakSkills,
    previousQuestions: sessionData.history.map((m) => m.content),
    config,
  });
  const nextQuestion: QuestionResult = JSON.parse(questionOutput.result);

  const now = new Date().toISOString();
  const updatedHistory = [
    ...sessionData.history,
    { role: "user", content: answer, timestamp: now },
    { role: "assistant", content: questionOutput.result, timestamp: now },
  ];

  const memoryUpdate: MemoryUpdate = {
    weakTopics: updatedWeakSkills,
    progress: {},
  };

  return {
    evaluation,
    coach: coachResult,
    memory: memoryUpdate,
    nextQuestion,
    updatedHistory,
    updatedWeakSkills,
  };
}
```

- [ ] **Step 2: Modify `POST /job/parse` to not create session**

In `src/api/routes/job.ts`, remove session creation. The route should only parse the job and return the profile — the client creates the session:

```typescript
import type { FastifyInstance } from "fastify";
import { parseJob } from "../../agents/orchestrator.js";
import { isValidJobText } from "../../utils/validators.js";
import { sanitizeJobText } from "../../utils/sanitize.js";
import { sanitizeInput, InputValidationError } from "../../security/sanitizer.js";
import config from "../../config.js";

export async function jobRoutes(app: FastifyInstance) {
  app.post("/job/parse", async (request, reply) => {
    const { text } = request.body as { text?: string };

    if (!text || !isValidJobText(text)) {
      return reply.status(400).send({ error: "Text is required and must be at least 50 characters" });
    }

    let sanitized: string;
    try {
      sanitized = sanitizeInput(sanitizeJobText(text));
    } catch (e) {
      if (e instanceof InputValidationError) {
        return reply.status(400).send({ error: e.message });
      }
      throw e;
    }

    // Generate a temporary sessionId for the orchestrator (not stored on backend)
    const tempId = crypto.randomUUID();
    const llmConfig = { apiKey: config.apiKey, baseUrl: config.llmBaseUrl, model: config.llmModel };
    const jobProfile = await parseJob(sanitized, tempId, app.redis, llmConfig);

    return { jobProfile };
  });
}
```

- [ ] **Step 3: Modify `POST /interview/answer` to accept session data**

In `src/api/routes/interview.ts`, update the answer route to accept session data in the body and use the stateless orchestrator:

```typescript
import type { FastifyInstance } from "fastify";
import { startInterview, processAnswerStateless } from "../../agents/orchestrator.js";
import { sanitizeInput, InputValidationError } from "../../security/sanitizer.js";
import { isValidAnswer } from "../../utils/validators.js";
import config from "../../config.js";

export async function interviewRoutes(app: FastifyInstance) {
  app.post("/interview/start", async (request, reply) => {
    const { sessionId, jobProfile, weakSkills, history } = request.body as {
      sessionId?: string;
      jobProfile?: any;
      weakSkills?: string[];
      history?: Array<{ role: string; content: string; timestamp: string }>;
    };

    if (!sessionId) {
      return reply.status(400).send({ error: "sessionId is required" });
    }

    if (!jobProfile) {
      return reply.status(400).send({ error: "jobProfile is required" });
    }

    const llmConfig = { apiKey: config.apiKey, baseUrl: config.llmBaseUrl, model: config.llmModel };
    try {
      const question = await startInterview(
        sessionId,
        app.redis,
        llmConfig
      );
      // Override the session lookup — use provided data
      // We need to modify startInterview to accept session data directly
      return { question };
    } catch (e) {
      request.log.error(e, "startInterview failed");
      return reply.status(500).send({ error: "Failed to start interview. Please try again." });
    }
  });

  app.post("/interview/answer", async (request, reply) => {
    const { sessionId, answer, sessionData } = request.body as {
      sessionId?: string;
      answer?: string;
      sessionData?: {
        jobProfile: any;
        history: Array<{ role: string; content: string; timestamp: string }>;
        weakSkills: string[];
      };
    };

    if (!sessionId) {
      return reply.status(400).send({ error: "sessionId is required" });
    }

    if (!answer || !isValidAnswer(answer)) {
      return reply.status(400).send({ error: "Answer is required and must be at least 10 characters" });
    }

    if (!sessionData?.jobProfile) {
      return reply.status(400).send({ error: "sessionData with jobProfile is required" });
    }

    let sanitized: string;
    try {
      sanitized = sanitizeInput(answer);
    } catch (e) {
      if (e instanceof InputValidationError) {
        return reply.status(400).send({ error: e.message });
      }
      throw e;
    }

    const llmConfig = { apiKey: config.apiKey, baseUrl: config.llmBaseUrl, model: config.llmModel };
    try {
      const result = await processAnswerStateless(
        {
          jobProfile: sessionData.jobProfile,
          history: sessionData.history,
          weakSkills: sessionData.weakSkills ?? [],
        },
        sanitized,
        llmConfig
      );
      return {
        evaluation: result.evaluation,
        coach: result.coach,
        memory: result.memory,
        nextQuestion: result.nextQuestion,
        updatedHistory: result.updatedHistory,
        updatedWeakSkills: result.updatedWeakSkills,
      };
    } catch (e) {
      request.log.error(e, "processAnswer failed");
      return reply.status(500).send({ error: "Failed to process answer. Please try again." });
    }
  });
}
```

- [ ] **Step 4: Add `startInterviewStateless` to orchestrator**

Since `startInterview` currently reads from Redis, add a stateless version:

```typescript
// Add to src/agents/orchestrator.ts

export async function startInterviewStateless(
  sessionData: {
    jobProfile: ParsedJob;
    weakSkills: string[];
    history: Array<{ role: string; content: string; timestamp: string }>;
  },
  config: { apiKey: string; baseUrl: string; model: string }
): Promise<QuestionResult> {
  const output = await interviewerAgent({
    input: { sessionId: "stateless", content: "" },
    jobProfile: sessionData.jobProfile,
    weakSkills: sessionData.weakSkills,
    previousQuestions: sessionData.history.map((m) => m.content),
    config,
  });

  return JSON.parse(output.result);
}
```

Then update the `/interview/start` route to use it:

```typescript
app.post("/interview/start", async (request, reply) => {
  const { sessionId, jobProfile, weakSkills, history } = request.body as {
    sessionId?: string;
    jobProfile?: any;
    weakSkills?: string[];
    history?: Array<{ role: string; content: string; timestamp: string }>;
  };

  if (!sessionId || !jobProfile) {
    return reply.status(400).send({ error: "sessionId and jobProfile are required" });
  }

  const llmConfig = { apiKey: config.apiKey, baseUrl: config.llmBaseUrl, model: config.llmModel };
  try {
    const question = await startInterviewStateless(
      { jobProfile, weakSkills: weakSkills ?? [], history: history ?? [] },
      llmConfig
    );
    return { question };
  } catch (e) {
    request.log.error(e, "startInterview failed");
    return reply.status(500).send({ error: "Failed to start interview. Please try again." });
  }
});
```

- [ ] **Step 5: Run backend typecheck**

```bash
npm run typecheck
```
Expected: no errors

- [ ] **Step 6: Commit**

```bash
git add src/agents/orchestrator.ts src/api/routes/job.ts src/api/routes/interview.ts
git commit -m "feat(backend): make session storage client-driven, add stateless orchestrator"
```

---

### Task 3: Update Frontend API Client

**Covers:** Frontend sends session data to backend

**Files:**
- Modify: `packages/web/lib/api.ts`
- Modify: `packages/web/lib/types.ts`

- [ ] **Step 1: Update types to match backend**

```typescript
// packages/web/lib/types.ts

export interface ParsedJob {
  title: string;
  company: string;
  seniority: string;
  domain: string;
  skills: string[];
  requirements: string[];
}

export interface QuestionResult {
  question: string;
  topic: string;
  difficulty: "easy" | "medium" | "hard";
}

export interface EvaluationResult {
  score: number;
  strengths: string[];
  weaknesses: string[];
  recommendation: string;
}

export interface CoachResult {
  explanation: string;
  improvedAnswer: string;
  tips: string[];
}

export interface MemoryUpdate {
  weakTopics: string[];
  progress: Record<string, number>;
}

export interface SessionData {
  id: string;
  jobProfile: ParsedJob | null;
  history: Array<{ role: string; content: string; timestamp: string }>;
  weakSkills: string[];
  createdAt: string;
  updatedAt: string;
}
```

- [ ] **Step 2: Update API client**

```typescript
// packages/web/lib/api.ts

import type { ParsedJob, QuestionResult, EvaluationResult, CoachResult, MemoryUpdate, SessionData } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

export function parseJob(text: string): Promise<{ jobProfile: ParsedJob }> {
  return request("/job/parse", {
    method: "POST",
    body: JSON.stringify({ text }),
  });
}

export function startInterview(sessionId: string, sessionData: {
  jobProfile: ParsedJob;
  weakSkills: string[];
  history: Array<{ role: string; content: string; timestamp: string }>;
}): Promise<{ question: QuestionResult }> {
  return request("/interview/start", {
    method: "POST",
    body: JSON.stringify({ sessionId, ...sessionData }),
  });
}

export function sendAnswer(
  sessionId: string,
  answer: string,
  sessionData: {
    jobProfile: ParsedJob;
    weakSkills: string[];
    history: Array<{ role: string; content: string; timestamp: string }>;
  }
): Promise<{
  evaluation: EvaluationResult;
  coach: CoachResult;
  memory: MemoryUpdate;
  nextQuestion: QuestionResult;
  updatedHistory: Array<{ role: string; content: string; timestamp: string }>;
  updatedWeakSkills: string[];
}> {
  return request("/interview/answer", {
    method: "POST",
    body: JSON.stringify({ sessionId, answer, sessionData }),
  });
}
```

- [ ] **Step 3: Run typecheck**

```bash
npx tsc --noEmit
```
Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add packages/web/lib/api.ts packages/web/lib/types.ts
git commit -m "feat(web): update API client to send session data in requests"
```

---

### Task 4: Update Home Page to Use IndexedDB

**Covers:** Sessions loaded from and saved to IndexedDB

**Files:**
- Modify: `packages/web/app/page.tsx`

- [ ] **Step 1: Rewrite page.tsx to use IndexedDB**

```typescript
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { parseJob, startInterview } from "@/lib/api";
import { createSession, updateSession, listSessions } from "@/lib/session-store";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import JobInputForm from "@/components/JobInputForm";

const MOBILE_BREAKPOINT = 768;

interface Session {
  id: string;
  title: string;
  date: string;
}

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT;
      setIsMobile(mobile);
      if (mobile) setIsSidebarOpen(false);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    listSessions().then((list) => {
      setSessions(
        list.map((s) => ({
          id: s.id,
          title: s.jobProfile?.role || "Без названия",
          date: new Date(s.createdAt).toLocaleDateString("ru-RU"),
        }))
      );
    });
  }, []);

  const closeSidebar = useCallback(() => {
    if (isMobile) setIsSidebarOpen(false);
  }, [isMobile]);

  const handleSubmit = async (text: string) => {
    setIsLoading(true);
    setError("");

    try {
      // 1. Parse job via backend
      const { jobProfile } = await parseJob(text);

      // 2. Create session in IndexedDB
      const session = await createSession();
      await updateSession(session.id, { jobProfile });

      // 3. Start interview via backend (sending session data)
      const { question } = await startInterview(session.id, {
        jobProfile,
        weakSkills: [],
        history: [],
      });

      // 4. Navigate to interview
      const params = new URLSearchParams({
        sessionId: session.id,
        question: question.question,
        topic: question.topic,
        difficulty: question.difficulty,
      });

      router.push(`/interview?${params.toString()}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Произошла ошибка");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header isSidebarOpen={isSidebarOpen} onMenuToggle={() => setIsSidebarOpen((prev) => !prev)} />
      <Sidebar isOpen={isSidebarOpen} sessions={sessions} />
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-[98] transition-opacity duration-300"
          onClick={closeSidebar}
        />
      )}
      <div className="max-w-[800px] w-[90%] p-10 glass rounded-[24px] relative z-[1] animate-slide-up shadow-glass">
        <JobInputForm onSubmit={handleSubmit} isLoading={isLoading} />
        {error && (
          <p className="mt-4 text-red-500 text-center">{error}</p>
        )}
      </div>
    </>
  );
}
```

- [ ] **Step 2: Run typecheck**

```bash
npx tsc --noEmit
```
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add packages/web/app/page.tsx
git commit -m "feat(web): use IndexedDB for session creation and listing"
```

---

### Task 5: Update Interview Page to Use IndexedDB

**Covers:** Interview page reads/writes session from IndexedDB

**Files:**
- Modify: `packages/web/app/interview/page.tsx`

- [ ] **Step 1: Read current interview page**

Read `packages/web/app/interview/page.tsx` to understand current structure.

- [ ] **Step 2: Update to load session from IndexedDB**

The interview page receives `sessionId` via URL search params. It should load the session from IndexedDB and pass it to ChatWindow:

```typescript
// packages/web/app/interview/page.tsx
// Key changes:
// 1. Import getSession from session-store
// 2. Load session data from IndexedDB on mount
// 3. Pass session data to ChatWindow
// 4. ChatWindow saves updates back to IndexedDB
```

The exact implementation depends on the current file content. The key pattern:

```typescript
import { getSession, updateSession } from "@/lib/session-store";

// In the component:
useEffect(() => {
  const sessionId = searchParams.get("sessionId");
  if (sessionId) {
    getSession(sessionId).then((session) => {
      if (session) {
        setSessionData(session);
      }
    });
  }
}, [searchParams]);
```

- [ ] **Step 3: Run typecheck**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add packages/web/app/interview/page.tsx
git commit -m "feat(web): load interview session from IndexedDB"
```

---

### Task 6: Update ChatWindow to Save to IndexedDB

**Covers:** Session data persisted after each answer

**Files:**
- Modify: `packages/web/components/ChatWindow.tsx`

- [ ] **Step 1: Add IndexedDB updates after each answer**

In `ChatWindow.tsx`, after `sendAnswer` returns, save the updated history and weakSkills to IndexedDB:

```typescript
import { updateSession } from "@/lib/session-store";

// In handleSend, after getting response:
const response = await sendAnswer(sessionId, answer, {
  jobProfile: sessionData.jobProfile,
  weakSkills: sessionData.weakSkills,
  history: sessionData.history,
});

// Save updated session to IndexedDB
await updateSession(sessionId, {
  history: response.updatedHistory,
  weakSkills: response.updatedWeakSkills,
});
```

The `ChatWindow` component needs a new prop `sessionData` (the full session from IndexedDB) and must pass it to `sendAnswer`.

- [ ] **Step 2: Run typecheck**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add packages/web/components/ChatWindow.tsx
git commit -m "feat(web): persist session updates to IndexedDB after each answer"
```

---

### Task 7: Update Sidebar to Navigate to Past Sessions

**Covers:** Clicking a session in sidebar opens it

**Files:**
- Modify: `packages/web/components/Sidebar.tsx`
- Modify: `packages/web/app/page.tsx` (add click handler)

- [ ] **Step 1: Add onClick prop to Sidebar**

```typescript
interface SidebarProps {
  isOpen: boolean;
  sessions: Session[];
  onSessionClick?: (sessionId: string) => void;
}

export default function Sidebar({ isOpen, sessions, onSessionClick }: SidebarProps) {
  return (
    <aside className={...}>
      <CustomScrollbar className="h-full">
        <div className="text-xs font-semibold text-content-secondary uppercase tracking-wider mb-5 mt-1 px-2.5">
          История сессий
        </div>
        <div className="space-y-2">
          {sessions.map((session) => (
            <div
              key={session.id}
              onClick={() => onSessionClick?.(session.id)}
              className="p-3.5 px-4 rounded-xl bg-surface-card border border-[var(--border)] cursor-pointer transition-all duration-300 hover:bg-primary hover:text-white hover:translate-x-1.5 hover:shadow-lg hover:shadow-primary/30"
            >
              <div className="text-sm font-medium mb-1">{session.title}</div>
              <div className="text-xs text-content-secondary">{session.date}</div>
            </div>
          ))}
        </div>
      </CustomScrollbar>
    </aside>
  );
}
```

- [ ] **Step 2: Add click handler in page.tsx**

In `page.tsx`, add a handler that loads the session from IndexedDB and navigates to the interview page:

```typescript
const handleSessionClick = async (sessionId: string) => {
  const session = await getSession(sessionId);
  if (!session?.jobProfile) return;

  // Get the last question from history
  const lastAssistant = session.history
    .filter((m) => m.role === "assistant")
    .pop();

  if (lastAssistant) {
    const questionData = JSON.parse(lastAssistant.content);
    const params = new URLSearchParams({
      sessionId,
      question: questionData.question,
      topic: questionData.topic,
      difficulty: questionData.difficulty,
    });
    router.push(`/interview?${params.toString()}`);
  }
};

// Pass to Sidebar:
<Sidebar isOpen={isSidebarOpen} sessions={sessions} onSessionClick={handleSessionClick} />
```

- [ ] **Step 3: Run typecheck**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add packages/web/components/Sidebar.tsx packages/web/app/page.tsx
git commit -m "feat(web): enable sidebar click to open past sessions"
```

---

### Task 8: Remove Redis Session Routes (Optional Cleanup)

**Covers:** Clean up unused backend session endpoints

**Files:**
- Modify: `src/api/routes/session.ts`
- Modify: `src/api/server.ts`

- [ ] **Step 1: Remove or simplify session routes**

The `GET /sessions` and `GET /session/:id` routes are no longer needed since the client owns sessions. Either remove them or keep as no-ops:

```typescript
// src/api/routes/session.ts — simplified
import type { FastifyInstance } from "fastify";

export async function sessionRoutes(app: FastifyInstance) {
  // Sessions are now stored client-side in IndexedDB.
  // These endpoints are kept for backward compatibility but return empty results.
  app.get("/sessions", async () => {
    return [];
  });

  app.get("/session/:id", async (_request, reply) => {
    return reply.status(404).send({ error: "Session not found" });
  });
}
```

- [ ] **Step 2: Run typecheck and lint**

```bash
npm run typecheck && npm run lint
```

- [ ] **Step 3: Commit**

```bash
git add src/api/routes/session.ts
git commit -m "refactor(backend): simplify session routes for client-driven storage"
```

---

### Task 9: Verify End-to-End

**Covers:** Everything works together

- [ ] **Step 1: Run all checks**

```bash
npm run typecheck && npm run lint && npm run test
```
Expected: all pass

- [ ] **Step 2: Manual test flow**

1. Open `http://localhost:3000`
2. Paste a job description, submit
3. Verify session appears in sidebar
4. Complete an interview question
5. Close and reopen the browser — session should persist in sidebar
6. Click a past session — should open the interview

- [ ] **Step 3: Final commit if needed**

```bash
git add -A
git commit -m "chore: verify client-side session storage works end-to-end"
```
