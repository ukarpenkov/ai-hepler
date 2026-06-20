# Фаза 1 — Промты для реализации

---

## Шаг 1 — Инициализация корневого monorepo (package.json, tsconfig, .gitignore, .env.example)

**Статус: Выполнено**

> **Общие правила (действуют для КАЖДОГО шага):**
> 1. Язык кода — TypeScript.
> 2. Не добавляй комментарии в код, кроме JSDoc где необходимо.
> 3. Не коммить автоматически — жди подтверждения.
> 4. После каждого шага запускай `npm run typecheck`, `npm run lint`, `npm run test`. Все три должны пройти.
> 5. Файлы структуры: `src/` — исходники, `src/**/*.test.ts` — тесты рядом с исходником.
> 6. Используй существующие библиотеки, не добавляй новые без необходимости.
> 7. Без feature flags и backwards-compat шимов — если меняешь, меняй напрямую.
> 8. После выполнения шага отмечай его статус «Выполнено» в заголовке.
> 9. Перед началом нового шага проверяй что предыдущий шаг отмечен как «Выполнено».

**Промт:**

```
Создай корневой package.json для TypeScript monorepo проекта AI Job Interview Simulator.

Требования:
1. package.json с name "ai-interview-simulator", type "module", scripts:
   - "typecheck": "tsc --noEmit"
   - "lint": "eslint . --max-warnings 0"
   - "lint:fix": "eslint . --fix"
   - "test": "vitest run"
   - "test:watch": "vitest"
   - "dev:api": "tsx watch src/api/server.ts"
   - "dev:web": "cd packages/web && npm run dev"

2. tsconfig.json — base config с strict mode, ES2022, module NodeNext, target ES2022, paths "@/*": ["./src/*"]

3. .gitignore — node_modules, dist, .env, .env.local, coverage, .DS_Store, *.log

4. .env.example — шаблон:
   OPENROUTER_API_KEY=your_key_here
   REDIS_URL=redis://localhost:6379
   PORT=3001
   NODE_ENV=development

5. Зависимости (devDependencies): typescript, vitest, @types/node, eslint, tsx, @typescript-eslint/parser, @typescript-eslint/eslint-plugin

6. Запусти npm install после создания package.json.
```

---

## Шаг 2 — ESLint конфигурация

**Статус: Выполнено**

> **Общие правила (действуют для КАЖДОГО шага):**
> 1. Язык кода — TypeScript.
> 2. Не добавляй комментарии в код, кроме JSDoc где необходимо.
> 3. Не коммить автоматически — жди подтверждения.
> 4. После каждого шага запускай `npm run typecheck`, `npm run lint`, `npm run test`. Все три должны пройти.
> 5. Файлы структуры: `src/` — исходники, `src/**/*.test.ts` — тесты рядом с исходником.
> 6. Используй существующие библиотеки, не добавляй новые без необходимости.
> 7. Без feature flags и backwards-compat шимов — если меняешь, меняй напрямую.
> 8. После выполнения шага отмечай его статус «Выполнено» в заголовке.
> 9. Перед началом нового шага проверяй что предыдущий шаг отмечен как «Выполнено».

**Промт:**

```
Создай конфигурацию ESLint для TypeScript проекта.

Требования:
1. Файл eslint.config.js (flat config формат)
2. Используй @typescript-eslint/parser и @typescript-eslint/eslint-plugin
3. Правила: no-unused-vars (error), no-undef (error), prefer-const (error)
4. Исключения: node_modules, dist, coverage
5. После создания запусти npm run lint и убедись что ошибок нет
```

---

## Шаг 3 — Структура директорий backend

**Статус: Выполнено** ✅

> **Общие правила (действуют для КАЖДОГО шага):**
> 1. Язык кода — TypeScript.
> 2. Не добавляй комментарии в код, кроме JSDoc где необходимо.
> 3. Не коммить автоматически — жди подтверждения.
> 4. После каждого шага запускай `npm run typecheck`, `npm run lint`, `npm run test`. Все три должны пройти.
> 5. Файлы структуры: `src/` — исходники, `src/**/*.test.ts` — тесты рядом с исходником.
> 6. Используй существующие библиотеки, не добавляй новые без необходимости.
> 7. Без feature flags и backwards-compat шимов — если меняешь, меняй напрямую.
> 8. После выполнения шага отмечай его статус «Выполнено» в заголовке.
> 9. Перед началом нового шага проверяй что предыдущий шаг отмечен как «Выполнено».

**Промт:**

```
Создай структуру директорий для backend части проекта.

Структура:
src/
  api/
    server.ts
    routes/
      job.ts
      interview.ts
      session.ts
  agents/
    types.ts
    job-parser.agent.ts
    interviewer.agent.ts
    evaluator.agent.ts
    coach.agent.ts
    memory.agent.ts
    orchestrator.ts
  tools/
    parse-job-description.tool.ts
    generate-question.tool.ts
    evaluate-answer.tool.ts
    update-memory.tool.ts
    fetch-weak-topics.tool.ts
  storage/
    redis.ts
    session-store.ts
  utils/
    sanitize.ts
    validators.ts
  config.ts

Создай пустые файлы (с экспортами по умолчанию где уместно) и индексный файл src/index.ts который экспортирует всё из agents/, tools/, storage/.
```

---

## Шаг 4 — Конфигурация приложения (config.ts)

**Статус: Выполнено** ✅

