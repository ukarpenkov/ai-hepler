# Feature: Reduce Questions to 5

**Date:** 2026-06-24
**Priority:** Medium
**Status:** Done
**Component:** Frontend (ChatWindow, InterviewPage)

---

## Description

Previously the interview contained 10 questions — too many for a typical candidate. Decided to reduce to 5 questions.

---

## Before

- `TOTAL_QUESTIONS = 1` (in ChatWindow) — constant was reduced to 1 for testing
- Default progress: `{ current: 1, total: 10 }` (in interview/page.tsx)
- UI displayed progress as `1/10`, `2/10`, etc.

## After

- `TOTAL_QUESTIONS = 6` (in ChatWindow) — internal limit at which the interview ends
- Default progress: `{ current: 1, total: 5 }` (in interview/page.tsx)
- UI displays progress as `1/5`, `2/5`, ... `5/5`

---

## Completion Logic

File: `packages/web/components/ChatWindow.tsx`

```
questionCount = 1          → Q1
answer → nextCount = 2     → 2 < 6 → Q2
answer → nextCount = 3     → 3 < 6 → Q3
answer → nextCount = 4     → 4 < 6 → Q4
answer → nextCount = 5     → 5 < 6 → Q5
answer → nextCount = 6     → 6 >= 6 → completed
```

Total: **5 questions**, 5 answers. Constant `TOTAL_QUESTIONS = 6` is used as the completion threshold.

## Progress Display

File: `packages/web/components/ChatWindow.tsx`

```typescript
onProgressChange?.(Math.min(questionCount, TOTAL_QUESTIONS - 1), TOTAL_QUESTIONS - 1);
```

Progress is calculated relative to `TOTAL_QUESTIONS - 1 = 5`, so the Header displays `5/5`.

---

## Changed Files

| File | Change |
|------|--------|
| `packages/web/components/ChatWindow.tsx:15` | `TOTAL_QUESTIONS = 6` (was 1) |
| `packages/web/components/ChatWindow.tsx:142` | Progress: `Math.min(questionCount, TOTAL_QUESTIONS - 1) / (TOTAL_QUESTIONS - 1)` |
| `packages/web/app/interview/page.tsx:32` | Default `total: 5` (was 10) |

## Acceptance Criteria

- [x] Interview asks exactly 5 questions
- [x] UI displays progress 1/5, 2/5, ... 5/5
- [x] After the 5th answer, interview ends and SummaryView is shown
- [x] TypeScript check passes
- [x] ESLint passes
- [x] All 157 tests pass
