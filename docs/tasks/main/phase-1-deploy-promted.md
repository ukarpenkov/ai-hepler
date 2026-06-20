# Фаза 1 — Промты для деплоя

---

## Шаг 1 — Исправить конфигурацию (DEEPSEEK_API_KEY вместо OPENROUTER_API_KEY) ✅ Выполнено

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
Обнови файл src/config.ts для работы с DeepSeek API вместо OpenRouter.

Текущий код:
```typescript
const openrouterApiKey = process.env.OPENROUTER_API_KEY;
if (!openrouterApiKey) {
  throw new Error("OPENROUTER_API_KEY environment variable is required");
}
const config = {
  openrouterApiKey,
  redisUrl: process.env.REDIS_URL || "redis://localhost:6379",
  port: parseInt(process.env.PORT || "3001", 10),
  nodeEnv: (process.env.NODE_ENV as "development" | "production") || "development",
} as const;
export default config;
```

Нужно изменить на:
1. Заменить OPENROUTER_API_KEY → DEEPSEEK_API_KEY
2. Переименовать поле openrouterApiKey → deepseekApiKey
3. Добавить поле llmBaseUrl: строка, по умолчанию "https://api.deepseek.com"
4. Добавить поле llmModel: строка, по умолчанию "deepseek-chat"
5. Сделать redisUrl опциональным: если REDIS_URL не задан — вернуть undefined (не строку)
6. Обновить .env.example: заменить OPENROUTER_API_KEY на DEEPSEEK_API_KEY
7. Обновить тест src/utils/__tests__/config.test.ts:
   - Тест что deepseekApiKey берётся из DEEPSEEK_API_KEY
   - Тест что llmBaseUrl по умолчанию "https://api.deepseek.com"
   - Тест что llmModel по умолчанию "deepseek-chat"
   - Тест что redisUrl undefined если REDIS_URL не задан
   - Тест что missing DEEPSEEK_API_KEY выбрасывает ошибку


---

## Шаг 2 — Обновить parseJobDescriptionTool (DeepSeek API) ✅ Выполнено

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
Обнови файл src/tools/parse-job-description.tool.ts для работы с DeepSeek API.

Текущий код вызывает fetch("https://openrouter.ai/api/v1/chat/completions") с моделью "deepseek/deepseek-chat".

Нужно изменить:
1. Сигнатуру функции: parseJobDescriptionTool(text: string, config: { apiKey: string }) → parseJobDescriptionTool(text: string, config: { apiKey: string, baseUrl: string, model: string })
2. URL: "https://openrouter.ai/api/v1/chat/completions" → `${config.baseUrl}/chat/completions`
3. Модель: "deepseek/deepseek-chat" → config.model
4. Заголовок ошибки: "OpenRouter API error" → "LLM API error"

Обнови тест src/tools/__tests__/parse-job-description.tool.test.ts:
- Мокай fetch на URL, содержащий "api.deepseek.com" (или любой baseUrl)
- Передавай config: { apiKey: "test", baseUrl: "https://api.deepseek.com", model: "deepseek-chat" }
```

---

## Шаг 3 — Обновить generateQuestionTool (DeepSeek API) ✅ Выполнено

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
Обнови файл src/tools/generate-question.tool.ts для работы с DeepSeek API.

Текущий код вызывает fetch("https://openrouter.ai/api/v1/chat/completions") с моделью "deepseek/deepseek-chat".

Нужно изменить:
1. Сигнатуру функции: добавить baseUrl и model в config параметр
   Было: config: { apiKey: string }
   Стало: config: { apiKey: string, baseUrl: string, model: string }
2. URL: "https://openrouter.ai/api/v1/chat/completions" → `${config.baseUrl}/chat/completions`
3. Модель: "deepseek/deepseek-chat" → config.model
4. Заголовок ошибки: "OpenRouter API error" → "LLM API error"

Обнови тест src/tools/__tests__/generate-question.tool.test.ts:
- Передавай config: { apiKey: "test", baseUrl: "https://api.deepseek.com", model: "deepseek-chat" }
```

---

## Шаг 4 — Обновить evaluateAnswerTool (DeepSeek API) ✅ Выполнено

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
Обнови файл src/tools/evaluate-answer.tool.ts для работы с DeepSeek API.

