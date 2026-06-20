# AI Job Interview Simulator

AI-агент, который анализирует вакансию и проводит персонализированное собеседование.

## Project Goal

Kaggle Capstone project. Build a real AI agent system using Google ADK that demonstrates min 3 key concepts: multi-agent systems, tools/MCP, agent skills, security features.

**Deadline:** 6 July 2026, 23:59 PT

## Tech Stack

- **Frontend:** Next.js (TypeScript)
- **Backend:** Fastify (Node.js + TypeScript)
- **AI Core:** Google ADK (TypeScript)
- **LLM:** DeepSeek via OpenRouter (not Gemini)
- **Storage:** Firestore or Redis (sessions)
- **Deploy:** Google Cloud Run

## Architecture — 5 Agents

1. **JobParserAgent** — parses job description → extracts skills, seniority, domain
2. **InterviewerAgent** — generates questions based on job profile, adapts difficulty
3. **EvaluatorAgent** — scores answers, returns structured feedback (score, strengths, weaknesses)
4. **CoachAgent** — explains correct answers, gives improvement tips
5. **MemoryAgent** — stores weak areas, affects future questions

**Flow:** Job Description → JobParser → Interviewer → User Answer → Evaluator → Coach → Memory update → Next Question (adaptive loop)

## Tools

- `parseJobDescriptionTool`
- `generateQuestionTool`
- `evaluateAnswerTool`
- `updateMemoryTool`
- `fetchWeakTopicsTool`

## API Endpoints

- `POST /job/parse`
- `POST /interview/start`
- `POST /interview/answer`
- `GET /session/:id`

## Rules

### Commits

Conventional Commits format: `<type>(scope): <description>`

Types: feat, fix, refactor, perf, test, docs, style, chore, build, ci

### Testing & Quality

Before every commit run in order:
1. `npm run typecheck` — TypeScript check
2. `npm run lint` — ESLint
3. `npm run test` — Vitest unit tests

All three must pass. Fix before committing.

### Restrictions

Automatic commits are forbidden. All commits must be done by user or after explicit confirmation.

## Session Memory

System stores per session:
- session_id (no registration required)
- interview history
- user weak skills
- progress

## Security

- Prompt injection protection
- Tool access control (agents only)
- Structured output validation (JSON schema)
- Input sanitization (job text / user answers)

## Detailed Docs

Full specs in `docs/spec/` folder:
- `docs/spec/idea/main.md` — product concept
- `docs/spec/tech/main.md` — full technical architecture
- `docs/spec/capstone/capstone.md` — competition requirements
- `docs/spec/tech/rules/commits.md` — commit conventions
- `docs/spec/tech/rules/testing-and-quality.md` — testing rules
- `docs/spec/restrictions/restrictions.md` — AI restrictions
