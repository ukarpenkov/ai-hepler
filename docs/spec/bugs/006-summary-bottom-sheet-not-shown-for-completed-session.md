# Bug: Summary bottom sheet not shown when navigating to completed session

**Date:** 2026-06-26
**Priority:** High
**Status:** Fixed
**Component:** Frontend — `ChatWindow.tsx`

## Description

When navigating to a completed session from the sidebar, the interview results bottom sheet (SummaryView) does not appear. The chat loads, but the BottomSheet with summary/feedback stats stays hidden.

## Expected Behavior

- Opening a completed session from the sidebar should immediately show the bottom sheet with interview results (scores, strengths, weaknesses, etc.)
- `isFinished` should be `true` and `isSummaryOpen` should be `true`

## Actual Behavior

- The chat loads normally but the bottom sheet never appears
- The input area is disabled (as if finished), but no summary is visible
- `isFinished` stays `false` because the restore condition never matches

## Reproduction

1. Complete an interview (answer all questions)
2. Close the interview (go to home page)
3. Open the same session from the sidebar
4. **Observation:** the summary bottom sheet does not appear at the bottom

## Root Cause

In the `useEffect` that restores stored feedbacks (`ChatWindow.tsx:80-92`), the condition to mark the session as finished is:

```typescript
if (storedFeedbacks.length >= TOTAL_QUESTIONS) {
  setIsFinished(true);
}
```

`TOTAL_QUESTIONS = 6`, so this requires **6 feedbacks**. But a completed interview only produces **5 feedbacks** — the interview stops when `questionCount` reaches 6 (after answering question 5), so only 5 answers are evaluated and stored.

The math:
- `questionCount` starts at 1
- After answering Q1 → feedback #1, `nextCount = 2`
- After answering Q2 → feedback #2, `nextCount = 3`
- After answering Q3 → feedback #3, `nextCount = 4`
- After answering Q4 → feedback #4, `nextCount = 5`
- After answering Q5 → feedback #5, `nextCount = 6` → `nextCount >= TOTAL_QUESTIONS` → interview ends

Result: **5 feedbacks stored**, but restore check expects **>= 6**.

## Fix

**File:** `packages/web/components/ChatWindow.tsx:87`

Change the condition from `>= TOTAL_QUESTIONS` to `>= TOTAL_QUESTIONS - 1`:

```typescript
// Before (broken):
if (storedFeedbacks.length >= TOTAL_QUESTIONS) {
  setIsFinished(true);
}

// After (fixed):
if (storedFeedbacks.length >= TOTAL_QUESTIONS - 1) {
  setIsFinished(true);
}
```

This correctly matches the 5 feedbacks a completed session contains.

## Components to Change

| File | Change |
|------|--------|
| `packages/web/components/ChatWindow.tsx:87` | Fix stored feedbacks restore condition to use `TOTAL_QUESTIONS - 1` |

## Related

- Similar off-by-one pattern to bug #3 (next question shown after limit)
- `TOTAL_QUESTIONS = 6` means 5 questions are answered, 5 feedbacks stored
