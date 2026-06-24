# Bug: Next question shown after reaching TOTAL_QUESTIONS limit

**Date:** 2026-06-23
**Priority:** High
**Status:** Fixed
**Component:** Frontend — `ChatWindow.tsx`

## Description

When `TOTAL_QUESTIONS = 1` (or any other value), after submitting an answer to the last question, the AI asks the next question in the chat. The message with the new question is added to the messages array before the `isFinished` check, so the user sees a question that should not be asked.

## Expected Behavior

- After answering the last question, show **only feedback** (score + tip)
- **Do not show** the next question — go directly to summary/results

## Actual Behavior

- After answering the last question, both feedback and **the next AI question** are added to the chat
- The user sees an extra question, even though the interview is already finished
- `isFinished` is set to `true`, but the question message is already in the DOM

## Reproduction

1. Set `TOTAL_QUESTIONS = 1` in `ChatWindow.tsx`
2. Start the interview, answer the first question
3. **Observation:** after the feedback, a second question from the AI appears
4. Meanwhile `isFinished = true` and the input is hidden — the question is meaningless

## Root Cause

In `handleSend` (`ChatWindow.tsx:137-143`), the next question is added to messages **before** the `if (nextCount >= TOTAL_QUESTIONS)` check:

```typescript
// The question message is added ALWAYS
setMessages((prev) => [...prev, feedbackMsg, nextQuestionMsg]);

// But the check happens LATER
if (nextCount >= TOTAL_QUESTIONS) {
  setIsFinished(true);
}
```

## Fix

**File:** `packages/web/components/ChatWindow.tsx`

Add the next question to messages **only** if `nextCount < TOTAL_QUESTIONS`:

```typescript
const nextQuestionMsg: ChatMessage | null =
  nextCount < TOTAL_QUESTIONS
    ? { role: "assistant", content: response.nextQuestion.question, topic: response.nextQuestion.topic }
    : null;

setMessages((prev) => [...prev, feedbackMsg, ...(nextQuestionMsg ? [nextQuestionMsg] : [])]);
```

## Components to Change

| File | Change |
|------|--------|
| `packages/web/components/ChatWindow.tsx:137-143` | Conditional addition of next question to messages |