> **Общие правила (действуют для КАЖДОГО шага):**
> 1. Язык кода — TypeScript.
> 2. Не добавляй комментарии в код, кроме JSDoc где необходимо.
> 3. Не коммить автоматически — жди подтверждения.
> 4. После каждого шага запускай `npm run typecheck`, `npm run lint`, `npm run test`. Все три должны пройти.
> 5. Файлы структуры: `src/` — исходники, `src/**/*.test.ts` — тесты рядом с исходником.
> 6. Используй существующие библиотеки, не добавляй новые без необходимости.
> 7. Без feature flags и backwards-compat шимов — если меняешь, меняй напрямую.
> 8. После выполнения шага отмечай его статус «Выполнено» в заголовке.
> 9. Перед началом нового шага проверяй что предыдущий шаг отмечен как «Выполнено».

**Промт:**

```
Создай файл src/config.ts с конфигурацией приложения.

Требования:
1. Читай переменные окружения через process.env
2. Экспортируй объект config:
   - openrouterApiKey: string (обязательный)
   - redisUrl: string (по умолчанию "redis://localhost:6379")
   - port: number (по умолчанию 3001)
   - nodeEnv: "development" | "production" (по умолчанию "development")
3. Валидация: если openrouterApiKey не задан — throw Error при инициализации
4. Создай тест src/utils/__tests__/config.test.ts который проверяет что:
   - config возвращает значения по умолчанию когда env заданы
   - missing openrouterApiKey выбрасывает ошибку
```

---

## Шаг 5 — Redis хранилище (storage layer)

**Статус: Выполнено** ✅

> **Общие правила (действуют для КАЖДОГО шага):**
> 1. Язык кода — TypeScript.
> 2. Не добавляй комментарии в код, кроме JSDoc где необходимо.
> 3. Не коммить автоматически — жди подтверждения.
> 4. После каждого шага запускай `npm run typecheck`, `npm run lint`, `npm run test`. Все три должны пройти.
> 5. Файлы структуры: `src/` — исходники, `src/**/*.test.ts` — тесты рядом с исходником.
> 6. Используй существующие библиотеки, не добавляй новые без необходимости.
> 7. Без feature flags и backwards-compat шимов — если меняешь, меняй напрямую.
> 8. После выполнения шага отмечай его статус «Выполнено» в заголовке.
> 9. Перед началом нового шага проверяй что предыдущий шаг отмечен как «Выполнено».

**Промт:**

```
Создай слой хранения на Redis.

Файлы:
1. src/storage/redis.ts — клиент Redis:
   - Используй библиотеку ioredis
   - Экспортируй функцию createRedisClient(url: string) → Redis
   - Экспортируй функцию closeRedisClient(client: Redis) → Promise<void>

2. src/storage/session-store.ts — хранилище сессий:
   - Тип SessionData: { id: string, jobProfile: JobProfile | null, history: InterviewMessage[], weakSkills: string[], createdAt: string, updatedAt: string }
   - Тип JobProfile: { role: string, level: string, skills: string[], keywords: string[], domain: string }
   - Тип InterviewMessage: { role: "user" | "assistant", content: string, timestamp: string }
   - Функции:
     - createSession(client: Redis) → Promise<SessionData> (создаёт с uuid, TTL 24 часа)
     - getSession(client: Redis, id: string) → Promise<SessionData | null>
     - updateSession(client: Redis, id: string, data: Partial<SessionData>) → Promise<void>
     - deleteSession(client: Redis, id: string) → Promise<void>

3. Тесты src/storage/__tests__/session-store.test.ts:
   - мокай ioredis
   - тест createSession — создаёт запись с id и timestamps
   - тест getSession — возвращает null для несуществующего id
   - тест updateSession — обновляет только переданные поля
   - тест deleteSession — вызывает del

Добавь ioredis в dependencies.
```

---

## Шаг 6 — Утилиты (sanitize, validators)

**Статус: Выполнено** ✅

> **Общие правила (действуют для КАЖДОГО шага):**
> 1. Язык кода — TypeScript.
> 2. Не добавляй комментарии в код, кроме JSDoc где необходимо.
> 3. Не коммить автоматически — жди подтверждения.
> 4. После каждого шага запускай `npm run typecheck`, `npm run lint`, `npm run test`. Все три должны пройти.
> 5. Файлы структуры: `src/` — исходники, `src/**/*.test.ts` — тесты рядом с исходником.
> 6. Используй существующие библиотеки, не добавляй новые без необходимости.
> 7. Без feature flags и backwards-compat шимов — если меняешь, меняй напрямую.
> 8. После выполнения шага отмечай его статус «Выполнено» в заголовке.
> 9. Перед началом нового шага проверяй что предыдущий шаг отмечен как «Выполнено».

**Промт:**

```
Создай утилиты для валидации и санитизации.

Файлы:
1. src/utils/sanitize.ts:
   - sanitizeInput(text: string) → string — удаляет HTML теги, ограничивает длину 10000 символов, экранирует спецсимволы
   - sanitizeJobText(text: string) → string — то же, но с лимитом 50000 символов

2. src/utils/validators.ts:
   - isValidSessionId(id: string) → boolean — формат UUID v4
   - isValidJobText(text: string) → boolean — непустая строка, минимум 50 символов
   - isValidAnswer(text: string) → boolean — непустая строка, минимум 10 символов

3. Тесты src/utils/__tests__/sanitize.test.ts и src/utils/__tests__/validators.test.ts:
   - sanitizeInput: удаляет <script>, ограничивает длину, экранирует
   - sanitizeJobText: лимит 50000
   - isValidSessionId: валидный UUID → true, невалидный → false
   - isValidJobText: пустая → false, < 50 символов → false, корректная → true
   - isValidAnswer: пустая → false, < 10 символов → false, корректная → true
```

---

## Шаг 7 — Типы агентов (agents/types.ts)

**Статус: Выполнено** ✅

