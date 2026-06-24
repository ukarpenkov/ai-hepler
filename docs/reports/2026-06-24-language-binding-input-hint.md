# 2026-06-24 — Language binding for LLM prompts + chat input placeholder hint

## Goal

Two changes:
1. Interview questions, evaluation, and coaching are output in the job description's language
2. Keyboard hint (Enter / Shift+Enter) added to textarea placeholder

## Problem

1. All LLM prompts always generated responses in English — even if the job description was in Russian, questions, evaluation, and tips were in English. Users couldn't understand the context.
2. No keyboard hint — new users didn't know that Enter submits and Shift+Enter creates a line break.

## Changes

### 1. `src/agents/types.ts` — `language` field in `ParsedJob`

Added `language: string` — ISO 639-1 code of the job description language.

### 2. `src/security/schemas.ts` — `JobProfileSchema`

Added `language: z.string().min(1)`.

### 3. `src/types/index.ts` — `SessionSchema.jobProfile`

Added `language: z.string()` in embedded jobProfile.

### 4. `src/storage/session-store.ts` — `JobProfile` interface

Added `language: string`.

### 5. `src/tools/parse-job-description.tool.ts` — language detection

- User prompt expanded: `"language: ISO 639-1 code of the language the job description is written in"`
- JSON response schema includes `"language": string`
- On parsing: `typeof parsed.language === "string"` → use it, otherwise fallback to `"en"`

### 6. `src/tools/generate-question.tool.ts` — question language

System prompt extended:
```
LANGUAGE: The job description is in ${langName}. You MUST generate the question, topic, and expectedAnswerCriteria in ${langName}.
```
Mapping: `{ ru: "Russian", de: "German", fr: "French", es: "Spanish", zh: "Chinese" }`, fallback → `"English"`.

### 7. `src/tools/evaluate-answer.tool.ts` — evaluation language

System prompt extended:
```
LANGUAGE: The job description and interview are in ${langName}. You MUST output all evaluation fields (strengths, weaknesses, recommendation, perfectAnswerSummary) in ${langName}.
```

### 8. `src/agents/coach.agent.ts` — coaching language

System prompt extended:
```
LANGUAGE: The job description and interview are in ${langName}. You MUST output all coaching feedback (explanation, improvedAnswer, tips) in ${langName}.
```

### 9. `packages/web/components/ChatWindow.tsx` — placeholder

**Before:** `"Введите ваш ответ..."`
**After:** `"Введите ваш ответ... (Enter — отправить, Shift+Enter — перенос строки)"`

### 10. `packages/web/components/ChatWindow.test.tsx` — mock updates

6 `getByPlaceholderText` occurrences updated for new text.

### 11. Tests — added `language: "en"` to all ParsedJob literals

15 test files updated: `evaluate-answer`, `generate-question`, `parse-job-description`, `schemas`, `types`, `evaluator`, `coach`, `interviewer`, `job-parser`, `orchestrator`, `server`, `job`, `interview`, `integration`, `agentWorkflow`.

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