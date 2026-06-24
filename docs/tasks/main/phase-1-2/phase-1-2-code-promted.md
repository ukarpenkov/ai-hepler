# Phase 1 — Implementation Prompts

---

## Step 1 — Initialize root monorepo (package.json, tsconfig, .gitignore, .env.example)

**Status: Done**

> **General rules (apply to EVERY step):**
> 1. Code language — TypeScript.
> 2. Do not add comments to code, except JSDoc where necessary.
> 3. Do not commit automatically — wait for confirmation.
> 4. After each step, run `npm run typecheck`, `npm run lint`, `npm run test`. All three must pass.
> 5. File structure: `src/` — source files, `src/**/*.test.ts` — tests next to source.
> 6. Use existing libraries, do not add new ones without necessity.
> 7. No feature flags or backwards-compat shims — if changing, change directly.
> 8. After completing a step, mark its status as "Done" in the heading.
> 9. Before starting a new step, check that the previous step is marked as "Done".

**Prompt:**

```
Create a root package.json for the TypeScript monorepo project AI Job Interview Simulator.

Requirements:
1. package.json with name "ai-interview-simulator", type "module", scripts:
   - "typecheck": "tsc --noEmit"
   - "lint": "eslint . --max-warnings 0"
   - "lint:fix": "eslint . --fix"
   - "test": "vitest run"
   - "test:watch": "vitest"
   - "dev:api": "tsx watch src/api/server.ts"
   - "dev:web": "cd packages/web && npm run dev"

2. tsconfig.json — base config with strict mode, ES2022, module NodeNext, target ES2022, paths "@/*": ["./src/*"]

3. .gitignore — node_modules, dist, .env, .env.local, coverage, .DS_Store, *.log

4. .env.example — template:
   OPENROUTER_API_KEY=your_key_here
   REDIS_URL=redis://localhost:6379
   PORT=3001
   NODE_ENV=development

5. Dependencies (devDependencies): typescript, vitest, @types/node, eslint, tsx, @typescript-eslint/parser, @typescript-eslint/eslint-plugin

6. Run npm install after creating package.json.
```

---

## Step 2 — ESLint configuration

**Status: Done**

> **General rules (apply to EVERY step):**
> 1. Code language — TypeScript.
> 2. Do not add comments to code, except JSDoc where necessary.
> 3. Do not commit automatically — wait for confirmation.
> 4. After each step, run `npm run typecheck`, `npm run lint`, `npm run test`. All three must pass.
> 5. File structure: `src/` — source files, `src/**/*.test.ts` — tests next to source.
> 6. Use existing libraries, do not add new ones without necessity.
> 7. No feature flags or backwards-compat shims — if changing, change directly.
> 8. After completing a step, mark its status as "Done" in the heading.
> 9. Before starting a new step, check that the previous step is marked as "Done".

**Prompt:**

```
Create an ESLint configuration for a TypeScript project.

Requirements:
1. File eslint.config.js (flat config format)
2. Use @typescript-eslint/parser and @typescript-eslint/eslint-plugin
3. Rules: no-unused-vars (error), no-undef (error), prefer-const (error)
4. Exclusions: node_modules, dist, coverage
5. After creation, run npm run lint and ensure there are no errors
```

---

## Step 3 — Backend directory structure

**Status: Done** ✅

> **General rules (apply to EVERY step):**
> 1. Code language — TypeScript.
> 2. Do not add comments to code, except JSDoc where necessary.
> 3. Do not commit automatically — wait for confirmation.
> 4. After each step, run `npm run typecheck`, `npm run lint`, `npm run test`. All three must pass.
> 5. File structure: `src/` — source files, `src/**/*.test.ts` — tests next to source.
> 6. Use existing libraries, do not add new ones without necessity.
> 7. No feature flags or backwards-compat shims — if changing, change directly.
> 8. After completing a step, mark its status as "Done" in the heading.
> 9. Before starting a new step, check that the previous step is marked as "Done".

**Prompt:**

```
Create the directory structure for the backend part of the project.

Structure:
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

Create empty files (with default exports where appropriate) and an index file src/index.ts that exports everything from agents/, tools/, storage/.
```

---

## Step 4 — Application configuration (config.ts)

**Status: Done** ✅

> **General rules (apply to EVERY step):**
> 1. Code language — TypeScript.
> 2. Do not add comments to code, except JSDoc where necessary.
> 3. Do not commit automatically — wait for confirmation.
> 4. After each step, run `npm run typecheck`, `npm run lint`, `npm run test`. All three must pass.
> 5. File structure: `src/` — source files, `src/**/*.test.ts` — tests next to source.
> 6. Use existing libraries, do not add new ones without necessity.
> 7. No feature flags or backwards-compat shims — if changing, change directly.
> 8. After completing a step, mark its status as "Done" in the heading.
> 9. Before starting a new step, check that the previous step is marked as "Done".

