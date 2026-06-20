# AI Job Interview Simulator

AI-powered interview simulator that analyzes job descriptions and conducts personalized technical interviews.

## Features

- Job description parsing with skill extraction
- Adaptive interview questions based on weak areas
- Answer evaluation with scores and feedback
- Coaching with improved answers and tips
- Session memory tracking weak skills

## Tech Stack

- **Backend:** Fastify (Node.js + TypeScript)
- **AI:** DeepSeek via OpenRouter
- **Storage:** Redis (ioredis)
- **Testing:** Vitest

## Quick Start

```bash
npm install
cp .env.example .env
# Edit .env with your OPENROUTER_API_KEY
npm run dev:api
```

Server starts at `http://localhost:3001`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/job/parse` | Parse job description |
| POST | `/interview/start` | Start interview session |
| POST | `/interview/answer` | Submit answer |
| GET | `/session/:id` | Get session data |

## Scripts

- `npm run dev:api` — Start dev server
- `npm run typecheck` — TypeScript check
- `npm run lint` — ESLint
- `npm run test` — Run tests

## Project Structure

```
src/
├── api/
│   ├── server.ts          # Fastify server
│   └── routes/            # API routes
├── agents/                # AI agents
│   ├── orchestrator.ts    # Workflow coordinator
│   └── *.agent.ts         # Individual agents
├── tools/                 # LLM tool functions
├── storage/               # Redis client & session store
├── utils/                 # Sanitize & validators
└── config.ts              # App configuration
```
