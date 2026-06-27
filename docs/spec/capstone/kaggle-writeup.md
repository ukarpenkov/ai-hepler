# AI Interview Simulator — Adaptive Multi-Agent Interview Practice

**Track:** Agents for Business

---

## Problem Statement

Hiring is broken. The average company spends **$4,700 and 42 days** to fill a single position — yet most candidates walk into interviews underprepared. Why? Because current interview prep tools are one-size-fits-none:

- **Generic question banks** ignore the actual job requirements — practicing for a senior backend role with junior frontend questions wastes everyone's time
- **Zero feedback loop** — candidates repeat the same mistakes without knowing what a strong answer looks like
- **No adaptive difficulty** — the system doesn't learn from performance, so preparation never gets smarter
- **Single-language lock-in** — global talent pools are excluded by English-only tools
- **No coaching layer** — candidates know they failed a question but have no idea how to improve

For businesses, this translates into **longer time-to-hire, higher recruiter burnout, and missed talent**. For candidates, it means failing interviews not from lack of skill, but from lack of targeted practice.

This system solves both sides: candidates practice with job-specific, adaptive interviews; hiring teams get better-prepared applicants who can actually demonstrate their competence.

---

## Why Agents?

A single chatbot can ask interview questions. It cannot run an adaptive interview pipeline. Here's what this system requires:

1. **Parse job descriptions** into structured skill profiles — skills, seniority, domain
2. **Generate contextual questions** matched to the exact role, not a generic pool
3. **Evaluate answers** across 5 dimensions with structured scoring (accuracy, depth, relevance, examples, communication)
4. **Coach candidates** by explaining what a perfect answer would include
5. **Track weak areas** across the entire session and adapt future questions

A single model attempting all of these produces incoherent results. The solution is **specialized agents in a pipeline** — each agent owns one cognitive task with focused instructions, dedicated tools, and validated output schemas. The result is deterministic, auditable, and production-grade.

---

## Architecture

### Agent Pipeline

Five specialized agents orchestrated via Google ADK's `SequentialAgent`:

```
Job Description → [JobParserAgent] → Job Profile
                                         ↓
                                    ┌─────────────┐
                                    │  Interview   │
User Answer → [EvaluatorAgent] →   │  Pipeline     │ → Next Question
                    ↓               │  (Sequential) │
             [CoachAgent]          └─────────────┘
                    ↓                    ↑
             [MemoryAgent] ─────────────┘
```

| Agent | Role | Business Value |
|-------|------|----------------|
| **JobParserAgent** | Extracts structured profile from job description text | Eliminates manual job analysis — instant role understanding |
| **InterviewerAgent** | Generates role-specific questions, weighted toward weak areas | No generic questions — every question targets actual job requirements |
| **EvaluatorAgent** | Scores answers across 5 dimensions with anti-cheat detection | Objective, structured evaluation — consistent across all candidates |
| **CoachAgent** | Explains correct answers with actionable improvement tips | Built-in coaching layer — replaces expensive interview coaches |
| **MemoryAgent** | Tracks weak skills and adapts difficulty in real-time | Personalized learning curve — maximum ROI per practice session |

### Adaptive Feedback Loop

The core differentiator is the **closed feedback loop** — the system gets smarter with every answer:

1. Candidate answers a question
2. **EvaluatorAgent** scores it across accuracy, depth, relevance, examples
3. **CoachAgent** generates a model answer and improvement tips
4. **MemoryAgent** updates the candidate's weak skills profile
5. **InterviewerAgent** generates the **next question weighted toward identified gaps**

No manual configuration. No static question pools. The system finds what the candidate struggles with and targets it automatically.

### Multi-Language Support

The system detects the language of the job description and conducts the entire interview in that language. English, Russian, German, Spanish — questions, evaluation, and coaching all adapt. This unlocks **global talent pools** without language barriers.

---

## Key Concepts Demonstrated

### 1. Multi-Agent Orchestration (Google ADK)

Five `LlmAgent` instances coordinated via `SequentialAgent`. Each agent has:
- Dedicated system prompt (`instruction`)
- Dedicated tools (`FunctionTool`)
- Output validation (`outputSchema` with Zod)
- Forced tool execution (`beforeModelCallback`)