> **Общие правила (действуют для КАЖДОГО шага):**
> 1. Язык кода — TypeScript.
> 2. Не добавляй комментарии в код, кроме JSDoc где необходимо.
> 3. Не коммить автоматически — жди подтверждения.
> 4. После каждого шага запускай `npm run typecheck`, `npm run lint`, `npm run test`. Все три должны пройти.
> 5. Файлы структуры: `src/` — исходники, `src/**/*.test.ts` — тесты рядом с исходником.
> 6. Используй существующие библиотеки, не добавляй новые без необходимости.
> 7. Без feature flags и backwards-compat шимов — если меняешь, меняй напрямую.
> 8. После выполнения шага отмечай его статус «Выполнено» в заголовке.
> 9. Перед началом нового шага проверяй что предыдущий шаг отмечен как «Выполнено».

**Промт:**

```
Создай файл src/agents/types.ts с общими типами для агентной системы.

Типы:
1. AgentName: "job-parser" | "interviewer" | "evaluator" | "coach" | "memory"
2. AgentInput: { sessionId: string, content: string, context?: Record<string, unknown> }
3. AgentOutput: { agentName: AgentName, result: string, metadata?: Record<string, unknown> }
4. ParsedJob: { role: string, level: "junior" | "middle" | "senior", skills: string[], keywords: string[], domain: string }
5. EvaluationResult: { score: number, strengths: string[], weaknesses: string[], recommendation: string }
6. QuestionResult: { question: string, topic: string, difficulty: "easy" | "medium" | "hard" }
7. CoachResult: { explanation: string, improvedAnswer: string, tips: string[] }
8. MemoryUpdate: { weakSkills: string[], answeredTopics: string[] }
9. InterviewState: { sessionId: string, currentQuestion: QuestionResult | null, questionCount: number, scores: number[] }

Создай тест src/agents/__tests__/types.test.ts который просто импортирует все типы и проверяет что файл компилируется (smoke test).
```

---

## Шаг 8 — Инструмент parseJobDescriptionTool

**Статус: Выполнено** ✅

> **Общие правила (действуют для КАЖДОГО шага):**
> 1. Язык кода — TypeScript.
> 2. Не добавляй комментарии в код, кроме JSDoc где необходимо.
> 3. Не коммить автоматически — жди подтверждения.
> 4. После каждого шага запускай `npm run typecheck`, `npm run lint`, `npm run test`. Все три должны пройти.
> 5. Файлы структуры: `src/` — исходники, `src/**/*.test.ts` — тесты рядом с исходником.
> 6. Используй существующие библиотеки, не добавляй новые без необходимости.
> 7. Без feature flags и backwards-compat шимов — если меняешь, меняй напрямую.
> 8. После выполнения шага отмечай его статус «Выполнено» в заголовке.
> 9. Перед началом нового шага проверяй что предыдущий шаг отмечен как «Выполнено».

**Промт:**

```
Создай инструмент parseJobDescriptionTool.

Файл: src/tools/parse-job-description.tool.ts

Требования:
1. Экспортируй функцию parseJobDescriptionTool(text: string, config: { apiKey: string }) → Promise<ParsedJob>
2. Функция отправляет промт в LLM через OpenRouter API (fetch к https://openrouter.ai/api/v1/chat/completions)
3. Промт: "Analyze this job description and extract: role, level (junior/middle/senior), skills array, keywords array, domain. Return ONLY valid JSON matching this schema: { role: string, level: string, skills: string[], keywords: string[], domain: string }"
4. Валидируй ответ через JSON.parse и проверь наличие обязательных полей
5. Используй модель "deepseek/deepseek-chat"
6. Обрабатывай ошибки: невалидный JSON → throw с сообщением, HTTP ошибки → throw с сообщением

Тест: src/tools/__tests__/parse-job-description.tool.test.ts
- мокай fetch
- тест успешного парсинга — возвращает ParsedJob
- тест невалидного JSON от LLM — выбрасывает ошибку
- тест HTTP ошибки — выбрасывает ошибку
```

---

## Шаг 9 — Инструмент generateQuestionTool

**Статус: Выполнено** ✅

> **Общие правила (действуют для КАЖДОГО шага):**
> 1. Язык кода — TypeScript.
> 2. Не добавляй комментарии в код, кроме JSDoc где необходимо.
> 3. Не коммить автоматически — жди подтверждения.
> 4. После каждого шага запускай `npm run typecheck`, `npm run lint`, `npm run test`. Все три должны пройти.
> 5. Файлы структуры: `src/` — исходники, `src/**/*.test.ts` — тесты рядом с исходником.
> 6. Используй существующие библиотеки, не добавляй новые без необходимости.
> 7. Без feature flags и backwards-compat шимов — если меняешь, меняй напрямую.
> 8. После выполнения шага отмечай его статус «Выполнено» в заголовке.
> 9. Перед началом нового шага проверяй что предыдущий шаг отмечен как «Выполнено».

**Промт:**

```
Создай инструмент generateQuestionTool.

Файл: src/tools/generate-question.tool.ts

Требования:
1. Экспортируй функцию generateQuestionTool(params: { jobProfile: ParsedJob, weakSkills: string[], previousQuestions: string[], config: { apiKey: string } }) → Promise<QuestionResult>
2. Отправляет промт в LLM через OpenRouter (deepseek/deepseek-chat)
3. Промт: "Generate an interview question for {role} position ({level} level). Required skills: {skills}. Weak areas to focus on: {weakSkills}. Avoid repeating: {previousQuestions}. Return JSON: { question: string, topic: string, difficulty: easy|medium|hard }"
4. Адаптируй difficulty на основе weakSkills (если есть weak skills по теме → medium/hard)
5. Валидируй ответ

Тест: src/tools/__tests__/generate-question.tool.test.ts
- мокай fetch
- тест генерации вопроса — возвращает QuestionResult
- тест с пустыми weakSkills — генерирует easy/medium вопрос
```

---

## Шаг 10 — Инструмент evaluateAnswerTool

**Статус: Выполнено** ✅

