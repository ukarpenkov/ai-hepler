# 2026-06-23 — Fix: jobProfile API Mismatch & Chat Error Handling

## Goal

Fix "jobProfile is required" error when starting interview and "An error occurred" error when submitting answer in chat.

## Problem

Two bugs blocked the main interview flow:

1. **Frontend API didn't send data to backend** — `startInterview()` and `sendAnswer()` in `packages/web/lib/api.ts` ignored `sessionData` parameters from calling code. Backend received requests without `jobProfile` and returned 400.

2. **`ParsedJob` type mismatch** — frontend used `{ title, company, seniority, requirements }`, while backend returns `{ role, level, skills, keywords, domain }`. Agents received `undefined` for key fields.

3. **Race condition with `sessionData`** — data loaded asynchronously from IndexedDB, but `ChatWindow` initialized state before data arrived, causing `null` when sending answer.

## Changes

### `packages/web/lib/api.ts`

- `startInterview` — added second parameter `sessionData`, passes `jobProfile`, `weakSkills`, `history` in request body
- `sendAnswer` — added third parameter `sessionData`, passed as `sessionData` in JSON

### `packages/web/lib/types.ts`

- `ParsedJob` aligned with backend: `{ role, level, skills, keywords, domain }`

### `packages/web/app/page.tsx`

- `s.jobProfile?.title` → `s.jobProfile?.role` (sidebar session title)
- `session.jobProfile?.title` → `session.jobProfile?.role` (fallback topic)

### `packages/web/components/ChatWindow.tsx`

- Added `useEffect` to sync `sessionData` prop with internal state
- Added null-guard `!currentSessionData?.jobProfile` in `handleSend`
- Catch block now logs error to console and shows specific message instead of generic "An error occurred"

## Verification

- `npm run typecheck` — passed
- `npm run lint` — passed
- Manual test: paste job description → first question → submit answer → receive score and next question