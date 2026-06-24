# AI Job Interview Simulator — Technical Stack & Architecture

## 1. Frontend (UI Layer)

### Next.js (TypeScript)

**Why:**
- fullstack UI framework
- fast to build the interface
- SSR / client components
- easy API integration

**Used for:**
- job description upload
- interview screen (chat UI)
- feedback display
- user progress

---

## 2. Backend (API Layer)

### Fastify (Node.js + TypeScript)

**Role:**
- API gateway between UI and agent system
- session management
- request routing

**Main endpoints:**
- `POST /job/parse`
- `POST /interview/start`
- `POST /interview/answer`
- `GET /session/:id`

---

## 3. AI Agent Layer (System Core)

### Google ADK (TypeScript)

This is the core of the project.

### Multi-Agent System:

1. **JobParserAgent**
   - analyzes job description
   - extracts:
     - skills
     - seniority
     - domain

2. **InterviewerAgent**
   - generates questions
   - adapts difficulty
   - manages dialogue

3. **EvaluatorAgent**
   - evaluates answers
   - returns structured score

4. **CoachAgent**
   - explains mistakes
   - provides improved answers
   - gives tips

5. **MemoryAgent**
   - stores:
     - weak topics
     - answer history
   - affects future questions

### Orchestration:

Uses:
- Sequential workflow (main flow)
- Loop workflow (interview cycle)
- Agent-to-Agent calls

---

## 4. Tools / MCP Layer

### Custom Tools:
- `parseJobDescriptionTool`
- `generateQuestionTool`
- `evaluateAnswerTool`
- `updateMemoryTool`
- `fetchWeakTopicsTool`

**Role of tools:**
- separate LLM from logic
- make the system "agent-based" rather than "prompt-based"
- used inside ADK agents

---

## 5. Memory & Sessions

### Session-based memory system

**Stores:**
- `session_id` (no registration required)
- interview history
- user weak skills
- progress

### Storage:
- Firestore (or Redis)
- `sessions/{sessionId}`
- `users_state/{sessionId}`

---

## 6. Security Layer

Implemented via:
- prompt injection protection
- tool access control (agents only)
- structured output validation (JSON schema)
- input sanitization (job text / user answers)

---

## 7. Deployment (Google Cloud)

### Cloud Run

**Deployment:**
- Fastify backend + ADK runtime
- stateless API
- autoscaling

**Optional:**
- Firestore — memory
- Secret Manager — API keys

### Deployment Config

No real deployment config exists in the project yet:
- ❌ Dockerfile
- ❌ cloudbuild.yaml
- ❌ CI/CD pipeline

**Approach:** Docker + manual deployment via gcloud CLI commands, without GitHub Actions automation.

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

## 9. LLM Replacement Approach

We are considering two options for integrating DeepSeek instead of Gemini.

### Option 1. Replacing Gemini with DeepSeek inside Google Gen AI SDK

The official JS SDK from Google allows overriding the address where requests are sent (`baseUrl`). To point it at DeepSeek, you still need **LiteLLM** (or Portkey/OpenRouter) running as a local proxy. It will accept requests from the SDK in Google Gemini format and translate them to DeepSeek format on the fly.

**How to set up in code:**

```javascript
import { GoogleGenAI } from '@google/genai'; // New SDK from Google

const ai = new GoogleGenAI({
  apiKey: "your_deepseek_or_proxy_api_key",
  httpOptions: {
    // Specify your proxy address (e.g. LiteLLM),
    // which can transform Google Gemini format to DeepSeek format
    baseUrl: "http://localhost:4000"
  }
});

// Call it like regular Gemini, but DeepSeek will respond
const response = await ai.models.generateContent({
  model: 'deepseek-chat', // Model name configured in your proxy
  contents: 'Hello! Who are you?',
});

console.log(response.text);
```

---

## 10. How This Meets Requirements

| Requirement        | Implementation                             |
|--------------------|---------------------------------------------|
| Multi-agent system | 5 specialized agents                        |
| Tools / MCP        | separate tool functions                     |
| Memory & sessions  | session-based learning + weak topics        |
| Security features  | injection protection, structured outputs    |
| Real-world use case | job-based interview simulation              |

---

## Final Description

The system is a full-stack AI Interview Simulator that transforms job descriptions into personalized adaptive interview sessions. It is built using Next.js, Fastify, and Google ADK (TypeScript). The architecture implements a multi-agent system consisting of JobParser, Interviewer, Evaluator, Coach, and Memory agents. The system leverages tools, session-based memory, and secure agent orchestration deployed on Google Cloud Run.

> LLM: **DeepSeek** via **OpenRouter** (instead of Gemini).