> **Общие правила (действуют для КАЖДОГО шага):**
> 1. Язык кода — TypeScript.
> 2. Не добавляй комментарии в код, кроме JSDoc где необходимо.
> 3. Не коммить автоматически — жди подтверждения.
> 4. После каждого шага запускай `npm run typecheck`, `npm run lint`, `npm run test`. Все три должны пройти.
> 5. Файлы структуры: `src/` — исходники, `src/**/*.test.ts` — тесты рядом с исходником.
> 6. Используй существующие библиотеки, не добавляй новые без необходимости.
> 7. Без feature flags и backwards-compat шимов — если меняешь, меняй напрямую.
> 8. После выполнения шага отмечай его статус «Выполнено» в заголовке.
> 9. Перед началом нового шага проверяй что предыдущий шаг отмечен как «Выполнено».

**Промт:**

```
Создай инструмент evaluateAnswerTool.

Файл: src/tools/evaluate-answer.tool.ts

Требования:
1. Экспортируй функцию evaluateAnswerTool(params: { question: string, answer: string, jobProfile: ParsedJob, config: { apiKey: string } }) → Promise<EvaluationResult>
2. Отправляет промт в LLM через OpenRouter (deepseek/deepseek-chat)
3. Промт: "Evaluate this interview answer for {role} ({level}) position. Question: {question}. Answer: {answer}. Required skills: {skills}. Score 1-10, list strengths, weaknesses, give recommendation. Return JSON: { score: number, strengths: string[], weaknesses: string[], recommendation: string }"
4. Валидируй score в диапазоне 1-10

Тест: src/tools/__tests__/evaluate-answer.tool.test.ts
- мокай fetch
- тест оценки — возвращает EvaluationResult с score 1-10
- тест невалидного score — исправляется до допустимого диапазона
```

---

## Шаг 11 — Инструмент updateMemoryTool

**Статус: Выполнено** ✅

> **Общие правила (действуют для КАЖДОГО шага):**
> 1. Язык кода — TypeScript.
> 2. Не добавляй комментарии в код, кроме JSDoc где необходимо.
> 3. Не коммить автоматически — жди подтверждения.
> 4. После каждого шага запускай `npm run typecheck`, `npm run lint`, `npm run test`. Все три должны пройти.
> 5. Файлы структуры: `src/` — исходники, `src/**/*.test.ts` — тесты рядом с исходником.
> 6. Используй существующие библиотеки, не добавляй новые без необходимости.
> 7. Без feature flags и backwards-compat шимов — если меняешь, меняй напрямую.
> 8. После выполнения шага отмечай его статус «Выполнено» в заголовке.
> 9. Перед началом нового шага проверяй что предыдущий шаг отмечен как «Выполнено».

**Промт:**

```
Создай инструмент updateMemoryTool.

Файл: src/tools/update-memory.tool.ts

Требования:
1. Экспортируй функцию updateMemoryTool(params: { sessionId: string, evaluation: EvaluationResult, questionTopic: string, redis: Redis }) → Promise<MemoryUpdate>
2. Логика:
   - Если score < 5 → добавить тему в weakSkills
   - Если score >= 7 → удалить тему из weakSkills (если была)
   - Всегда добавить questionTopic в answeredTopics
3. Обнови сессию в Redis через session-store
4. Верни MemoryUpdate

Тест: src/tools/__tests__/update-memory.tool.test.ts
- мокай Redis и session-store
- тест score < 5 — тема добавляется в weakSkills
- тест score >= 7 — тема удаляется из weakSkills
- тест score 5-6 — weakSkills не меняются
```

---

## Шаг 12 — Инструмент fetchWeakTopicsTool

**Статус: Выполнено** ✅

> **Общие правила (действуют для КАЖДОГО шага):**
> 1. Язык кода — TypeScript.
> 2. Не добавляй комментарии в код, кроме JSDoc где необходимо.
> 3. Не коммить автоматически — жди подтверждения.
> 4. После каждого шага запускай `npm run typecheck`, `npm run lint`, `npm run test`. Все три должны пройти.
> 5. Файлы структуры: `src/` — исходники, `src/**/*.test.ts` — тесты рядом с исходником.
> 6. Используй существующие библиотеки, не добавляй новые без необходимости.
> 7. Без feature flags и backwards-compat шимов — если меняешь, меняй напрямую.
> 8. После выполнения шага отмечай его статус «Выполнено» в заголовке.
> 9. Перед началом нового шага проверяй что предыдущий шаг отмечен как «Выполнено».

**Промт:**

```
Создай инструмент fetchWeakTopicsTool.

Файл: src/tools/fetch-weak-topics.tool.ts

Требования:
1. Экспортируй функцию fetchWeakTopicsTool(params: { sessionId: string, redis: Redis }) → Promise<string[]>
2. Получи сессию из Redis и верни weakSkills
3. Если сессия не найдена — верни пустой массив

Тест: src/tools/__tests__/fetch-weak-topics.tool.test.ts
- мокай Redis
- тест есть weakSkills — возвращает массив
- тест нет сессии — возвращает []
- тест weakSkills пустой — возвращает []
```

---

## Шаг 13 — Агент JobParserAgent

**Статус: Выполнено** ✅

> **Общие правила (действуют для КАЖДОГО шага):**
> 1. Язык кода — TypeScript.
> 2. Не добавляй комментарии в код, кроме JSDoc где необходимо.
> 3. Не коммить автоматически — жди подтверждения.
> 4. После каждого шага запускай `npm run typecheck`, `npm run lint`, `npm run test`. Все три должны пройти.
> 5. Файлы структуры: `src/` — исходники, `src/**/*.test.ts` — тесты рядом с исходником.
> 6. Используй существующие библиотеки, не добавляй новые без необходимости.
> 7. Без feature flags и backwards-compat шимов — если меняешь, меняй напрямую.
> 8. После выполнения шага отмечай его статус «Выполнено» в заголовке.
> 9. Перед началом нового шага проверяй что предыдущий шаг отмечен как «Выполнено».