**Prompt:**

```
Create a file src/config.ts with application configuration.

Requirements:
1. Read environment variables via process.env
2. Export a config object:
   - openrouterApiKey: string (required)
   - redisUrl: string (default "redis://localhost:6379")
   - port: number (default 3001)
   - nodeEnv: "development" | "production" (default "development")
3. Validation: if openrouterApiKey is not set — throw Error on initialization
4. Create a test src/utils/__tests__/config.test.ts that verifies:
   - config returns default values when env vars are set
   - missing openrouterApiKey throws an error
```

---

## Step 5 — Redis storage (storage layer)

**Status: Done** ✅

> **General rules (apply to EVERY step):**
> 1. Code language — TypeScript.
> 2. Do not add comments to code, except JSDoc where necessary.
> 3. Do not commit automatically — wait for confirmation.
> 4. After each step, run `npm run typecheck`, `npm run lint`, `npm run test`. All three must pass.
> 5. File structure: `src/` — source files, `src/**/*.test.ts` — tests next to source.
> 6. Use existing libraries, do not add new ones without necessity.
> 7. No feature flags or backwards-compat shims — if changing, change directly.
> 8. After completing a step, mark its status as "Done" in the heading.
> 9. Before starting a new step, check that the previous step is marked as "Done".

**Prompt:**

```
Create a Redis-based storage layer.

Files:
1. src/storage/redis.ts — Redis client:
   - Use the ioredis library
   - Export function createRedisClient(url: string) → Redis
   - Export function closeRedisClient(client: Redis) → Promise<void>

2. src/storage/session-store.ts — session storage:
   - Type SessionData: { id: string, jobProfile: JobProfile | null, history: InterviewMessage[], weakSkills: string[], createdAt: string, updatedAt: string }
   - Type JobProfile: { role: string, level: string, skills: string[], keywords: string[], domain: string }
   - Type InterviewMessage: { role: "user" | "assistant", content: string, timestamp: string }
   - Functions:
     - createSession(client: Redis) → Promise<SessionData> (creates with uuid, TTL 24 hours)
     - getSession(client: Redis, id: string) → Promise<SessionData | null>
     - updateSession(client: Redis, id: string, data: Partial<SessionData>) → Promise<void>
     - deleteSession(client: Redis, id: string) → Promise<void>

3. Tests src/storage/__tests__/session-store.test.ts:
   - mock ioredis
   - test createSession — creates a record with id and timestamps
   - test getSession — returns null for non-existing id
   - test updateSession — updates only the provided fields
   - test deleteSession — calls del

Add ioredis to dependencies.
```

---

## Step 6 — Utilities (sanitize, validators)

**Status: Done** ✅

> **General rules (apply to EVERY step):**
> 1. Code language — TypeScript.
> 2. Do not add comments to code, except JSDoc where necessary.
> 3. Do not commit automatically — wait for confirmation.
> 4. After each step, run `npm run typecheck`, `npm run lint`, `npm run test`. All three must pass.
> 5. File structure: `src/` — source files, `src/**/*.test.ts` — tests next to source.
> 6. Use existing libraries, do not add new ones without necessity.
> 7. No feature flags or backwards-compat shims — if changing, change directly.
> 8. After completing a step, mark its status as "Done" in the heading.
> 9. Before starting a new step, check that the previous step is marked as "Done".

**Prompt:**

```
Create utilities for validation and sanitization.

Files:
1. src/utils/sanitize.ts:
   - sanitizeInput(text: string) → string — removes HTML tags, limits length to 10000 characters, escapes special characters
   - sanitizeJobText(text: string) → string — same, but with a limit of 50000 characters

2. src/utils/validators.ts:
   - isValidSessionId(id: string) → boolean — UUID v4 format
   - isValidJobText(text: string) → boolean — non-empty string, minimum 50 characters
   - isValidAnswer(text: string) → boolean — non-empty string, minimum 10 characters

3. Tests src/utils/__tests__/sanitize.test.ts and src/utils/__tests__/validators.test.ts:
   - sanitizeInput: removes <script>, limits length, escapes
   - sanitizeJobText: limit 50000
   - isValidSessionId: valid UUID → true, invalid → false
   - isValidJobText: empty → false, < 50 characters → false, correct → true
   - isValidAnswer: empty → false, < 10 characters → false, correct → true
```

---

## Step 7 — Agent types (agents/types.ts)

**Status: Done** ✅

> **General rules (apply to EVERY step):**
> 1. Code language — TypeScript.
> 2. Do not add comments to code, except JSDoc where necessary.
> 3. Do not commit automatically — wait for confirmation.
> 4. After each step, run `npm run typecheck`, `npm run lint`, `npm run test`. All three must pass.
> 5. File structure: `src/` — source files, `src/**/*.test.ts` — tests next to source.
> 6. Use existing libraries, do not add new ones without necessity.
> 7. No feature flags or backwards-compat shims — if changing, change directly.
> 8. After completing a step, mark its status as "Done" in the heading.
> 9. Before starting a new step, check that the previous step is marked as "Done".

