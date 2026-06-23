# 2026-06-23 — Fix: next question shown after limit

## Bug

`docs/spec/bugs/003-next-question-shown-after-limit.md`

## Problem

При `TOTAL_QUESTIONS = 1` после ответа на последний вопрос ИИ задавал следующий —尽管 интервью уже завершено. Сообщение с вопросом добавлялось в messages до проверки `isFinished`.

## Root Cause

В `handleSend` следующий вопрос добавлялся в массив **всегда**, а проверка `nextCount >= TOTAL_QUESTIONS` шла **после**:

```typescript
// BEFORE — вопрос добавляется всегда
setMessages((prev) => [...prev, feedbackMsg, nextQuestionMsg]);

// Проверка идёт позже
if (nextCount >= TOTAL_QUESTIONS) {
  setIsFinished(true);
}
```

## Fix

**`packages/web/components/ChatWindow.tsx:137-143`**

Вопрос добавляется только если `nextCount < TOTAL_QUESTIONS`:

```typescript
// AFTER — условное добавление
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
- При достижении лимита вопросов — показывается только фидбек, следующий вопрос не добавляется
