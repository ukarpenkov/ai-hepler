# 2026-06-26 — Fix: summary bottom sheet not shown for completed session

## Bug

`docs/spec/bugs/006-summary-bottom-sheet-not-shown-for-completed-session.md`

## Problem

When navigating to a completed session from the sidebar, the interview results bottom sheet (SummaryView) did not appear. The chat loaded, the input was disabled, but no summary was visible.

## Root Cause

Off-by-one in the restore condition. The `useEffect` that restores stored feedbacks checks:

```typescript
if (storedFeedbacks.length >= TOTAL_QUESTIONS) {  // >= 6
  setIsFinished(true);
}
```

But a completed interview only stores **5 feedbacks** — the loop stops when `nextCount >= 6` after answering question 5. The condition never matched, so `isFinished` stayed `false` and `isSummaryOpen` was never opened.

## Fix

**`packages/web/components/ChatWindow.tsx:87`**

Changed to account for the actual number of stored feedbacks:

```typescript
// BEFORE — off-by-one, needs 6 but only 5 exist
if (storedFeedbacks.length >= TOTAL_QUESTIONS) {
  setIsFinished(true);
}

// AFTER — matches the 5 feedbacks a completed session contains
if (storedFeedbacks.length >= TOTAL_QUESTIONS - 1) {
  setIsFinished(true);
}
```

## Result

- typecheck: pass
- lint: pass
- tests: 7/7 ChatWindow tests pass
- Completed sessions from sidebar now show the summary bottom sheet immediately
