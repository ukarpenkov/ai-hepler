# Bug: Session history not shown on interview page sidebar

**Date:** 2026-06-23
**Priority:** Medium
**Status:** Fixed
**Component:** Frontend — `interview/page.tsx`, `Sidebar.tsx`

## Description

On the interview page (`/interview`), session history is not displayed in the sidebar. The sidebar is empty, although on the home page (`/`) sessions are shown correctly.

## Expected Behavior

- On the interview page, the sidebar should show a list of all sessions from IndexedDB
- Clicking a session in the sidebar should open that session

## Actual Behavior

- On the interview page, the sidebar is empty — no session list
- Clicking sessions does not work (no handler)

## Reproduction

1. Open http://localhost:3000
2. Create an interview (session is saved to IndexedDB)
3. Navigate to the interview page (`/interview?sessionId=...`)
4. Open the sidebar (click the hamburger)
5. **Observation:** sidebar is empty, no session history

## Root Cause

Two issues in `packages/web/app/interview/page.tsx`:

1. **Wrong data source:** Sessions were loaded from the backend API (`fetch(${apiBase}/sessions)`), not from IndexedDB via `listSessions()`. The backend API does not store sessions — they are stored only in the browser's IndexedDB.

2. **Missing click handler:** The `onSessionClick` prop was not passed to the `Sidebar` component, so even if sessions were loaded, clicking them would do nothing.

## Where to Fix

**`packages/web/app/interview/page.tsx`:**

- Import `listSessions` from `@/lib/session-store`
- Replace `fetch(${apiBase}/sessions)` with `listSessions()` using the same data mapping as on the home page
- Add a `handleSessionClick` function for navigating between sessions
- Pass `onSessionClick={handleSessionClick}` to the `Sidebar` component

## Components to Change

| File | Change |
|------|--------|
| `packages/web/app/interview/page.tsx` | Use `listSessions()` instead of API, add `handleSessionClick`, pass `onSessionClick` to Sidebar |