**Prompt:**

```
Create a file src/agents/types.ts with common types for the agent system.

Types:
1. AgentName: "job-parser" | "interviewer" | "evaluator" | "coach" | "memory"
2. AgentInput: { sessionId: string, content: string, context?: Record<string, unknown> }
3. AgentOutput: { agentName: AgentName, result: string, metadata?: Record<string, unknown> }
4. ParsedJob: { role: string, level: "junior" | "middle" | "senior", skills: string[], keywords: string[], domain: string }
5. EvaluationResult: { score: number, strengths: string[], weaknesses: string[], recommendation: string }
6. QuestionResult: { question: string, topic: string, difficulty: "easy" | "medium" | "hard" }
7. CoachResult: { explanation: string, improvedAnswer: string, tips: string[] }
8. MemoryUpdate: { weakSkills: string[], answeredTopics: string[] }
9. InterviewState: { sessionId: string, currentQuestion: QuestionResult | null, questionCount: number, scores: number[] }

Create a test src/agents/__tests__/types.test.ts that simply imports all types and verifies that the file compiles (smoke test).
```

---

## Step 8 — Tool parseJobDescriptionTool

**Status: Done** ✅

> **General rules (apply to EVERY step):**
> 1. Code language — TypeScript.
> 2. Do not add comments to code, except JSDoc where necessary.
> 3. Do not commit automatically — wait for confirmation.
> 4. After each step, run `npm run typecheck`, `npm run lint`, `npm run test`. All three must pass.
> 5. File structure: `src/` — source files, `src/**/*.test.ts` — tests next to source.
> 6. Use existing libraries, do not add new ones without necessity.
> 7. No feature flags or backwards-compat shims — if changing, change directly.
> 8. After completing a step, mark its status as "Done" in the heading.
> 9. Before starting a new step, check that the previous step is marked as "Done".

**Prompt:**

```
Create the parseJobDescriptionTool.

File: src/tools/parse-job-description.tool.ts

Requirements:
1. Export function parseJobDescriptionTool(text: string, config: { apiKey: string }) → Promise<ParsedJob>
2. The function sends a prompt to the LLM via OpenRouter API (fetch to https://openrouter.ai/api/v1/chat/completions)
3. Prompt: "Analyze this job description and extract: role, level (junior/middle/senior), skills array, keywords array, domain. Return ONLY valid JSON matching this schema: { role: string, level: string, skills: string[], keywords: string[], domain: string }"
4. Validate the response via JSON.parse and check for required fields
5. Use model "deepseek/deepseek-chat"
6. Handle errors: invalid JSON → throw with message, HTTP errors → throw with message

Test: src/tools/__tests__/parse-job-description.tool.test.ts
- mock fetch
- test successful parsing — returns ParsedJob
- test invalid JSON from LLM — throws error
- test HTTP error — throws error
```

---

## Step 9 — Tool generateQuestionTool

**Status: Done** ✅

> **General rules (apply to EVERY step):**
> 1. Code language — TypeScript.
> 2. Do not add comments to code, except JSDoc where necessary.
> 3. Do not commit automatically — wait for confirmation.
> 4. After each step, run `npm run typecheck`, `npm run lint`, `npm run test`. All three must pass.
> 5. File structure: `src/` — source files, `src/**/*.test.ts` — tests next to source.
> 6. Use existing libraries, do not add new ones without necessity.
> 7. No feature flags or backwards-compat shims — if changing, change directly.
> 8. After completing a step, mark its status as "Done" in the heading.
> 9. Before starting a new step, check that the previous step is marked as "Done".

**Prompt:**

```
Create the generateQuestionTool.

File: src/tools/generate-question.tool.ts

Requirements:
1. Export function generateQuestionTool(params: { jobProfile: ParsedJob, weakSkills: string[], previousQuestions: string[], config: { apiKey: string } }) → Promise<QuestionResult>
2. Sends a prompt to the LLM via OpenRouter (deepseek/deepseek-chat)
3. Prompt: "Generate an interview question for {role} position ({level} level). Required skills: {skills}. Weak areas to focus on: {weakSkills}. Avoid repeating: {previousQuestions}. Return JSON: { question: string, topic: string, difficulty: easy|medium|hard }"
4. Adapt difficulty based on weakSkills (if there are weak skills on the topic → medium/hard)
5. Validate the response

Test: src/tools/__tests__/generate-question.tool.test.ts
- mock fetch
- test question generation — returns QuestionResult
- test with empty weakSkills — generates easy/medium question
```

---

## Step 10 — Tool evaluateAnswerTool

**Status: Done** ✅

