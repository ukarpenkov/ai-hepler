# Feature: Smart LLM Prompts — anti-cheat evaluation + adaptive questions

**Дата:** 2026-06-24
**Приоритет:** High
**Статус:** Done
**Компонент:** AI Core — Tools (evaluate-answer, generate-question, parse-job-description) + Coach Agent

---

## Описание

Переработаны промпты для LLM-вызовов в инструментах оценки ответов, генерации вопросов, парсинга вакансий и коучинга. Основная цель — исключить возможность накрутки баллов копипастом вопроса, сделать вопросы разнообразнее и умнее, улучшить качество обратной связи.

Ключевая проблема до изменений: кандидат мог скопировать текст вопроса и вставить как ответ — получал 7/10, потому что LLM видел релевантные ключевые слова и не имел критериев для детекции читерства.

---

## Текущее поведение (до изменений)

### Оценка ответов (`evaluate-answer.tool.ts`)
- Плоский user message без system prompt
- Единая оценка 1-10 без размерностей
- Нет анти-чит проверок: копипаст вопроса → 7/10
- Нет рубрики — модель оценивает произвольно

### Генерация вопросов (`generate-question.tool.ts`)
- Плоский user message без system prompt
- Вопросы однотипные, без категорий (только theoretical)
- Нет expected answer criteria для оценщика
- Вопросы не привязаны к конкретному домену/ключевым словам вакансии

### Коучинг (`coach.agent.ts`)
- Плоский user message
- Советы не привязаны к конкретным слабостям
- Нет dimensional scores в контексте

### Парсинг вакансий (`parse-job-description.tool.ts`)
- Не разделяет hard skills и soft skills
- Не извлекает требования к опыту (years of experience)

### Типы
- `EvaluationResult`: только score, strengths, weaknesses, recommendation
- `QuestionResult`: только question, topic, difficulty
- `ParsedJob`: нет softSkills, minYearsExperience

---

## Ожидаемое поведение

### 1. Anti-Cheat Multi-Dimension Evaluation

**System prompt** задаёт роль строгого технического интервьюера с чёткими правилами:

- **Анти-чит правила:**
  - Перефраз/эхо вопроса без оригинального контента → score 1-2, флаг `paraphrasing_question`
  - Копипаст текста вопроса → score 1
  - Баззворды без демонстрации понимания → флаг `buzzwords_without_substance`
  - Общие фразы без конкретики → флаг `generic_answer`
  - Отсутствие оригинальной мысли → флаг `no_original_thought`
  - Ответ не по теме → флаг `off_topic`

- **4-мерная рубрика (total 0-10):**
  - Technical Accuracy (0-3) — корректность технических утверждений
  - Depth of Understanding (0-3) — глубина, объяснение WHY, tradeoffs
  - Relevance & Specificity (0-2) — релевантность и конкретика
  - Examples & Application (0-2) — примеры и практическое применение

- **Новые поля в ответе:**
  - `accuracy`, `depth`, `relevance`, `examples` — dimensional scores
  - `antiCheatFlags: string[]` — флаги подозрительного поведения
  - `perfectAnswerSummary: string` — что должно быть в идеальном ответе

### 2. Smarter Question Generation

**System prompt** задаёт персону опытного интервьюера:

- **5 типов вопросов:**
  - `theoretical_explanation` — объяснение концепции
  - `practical_implementation` — практическая реализация
  - `system_design` — проектирование системы
  - `debugging_scenario` — отладка/разбор бага
  - `behavioral_experience` — поведенческий вопрос

- **Difficulty guidelines:**
  - easy — фундаментальные концепции
  - medium — сравнение, практические сценарии, reasoning
  - hard — system design, tradeoff analysis, edge cases

- **`expectedAnswerCriteria: string[]`** — 3-5 ключевых пунктов, которые должен покрыть хороший ответ (скрыты от кандидата, используются оценщиком)

- Вопросы используют keywords и domain вакансии для контекстуализации

### 3. Personalized Coaching

**System prompt** с ролью supportive but honest coach:

- Советы привязаны к конкретным weaknesses и antiCheatFlags
- Model answer демонстрирует уровень 9-10/10
- Dimensional scores передаются в контекст

### 4. Better Job Description Parsing

- Разделение `skills` (hard/technical) и `softSkills` (soft/interpersonal)
- Извлечение `minYearsExperience: number | null`
- Улучшенный system prompt с инструкциями по точному извлечению

### 5. Type Updates

```typescript
// EvaluationResult — новые поля
accuracy: number;       // 0-3
depth: number;          // 0-3
relevance: number;      // 0-2
examples: number;       // 0-2
antiCheatFlags: string[];
perfectAnswerSummary: string;

// QuestionResult — новые поля
questionType: "theoretical_explanation" | "practical_implementation" | "system_design" | "debugging_scenario" | "behavioral_experience";
expectedAnswerCriteria: string[];

// ParsedJob — новые поля
softSkills: string[];
minYearsExperience: number | null;
```

---

## Затронутые файлы

| Файл | Изменение |
|------|-----------|
| `src/tools/evaluate-answer.tool.ts` | Переписан: system prompt, multi-dimension rubric, anti-cheat правила, 9 полей в ответе |
| `src/tools/generate-question.tool.ts` | Переписан: system prompt, 5 типов вопросов, expectedAnswerCriteria, валидация questionType |
| `src/tools/parse-job-description.tool.ts` | Переписан: system prompt, softSkills, minYearsExperience |
| `src/agents/coach.agent.ts` | Переписан: system prompt, dimensional scores в контексте, antiCheatFlags |
| `src/agents/types.ts` | EvaluationResult +5 полей, QuestionResult +2 поля, ParsedJob +2 поля |
| `src/security/schemas.ts` | JobProfileSchema +2 поля, EvaluationSchema +6 полей |
| `src/types/index.ts` | SessionSchema.jobProfile +2 поля |
| `src/storage/session-store.ts` | JobProfile interface +2 поля |
| `src/agents/orchestrator.ts` | Дефолтный QuestionResult с новыми полями |
| `src/tools/__tests__/*.test.ts` | Обновлены моки (8 файлов) |
| `src/agents/__tests__/*.test.ts` | Обновлены моки (6 файлов) |
| `src/api/__tests__/*.test.ts` | Обновлены моки (4 файла) |
| `src/__tests__/agentWorkflow.test.ts` | Обновлены моки |
| `src/security/schemas.test.ts` | Обновлены тестовые данные |
| `src/types/index.test.ts` | Обновлены тестовые данные |

---

## Verification

```bash
npm run typecheck   # 0 errors
npm run lint        # 0 warnings
npm run test        # 157/157 passed, 29 test files
```

### Manual smoke test

1. **Parse job description** — проверить что `softSkills` и `minYearsExperience` заполняются
2. **Generate question** — проверить что `questionType` и `expectedAnswerCriteria` присутствуют
3. **Submit copy-pasted answer** (answer === question) — score должен быть ≤2, `antiCheatFlags` содержит `paraphrasing_question`
4. **Submit buzzword-only answer** — score ≤3, флаг `buzzwords_without_substance`
5. **Submit genuinely good answer** — score 7-10, meaningful dimensional scores, empty `antiCheatFlags`
