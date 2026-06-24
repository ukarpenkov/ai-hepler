# 2026-06-24 — Reduce question count to 5

## Goal

Reduce interview question count from 10 to 5. Interface should display progress in 5/5 format.

## Problem

10 questions — too many for a typical candidate. Interview lasts longer than the user wants. Meanwhile the `TOTAL_QUESTIONS` constant was reduced to 1 for testing, and default progress remained `{ current: 1, total: 10 }`.

## Changes

### 1. `packages/web/components/ChatWindow.tsx:15` — `TOTAL_QUESTIONS`

**Before:** `const TOTAL_QUESTIONS = 1;`
**After:** `const TOTAL_QUESTIONS = 6;`

Constant = 6, because completion logic checks `nextCount >= TOTAL_QUESTIONS`. With limit 6, exactly 5 questions are asked (6th is not shown).

### 2. `packages/web/components/ChatWindow.tsx:142` — progress display

**Before:**
```typescript
onProgressChange?.(Math.min(questionCount, TOTAL_QUESTIONS), TOTAL_QUESTIONS);
```

**After:**
```typescript
onProgressChange?.(Math.min(questionCount, TOTAL_QUESTIONS - 1), TOTAL_QUESTIONS - 1);
```

Progress calculated relative to `TOTAL_QUESTIONS - 1 = 5`, so Header displays `1/5`, `2/5`, ... `5/5`.

### 3. `packages/web/app/interview/page.tsx:32` — default progress

**Before:** `const [progress, setProgress] = useState({ current: 1, total: 10 });`
**After:** `const [progress, setProgress] = useState({ current: 1, total: 5 });`

## Verification

```bash
npm run typecheck   # 0 errors
npm run lint        # 0 warnings
npm run test        # 157/157
```

## Files changed (3 total)

| File | Change |
|------|--------|
| `packages/web/components/ChatWindow.tsx:15` | `TOTAL_QUESTIONS = 6` (was 1) |
| `packages/web/components/ChatWindow.tsx:142` | Progress: `Math.min(..., TOTAL_QUESTIONS - 1) / (TOTAL_QUESTIONS - 1)` |
| `packages/web/app/interview/page.tsx:32` | Default `total: 5` (was 10) |

## Feature spec

`docs/spec/features/010-reduce-questions-to-5.md`