> **General rules (apply to EVERY step):**
> 1. Code language — TypeScript.
> 2. Do not add comments to code, except JSDoc where necessary.
> 3. Do not commit automatically — wait for confirmation.
> 4. After each step, run `npm run typecheck`, `npm run lint`, `npm run test`. All three must pass.
> 5. File structure: `src/` — source files, `src/**/*.test.ts` — tests next to source.
> 6. Use existing libraries, do not add new ones without necessity.
> 7. No feature flags or backwards-compat shims — if changing, change directly.
> 8. After completing a step, mark its status as "Done" in the heading.
> 9. Before starting a new step, check that the previous step is marked as "Done".

**Prompt:**

```
Create the evaluateAnswerTool.

File: src/tools/evaluate-answer.tool.ts

Requirements:
1. Export function evaluateAnswerTool(params: { question: string, answer: string, jobProfile: ParsedJob, config: { apiKey: string } }) → Promise<EvaluationResult>
2. Sends a prompt to the LLM via OpenRouter (deepseek/deepseek-chat)
3. Prompt: "Evaluate this interview answer for {role} ({level}) position. Question: {question}. Answer: {answer}. Required skills: {skills}. Score 1-10, list strengths, weaknesses, give recommendation. Return JSON: { score: number, strengths: string[], weaknesses: string[], recommendation: string }"
4. Validate score in range 1-10

Test: src/tools/__tests__/evaluate-answer.tool.test.ts
- mock fetch
- test evaluation — returns EvaluationResult with score 1-10
- test invalid score — corrected to valid range
```

---

## Step 11 — Tool updateMemoryTool

**Status: Done** ✅

> **General rules (apply to EVERY step):**
> 1. Code language — TypeScript.
> 2. Do not add comments to code, except JSDoc where necessary.
> 3. Do not commit automatically — wait for confirmation.
> 4. After each step, run `npm run typecheck`, `npm run lint`, `npm run test`. All three must pass.
> 5. File structure: `src/` — source files, `src/**/*.test.ts` — tests next to source.
> 6. Use existing libraries, do not add new ones without necessity.
> 7. No feature flags or backwards-compat shims — if changing, change directly.
> 8. After completing a step, mark its status as "Done" in the heading.
> 9. Before starting a new step, check that the previous step is marked as "Done".

**Prompt:**

```
Create the updateMemoryTool.

File: src/tools/update-memory.tool.ts

Requirements:
1. Export function updateMemoryTool(params: { sessionId: string, evaluation: EvaluationResult, questionTopic: string, redis: Redis }) → Promise<MemoryUpdate>
2. Logic:
   - If score < 5 → add topic to weakSkills
   - If score >= 7 → remove topic from weakSkills (if present)
   - Always add questionTopic to answeredTopics
3. Update the session in Redis via session-store
4. Return MemoryUpdate

Test: src/tools/__tests__/update-memory.tool.test.ts
- mock Redis and session-store
- test score < 5 — topic is added to weakSkills
- test score >= 7 — topic is removed from weakSkills
- test score 5-6 — weakSkills remain unchanged
```

---

## Step 12 — Tool fetchWeakTopicsTool

**Status: Done** ✅

> **General rules (apply to EVERY step):**
> 1. Code language — TypeScript.
> 2. Do not add comments to code, except JSDoc where necessary.
> 3. Do not commit automatically — wait for confirmation.
> 4. After each step, run `npm run typecheck`, `npm run lint`, `npm run test`. All three must pass.
> 5. File structure: `src/` — source files, `src/**/*.test.ts` — tests next to source.
> 6. Use existing libraries, do not add new ones without necessity.
> 7. No feature flags or backwards-compat shims — if changing, change directly.
> 8. After completing a step, mark its status as "Done" in the heading.
> 9. Before starting a new step, check that the previous step is marked as "Done".

**Prompt:**

```
Create the fetchWeakTopicsTool.

File: src/tools/fetch-weak-topics.tool.ts

Requirements:
1. Export function fetchWeakTopicsTool(params: { sessionId: string, redis: Redis }) → Promise<string[]>
2. Get the session from Redis and return weakSkills
3. If session is not found — return an empty array

Test: src/tools/__tests__/fetch-weak-topics.tool.test.ts
- mock Redis
- test has weakSkills — returns array
- test no session — returns []
- test weakSkills is empty — returns []
```

---

## Step 13 — Agent JobParserAgent

**Status: Done** ✅

> **General rules (apply to EVERY step):**
> 1. Code language — TypeScript.
> 2. Do not add comments to code, except JSDoc where necessary.
> 3. Do not commit automatically — wait for confirmation.
> 4. After each step, run `npm run typecheck`, `npm run lint`, `npm run test`. All three must pass.
> 5. File structure: `src/` — source files, `src/**/*.test.ts` — tests next to source.
> 6. Use existing libraries, do not add new ones without necessity.
> 7. No feature flags or backwards-compat shims — if changing, change directly.
> 8. After completing a step, mark its status as "Done" in the heading.
> 9. Before starting a new step, check that the previous step is marked as "Done".

