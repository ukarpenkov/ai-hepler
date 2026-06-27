# AI Interview Simulator

**Track:** Agents for Business -- Kaggle Capstone Project

Adaptive multi-agent interview practice platform. Parse any job description, run a personalized interview session, and receive structured coaching feedback -- all powered by an orchestrated pipeline of five specialized agents built with Google ADK.

**Live Demo:**
- Backend: https://interview-sim-606232140580.us-central1.run.app
- Frontend: https://interview-sim-frontend-606232140580.us-central1.run.app

---

## Problem

Most interview preparation tools fail because they are generic. They pull from static question banks, provide no feedback on what went wrong, and do not adapt to the candidate's actual skill level. The result is candidates who practice the wrong things, waste time, and still fail under pressure.

For businesses, this means longer hiring cycles, higher recruiter workload, and qualified candidates slipping through because they could not articulate their skills in an interview setting.

## Solution

This system replaces one-size-fits-all question banks with an adaptive interview pipeline that:

1. Parses the target job description to extract required skills, seniority level, and domain
2. Generates interview questions specific to that role -- not a generic pool
3. Evaluates each answer across five dimensions with structured scoring
4. Provides coaching feedback that explains what a strong answer would include
5. Tracks weak areas across the session and adapts future questions accordingly

The result is a practice interview that gets smarter with every answer and focuses on exactly where the candidate needs improvement.

---

## Architecture

### Agent Pipeline

Five agents are orchestrated through Google ADK's `SequentialAgent`:

```
Job Description -> [JobParserAgent] -> Job Profile
                                           |
                                      +----v----+
                                      |Interview|
User Answer -> [EvaluatorAgent] ->   | Pipeline  | -> Next Question
                      |              | (Sequential)
               [CoachAgent]          +----^----+
                      |                    |
               [MemoryAgent] -------------+
```

| Agent | Responsibility |
|-------|---------------|
| **JobParserAgent** | Extracts a structured job profile from the description text -- skills, seniority, domain |
| **InterviewerAgent** | Generates role-specific questions, weighted toward the candidate's weak areas |
| **EvaluatorAgent** | Scores answers across five dimensions: accuracy, depth, relevance, examples, and communication quality |
| **CoachAgent** | Produces a model answer and actionable improvement tips for each question |
| **MemoryAgent** | Maintains a running record of weak topics so the system can adapt question selection |

### Adaptive Loop

The feedback cycle runs on every answer:

1. Candidate submits an answer
2. `EvaluatorAgent` scores it with structured output (Zod-validated)
3. `CoachAgent` generates a model answer and tips
4. `MemoryAgent` updates the candidate's weak skills profile
5. `InterviewerAgent` selects the next question, prioritizing identified gaps

No manual configuration is needed. The system identifies weak areas and targets them automatically.

### Multi-Language Support

The system detects the language of the job description and conducts the entire interview in that language. Questions, evaluation criteria, and coaching feedback all adapt. English, Russian, German, Spanish, or any other language -- no translation layer required.

### Security

- **Input sanitization** -- regex-based prompt injection detection blocks common attack patterns
- **Rate limiting** -- IP-based limiter at 30 requests per minute with HTTP 429 responses
- **Tool access control** -- matrix-based permissions restrict which agents can call which tools
- **Structured output validation** -- every LLM response is validated against a Zod schema before downstream processing

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Fastify (Node.js + TypeScript, ESM) |
| AI Framework | Google ADK v1.3.0 |
| LLM | DeepSeek via OpenRouter |
| State Storage | Redis (ioredis) |
| Validation | Zod |
| Frontend | Next.js (React + TypeScript) |
| Testing | Vitest |
| Deployment | Google Cloud Run (Docker) |

---

## Prerequisites

- Node.js 20 or later
- npm
- Redis server running locally (or provide a remote Redis URL)
- An OpenRouter API key with access to DeepSeek models

