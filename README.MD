# AI Interview Simulator

AI-агент для проведения персонализированных собеседований. Анализирует вакансию и проводит адаптивное интервью с обратной связью.

**Kaggle Capstone Project**

## Архитектура

### Агенты (5)

| Агент | Описание |
|-------|----------|
| **JobParserAgent** | Парсит описание вакансии, извлекает навыки, уровень, домен |
| **InterviewerAgent** | Генерирует вопросы на основе профиля вакансии, адаптирует сложность |
| **EvaluatorAgent** | Оценивает ответы, возвращает структурированную обратную связь |
| **CoachAgent** | Объясняет правильные ответы, даёт советы по улучшению |
| **MemoryAgent** | Запоминает слабые темы, влияет на будущие вопросы |

### Tools (5)

- `parseJob` — парсинг описания вакансии
- `generateQuestion` — генерация вопроса
- `evaluateAnswer` — оценка ответа
- `updateMemory` — обновление памяти
- `fetchWeakTopics` — получение слабых тем

### Стек технологий

- **Backend:** Fastify (Node.js + TypeScript)
- **Frontend:** Next.js (React + TypeScript)
- **AI:** DeepSeek via OpenRouter
- **AI Framework:** Google ADK
- **Storage:** Redis (ioredis)
- **Валидация:** Zod
- **Тестирование:** Vitest

## Быстрый старт

```bash
# Клонирование репозитория
git clone <repository-url>
cd ai-interview-simulator

# Установка зависимостей
npm install

# Копирование конфигурации
cp .env.example .env

# Редактирование .env (добавить OPENROUTER_API_KEY)
nano .env

# Запуск сервера
npm run dev:api

# Запуск фронтенда (отдельный терминал)
npm run dev:web
```

Сервер: `http://localhost:3001`
Фронтенд: `http://localhost:3000`

## API Endpoints

| Метод | Эндпоинт | Описание |
|-------|----------|----------|
| `GET` | `/health` | Проверка здоровья сервера |
| `POST` | `/job/parse` | Парсинг описания вакансии |
| `POST` | `/interview/start` | Начало сессии интервью |
| `POST` | `/interview/answer` | Отправка ответа на вопрос |
| `GET` | `/session/:id` | Получение данных сессии |

## Безопасность

- **Input sanitization** — защита от prompt injection
- **Rate limiting** — ограничение количества запросов
- **Tool access control** — контроль доступа к tools
- **Structured output validation** — валидация вывода LLM через Zod

## Деплой

### Backend (Cloud Run)

```bash
# Сборка и деплой
docker build -t gcr.io/$PROJECT_ID/interview-sim .
docker push gcr.io/$PROJECT_ID/interview-sim
gcloud run deploy interview-sim --image gcr.io/$PROJECT_ID/interview-sim
```

### Frontend (Vercel)

1. Подключи GitHub репозиторий к Vercel
2. Укажи Root Directory: `packages/web`
3. Build Command: `npm run build`
4. Добавь переменную `NEXT_PUBLIC_API_URL`

### Secrets Management

```bash
# Создание secrets
echo "YOUR_API_KEY" | gcloud secrets create openrouter-api-key --data-file=-

# Использование в Cloud Run
gcloud run deploy interview-sim \
  --set-secrets "OPENROUTER_API_KEY=openrouter-api-key:latest"
```

Подробнее: `docs/deployment/`

## Тесты

```bash
# Запуск всех тестов
npm run test

# Проверка типов
npm run typecheck

# Линтинг
npm run lint
```

## Структура проекта

```
├── src/
│   ├── api/              # Fastify сервер и маршруты
│   ├── agents/           # AI агенты
│   ├── tools/            # Функции для LLM
│   ├── storage/          # Redis клиент
│   ├── security/         # Модули безопасности
│   ├── types/            # TypeScript типы
│   └── config.ts         # Конфигурация
├── packages/web/         # Next.js фронтенд
├── docs/                 # Документация
├── Dockerfile            # Docker сборка
├── cloudbuild.yaml       # Google Cloud Build
└── package.json
```

## Лицензия

MIT
