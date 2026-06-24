# 2026-06-24 — Сокращение количества вопросов до 5

## Goal

Сократить количество вопросов в интервью с 10 до 5. Интерфейс должен отображать прогресс в формате 5/5.

## Problem

10 вопросов — слишком много для типичного кандидата. Интервью длится дольше, чем хочет пользователь. При этом константа `TOTAL_QUESTIONS` была снижена до 1 для тестов, а default progress оставался `{ current: 1, total: 10 }`.

## Changes

### 1. `packages/web/components/ChatWindow.tsx:15` — `TOTAL_QUESTIONS`

**Было:** `const TOTAL_QUESTIONS = 1;`
**Стало:** `const TOTAL_QUESTIONS = 6;`

Константа = 6, потому что логика завершения проверяет `nextCount >= TOTAL_QUESTIONS`. При 6 лимите спрашивается ровно 5 вопросов (6-й не показывается).

### 2. `packages/web/components/ChatWindow.tsx:142` — отображение прогресса

**Было:**
```typescript
onProgressChange?.(Math.min(questionCount, TOTAL_QUESTIONS), TOTAL_QUESTIONS);
```

**Стало:**
```typescript
onProgressChange?.(Math.min(questionCount, TOTAL_QUESTIONS - 1), TOTAL_QUESTIONS - 1);
```

Прогресс считается относительно `TOTAL_QUESTIONS - 1 = 5`, поэтому в Header отображается `1/5`, `2/5`, ... `5/5`.

### 3. `packages/web/app/interview/page.tsx:32` — default progress

**Было:** `const [progress, setProgress] = useState({ current: 1, total: 10 });`
**Стало:** `const [progress, setProgress] = useState({ current: 1, total: 5 });`

## Verification

```bash
npm run typecheck   # 0 errors
npm run lint        # 0 warnings
npm run test        # 157/157
```

## Files changed (3 total)

| File | Change |
|------|--------|
| `packages/web/components/ChatWindow.tsx:15` | `TOTAL_QUESTIONS = 6` (было 1) |
| `packages/web/components/ChatWindow.tsx:142` | Прогресс: `Math.min(..., TOTAL_QUESTIONS - 1) / (TOTAL_QUESTIONS - 1)` |
| `packages/web/app/interview/page.tsx:32` | Default `total: 5` (было 10) |

## Feature spec

`docs/spec/features/010-reduce-questions-to-5.md`
