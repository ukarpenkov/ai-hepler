# AI Job Interview Simulator — Technical Stack & Architecture

## 1. Frontend (UI слой)

### Next.js (TypeScript)

**Почему:**
- fullstack UI framework
- быстро собрать интерфейс
- SSR / client components
- легко интегрируется с API

**Используется для:**
- загрузка текста вакансии
- экран интервью (чат UI)
- отображение фидбека
- прогресс пользователя

---

## 2. Backend (API слой)

### Fastify (Node.js + TypeScript)

**Роль:**
- API gateway между UI и агентной системой
- управление сессиями
- маршрутизация запросов

**Основные endpoints:**
- `POST /job/parse`
- `POST /interview/start`
- `POST /interview/answer`
- `GET /session/:id`

---

## 3. AI Agent Layer (ядро системы)

### Google ADK (TypeScript)

Это ядро проекта.

### Multi-Agent System:

1. **JobParserAgent**
   - анализирует вакансию
   - извлекает:
     - skills
     - seniority
     - domain

2. **InterviewerAgent**
   - генерирует вопросы
   - адаптирует сложность
   - ведёт диалог

3. **EvaluatorAgent**
   - оценивает ответ
   - возвращает structured score

4. **CoachAgent**
   - объясняет ошибки
   - даёт улучшенный ответ
   - даёт советы

5. **MemoryAgent**
   - хранит:
     - слабые темы
     - историю ответов
   - влияет на будущие вопросы

### Orchestration:

Используется:
- Sequential workflow (основной поток)
- Loop workflow (интервью цикл)
- Agent-to-Agent calls

---

## 4. Tools / MCP Layer

### Custom Tools:
- `parseJobDescriptionTool`
- `generateQuestionTool`
- `evaluateAnswerTool`
- `updateMemoryTool`
- `fetchWeakTopicsTool`

**Роль tools:**
- отделяют LLM от логики
- делают систему "agent-based", а не prompt-based
- используются внутри ADK agents

---

## 5. Memory & Sessions

### Session-based memory system

**Хранит:**
- `session_id` (без регистрации)
- история интервью
- слабые навыки пользователя
- прогресс

### Storage:
- Firestore (или Redis)
- `sessions/{sessionId}`
- `users_state/{sessionId}`

---

## 6. Security Layer

Реализуется через:
- prompt injection protection
- tool access control (agents only)
- structured output validation (JSON schema)
- input sanitization (job text / user answers)

---

## 7. Deployment (Google Cloud)

### Cloud Run

**Деплой:**
- Fastify backend + ADK runtime
- stateless API
- autoscaling

**Optional:**
- Firestore — memory
- Secret Manager — API keys

---

## 8. System Architecture Flow

```
Next.js UI
     │
     ▼
Fastify API
     │
     ▼
ADK Orchestrator
     │
     ├──▶ JobParser
     ├──▶ Interviewer
     └──▶ Evaluator
              │
              ▼
     CoachAgent + MemoryAgent
              │
              ▼
   LLM (DeepSeek via OpenRouter)
```

---

## 9. Подход к замене LLM

Рассматриваем два варианта интеграции DeepSeek вместо Gemini.

### Вариант 1. Замена Gemini на DeepSeek внутри Google Gen AI SDK

Официальный JS SDK от Google позволяет переопределить адрес, куда отправляются запросы (`baseUrl`). Чтобы подсунуть туда DeepSeek, вам все равно понадобится **LiteLLM** (или Portkey/OpenRouter), запущенный как локальный прокси. Он будет принимать от SDK запросы в формате Google Gemini и "на лету" переводить их в формат DeepSeek.

**Как настроить в коде:**

```javascript
import { GoogleGenAI } from '@google/genai'; // Новый SDK от Google

const ai = new GoogleGenAI({
  apiKey: "ваш_api_key_от_deepseek_или_прокси",
  httpOptions: {
    // Указываем адрес вашего прокси (например LiteLLM),
    // который умеет трансформировать формат Google Gemini -> DeepSeek
    baseUrl: "http://localhost:4000"
  }
});

// Вызываем как обычный Gemini, но отвечать будет DeepSeek
const response = await ai.models.generateContent({
  model: 'deepseek-chat', // Имя модели, прописанное в вашем прокси
  contents: 'Привет! Кто ты?',
});

console.log(response.text);
```

---

## 10. Как это закрывает ТЗ

| ТЗ пункт           | Реализация                             |
|--------------------|----------------------------------------|
| Multi-agent system | 5 специализированных agents            |
| Tools / MCP        | отдельные tool functions               |
| Memory & sessions  | session-based learning + weak topics   |
| Security features  | injection protection, structured outputs |
| Real-world use case | job-based interview simulation        |

---

## Итоговое описание

The system is a full-stack AI Interview Simulator that transforms job descriptions into personalized adaptive interview sessions. It is built using Next.js, Fastify, and Google ADK (TypeScript). The architecture implements a multi-agent system consisting of JobParser, Interviewer, Evaluator, Coach, and Memory agents. The system leverages tools, session-based memory, and secure agent orchestration deployed on Google Cloud Run.

> LLM: **DeepSeek** через **OpenRouter** (вместо Gemini).