Текущий код вызывает fetch("https://openrouter.ai/api/v1/chat/completions") с моделью "deepseek/deepseek-chat".

Нужно изменить:
1. Сигнатуру функции: добавить baseUrl и model в config параметр
   Было: config: { apiKey: string }
   Стало: config: { apiKey: string, baseUrl: string, model: string }
2. URL: "https://openrouter.ai/api/v1/chat/completions" → `${config.baseUrl}/chat/completions`
3. Модель: "deepseek/deepseek-chat" → config.model
4. Заголовок ошибки: "OpenRouter API error" → "LLM API error"

Обнови тест src/tools/__tests__/evaluate-answer.tool.test.ts:
- Передавай config: { apiKey: "test", baseUrl: "https://api.deepseek.com", model: "deepseek-chat" }
```

---

## Шаг 5 — Обновить coachAgent (DeepSeek API) ✅ Выполнено

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
Обнови файл src/agents/coach.agent.ts для работы с DeepSeek API.

Текущий код вызывает fetch("https://openrouter.ai/api/v1/chat/completions") с моделью "deepseek/deepseek-chat".

Нужно изменить:
1. Сигнатуру функции: добавить baseUrl и model в config параметр
   Было: config: { apiKey: string }
   Стало: config: { apiKey: string, baseUrl: string, model: string }
2. URL: "https://openrouter.ai/api/v1/chat/completions" → `${config.baseUrl}/chat/completions`
3. Модель: "deepseek/deepseek-chat" → config.model
4. Заголовок ошибки: "OpenRouter API error" → "LLM API error"

Обнови тест src/agents/__tests__/coach.agent.test.ts:
- Передавай config: { apiKey: "test", baseUrl: "https://api.deepseek.com", model: "deepseek-chat" }
```

---

## Шаг 6 — Обновить оркестратор (передача config всем агентам) ✅ Выполнено

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
Обнови файл src/agents/orchestrator.ts для передачи полного config (apiKey, baseUrl, model) всем агентам.

Сейчас оркестратор принимает config: { apiKey: string } и передаёт его агентам.

Нужно изменить:
1. Сигнатуры функций parseJob, startInterview, processAnswer:
   Было: config: { apiKey: string }
   Стало: config: { apiKey: string, baseUrl: string, model: string }
2. Во всех вызовах агентов (jobParserAgent, interviewerAgent, evaluatorAgent, coachAgent, memoryAgent) передавай полный config
3. Импортируй config из ../config.js и используй его при вызове функций оркестратора

Обнови тест src/agents/__tests__/orchestrator.test.ts:
- Передавай config: { apiKey: "test", baseUrl: "https://api.deepseek.com", model: "deepseek-chat" }
```

---

## Шаг 7 — Обновить API routes (передача config из конфига) ✅ Выполнено

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
Обнови API маршруты для передачи полного config из конфига приложения.

Файлы: src/api/routes/job.ts, src/api/routes/interview.ts

Сейчас маршруты импортируют config и передают { apiKey: config.openrouterApiKey }.

Нужно изменить:
1. В каждом маршруте импортируй config из ../../config.js
2. Создай объект llmConfig: { apiKey: config.deepseekApiKey, baseUrl: config.llmBaseUrl, model: config.llmModel }
3. Передавай llmConfig в вызовы оркестратора (parseJob, startInterview, processAnswer)

Обнови тесты:
- src/api/__tests__/job.test.ts — mocked config должен содержать deepseekApiKey, llmBaseUrl, llmModel
- src/api/__tests__/interview.test.ts — аналогично
```

---

## Шаг 8 — Сделать Redis опциональным (in-memory fallback) ✅ Выполнено

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
Сделай Redis опциональным с in-memory fallback для работы на Cloud Run без Memorystore.

1. Обнови src/storage/redis.ts:
   - Функция createRedisClient(url: string | undefined) → Redis | null
   - Если url не задан или пустой — вернуть null
   - Если url задан — создать Redis клиент как раньше