**Промт:**

```
Создай агент JobParserAgent.

Файл: src/agents/job-parser.agent.ts

Требования:
1. Экспортируй функцию jobParserAgent(input: AgentInput, config: { apiKey: string }) → Promise<AgentOutput>
2. Используй parseJobDescriptionTool для парсинга текста вакансии
3. Верни AgentOutput с agentName "job-parser" и result — JSON строка ParsedJob
4. Валидируй входной текст через sanitizeJobText и isValidJobText

Тест: src/agents/__tests__/job-parser.agent.test.ts
- мокай parseJobDescriptionTool
- тест корректного ввода — возвращает AgentOutput с parsed job
- тест пустого текста — выбрасывает ошибку валидации
```

---

## Шаг 14 — Агент InterviewerAgent

**Статус: Выполнено** ✅

> **Общие правила (действуют для КАЖДОГО шага):**
> 1. Язык кода — TypeScript.
> 2. Не добавляй комментарии в код, кроме JSDoc где необходимо.
> 3. Не коммить автоматически — жди подтверждения.
> 4. После каждого шага запускай `npm run typecheck`, `npm run lint`, `npm run test`. Все три должны пройти.
> 5. Файлы структуры: `src/` — исходники, `src/**/*.test.ts` — тесты рядом с исходником.
> 6. Используй существующие библиотеки, не добавляй новые без необходимости.
> 7. Без feature flags и backwards-compat шимов — если меняешь, меняй напрямую.
> 8. После выполнения шага отмечай его статус «Выполнено» в заголовке.
> 9. Перед началом нового шага проверяй что предыдущий шаг отмечен как «Выполнено».

**Промт:**

```
Создай агент InterviewerAgent.

Файл: src/agents/interviewer.agent.ts

Требования:
1. Экспортируй функцию interviewerAgent(params: { input: AgentInput, jobProfile: ParsedJob, weakSkills: string[], previousQuestions: string[], config: { apiKey: string } }) → Promise<AgentOutput>
2. Используй generateQuestionTool для генерации вопроса
3. Верни AgentOutput с agentName "interviewer" и result — JSON строка QuestionResult

Тест: src/agents/__tests__/interviewer.agent.test.ts
- мокай generateQuestionTool
- тест генерации вопроса — возвращает AgentOutput с QuestionResult
```

---

## Шаг 15 — Агент EvaluatorAgent

**Статус: Выполнено** ✅

> **Общие правила (действуют для КАЖДОГО шага):**
> 1. Язык кода — TypeScript.
> 2. Не добавляй комментарии в код, кроме JSDoc где необходимо.
> 3. Не коммить автоматически — жди подтверждения.
> 4. После каждого шага запускай `npm run typecheck`, `npm run lint`, `npm run test`. Все три должны пройти.
> 5. Файлы структуры: `src/` — исходники, `src/**/*.test.ts` — тесты рядом с исходником.
> 6. Используй существующие библиотеки, не добавляй новые без необходимости.
> 7. Без feature flags и backwards-compat шимов — если меняешь, меняй напрямую.
> 8. После выполнения шага отмечай его статус «Выполнено» в заголовке.
> 9. Перед началом нового шага проверяй что предыдущий шаг отмечен как «Выполнено».

**Промт:**

```
Создай агент EvaluatorAgent.

Файл: src/agents/evaluator.agent.ts

Требования:
1. Экспортируй функцию evaluatorAgent(params: { question: string, answer: string, jobProfile: ParsedJob, config: { apiKey: string } }) → Promise<AgentOutput>
2. Используй evaluateAnswerTool для оценки ответа
3. Верни AgentOutput с agentName "evaluator" и result — JSON строка EvaluationResult

Тест: src/agents/__tests__/evaluator.agent.test.ts
- мокай evaluateAnswerTool
- тест оценки — возвращает AgentOutput с EvaluationResult
```

---

## Шаг 16 — Агент CoachAgent

**Статус: Выполнено** ✅

> **Общие правила (действуют для КАЖДОГО шага):**
> 1. Язык кода — TypeScript.
> 2. Не добавляй комментарии в код, кроме JSDoc где необходимо.
> 3. Не коммить автоматически — жди подтверждения.
> 4. После каждого шага запускай `npm run typecheck`, `npm run lint`, `npm run test`. Все три должны пройти.
> 5. Файлы структуры: `src/` — исходники, `src/**/*.test.ts` — тесты рядом с исходником.
> 6. Используй существующие библиотеки, не добавляй новые без необходимости.
> 7. Без feature flags и backwards-compat шимов — если меняешь, меняй напрямую.
> 8. После выполнения шага отмечай его статус «Выполнено» в заголовке.
> 9. Перед началом нового шага проверяй что предыдущий шаг отмечен как «Выполнено».

**Промт:**

```
Создай агент CoachAgent.

Файл: src/agents/coach.agent.ts

Требования:
1. Экспортируй функцию coachAgent(params: { question: string, answer: string, evaluation: EvaluationResult, jobProfile: ParsedJob, config: { apiKey: string } }) → Promise<AgentOutput>
2. Отправляет промт в LLM через OpenRouter
3. Промт: "You are an interview coach. For {role} ({level}) position. Question was: {question}. Candidate answered: {answer}. Score: {score}/10. Strengths: {strengths}. Weaknesses: {weaknesses}. Provide: explanation of correct answer, improved version of candidate's answer, 3 practical tips. Return JSON: { explanation: string, improvedAnswer: string, tips: string[] }"
4. Верни AgentOutput с agentName "coach" и result — JSON строка CoachResult

Тест: src/agents/__tests__/coach.agent.test.ts
- мокай fetch
- тест генерации фидбека — возвращает AgentOutput с CoachResult
```

