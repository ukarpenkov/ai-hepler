# 2026-06-23 — Fix: next question shown after limit

## Bug

`docs/spec/bugs/003-next-question-shown-after-limit.md`

## Problem

With `TOTAL_QUESTIONS = 1`, after answering the last question AI asked the next one — even though the interview was already finished. The question message was added to messages before the `isFinished` check.

## Root Cause

In `handleSend`, the next question was added to the array **always**, and the `nextCount >= TOTAL_QUESTIONS` check came **after**:

```typescript
// BEFORE — question always added
setMessages((prev) => [...prev, feedbackMsg, nextQuestionMsg]);

// Check happens later
if (nextCount >= TOTAL_QUESTIONS) {
  setIsFinished(true);
}
```

## Fix

**`packages/web/components/ChatWindow.tsx:137-143`**

Question only added if `nextCount < TOTAL_QUESTIONS`:

```typescript
// AFTER — conditional addition
const nextQuestionMsg: ChatMessage | null =
  nextCount < TOTAL_QUESTIONS
    ? { role: "assistant", content: response.nextQuestion.question, topic: response.nextQuestion.topic }
    : null;

setMessages((prev) => [...prev, feedbackMsg, ...(nextQuestionMsg ? [nextQuestionMsg] : [])]);
```

## Result

- typecheck: pass
- lint: pass
- tests: 157/157 pass
- When reaching question limit — only feedback is shown, next question is not added