2. Обнови src/storage/session-store.ts:
   - Добавь in-memory хранилище: Map<string, { data: SessionData, expiresAt: number }>
   - Измени сигнатуры функций: client: Redis → client: Redis | null
   - createSession: если client=null → сохранить в Map с TTL 24 часа
   - getSession: если client=null → найти в Map (проверить expiresAt)
   - updateSession: если client=null → обновить в Map
   - deleteSession: если client=null → удалить из Map
   - При использовании Redis — логика как раньше

3. Обнови src/api/server.ts:
   - createRedisClient может вернуть null
   - server.decorate("redis", redis) — redis может быть null
   - В shutdown: если redis — закрыть, если null — пропустить

4. Обнови тест src/storage/__tests__/session-store.test.ts:
   - Добавь тесты для in-memory режима (client=null)
   - Тест createSession с null client — создаёт в Map
   - Тест getSession с null client — находит в Map
   - Тест updateSession с null client — обновляет в Map
   - Тест deleteSession с null client — удаляет из Map
```

---

## Шаг 9 — Добавить скрипты сборки в package.json ✅ Выполнено

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
Добавь скрипты сборки и запуска в package.json.

Текущие scripts:
```json
"scripts": {
  "typecheck": "tsc --noEmit",
  "lint": "eslint . --max-warnings 0",
  "lint:fix": "eslint . --fix",
  "test": "vitest run",
  "test:watch": "vitest",
  "dev:api": "tsx watch src/api/server.ts",
  "dev:web": "cd packages/web && npm run dev"
}
```

Добавь:
- "build": "tsc" — компиляция TypeScript в dist/
- "start": "node dist/api/server.js" — запуск скомпилированного сервера
- "dev": "tsx watch src/api/server.ts" — алиас для dev:api

После изменения выполни npm run build и убедись что dist/ создаётся.


---

## Шаг 10 — Создать Dockerfile ✅ Выполнено

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
Создай Dockerfile для деплоя на Google Cloud Run.

Файл: Dockerfile (в корне проекта)

Многостадийная сборка:
```dockerfile
FROM node:22-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-slim
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
EXPOSE 3001
CMD ["npm", "start"]
```

Также создай файл .dockerignore:
```
node_modules
dist
coverage
.env
.env.local
.git
*.log
.DS_Store
```


---

## Шаг 11 — Проверить сборку локально ✅ Выполнено

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
Проверь что проект собирается и все проверки проходят.

Выполни последовательно:
1. npm run typecheck — должен пройти без ошибок
2. npm run lint — должен пройти без warnings
3. npm run test — все тесты должны пройти
4. npm run build — должна создаться папка dist/

Если какая-то команда упала — исправь ошибки и повтори.

После успешной сборки проверь что файл dist/api/server.js существует.
```

---

## Шаг 12 — Настроить Google Cloud проект ✅ Выполнено

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
Настрой Google Cloud проект для деплоя на Cloud Run.

Выполни команды:
1. gcloud config set project studious-pager-6k76w
2. gcloud services enable run.googleapis.com
3. gcloud services enable containerregistry.googleapis.com

Проверь:
- gcloud config get-value project → studious-pager-6k76w
- gcloud auth list → показывает активного пользователя
```

---

## Шаг 13 — Деплой на Cloud Run ✅ Выполнено

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
Задеплой приложение на Google Cloud Run.

Выполни команду деплоя:
gcloud run deploy interview-sim --source . --platform managed --region us-central1 --allow-unauthenticated --set-env-vars "DEEPSEEK_API_KEY=$DEEPSEEK_API_KEY,GOOGLE_CLOUD_PROJECT=studious-pager-6k76w,PORT=3001"

После деплоя:
1. Скопируй URL сервиса из вывода команды
2. Проверь что URL работает: curl <URL>/health
3. Ожидаемый ответ: {"status":"ok"}

Если деплой упал — прочитай логи и исправь ошибку.
```

---

## Шаг 14 — Верификация деплоя ✅ Выполнено

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
Проверь что деплой на Cloud Run работает корректно.

Выполни проверки:
1. curl <CLOUD_RUN_URL>/health → должен вернуть {"status":"ok"}
2. Проверь что сервер отвечает на POST запросы (даже с ошибкой валидации — это нормально, значит сервер работает)

Сохрани URL сервиса — он понадобится для фронтенда.

Запиши URL в файл .env.deploy:
CLOUD_RUN_URL=<ваш URL>
```
