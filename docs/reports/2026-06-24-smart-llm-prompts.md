# 2026-06-24 — Smart LLM Prompts: anti-cheat evaluation + adaptive questions + smarter coaching

## Goal

Переработать промпты для DeepSeek API во всех AI-инструментах, чтобы:
1. Исключить накрутку баллов копипастом вопроса (было 7/10, стало ≤2)
2. Сделать вопросы разнообразнее и привязанными к реальной вакансии
3. Улучшить качество коучинга — советы привязаны к конкретным слабостям
4. Улучшить парсинг вакансий — разделить hard/soft skills, извлекать требования к опыту

## Problem

До изменений:
1. **`evaluate-answer.tool.ts`** — плоский user message, нет system prompt, нет рубрики. Кандидат копирует вопрос → вставляет как ответ → 7/10. Модель видит релевантные ключевые слова и ставит высокий балл.
2. **`generate-question.tool.ts`** — вопросы однотипные (только theoretical), нет expected answer criteria для оценщика, не привязаны к домену/ключевым словам вакансии.
3. **`coach.agent.ts`** — плоский промпт, советы общие, не привязаны к конкретным слабостям.
4. **`parse-job-description.tool.ts`** — не разделяет hard/soft skills, не извлекает опыт.

## Changes

### 1. `src/tools/evaluate-answer.tool.ts` — Anti-Cheat Multi-Dimension Evaluation

**System prompt:**
- Персона строгого технического интервьюера
- 5 анти-чит правил: перефраз вопроса → score ≤2, копипаст → 1, баззворды без сути, общие фразы, отсутствие оригинальной мысли
- 6 флагов: `paraphrasing_question`, `generic_answer`, `no_original_thought`, `buzzwords_without_substance`, `off_topic`

**4-мерная рубрика (total 0-10):**
- Technical Accuracy (0-3) — корректность
- Depth of Understanding (0-3) — глубина, WHY, tradeoffs
- Relevance & Specificity (0-2) — релевантность и конкретика
- Examples & Application (0-2) — примеры и применение

**Новые поля в ответе:**
- `accuracy`, `depth`, `relevance`, `examples` — dimensional scores
- `antiCheatFlags: string[]` — флаги читерства
- `perfectAnswerSummary: string` — что должен содержать идеальный ответ
- Валидация: clamp по каждому dimension

### 2. `src/tools/generate-question.tool.ts` — Smarter Questions

**System prompt:**
- Персона опытного интервьюера из top tech company
- Принципы: вопросы требуют МЫШЛЕНИЯ, а не recall; избегать «What is X?»
- Difficulty guidelines: junior=fundamentals, middle=architecture+tradeoffs, senior=system design+leadership

**5 типов вопросов:**
- `theoretical_explanation` — объяснение концепции
- `practical_implementation` — практическая реализация
- `system_design` — проектирование системы
- `debugging_scenario` — отладка/разбор бага
- `behavioral_experience` — поведенческий вопрос

**`expectedAnswerCriteria: string[]`** — 3-5 пунктов для хорошего ответа (скрыты от кандидата, для оценщика)

**Валидация:**
- questionType должен быть одним из 5 допустимых значений
- Вопросы используют keywords и domain вакансии

### 3. `src/agents/coach.agent.ts` — Personalized Coaching

**System prompt:**
- Персона supportive but honest coach
- Правила: быть прямым, model answer уровня 9-10/10, советы привязаны к weaknesses, antiCheatFlags в контексте

**User message:**
- Dimensional scores (accuracy, depth, relevance, examples)
- AntiCheatFlags передаются для адресации читерского поведения
- perfectAnswerSummary используется как ориентир

### 4. `src/tools/parse-job-description.tool.ts` — Better Extraction

- System prompt с инструкциями по точному извлечению
- Разделение `skills` (hard/technical) и `softSkills` (interpersonal)
- `minYearsExperience: number | null`
- Санитайз: softSkills фильтруются на строки, minYearsExperience округляется и проверяется >0

### 5. Types & Schemas

| Type | New fields |
|------|------------|
| `EvaluationResult` | `accuracy`, `depth`, `relevance`, `examples`, `antiCheatFlags`, `perfectAnswerSummary` |
| `QuestionResult` | `questionType`, `expectedAnswerCriteria` |
| `ParsedJob` | `softSkills`, `minYearsExperience` |

**Затронутые schema-файлы:**
- `src/security/schemas.ts` — `JobProfileSchema`, `EvaluationSchema`
- `src/types/index.ts` — `SessionSchema.jobProfile`
- `src/storage/session-store.ts` — `JobProfile` interface

### 6. Test Updates (18 файлов)

Все моки обновлены под новые поля. Особые случаи:
- `generate-question.tool.test.ts` — проверка `body.messages[1].content` вместо `[0]` (system prompt стал первым сообщением)
- `orchestrator.ts` — дефолтный `QuestionResult` с `questionType` и `expectedAnswerCriteria`

## Verification

```bash
npm run typecheck   # 0 errors
npm run lint        # 0 warnings
npm run test        # 157/157 tests passed, 29 test files
```

## Manual smoke checklist

- [x] Parse job description → `softSkills` и `minYearsExperience` заполняются
- [x] Generate question → `questionType` и `expectedAnswerCriteria` присутствуют
- [x] Submit copy-pasted answer (answer === question) → score ≤2, `paraphrasing_question` во flags
- [x] Submit buzzword-only answer → score ≤3, `buzzwords_without_substance`
- [x] Submit genuinely good answer → score 7-10, dimensional scores meaningful, antiCheatFlags empty

## Files changed (18 production + 18 test)

| File | Type |
|------|------|
| `src/tools/evaluate-answer.tool.ts` | Rewrite |
| `src/tools/generate-question.tool.ts` | Rewrite |
| `src/tools/parse-job-description.tool.ts` | Rewrite |
| `src/agents/coach.agent.ts` | Rewrite |
| `src/agents/types.ts` | 3 interfaces extended |
| `src/security/schemas.ts` | 2 schemas extended |
| `src/types/index.ts` | SessionSchema extended |
| `src/storage/session-store.ts` | JobProfile interface extended |
| `src/agents/orchestrator.ts` | Default QuestionResult updated |
| `src/tools/__tests__/evaluate-answer.tool.test.ts` | Mocks updated |
| `src/tools/__tests__/generate-question.tool.test.ts` | Mocks updated + message index fix |
| `src/tools/__tests__/parse-job-description.tool.test.ts` | Mocks updated |
| `src/tools/__tests__/update-memory.tool.test.ts` | Mocks updated |
| `src/security/schemas.test.ts` | Test data updated |
| `src/types/index.test.ts` | Test data updated |
| `src/agents/__tests__/types.test.ts` | Type assertions updated |
| `src/agents/__tests__/evaluator.agent.test.ts` | Mocks updated |
| `src/agents/__tests__/coach.agent.test.ts` | Mocks updated |
| `src/agents/__tests__/interviewer.agent.test.ts` | Mocks updated |
| `src/agents/__tests__/job-parser.agent.test.ts` | Mocks updated |
| `src/agents/__tests__/memory.agent.test.ts` | Mocks updated |
| `src/agents/__tests__/orchestrator.test.ts` | Mocks updated |
| `src/api/__tests__/server.test.ts` | Mocks updated |
| `src/api/__tests__/job.test.ts` | Mocks updated |
| `src/api/__tests__/interview.test.ts` | Mocks updated |
| `src/api/__tests__/integration.test.ts` | Mocks updated |
| `src/__tests__/agentWorkflow.test.ts` | Mocks updated |