---

## Шаг 17 — Агент MemoryAgent

**Статус: Выполнено** ✅

> **Общие правила (действуют для КАЖДОГО шага):**
> 1. Язык кода — TypeScript.
> 2. Не добавляй комментарии в код, кроме JSDoc где необходимо.
> 3. Не коммить автоматически — жди подтверждения.
> 4. После каждого шага запускай `npm run typecheck`, `npm run lint`, `npm run test`. Все три должны пройти.
> 5. Файлы структуры: `src/` — исходники, `src/**/*.test.ts` — тесты рядом с исходником.
> 6. Используй существующие библиотеки, не добавляй новые без необходимости.
> 7. Без feature flags и backwards-compat шимов — если меняешь, меняй напрямую.
> 8. После выполнения шага отмечай его статус «Выполнено» в заголовке.
> 9. Перед началом нового шага проверяй что предыдущий шаг отмечен как «Выполнено».

**Промт:**

```
Создай агент MemoryAgent.

Файл: src/agents/memory.agent.ts

Требования:
1. Экспортируй функцию memoryAgent(params: { sessionId: string, evaluation: EvaluationResult, questionTopic: string, redis: Redis }) → Promise<AgentOutput>
2. Используй updateMemoryTool и fetchWeakTopicsTool
3. Вызови updateMemoryTool для обновления памяти на основе оценки
4. Получи актуальные weakSkills через fetchWeakTopicsTool
5. Верни AgentOutput с agentName "memory" и result — JSON строка MemoryUpdate

Тест: src/agents/__tests__/memory.agent.test.ts
- мокай updateMemoryTool и fetchWeakTopicsTool
- тест обновления — возвращает AgentOutput с MemoryUpdate
```

---

## Шаг 18 — Оркестратор (orchestrator.ts)

**Статус: Выполнено** ✅

> **Общие правила (действуют для КАЖДОГО шага):**
> 1. Язык кода — TypeScript.
> 2. Не добавляй комментарии в код, кроме JSDoc где необходимо.
> 3. Не коммить автоматически — жди подтверждения.
> 4. После каждого шага запускай `npm run typecheck`, `npm run lint`, `npm run test`. Все три должны пройти.
> 5. Файлы структуры: `src/` — исходники, `src/**/*.test.ts` — тесты рядом с исходником.
> 6. Используй существующие библиотеки, не добавляй новые без необходимости.
> 7. Без feature flags и backwards-compat шимов — если меняешь, меняй напрямую.
> 8. После выполнения шага отмечай его статус «Выполнено» в заголовке.
> 9. Перед началом нового шага проверяй что предыдущий шаг отмечен как «Выполнено».

**Промт:**

```
Создай оркестратор агентной системы.

Файл: src/agents/orchestrator.ts

Требования:
1. Экспортируй функцию parseJob(text: string, sessionId: string, redis: Redis, config: { apiKey: string }) → Promise<ParsedJob>
   - Вызывает jobParserAgent, сохраняет jobProfile в сессию

2. Экспортируй функцию startInterview(sessionId: string, redis: Redis, config: { apiKey: string }) → Promise<QuestionResult>
   - Получает сессию, вызывает interviewerAgent с weakSkills, сохраняет вопрос в сессию

3. Экспортируй функцию processAnswer(sessionId: string, answer: string, redis: Redis, config: { apiKey: string }) → Promise<{ evaluation: EvaluationResult, coach: CoachResult, memory: MemoryUpdate, nextQuestion: QuestionResult }>
   - Последовательно вызывает: evaluatorAgent → coachAgent → memoryAgent → interviewerAgent (следующий вопрос)
   - Сохраняет ответ и результаты в сессию

4. Каждый вызов агента должен ловить ошибки и пробрасывать с контекстом (какой агент упал)

Тест: src/agents/__tests__/orchestrator.test.ts
- мокай всех агентов
- тест parseJob — вызывает jobParserAgent и сохраняет в сессию
- тест startInterview — вызывает interviewerAgent с weakSkills из сессии
- тест processAnswer — вызывает цепочку агентов и возвращает результат
```

---

## Шаг 19 — Fastify сервер и базовые middleware

**Статус: Выполнено** ✅

> **Общие правила (действуют для КАЖДОГО шага):**
> 1. Язык кода — TypeScript.
> 2. Не добавляй комментарии в код, кроме JSDoc где необходимо.
> 3. Не коммить автоматически — жди подтверждения.
> 4. После каждого шага запускай `npm run typecheck`, `npm run lint`, `npm run test`. Все три должны пройти.
> 5. Файлы структуры: `src/` — исходники, `src/**/*.test.ts` — тесты рядом с исходником.
> 6. Используй существующие библиотеки, не добавляй новые без необходимости.
> 7. Без feature flags и backwards-compat шимов — если меняешь, меняй напрямую.
> 8. После выполнения шага отмечай его статус «Выполнено» в заголовке.
> 9. Перед началом нового шага проверяй что предыдущий шаг отмечен как «Выполнено».

**Промт:**

```
Создай Fastify сервер с базовыми middleware.

Файл: src/api/server.ts

Требования:
1. Используй fastify с @fastify/cors
2. Порт из config.port
3. CORS: разрешай origin из CORS_ORIGIN env (по умолчанию http://localhost:3000)
4. Логирование запросов через @fastify/helmet для безопасности
5. Graceful shutdown: при SIGTERM/SIGINT закрывай Redis и сервер
6. Экспортируй server для тестов

Доп. зависимости: fastify, @fastify/cors, @fastify/helmet

Тест: src/api/__tests__/server.test.ts
- тест сервер стартует и отвечает на GET /health → 200 { status: "ok" }
- тест CORS заголовки присутствуют
```