**Prompt:**

```
Create the JobParserAgent.

File: src/agents/job-parser.agent.ts

Requirements:
1. Export function jobParserAgent(input: AgentInput, config: { apiKey: string }) → Promise<AgentOutput>
2. Use parseJobDescriptionTool to parse job description text
3. Return AgentOutput with agentName "job-parser" and result — JSON string of ParsedJob
4. Validate input text via sanitizeJobText and isValidJobText

Test: src/agents/__tests__/job-parser.agent.test.ts
- mock parseJobDescriptionTool
- test correct input — returns AgentOutput with parsed job
- test empty text — throws validation error
```

---

## Step 14 — Agent InterviewerAgent

**Status: Done** ✅

> **General rules (apply to EVERY step):**
> 1. Code language — TypeScript.
> 2. Do not add comments to code, except JSDoc where necessary.
> 3. Do not commit automatically — wait for confirmation.
> 4. After each step, run `npm run typecheck`, `npm run lint`, `npm run test`. All three must pass.
> 5. File structure: `src/` — source files, `src/**/*.test.ts` — tests next to source.
> 6. Use existing libraries, do not add new ones without necessity.
> 7. No feature flags or backwards-compat shims — if changing, change directly.
> 8. After completing a step, mark its status as "Done" in the heading.
> 9. Before starting a new step, check that the previous step is marked as "Done".

**Prompt:**

```
Create the InterviewerAgent.

File: src/agents/interviewer.agent.ts

Requirements:
1. Export function interviewerAgent(params: { input: AgentInput, jobProfile: ParsedJob, weakSkills: string[], previousQuestions: string[], config: { apiKey: string } }) → Promise<AgentOutput>
2. Use generateQuestionTool to generate a question
3. Return AgentOutput with agentName "interviewer" and result — JSON string of QuestionResult

Test: src/agents/__tests__/interviewer.agent.test.ts
- mock generateQuestionTool
- test question generation — returns AgentOutput with QuestionResult
```

---

## Step 15 — Agent EvaluatorAgent

**Status: Done** ✅

> **General rules (apply to EVERY step):**
> 1. Code language — TypeScript.
> 2. Do not add comments to code, except JSDoc where necessary.
> 3. Do not commit automatically — wait for confirmation.
> 4. After each step, run `npm run typecheck`, `npm run lint`, `npm run test`. All three must pass.
> 5. File structure: `src/` — source files, `src/**/*.test.ts` — tests next to source.
> 6. Use existing libraries, do not add new ones without necessity.
> 7. No feature flags or backwards-compat shims — if changing, change directly.
> 8. After completing a step, mark its status as "Done" in the heading.
> 9. Before starting a new step, check that the previous step is marked as "Done".

**Prompt:**

```
Create the EvaluatorAgent.

File: src/agents/evaluator.agent.ts

Requirements:
1. Export function evaluatorAgent(params: { question: string, answer: string, jobProfile: ParsedJob, config: { apiKey: string } }) → Promise<AgentOutput>
2. Use evaluateAnswerTool to evaluate the answer
3. Return AgentOutput with agentName "evaluator" and result — JSON string of EvaluationResult

Test: src/agents/__tests__/evaluator.agent.test.ts
- mock evaluateAnswerTool
- test evaluation — returns AgentOutput with EvaluationResult
```

---

## Step 16 — Agent CoachAgent

**Status: Done** ✅

> **General rules (apply to EVERY step):**
> 1. Code language — TypeScript.
> 2. Do not add comments to code, except JSDoc where necessary.
> 3. Do not commit automatically — wait for confirmation.
> 4. After each step, run `npm run typecheck`, `npm run lint`, `npm run test`. All three must pass.
> 5. File structure: `src/` — source files, `src/**/*.test.ts` — tests next to source.
> 6. Use existing libraries, do not add new ones without necessity.
> 7. No feature flags or backwards-compat shims — if changing, change directly.
> 8. After completing a step, mark its status as "Done" in the heading.
> 9. Before starting a new step, check that the previous step is marked as "Done".

**Prompt:**

```
Create the CoachAgent.

File: src/agents/coach.agent.ts

Requirements:
1. Export function coachAgent(params: { question: string, answer: string, evaluation: EvaluationResult, jobProfile: ParsedJob, config: { apiKey: string } }) → Promise<AgentOutput>
2. Sends a prompt to the LLM via OpenRouter
3. Prompt: "You are an interview coach. For {role} ({level}) position. Question was: {question}. Candidate answered: {answer}. Score: {score}/10. Strengths: {strengths}. Weaknesses: {weaknesses}. Provide: explanation of correct answer, improved version of candidate's answer, 3 practical tips. Return JSON: { explanation: string, improvedAnswer: string, tips: string[] }"
4. Return AgentOutput with agentName "coach" and result — JSON string of CoachResult

Test: src/agents/__tests__/coach.agent.test.ts
- mock fetch
- test feedback generation — returns AgentOutput with CoachResult
```