You need an API key from OpenRouter (https://openrouter.ai) to connect to the LLM. Create an account, generate an API key, and add it to the `.env` file as described below.

---

## Running Locally

### 1. Clone the repository

```
git clone <repository-url>
cd ai-interview-simulator
```

### 2. Install dependencies

```
npm install
```

### 3. Configure environment variables

Copy the example configuration file:

```
cp .env.example .env
```

Edit `.env` and set your API key:

```
DEEPSEEK_API_KEY=<your-openrouter-api-key>
REDIS_URL=redis://localhost:6379
PORT=3001
NODE_ENV=development
ADK_MODEL=deepseek/deepseek-chat
ADK_BASE_URL=https://api.deepseek.com
```

The `DEEPSEEK_API_KEY` field is required. Without a valid API key, the agents cannot generate questions or evaluate answers.

### 4. Start Redis

Make sure a Redis server is running on `localhost:6379`, or set `REDIS_URL` to point to your Redis instance.

### 5. Start the backend

```
npm run dev:api
```

The API server will start on `http://localhost:3001`.

### 6. Start the frontend (separate terminal)

```
npm run dev:web
```

The web interface will be available at `http://localhost:3000`.

### 7. Run a session

Open the frontend in your browser, paste a job description, and start the interview.

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check -- returns service status |
| `POST` | `/job/parse` | Parse a job description into a structured profile |
| `POST` | `/interview/start` | Initialize an interview session with a job profile |
| `POST` | `/interview/answer` | Submit an answer; returns evaluation, coaching, and the next question |
| `GET` | `/session/:id` | Retrieve full session history and performance scores |

---

## Development Commands

```
npm run dev:api      # Start backend with hot reload
npm run dev:web      # Start frontend with hot reload
npm run build        # Compile TypeScript to JavaScript
npm run start        # Run compiled backend (production mode)
npm run test         # Run all tests (Vitest)
npm run test:watch   # Run tests in watch mode
npm run typecheck    # Run TypeScript type checking
npm run lint         # Run ESLint (zero warnings policy)
npm run lint:fix     # Run ESLint with auto-fix
```

---

## Project Structure

```
ai-interview-simulator/
├── src/
│   ├── api/              # Fastify server and route handlers
│   ├── agents/           # ADK agent definitions (5 agents)
│   ├── tools/            # FunctionTool implementations (6 tools)
│   ├── storage/          # Redis client and session management
│   ├── security/         # Input sanitization, rate limiting, access control
│   ├── types/            # TypeScript type definitions and Zod schemas
│   └── config.ts         # Application configuration
├── packages/web/         # Next.js frontend application
├── docs/
│   └── spec/capstone/    # Kaggle capstone writeup and competition materials
├── deployment/           # Cloud Run deployment configuration
├── Dockerfile            # Backend Docker image (multi-stage build)
├── cloudbuild.yaml       # Google Cloud Build pipeline definition
└── package.json          # Root package configuration
```

---

## Deployment

The application is deployed on Google Cloud Run. See `docs/deployment/` for detailed deployment instructions.

### Quick deploy

```
# Authenticate and set project
gcloud auth login
gcloud config set project project-045dea81-cef3-4b7e-a28

# Enable required APIs
gcloud services enable run.googleapis.com artifactregistry.googleapis.com cloudbuild.googleapis.com

# Create and grant access to secrets
echo "YOUR_API_KEY" | gcloud secrets create deepseek-api-key --data-file=-
gcloud secrets add-iam-policy-binding deepseek-api-key \
  --member="serviceAccount:606232140580-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

# Deploy backend
gcloud run deploy interview-sim \
  --source . \
  --region us-central1 \
  --set-secrets "DEEPSEEK_API_KEY=deepseek-api-key:latest"

# Deploy frontend
cd packages/web
gcloud run deploy interview-sim-frontend \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --port 3000
```

### Live URLs

| Service | URL |
|---------|-----|
| Backend | https://interview-sim-606232140580.us-central1.run.app |
| Frontend | https://interview-sim-frontend-606232140580.us-central1.run.app |

---

## License

MIT