---

## Шаг 20 — API маршрут POST /job/parse

**Статус:**

> **Общие правила (действуют для КАЖДОГО шага):**
> 1. Язык кода — TypeScript.
> 2. Не добавляй комментарии в код, кроме JSDoc где необходимо.
> 3. Не коммить автоматически — жди подтверждения.
> 4. После каждого шага запускай `npm run typecheck`, `npm run lint`, `npm run test`. Все три должны пройти.
> 5. Файлы структуры: `src/` — исходники, `src/**/*.test.ts` — тесты рядом с исходником.
> 6. Используй существующие библиотеки, не добавляй новые без необходимости.
> 7. Без feature flags и backwards-compat шимов — если меняешь, меняй напрямую.
> 8. После выполнения шага отмечай его статус «Выполнено» в заголовке.
> 9. Перед началом нового шага проверяй что предыдущий шаг отмечен как «Выполнено».

**Промт:**

```
Создай API маршрут для парсинга вакансии.

Файл: src/api/routes/job.ts

Требования:
1. POST /job/parse — принимает { text: string }
2. Валидация: text обязателен, минимум 50 символов (isValidJobText)
3. Санитизация: sanitizeJobText(text)
4. Создаёт новую сессию через createSession
5. Вызывает parseJob из оркестратора
6. Возвращает: { sessionId: string, jobProfile: ParsedJob }
7. Ошибки: 400 для невалидного ввода, 500 для внутренних ошибок

Тест: src/api/__tests__/job.test.ts
- мокай оркестратор и Redis
- тест успешного парсинга — 200 с sessionId и jobProfile
- тест пустого текста — 400
- тест короткого текста — 400
```

---

## Шаг 21 — API маршрут POST /interview/start

**Статус:**

> **Общие правила (действуют для КАЖДОГО шага):**
> 1. Язык кода — TypeScript.
> 2. Не добавляй комментарии в код, кроме JSDoc где необходимо.
> 3. Не коммить автоматически — жди подтверждения.
> 4. После каждого шага запускай `npm run typecheck`, `npm run lint`, `npm run test`. Все три должны пройти.
> 5. Файлы структуры: `src/` — исходники, `src/**/*.test.ts` — тесты рядом с исходником.
> 6. Используй существующие библиотеки, не добавляй новые без необходимости.
> 7. Без feature flags и backwards-compat шимов — если меняешь, меняй напрямую.
> 8. После выполнения шага отмечай его статус «Выполнено» в заголовке.
> 9. Перед началом нового шага проверяй что предыдущий шаг отмечен как «Выполнено».

**Промт:**

```
Создай API маршрут для старта интервью.

Файл: src/api/routes/interview.ts

Требования:
1. POST /interview/start — принимает { sessionId: string }
2. Валидация: sessionId обязателен, должен быть валидный UUID
3. Проверь что сессия существует
4. Вызывает startInterview из оркестратора
5. Возвращает: { question: QuestionResult }
6. Ошибки: 404 если сессия не найдена, 400 если sessionId невалидный

Тест: src/api/__tests__/interview.test.ts
- мокай оркестратор и Redis
- тест успешного старта — 200 с question
- тест несуществующей сессии — 404
- тест невалидного UUID — 400
```

---

## Шаг 22 — API маршрут POST /interview/answer

**Статус:**

> **Общие правила (действуют для КАЖДОГО шага):**
> 1. Язык кода — TypeScript.
> 2. Не добавляй комментарии в код, кроме JSDoc где необходимо.
> 3. Не коммить автоматически — жди подтверждения.
> 4. После каждого шага запускай `npm run typecheck`, `npm run lint`, `npm run test`. Все три должны пройти.
> 5. Файлы структуры: `src/` — исходники, `src/**/*.test.ts` — тесты рядом с исходником.
> 6. Используй существующие библиотеки, не добавляй новые без необходимости.
> 7. Без feature flags и backwards-compat шимов — если меняешь, меняй напрямую.
> 8. После выполнения шага отмечай его статус «Выполнено» в заголовке.
> 9. Перед началом нового шага проверяй что предыдущий шаг отмечен как «Выполнено».

**Промт:**

```
Создай API маршрут для отправки ответа.

Файл: src/api/routes/interview.ts (добавь в существующий)

Требования:
1. POST /interview/answer — принимает { sessionId: string, answer: string }
2. Валидация: sessionId (UUID), answer (isValidAnswer, минимум 10 символов)
3. Санитизация: sanitizeInput(answer)
4. Проверь что сессия существует
5. Вызывает processAnswer из оркестратора
6. Возвращает: { evaluation: EvaluationResult, coach: CoachResult, memory: MemoryUpdate, nextQuestion: QuestionResult }
7. Ошибки: 400 для невалидного ввода, 404 если сессия не найдена

Тест: src/api/__tests__/interview.test.ts (добавь тесты)
- мокай оркестратор и Redis
- тест успешного ответа — 200 с полным результатом
- тест пустого ответа — 400
- тест короткого ответа — 400
```

---

## Шаг 23 — API маршрут GET /session/:id

**Статус:**

> **Общие правила (действуют для КАЖДОГО шага):**
> 1. Язык кода — TypeScript.
> 2. Не добавляй комментарии в код, кроме JSDoc где необходимо.
> 3. Не коммить автоматически — жди подтверждения.
> 4. После каждого шага запускай `npm run typecheck`, `npm run lint`, `npm run test`. Все три должны пройти.
> 5. Файлы структуры: `src/` — исходники, `src/**/*.test.ts` — тесты рядом с исходником.
> 6. Используй существующие библиотеки, не добавляй новые без необходимости.
> 7. Без feature flags и backwards-compat шимов — если меняешь, меняй напрямую.
> 8. После выполнения шага отмечай его статус «Выполнено» в заголовке.
> 9. Перед началом нового шага проверяй что предыдущий шаг отмечен как «Выполнено».

