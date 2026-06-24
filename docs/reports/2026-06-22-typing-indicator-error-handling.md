# 2026-06-22 — Typing Indicator Animation & Error Handling

## Goal

1. Add typing indicator animation to chat — show while AI processes the answer
2. Fix 500 error on `/interview/answer` — add try-catch with logging to routes

## Problem

1. After user submits an answer and before receiving AI response — empty space with no visual feedback
2. Routes `/interview/start` and `/interview/answer` had no try-catch around LLM calls — on DeepSeek API error or invalid JSON from LLM, the exception flew to Fastify's global error handler, returning a generic `500 Internal Server Error`

## Changes

### `components/TypingIndicator.tsx` (new)

- Component with AI avatar () and bubble containing animated text "Typing..."
- Adapted animation from `docs/design/typing.html`:
  - `typing` — text appears character by character via `width: 0 → 6.5ch` with `steps(6, end)`
  - `blink` — blinking cursor via `border-right` + `border-color: transparent`
- Styles match MessageBubble: gradient avatar, glass bubble, `messageIn` appear animation

### `app/globals.css`

- Added `@keyframes typing` and `@keyframes blink` to global styles

### `components/ChatWindow.tsx`

- Imported `TypingIndicator`
- `{isLoading && <TypingIndicator />}` — renders after message list when `isLoading === true`

### `src/api/routes/interview.ts`

- **`/interview/start`**: `startInterview()` wrapped in try-catch, errors logged via `request.log.error(e, "startInterview failed")`
- **`/interview/answer`**: `processAnswer()` wrapped in try-catch, errors logged via `request.log.error(e, "processAnswer failed")`
- Both return `{ error: "..." }` with 500 status instead of propagating to global handler

### `docs/design/summary-view.html` (new)

- Interview results page prototype: statistics (average/best/worst score), question navigation, answer review (strengths/weaknesses, recommendation, improved answer, tips)

### `docs/design/typing.html` (new)

- Typing indicator animation prototype, used as source for CSS keyframes

## Result

- typecheck: pass
- lint: pass
- tests: 158/158 pass
- Typing indicator appears when waiting for AI response
- LLM errors now logged with details instead of generic 500