---

## Step 17 — Agent MemoryAgent

**Status: Done** ✅

> **General rules (apply to EVERY step):**
> 1. Code language — TypeScript.
> 2. Do not add comments to code, except JSDoc where necessary.
> 3. Do not commit automatically — wait for confirmation.
> 4. After each step, run `npm run typecheck`, `npm run lint`, `npm run test`. All three must pass.
> 5. File structure: `src/` — source files, `src/**/*.test.ts` — tests next to source.
> 6. Use existing libraries, do not add new ones without necessity.
> 7. No feature flags or backwards-compat shims — if changing, change directly.
> 8. After completing a step, mark its status as "Done" in the heading.
> 9. Before starting a new step, check that the previous step is marked as "Done".

**Prompt:**

```
Create the MemoryAgent.

File: src/agents/memory.agent.ts

Requirements:
1. Export function memoryAgent(params: { sessionId: string, evaluation: EvaluationResult, questionTopic: string, redis: Redis }) → Promise<AgentOutput>
2. Use updateMemoryTool and fetchWeakTopicsTool
3. Call updateMemoryTool to update memory based on evaluation
4. Get current weakSkills via fetchWeakTopicsTool
5. Return AgentOutput with agentName "memory" and result — JSON string of MemoryUpdate

Test: src/agents/__tests__/memory.agent.test.ts
- mock updateMemoryTool and fetchWeakTopicsTool
- test update — returns AgentOutput with MemoryUpdate
```

---

## Step 18 — Orchestrator (orchestrator.ts)

**Status: Done** ✅

> **General rules (apply to EVERY step):**
> 1. Code language — TypeScript.
> 2. Do not add comments to code, except JSDoc where necessary.
> 3. Do not commit automatically — wait for confirmation.
> 4. After each step, run `npm run typecheck`, `npm run lint`, `npm run test`. All three must pass.
> 5. File structure: `src/` — source files, `src/**/*.test.ts` — tests next to source.
> 6. Use existing libraries, do not add new ones without necessity.
> 7. No feature flags or backwards-compat shims — if changing, change directly.
> 8. After completing a step, mark its status as "Done" in the heading.
> 9. Before starting a new step, check that the previous step is marked as "Done".

**Prompt:**

```
Create the agent system orchestrator.

File: src/agents/orchestrator.ts

Requirements:
1. Export function parseJob(text: string, sessionId: string, redis: Redis, config: { apiKey: string }) → Promise<ParsedJob>
   - Calls jobParserAgent, saves jobProfile to session

2. Export function startInterview(sessionId: string, redis: Redis, config: { apiKey: string }) → Promise<QuestionResult>
   - Gets session, calls interviewerAgent with weakSkills, saves question to session

3. Export function processAnswer(sessionId: string, answer: string, redis: Redis, config: { apiKey: string }) → Promise<{ evaluation: EvaluationResult, coach: CoachResult, memory: MemoryUpdate, nextQuestion: QuestionResult }>
   - Sequentially calls: evaluatorAgent → coachAgent → memoryAgent → interviewerAgent (next question)
   - Saves answer and results to session

4. Each agent call must catch errors and rethrow with context (which agent failed)

Test: src/agents/__tests__/orchestrator.test.ts
- mock all agents
- test parseJob — calls jobParserAgent and saves to session
- test startInterview — calls interviewerAgent with weakSkills from session
- test processAnswer — calls agent chain and returns result
```

---

## Step 19 — Fastify server and basic middleware

**Status: Done** ✅

> **General rules (apply to EVERY step):**
> 1. Code language — TypeScript.
> 2. Do not add comments to code, except JSDoc where necessary.
> 3. Do not commit automatically — wait for confirmation.
> 4. After each step, run `npm run typecheck`, `npm run lint`, `npm run test`. All three must pass.
> 5. File structure: `src/` — source files, `src/**/*.test.ts` — tests next to source.
> 6. Use existing libraries, do not add new ones without necessity.
> 7. No feature flags or backwards-compat shims — if changing, change directly.
> 8. After completing a step, mark its status as "Done" in the heading.
> 9. Before starting a new step, check that the previous step is marked as "Done".

**Prompt:**

```
Create a Fastify server with basic middleware.

File: src/api/server.ts

Requirements:
1. Use fastify with @fastify/cors
2. Port from config.port
3. CORS: allow origin from CORS_ORIGIN env (default http://localhost:3000)
4. Request logging via @fastify/helmet for security
5. Graceful shutdown: on SIGTERM/SIGINT close Redis and server
6. Export server for tests

Additional dependencies: fastify, @fastify/cors, @fastify/helmet

Test: src/api/__tests__/server.test.ts
- test server starts and responds to GET /health → 200 { status: "ok" }
- test CORS headers are present
```