State flows through ADK's session management — each agent reads and writes to shared session state, enabling true multi-agent collaboration.

### 2. Structured Tools (FunctionTool)

Six custom tools with Zod schema validation:

```typescript
export const parseJobTool = new FunctionTool({
  name: "parseJobDescription",
  description: "Extracts structured job profile from text",
  parameters: parseJobParams,  // z.object({ jobText: z.string() })
  execute: executeParseJob,
});
```

Every tool call validates input and output through Zod schemas — no malformed responses, no missing fields, no hallucinated data.

### 3. Production-Grade Security

- **Prompt Injection Defense**: Regex-based detection blocks "ignore previous instructions", "you are now", and similar attack vectors
- **Rate Limiting**: IP-based limiter (30 req/min) with proper HTTP 429 responses
- **Tool Access Control**: Matrix-based permissions — system tools restricted to agents, memory tools scoped to agents and routes
- **Output Validation**: All LLM responses validated through Zod schemas before any downstream processing

### 4. Forced Tool Execution Pattern

Each agent uses `beforeModelCallback` to enforce deterministic tool calls — the agent is instructed to always invoke its designated tool, ensuring predictable behavior for critical operations like evaluation and memory updates.

---

## Technical Implementation

### Stack

| Layer | Technology |
|-------|-----------|
| Backend | Fastify (Node.js + TypeScript) |
| AI Framework | Google ADK (v1.3.0) |
| LLM | DeepSeek via OpenRouter |
| State Storage | Redis (ioredis) |
| Schema Validation | Zod |
| Frontend | Next.js (React + TypeScript) |
| Testing | Vitest |
| Deployment | Google Cloud Run (Docker) |

### API Design

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/job/parse` | POST | Parse job description → structured profile |
| `/interview/start` | POST | Initialize interview session with job profile |
| `/interview/answer` | POST | Submit answer → evaluation + coaching + next question |
| `/session/:id` | GET | Retrieve full session history and performance scores |

### Structured Output Guarantee

Every agent output is validated against a Zod schema before use:

```typescript
const evaluationResultSchema = z.object({
  score: z.number(),
  accuracy: z.number(),
  depth: z.number(),
  relevance: z.number(),
  examples: z.number(),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  recommendation: z.string(),
  antiCheatFlags: z.array(z.string()),
  perfectAnswerSummary: z.string(),
});
```

This eliminates the #1 failure mode in production LLM apps — parsing errors from malformed responses.

### Deployment

Production-deployed on Google Cloud Run with multi-stage Docker builds:

- **Backend**: `https://interview-sim-606232140580.us-central1.run.app`
- **Frontend**: `https://interview-sim-frontend-606232140580.us-central1.run.app`

Auto-scaling, zero-downtime deploys, containerized.

---

## Business Impact

| Metric | Before | With AI Interview Simulator |
|--------|--------|---------------------------|
| Candidate prep time | Weeks of unstructured practice | Hours of targeted, adaptive sessions |
| Interview quality | Generic questions, no feedback | Role-specific questions with 5-dimension scoring |
| Coaching access | Expensive human coaches ($100+/hr) | Built-in AI coaching with every answer |
| Language coverage | English-only tools | Any language — automatic detection |
| Scalability | 1:1 human coaching only | Unlimited concurrent sessions |

### Who Benefits

- **Candidates**: Practice with the exact skills their target role requires, get instant feedback, and improve in their weak areas — all without paying for a coach
- **Recruiters & Hiring Teams**: Receive better-prepared candidates who can articulate their skills effectively, reducing interview rounds and time-to-hire
- **HR Platforms**: White-label-ready API that can be embedded into existing ATS/HR systems

---

## What Makes This Different

1. **Job-specific, not generic** — questions extracted from the actual job description, not a static pool
2. **Adaptive difficulty** — the system learns from every answer and adjusts in real-time
3. **Memory-driven personalization** — weak areas are tracked across the entire session
4. **Multi-language by design** — any language the job posting is written in
5. **Structured, auditable feedback** — 5-dimension scoring with anti-cheat detection
6. **Production-ready** — deployed, type-safe, tested, with security built in from day one
7. **Multi-agent architecture** — 5 specialized agents collaborating via Google ADK, not a single chatbot

---

## License

MIT
