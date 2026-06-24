# 2026-06-24 — Language binding for LLM prompts + chat input placeholder hint

## Goal

Два изменения:
1. Вопросы интервью, оценка и коучинг выводятся на языке вакансии
2. В placeholder textarea добавлена подсказка о клавишах (Enter / Shift+Enter)

## Problem

1. Все промпты LLM всегда генерировали ответ на английском — даже если вакансия на русском, вопросы, оценка и советы были на английском. Пользователь не понимал контекст.
2. Не было подсказки о клавишах — новые пользователи не знали, что Enter отправляет, а Shift+Enter делает перенос строки.

## Changes

### 1. `src/agents/types.ts` — поле `language` в `ParsedJob`

Добавлено `language: string` — ISO 639-1 код языка вакансии.

### 2. `src/security/schemas.ts` — `JobProfileSchema`

Добавлено `language: z.string().min(1)`.

### 3. `src/types/index.ts` — `SessionSchema.jobProfile`

Добавлено `language: z.string()` в embedded jobProfile.

### 4. `src/storage/session-store.ts` — `JobProfile` interface

Добавлено `language: string`.

### 5. `src/tools/parse-job-description.tool.ts` — определение языка

- User prompt расширен: `"language: ISO 639-1 code of the language the job description is written in"`
- JSON schema ответа включает `"language": string`
- При парсинге: `typeof parsed.language === "string"` → используем, иначе fallback `"en"`

### 6. `src/tools/generate-question.tool.ts` — язык вопросов

System prompt дополнен:
```
LANGUAGE: The job description is in ${langName}. You MUST generate the question, topic, and expectedAnswerCriteria in ${langName}.
```
Маппинг: `{ ru: "Russian", de: "German", fr: "French", es: "Spanish", zh: "Chinese" }`, fallback → `"English"`.

### 7. `src/tools/evaluate-answer.tool.ts` — язык оценки

System prompt дополнен:
```
LANGUAGE: The job description and interview are in ${langName}. You MUST output all evaluation fields (strengths, weaknesses, recommendation, perfectAnswerSummary) in ${langName}.
```

### 8. `src/agents/coach.agent.ts` — язык коучинга

System prompt дополнен:
```
LANGUAGE: The job description and interview are in ${langName}. You MUST output all coaching feedback (explanation, improvedAnswer, tips) in ${langName}.
```

### 9. `packages/web/components/ChatWindow.tsx` — placeholder

**Было:** `"Введите ваш ответ..."`
**Стало:** `"Введите ваш ответ... (Enter — отправить, Shift+Enter — перенос строки)"`

### 10. `packages/web/components/ChatWindow.test.tsx` — обновление моков

6 вхождений `getByPlaceholderText` обновлены под новый текст.

### 11. Тесты — добавлено `language: "en"` во все ParsedJob-литералы

15 файлов тестов обновлены: `evaluate-answer`, `generate-question`, `parse-job-description`, `schemas`, `types`, `evaluator`, `coach`, `interviewer`, `job-parser`, `orchestrator`, `server`, `job`, `interview`, `integration`, `agentWorkflow`.

## Verification

```bash
npm run typecheck   # 0 errors
npm run lint        # 0 warnings
npm run test        # 157/157 (backend) + 7/7 (ChatWindow)
```

## Files changed (26 total)

| File | Change |
|------|--------|
| `src/agents/types.ts` | `ParsedJob.language` |
| `src/security/schemas.ts` | `JobProfileSchema` |
| `src/types/index.ts` | `SessionSchema.jobProfile` |
| `src/storage/session-store.ts` | `JobProfile.language` |
| `src/tools/parse-job-description.tool.ts` | language detection in prompt + parsing |
| `src/tools/generate-question.tool.ts` | language instruction in system prompt |
| `src/tools/evaluate-answer.tool.ts` | language instruction in system prompt |
| `src/agents/coach.agent.ts` | language instruction in system prompt |
| `packages/web/components/ChatWindow.tsx` | placeholder text updated |
| `packages/web/components/ChatWindow.test.tsx` | placeholder refs updated |
| `docs/spec/features/009-language-bindling-and-input-hint.md` | feature spec |
| 14 test files | `language: "en"` added to mocks |