---

## Step 20 — API route POST /job/parse

**Status: Done** ✅

> **General rules (apply to EVERY step):**
> 1. Code language — TypeScript.
> 2. Do not add comments to code, except JSDoc where necessary.
> 3. Do not commit automatically — wait for confirmation.
> 4. After each step, run `npm run typecheck`, `npm run lint`, `npm run test`. All three must pass.
> 5. File structure: `src/` — source files, `src/**/*.test.ts` — tests next to source.
> 6. Use existing libraries, do not add new ones without necessity.
> 7. No feature flags or backwards-compat shims — if changing, change directly.
> 8. After completing a step, mark its status as "Done" in the heading.
> 9. Before starting a new step, check that the previous step is marked as "Done".

**Prompt:**

```
Create the API route for job parsing.

File: src/api/routes/job.ts

Requirements:
1. POST /job/parse — accepts { text: string }
2. Validation: text is required, minimum 50 characters (isValidJobText)
3. Sanitization: sanitizeJobText(text)
4. Creates a new session via createSession
5. Calls parseJob from the orchestrator
6. Returns: { sessionId: string, jobProfile: ParsedJob }
7. Errors: 400 for invalid input, 500 for internal errors

Test: src/api/__tests__/job.test.ts
- mock orchestrator and Redis
- test successful parsing — 200 with sessionId and jobProfile
- test empty text — 400
- test short text — 400
```

---

## Step 21 — API route POST /interview/start

**Status: Done** ✅

> **General rules (apply to EVERY step):**
> 1. Code language — TypeScript.
> 2. Do not add comments to code, except JSDoc where necessary.
> 3. Do not commit automatically — wait for confirmation.
> 4. After each step, run `npm run typecheck`, `npm run lint`, `npm run test`. All three must pass.
> 5. File structure: `src/` — source files, `src/**/*.test.ts` — tests next to source.
> 6. Use existing libraries, do not add new ones without necessity.
> 7. No feature flags or backwards-compat shims — if changing, change directly.
> 8. After completing a step, mark its status as "Done" in the heading.
> 9. Before starting a new step, check that the previous step is marked as "Done".

**Prompt:**

```
Create the API route for starting an interview.

File: src/api/routes/interview.ts

Requirements:
1. POST /interview/start — accepts { sessionId: string }
2. Validation: sessionId is required, must be a valid UUID
3. Check that the session exists
4. Calls startInterview from the orchestrator
5. Returns: { question: QuestionResult }
6. Errors: 404 if session not found, 400 if sessionId is invalid

Test: src/api/__tests__/interview.test.ts
- mock orchestrator and Redis
- test successful start — 200 with question
- test non-existing session — 404
- test invalid UUID — 400
```

---

## Step 22 — API route POST /interview/answer

**Status: Done** ✅

> **General rules (apply to EVERY step):**
> 1. Code language — TypeScript.
> 2. Do not add comments to code, except JSDoc where necessary.
> 3. Do not commit automatically — wait for confirmation.
> 4. After each step, run `npm run typecheck`, `npm run lint`, `npm run test`. All three must pass.
> 5. File structure: `src/` — source files, `src/**/*.test.ts` — tests next to source.
> 6. Use existing libraries, do not add new ones without necessity.
> 7. No feature flags or backwards-compat shims — if changing, change directly.
> 8. After completing a step, mark its status as "Done" in the heading.
> 9. Before starting a new step, check that the previous step is marked as "Done".

**Prompt:**

```
Create the API route for submitting an answer.

File: src/api/routes/interview.ts (add to existing)

Requirements:
1. POST /interview/answer — accepts { sessionId: string, answer: string }
2. Validation: sessionId (UUID), answer (isValidAnswer, minimum 10 characters)
3. Sanitization: sanitizeInput(answer)
4. Check that the session exists
5. Calls processAnswer from the orchestrator
6. Returns: { evaluation: EvaluationResult, coach: CoachResult, memory: MemoryUpdate, nextQuestion: QuestionResult }
7. Errors: 400 for invalid input, 404 if session not found

Test: src/api/__tests__/interview.test.ts (add tests)
- mock orchestrator and Redis
- test successful answer — 200 with full result
- test empty answer — 400
- test short answer — 400
```

---

## Step 23 — API route GET /session/:id

**Status: Done** ✅

> **General rules (apply to EVERY step):**
> 1. Code language — TypeScript.
> 2. Do not add comments to code, except JSDoc where necessary.
> 3. Do not commit automatically — wait for confirmation.
> 4. After each step, run `npm run typecheck`, `npm run lint`, `npm run test`. All three must pass.
> 5. File structure: `src/` — source files, `src/**/*.test.ts` — tests next to source.
> 6. Use existing libraries, do not add new ones without necessity.
> 7. No feature flags or backwards-compat shims — if changing, change directly.
> 8. After completing a step, mark its status as "Done" in the heading.
> 9. Before starting a new step, check that the previous step is marked as "Done".

