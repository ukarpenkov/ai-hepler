# 2026-06-23 — Fix: Session History Not Shown on Interview Page

## Goal

Fix missing session history in sidebar on the interview page.

## Problem

On the interview page (`/interview`), the sidebar was empty — session history wasn't displayed, even though it worked correctly on the main page. Two reasons:

1. **Wrong data source** — in `interview/page.tsx`, sessions were loaded from backend API (`fetch(${apiBase}/sessions)`), not from IndexedDB. Backend doesn't store sessions — they're only stored in the browser via `idb`.

2. **Missing click handler** — the `onSessionClick` prop wasn't passed to the `Sidebar` component, so clicking sessions did nothing.

## Changes

### `packages/web/app/interview/page.tsx`

- Added `listSessions` import from `@/lib/session-store`
- Replaced `fetch(${apiBase}/sessions)` with `listSessions()` and mapping `{ id, title: jobProfile.role, date }` — same as main page
- Added `handleSessionClick` function — loads session from IndexedDB, extracts last question from `history`, builds URL params and executes `router.push`
- Added `onSessionClick={handleSessionClick}` prop to `Sidebar`

## Verification

- `npm run typecheck` — passed
- `npm run lint` — passed