# 2026-06-24 — Fix: правильное объяснение при парсинге вопроса как ответа

## Problem

При копировании вопроса как ответа:
- Оценка 1/10 — **правильно** (anti-cheat работает)
- Recommendation: "Never leave an answer empty" — **неправильно** (не объясняет причину)

## Root cause

Промпт в `evaluate-answer.tool.ts` содержал anti-cheat правила с флагами, но не инструктировал LLM привязывать `recommendation` к конкретным флагам. Модель выбирала generic-предупреждение вместо адресного объяснения.

## Solution

Добавлены прямые инструкции в anti-cheat правила:

**Для `paraphrasing_question` (сильный кейс — копипаст):**
```
When "paraphrasing_question" is flagged, the recommendation MUST explicitly state
that copying or paraphrasing the question is unacceptable and not a real answer
— e.g. "Copying the question is not an answer. On a real interview this would
be an immediate rejection. Answer honestly even if you don't know everything."
```

**Для перефраза без добавления контента:**
```
When flagged, the recommendation MUST explain that paraphrasing the question
is not a valid answer and the candidate should provide original content.
```

## Files changed

| File | Change |
|------|--------|
| `src/tools/evaluate-answer.tool.ts` | 2 anti-cheat rules updated with recommendation binding instructions |

## Verification

```bash
npm run typecheck   # 0 errors
npm run lint        # 0 warnings
```

## Expected behavior after fix

При копировании вопроса → recommendation содержит:
> "Копирование вопроса — это не ответ. На реальном собеседовании это было бы немедленным отказом. Отвечайте честно, даже если не знаете всего."
