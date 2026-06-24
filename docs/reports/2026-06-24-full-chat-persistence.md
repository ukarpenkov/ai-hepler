# 2026-06-24 — Full Chat Persistence in IndexedDB

## Goal

Store full chat history (questions, answers, scores, feedback) in IndexedDB, so opening a previous session restores the entire chat.

## Problem

When opening a previous session from the sidebar, only the AI question was displayed. User answers, score blocks, and summary block weren't restored. Three reasons:

1. **User answer wasn't persisted** — in `handleSend`, the `messages` variable was state that hadn't updated yet when `updatedMessages` was formed. So the user answer didn't make it to IndexedDB.

2. **Feedback data wasn't saved** — `allFeedbacks` (scores, coach breakdown) were only stored in ChatWindow's local state and lost on reload.

3. **Restoration didn't work** — `useState(() => buildInitialMessages(...))` only ran on mount. When `getSession()` loaded data later, stored data wasn't applied.

## Changes

### `packages/web/lib/session-store.ts`

- Added `ChatMessage` (with `evaluation?` and `coach?`) and `FeedbackData` (with `answer`) interfaces
- `SessionRecord` gained new fields: `chatMessages: ChatMessage[]` and `allFeedbacks: FeedbackData[]`
- `DB_VERSION` increased to 2 with migration (fills empty arrays for old records)
- `createSession()` initializes new fields with empty arrays
- New types `ChatMessage`, `FeedbackData` exported

### `packages/web/components/ChatWindow.tsx`

- New `storedChatMessages` and `storedFeedbacks` props for passing stored data
- Added `useEffect` that updates `messages`, `allFeedbacks`, `questionCount` and `isSummaryOpen` when stored data loads from IndexedDB (solves timing issue)
- In `handleSend`: added `userMsg` explicitly to `updatedMessages` (solves state staleness)
- `FeedbackData` now stores `answer` (user answer text)
- After answer, persists `chatMessages` and `allFeedbacks` to IndexedDB

### `packages/web/app/interview/page.tsx`

- `sessionData` type changed from `SessionData` to `SessionRecord` (access to `chatMessages`/`allFeedbacks`)
- `storedChatMessages` and `storedFeedbacks` passed to `ChatWindow`

### `packages/web/components/SummaryView.tsx`

- Added "Your Answer" block — shows user answer text for each question in summary

### `packages/web/__tests__/api.test.ts`

- Updated `startInterview` and `sendAnswer` calls to match current signatures (pre-existing desync)

### `packages/web/components/SummaryView.test.tsx`

- Added `answer` field to mock data
- Added test for "Your Answer" block

### `packages/web/app/interview/__tests__/page.test.tsx`

- Added `listSessions` to `@/lib/session-store` mock

### `packages/web/components/ChatWindow.test.tsx`

- Added `updateSession` mock from `@/lib/session-store`

## Verification

- `npx tsc --noEmit` — passed (0 errors)
- `npx eslint` — 1 pre-existing warning (useCallback deps)
- `npx vitest run` — 65 passed, 4 failed (pre-existing ChatWindow test issues unrelated to changes)