# Feature: Completed session UX — disabled input + results block

**Date:** 2026-06-24
**Priority:** High
**Status:** Done
**Component:** Frontend — ChatWindow

---

## Description

When navigating to a completed session (all questions asked), the interface correctly displays a disabled input and results block. Previously: input was hidden completely, `isFinished` wasn't initialized from IndexedDB, and when navigating to a past session the behavior was unpredictable.

---

## Current Behavior (before changes)

- When loading a completed session, `isFinished` remained `false` — input was active
- `storedFeedbacks` were loaded but `isFinished` wasn't set to `true`
- Input block was hidden via `{!isFinished && (...)}` — active input flashed during navigation
- `BottomSheet` with `SummaryView` didn't display on load (only after answering)

---

## Expected Behavior

### 1. Disabled input on completion

- `textarea` and submit button receive `disabled` when `isFinished === true`
- Placeholder changes to "Interview completed"
- Input block is always visible (not hidden), but inactive
- Scrollbar of input is hidden when `isFinished`

### 2. Auto-initialization of isFinished

- When loading `storedFeedbacks` from IndexedDB: if `storedFeedbacks.length >= TOTAL_QUESTIONS` → `setIsFinished(true)`
- When answering the last question: `setIsFinished(true)` (as before)

### 3. BottomSheet with results

- When `isFinished === true`, `BottomSheet` with `SummaryView` renders
- When loading a completed session, `isSummaryOpen = true` (summary is expanded)
- Results (`allFeedbacks`) are saved to IndexedDB via `updateSession()`

---

## Acceptance Criteria

- [x] When loading a completed session, input is disabled with placeholder "Interview completed"
- [x] Submit button is disabled when `isFinished`
- [x] `BottomSheet` with `SummaryView` displays when loading a completed session
- [x] `isSummaryOpen = true` when loading a completed session
- [x] Results (`allFeedbacks`) are saved to IndexedDB
- [x] All tests pass
- [x] typecheck without errors
- [x] lint without errors (pre-existing warnings acceptable)

---

## Files to Modify

| File | Action |
|------|--------|
| `packages/web/components/ChatWindow.tsx` | Update — `isFinished` logic, disabled input, placeholder |
| `packages/web/components/ChatWindow.test.tsx` | Update — disabled input tests, mock `sessionData` |

---

## Priorities

| Element | Priority |
|---------|----------|
| `isFinished` initialization from IndexedDB | **High** |
| Disabled input + placeholder | **High** |
| BottomSheet on load | **High** |
| Tests | **Medium** |