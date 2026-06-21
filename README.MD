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

### URLs

| Сервис | URL |
|--------|-----|
| **Backend** | https://interview-sim-606232140580.us-central1.run.app |
| **Frontend** | https://interview-sim-frontend-606232140580.us-central1.run.app |

### Backend (Cloud Run)

```bash
# Авторизация и настройка проекта
gcloud auth login
gcloud config set project project-045dea81-cef3-4b7e-a28

# Включение API
gcloud services enable run.googleapis.com artifactregistry.googleapis.com cloudbuild.googleapis.com

# Создание secrets
echo "YOUR_DEEPSEEK_KEY" | gcloud secrets create deepseek-api-key --data-file=-
gcloud secrets add-iam-policy-binding deepseek-api-key \
  --member="serviceAccount:606232140580-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

# Деплой
gcloud run deploy interview-sim \
  --source . \
  --region us-central1 \
  --set-secrets "DEEPSEEK_API_KEY=deepseek-api-key:latest"
```

### Frontend (Cloud Run)

```bash
cd packages/web
gcloud run deploy interview-sim-frontend \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --port 3000
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