**Промт:**

```
Создай API маршрут для получения сессии.

Файл: src/api/routes/session.ts

Требования:
1. GET /session/:id — возвращает данные сессии
2. Валидация: id обязателен, должен быть валидный UUID
3. Проверь что сессия существует
4. Возвращает: { id, jobProfile, history, weakSkills, createdAt, updatedAt }
5. Ошибки: 404 если сессия не найдена, 400 если id невалидный

Тест: src/api/__tests__/session.test.ts
- мокай Redis и session-store
- тест существующей сессии — 200 с данными
- тест несуществующей сессии — 404
- тест невалидного UUID — 400
```

---

## Шаг 24 — Регистрация маршрутов в сервере

**Статус:**

> **Общие правила (действуют для КАЖДОГО шага):**
> 1. Язык кода — TypeScript.
> 2. Не добавляй комментарии в код, кроме JSDoc где необходимо.
> 3. Не коммить автоматически — жди подтверждения.
> 4. После каждого шага запускай `npm run typecheck`, `npm run lint`, `npm run test`. Все три должны пройти.
> 5. Файлы структуры: `src/` — исходники, `src/**/*.test.ts` — тесты рядом с исходником.
> 6. Используй существующие библиотеки, не добавляй новые без необходимости.
> 7. Без feature flags и backwards-compat шимов — если меняешь, меняй напрямую.
> 8. После выполнения шага отмечай его статус «Выполнено» в заголовке.
> 9. Перед началом нового шага проверяй что предыдущий шаг отмечен как «Выполнено».

**Промт:**

```
Зарегистрируй все API маршруты в Fastify сервере.

Обнови src/api/server.ts:
1. Импортируй маршруты из routes/job.ts, routes/interview.ts, routes/session.ts
2. Зарегистрируй их через fastify.register
3. Убедись что Redis клиент создаётся при старте и передаётся в контекст через decorate
4. Добавь обработчик ошибок (onError) с логированием

Обнови src/api/routes/*.ts:
1. Каждый маршрут должен получать Redis из fastify (через request.server.redis)
2. Config — из process.env (через config.ts)

Тест: src/api/__tests__/server.test.ts (добавь тесты)
- тест все маршруты доступны
- тест POST /job/parse с валидным body
- тест POST /interview/start с валидным body
- тест POST /interview/answer с валидным body
- тест GET /session/:id с валидным id
```

---

## Шаг 25 — Интеграционный тест API

**Статус:**

> **Общие правила (действуют для КАЖДОГО шага):**
> 1. Язык кода — TypeScript.
> 2. Не добавляй комментарии в код, кроме JSDoc где необходимо.
> 3. Не коммить автоматически — жди подтверждения.
> 4. После каждого шага запускай `npm run typecheck`, `npm run lint`, `npm run test`. Все три должны пройти.
> 5. Файлы структуры: `src/` — исходники, `src/**/*.test.ts` — тесты рядом с исходником.
> 6. Используй существующие библиотеки, не добавляй новые без необходимости.
> 7. Без feature flags и backwards-compat шимов — если меняешь, меняй напрямую.
> 8. После выполнения шага отмечай его статус «Выполнено» в заголовке.
> 9. Перед началом нового шага проверяй что предыдущий шаг отмечен как «Выполнено».

**Промт:**

```
Напиши интеграционный тест полного flow API.

Файл: src/api/__tests__/integration.test.ts

Сценарий:
1. POST /job/parse с текстом вакансии → получить sessionId
2. POST /interview/start с sessionId → получить первый вопрос
3. POST /interview/answer с sessionId и ответом → получить оценку, фидбек, следующий вопрос
4. GET /session/:id → проверить что история обновилась

Мокай Redis и все LLM вызовы (fetch). Проверяй что:
- session ID валидный UUID
- jobProfile содержит role, level, skills
- question содержит question, topic, difficulty
- evaluation содержит score 1-10
- coach содержит explanation, improvedAnswer, tips
- nextQuestion содержит question, topic, difficulty
- session history содержит записи

Этот тест проверяет что все компоненты корректно связаны.
```

---

## Шаг 26 — Финальная проверка и фикс

**Статус:**

> **Общие правила (действуют для КАЖДОГО шага):**
> 1. Язык кода — TypeScript.
> 2. Не добавляй комментарии в код, кроме JSDoc где необходимо.
> 3. Не коммить автоматически — жди подтверждения.
> 4. После каждого шага запускай `npm run typecheck`, `npm run lint`, `npm run test`. Все три должны пройти.
> 5. Файлы структуры: `src/` — исходники, `src/**/*.test.ts` — тесты рядом с исходником.
> 6. Используй существующие библиотеки, не добавляй новые без необходимости.
> 7. Без feature flags и backwards-compat шимов — если меняешь, меняй напрямую.
> 8. После выполнения шага отмечай его статус «Выполнено» в заголовке.
> 9. Перед началом нового шага проверяй что предыдущий шаг отмечен как «Выполнено».

**Промт:**

```
Проведи финальную проверку проекта:

1. Запусти npm run typecheck — исправь все ошибки типов
2. Запусти npm run lint — исправь все warnings и errors
3. Запусти npm run test — убедись что все тесты проходят
4. Проверь что все файлы из структуры (шаг 3) созданы
5. Проверь что .env.example содержит все нужные переменные
6. Проверь что package.json содержит все зависимости
7. Создай README.md с кратким описанием проекта, как запустить (npm install, npm run dev:api), и структурой

Все три команды (typecheck, lint, test) должны пройти без ошибок.
```