**Prompt:**

```
Create the API route for getting a session.

File: src/api/routes/session.ts

Requirements:
1. GET /session/:id — returns session data
2. Validation: id is required, must be a valid UUID
3. Check that the session exists
4. Returns: { id, jobProfile, history, weakSkills, createdAt, updatedAt }
5. Errors: 404 if session not found, 400 if id is invalid

Test: src/api/__tests__/session.test.ts
- mock Redis and session-store
- test existing session — 200 with data
- test non-existing session — 404
- test invalid UUID — 400
```

---

## Step 24 — Route registration in server

**Status: Done** ✅

> **General rules (apply to EVERY step):**
> 1. Code language — TypeScript.
> 2. Do not add comments to code, except JSDoc where necessary.
> 3. Do not commit automatically — wait for confirmation.
> 4. After each step, run `npm run typecheck`, `npm run lint`, `npm run test`. All three must pass.
> 5. File structure: `src/` — source files, `src/**/*.test.ts` — tests next to source.
> 6. Use existing libraries, do not add new ones without necessity.
> 7. No feature flags or backwards-compat shims — if changing, change directly.
> 8. After completing a step, mark its status as "Done" in the heading.
> 9. Before starting a new step, check that the previous step is marked as "Done".

**Prompt:**

```
Register all API routes in the Fastify server.

Update src/api/server.ts:
1. Import routes from routes/job.ts, routes/interview.ts, routes/session.ts
2. Register them via fastify.register
3. Ensure the Redis client is created on startup and passed to context via decorate
4. Add error handler (onError) with logging

Update src/api/routes/*.ts:
1. Each route should get Redis from fastify (via request.server.redis)
2. Config — from process.env (via config.ts)

Test: src/api/__tests__/server.test.ts (add tests)
- test all routes are available
- test POST /job/parse with valid body
- test POST /interview/start with valid body
- test POST /interview/answer with valid body
- test GET /session/:id with valid id
```

---

## Step 25 — Integration test for API

**Status: Done** ✅

> **General rules (apply to EVERY step):**
> 1. Code language — TypeScript.
> 2. Do not add comments to code, except JSDoc where necessary.
> 3. Do not commit automatically — wait for confirmation.
> 4. After each step, run `npm run typecheck`, `npm run lint`, `npm run test`. All three must pass.
> 5. File structure: `src/` — source files, `src/**/*.test.ts` — tests next to source.
> 6. Use existing libraries, do not add new ones without necessity.
> 7. No feature flags or backwards-compat shims — if changing, change directly.
> 8. After completing a step, mark its status as "Done" in the heading.
> 9. Before starting a new step, check that the previous step is marked as "Done".

**Prompt:**

```
Write an integration test for the full API flow.

File: src/api/__tests__/integration.test.ts

Scenario:
1. POST /job/parse with job description text → get sessionId
2. POST /interview/start with sessionId → get first question
3. POST /interview/answer with sessionId and answer → get evaluation, feedback, next question
4. GET /session/:id → verify that the history has been updated

Mock Redis and all LLM calls (fetch). Verify that:
- session ID is a valid UUID
- jobProfile contains role, level, skills
- question contains question, topic, difficulty
- evaluation contains score 1-10
- coach contains explanation, improvedAnswer, tips
- nextQuestion contains question, topic, difficulty
- session history contains records

This test verifies that all components are correctly connected.
```

---

## Step 26 — Final verification and fix

**Status: Done** ✅

> **General rules (apply to EVERY step):**
> 1. Code language — TypeScript.
> 2. Do not add comments to code, except JSDoc where necessary.
> 3. Do not commit automatically — wait for confirmation.
> 4. After each step, run `npm run typecheck`, `npm run lint`, `npm run test`. All three must pass.
> 5. File structure: `src/` — source files, `src/**/*.test.ts` — tests next to source.
> 6. Use existing libraries, do not add new ones without necessity.
> 7. No feature flags or backwards-compat shims — if changing, change directly.
> 8. After completing a step, mark its status as "Done" in the heading.
> 9. Before starting a new step, check that the previous step is marked as "Done".

**Prompt:**

```
Perform a final verification of the project:

1. Run npm run typecheck — fix all type errors
2. Run npm run lint — fix all warnings and errors
3. Run npm run test — ensure all tests pass
4. Verify that all files from the structure (step 3) are created
5. Verify that .env.example contains all required variables
6. Verify that package.json contains all dependencies
7. Create README.md with a brief project description, how to run (npm install, npm run dev:api), and the structure

All three commands (typecheck, lint, test) must pass without errors.
```