# Phase 1 — Prompts for Deployment

---

## Step 1 — Fix Configuration (DEEPSEEK_API_KEY instead of OPENROUTER_API_KEY) ✅ Done

**Status:**

> **General rules (apply to EACH step):**
> 1. Code language — TypeScript.
> 2. Do not add comments to code, except JSDoc where necessary.
> 3. Do not commit automatically — wait for confirmation.
> 4. After each step run `npm run typecheck`, `npm run lint`, `npm run test`. All three must pass.
> 5. File structure: `src/` — source files, `src/**/*.test.ts` — tests next to source.
> 6. Use existing libraries, do not add new ones without necessity.
> 7. No feature flags and backwards-compat shims — if you change, change directly.
> 8. After completing a step, mark its status "Done" in the header.
> 9. Before starting a new step, verify that the previous step is marked as "Done".

**Prompt:**

```
Update the file src/config.ts to work with DeepSeek API instead of OpenRouter.

Current code:
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

Need to change to:
1. Replace OPENROUTER_API_KEY → DEEPSEEK_API_KEY
2. Rename field openrouterApiKey → deepseekApiKey
3. Add field llmBaseUrl: string, default "https://api.deepseek.com"
4. Add field llmModel: string, default "deepseek-chat"
5. Make redisUrl optional: if REDIS_URL is not set — return undefined (not a string)
6. Update .env.example: replace OPENROUTER_API_KEY with DEEPSEEK_API_KEY
7. Update test src/utils/__tests__/config.test.ts:
   - Test that deepseekApiKey is taken from DEEPSEEK_API_KEY
   - Test that llmBaseUrl defaults to "https://api.deepseek.com"
   - Test that llmModel defaults to "deepseek-chat"
   - Test that redisUrl is undefined if REDIS_URL is not set
   - Test that missing DEEPSEEK_API_KEY throws an error


---

## Step 2 — Update parseJobDescriptionTool (DeepSeek API) ✅ Done

**Status:**

> **General rules (apply to EACH step):**
> 1. Code language — TypeScript.
> 2. Do not add comments to code, except JSDoc where necessary.
> 3. Do not commit automatically — wait for confirmation.
> 4. After each step run `npm run typecheck`, `npm run lint`, `npm run test`. All three must pass.
> 5. File structure: `src/` — source files, `src/**/*.test.ts` — tests next to source.
> 6. Use existing libraries, do not add new ones without necessity.
> 7. No feature flags and backwards-compat shims — if you change, change directly.
> 8. After completing a step, mark its status "Done" in the header.
> 9. Before starting a new step, verify that the previous step is marked as "Done".

**Prompt:**

```
Update the file src/tools/parse-job-description.tool.ts to work with DeepSeek API.

The current code calls fetch("https://openrouter.ai/api/v1/chat/completions") with model "deepseek/deepseek-chat".

Need to change:
1. Function signature: parseJobDescriptionTool(text: string, config: { apiKey: string }) → parseJobDescriptionTool(text: string, config: { apiKey: string, baseUrl: string, model: string })
2. URL: "https://openrouter.ai/api/v1/chat/completions" → `${config.baseUrl}/chat/completions`
3. Model: "deepseek/deepseek-chat" → config.model
4. Error header: "OpenRouter API error" → "LLM API error"

Update test src/tools/__tests__/parse-job-description.tool.test.ts:
- Mock fetch on URL containing "api.deepseek.com" (or any baseUrl)
- Pass config: { apiKey: "test", baseUrl: "https://api.deepseek.com", model: "deepseek-chat" }
```

---

## Step 3 — Update generateQuestionTool (DeepSeek API) ✅ Done

**Status:**

> **General rules (apply to EACH step):**
> 1. Code language — TypeScript.
> 2. Do not add comments to code, except JSDoc where necessary.
> 3. Do not commit automatically — wait for confirmation.
> 4. After each step run `npm run typecheck`, `npm run lint`, `npm run test`. All three must pass.
> 5. File structure: `src/` — source files, `src/**/*.test.ts` — tests next to source.
> 6. Use existing libraries, do not add new ones without necessity.
> 7. No feature flags and backwards-compat shims — if you change, change directly.
> 8. After completing a step, mark its status "Done" in the header.
> 9. Before starting a new step, verify that the previous step is marked as "Done".

**Prompt:**

```
Update the file src/tools/generate-question.tool.ts to work with DeepSeek API.

The current code calls fetch("https://openrouter.ai/api/v1/chat/completions") with model "deepseek/deepseek-chat".

Need to change:
1. Function signature: add baseUrl and model to config parameter
   Was: config: { apiKey: string }
   Now: config: { apiKey: string, baseUrl: string, model: string }
2. URL: "https://openrouter.ai/api/v1/chat/completions" → `${config.baseUrl}/chat/completions`
3. Model: "deepseek/deepseek-chat" → config.model
4. Error header: "OpenRouter API error" → "LLM API error"

Update test src/tools/__tests__/generate-question.tool.test.ts:
- Pass config: { apiKey: "test", baseUrl: "https://api.deepseek.com", model: "deepseek-chat" }
```

---

## Step 4 — Update evaluateAnswerTool (DeepSeek API) ✅ Done

**Status:**

> **General rules (apply to EACH step):**
> 1. Code language — TypeScript.
> 2. Do not add comments to code, except JSDoc where necessary.
> 3. Do not commit automatically — wait for confirmation.
> 4. After each step run `npm run typecheck`, `npm run lint`, `npm run test`. All three must pass.
> 5. File structure: `src/` — source files, `src/**/*.test.ts` — tests next to source.
> 6. Use existing libraries, do not add new ones without necessity.
> 7. No feature flags and backwards-compat shims — if you change, change directly.
> 8. After completing a step, mark its status "Done" in the header.
> 9. Before starting a new step, verify that the previous step is marked as "Done".

**Prompt:**

```
Update the file src/tools/evaluate-answer.tool.ts to work with DeepSeek API.

The current code calls fetch("https://openrouter.ai/api/v1/chat/completions") with model "deepseek/deepseek-chat".

Need to change:
1. Function signature: add baseUrl and model to config parameter
   Was: config: { apiKey: string }
   Now: config: { apiKey: string, baseUrl: string, model: string }
2. URL: "https://openrouter.ai/api/v1/chat/completions" → `${config.baseUrl}/chat/completions`
3. Model: "deepseek/deepseek-chat" → config.model
4. Error header: "OpenRouter API error" → "LLM API error"

Update test src/tools/__tests__/evaluate-answer.tool.test.ts:
- Pass config: { apiKey: "test", baseUrl: "https://api.deepseek.com", model: "deepseek-chat" }
```

---

## Step 5 — Update coachAgent (DeepSeek API) ✅ Done

**Status:**

> **General rules (apply to EACH step):**
> 1. Code language — TypeScript.
> 2. Do not add comments to code, except JSDoc where necessary.
> 3. Do not commit automatically — wait for confirmation.
> 4. After each step run `npm run typecheck`, `npm run lint`, `npm run test`. All three must pass.
> 5. File structure: `src/` — source files, `src/**/*.test.ts` — tests next to source.
> 6. Use existing libraries, do not add new ones without necessity.
> 7. No feature flags and backwards-compat shims — if you change, change directly.
> 8. After completing a step, mark its status "Done" in the header.
> 9. Before starting a new step, verify that the previous step is marked as "Done".

**Prompt:**

```
Update the file src/agents/coach.agent.ts to work with DeepSeek API.

The current code calls fetch("https://openrouter.ai/api/v1/chat/completions") with model "deepseek/deepseek-chat".

Need to change:
1. Function signature: add baseUrl and model to config parameter
   Was: config: { apiKey: string }
   Now: config: { apiKey: string, baseUrl: string, model: string }
2. URL: "https://openrouter.ai/api/v1/chat/completions" → `${config.baseUrl}/chat/completions`
3. Model: "deepseek/deepseek-chat" → config.model
4. Error header: "OpenRouter API error" → "LLM API error"

Update test src/agents/__tests__/coach.agent.test.ts:
- Pass config: { apiKey: "test", baseUrl: "https://api.deepseek.com", model: "deepseek-chat" }
```

---

## Step 6 — Update orchestrator (pass config to all agents) ✅ Done

**Status:**

> **General rules (apply to EACH step):**
> 1. Code language — TypeScript.
> 2. Do not add comments to code, except JSDoc where necessary.
> 3. Do not commit automatically — wait for confirmation.
> 4. After each step run `npm run typecheck`, `npm run lint`, `npm run test`. All three must pass.
> 5. File structure: `src/` — source files, `src/**/*.test.ts` — tests next to source.
> 6. Use existing libraries, do not add new ones without necessity.
> 7. No feature flags and backwards-compat shims — if you change, change directly.
> 8. After completing a step, mark its status "Done" in the header.
> 9. Before starting a new step, verify that the previous step is marked as "Done".

**Prompt:**

```
Update the file src/agents/orchestrator.ts to pass the full config (apiKey, baseUrl, model) to all agents.

Currently the orchestrator takes config: { apiKey: string } and passes it to agents.

Need to change:
1. Function signatures parseJob, startInterview, processAnswer:
   Was: config: { apiKey: string }
   Now: config: { apiKey: string, baseUrl: string, model: string }
2. In all agent calls (jobParserAgent, interviewerAgent, evaluatorAgent, coachAgent, memoryAgent) pass the full config
3. Import config from ../config.js and use it when calling orchestrator functions

Update test src/agents/__tests__/orchestrator.test.ts:
- Pass config: { apiKey: "test", baseUrl: "https://api.deepseek.com", model: "deepseek-chat" }
```

---

## Step 7 — Update API routes (pass config from app config) ✅ Done

**Status:**

> **General rules (apply to EACH step):**
> 1. Code language — TypeScript.
> 2. Do not add comments to code, except JSDoc where necessary.
> 3. Do not commit automatically — wait for confirmation.
> 4. After each step run `npm run typecheck`, `npm run lint`, `npm run test`. All three must pass.
> 5. File structure: `src/` — source files, `src/**/*.test.ts` — tests next to source.
> 6. Use existing libraries, do not add new ones without necessity.
> 7. No feature flags and backwards-compat shims — if you change, change directly.
> 8. After completing a step, mark its status "Done" in the header.
> 9. Before starting a new step, verify that the previous step is marked as "Done".

**Prompt:**

```
Update API routes to pass the full config from the application config.

Files: src/api/routes/job.ts, src/api/routes/interview.ts

Currently the routes import config and pass { apiKey: config.openrouterApiKey }.

Need to change:
1. In each route import config from ../../config.js
2. Create object llmConfig: { apiKey: config.deepseekApiKey, baseUrl: config.llmBaseUrl, model: config.llmModel }
3. Pass llmConfig to orchestrator calls (parseJob, startInterview, processAnswer)

Update tests:
- src/api/__tests__/job.test.ts — mocked config should contain deepseekApiKey, llmBaseUrl, llmModel
- src/api/__tests__/interview.test.ts — similarly
```

---

## Step 8 — Make Redis optional (in-memory fallback) ✅ Done

**Status:**

> **General rules (apply to EACH step):**
> 1. Code language — TypeScript.
> 2. Do not add comments to code, except JSDoc where necessary.
> 3. Do not commit automatically — wait for confirmation.
> 4. After each step run `npm run typecheck`, `npm run lint`, `npm run test`. All three must pass.
> 5. File structure: `src/` — source files, `src/**/*.test.ts` — tests next to source.
> 6. Use existing libraries, do not add new ones without necessity.
> 7. No feature flags and backwards-compat shims — if you change, change directly.
> 8. After completing a step, mark its status "Done" in the header.
> 9. Before starting a new step, verify that the previous step is marked as "Done".

**Prompt:**

```
Make Redis optional with in-memory fallback to run on Cloud Run without Memorystore.

1. Update src/storage/redis.ts:
   - Function createRedisClient(url: string | undefined) → Redis | null
   - If url is not set or empty — return null
   - If url is set — create Redis client as before

2. Update src/storage/session-store.ts:
   - Add in-memory storage: Map<string, { data: SessionData, expiresAt: number }>
   - Change function signatures: client: Redis → client: Redis | null
   - createSession: if client=null → save to Map with TTL 24 hours
   - getSession: if client=null → find in Map (check expiresAt)
   - updateSession: if client=null → update in Map
   - deleteSession: if client=null → delete from Map
   - When using Redis — logic as before

3. Update src/api/server.ts:
   - createRedisClient may return null
   - server.decorate("redis", redis) — redis may be null
   - In shutdown: if redis — close, if null — skip

4. Update test src/storage/__tests__/session-store.test.ts:
   - Add tests for in-memory mode (client=null)
   - Test createSession with null client — creates in Map
   - Test getSession with null client — finds in Map
   - Test updateSession with null client — updates in Map
   - Test deleteSession with null client — deletes from Map
```

---

## Step 9 — Add build scripts to package.json ✅ Done

**Status:**

> **General rules (apply to EACH step):**
> 1. Code language — TypeScript.
> 2. Do not add comments to code, except JSDoc where necessary.
> 3. Do not commit automatically — wait for confirmation.
> 4. After each step run `npm run typecheck`, `npm run lint`, `npm run test`. All three must pass.
> 5. File structure: `src/` — source files, `src/**/*.test.ts` — tests next to source.
> 6. Use existing libraries, do not add new ones without necessity.
> 7. No feature flags and backwards-compat shims — if you change, change directly.
> 8. After completing a step, mark its status "Done" in the header.
> 9. Before starting a new step, verify that the previous step is marked as "Done".

**Prompt:**

```
Add build and run scripts to package.json.

Current scripts:
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

Add:
- "build": "tsc" — compile TypeScript to dist/
- "start": "node dist/api/server.js" — run compiled server
- "dev": "tsx watch src/api/server.ts" — alias for dev:api

After making changes, run npm run build and verify that dist/ is created.


---

## Step 10 — Create Dockerfile ✅ Done

**Status:**

> **General rules (apply to EACH step):**
> 1. Code language — TypeScript.
> 2. Do not add comments to code, except JSDoc where necessary.
> 3. Do not commit automatically — wait for confirmation.
> 4. After each step run `npm run typecheck`, `npm run lint`, `npm run test`. All three must pass.
> 5. File structure: `src/` — source files, `src/**/*.test.ts` — tests next to source.
> 6. Use existing libraries, do not add new ones without necessity.
> 7. No feature flags and backwards-compat shims — if you change, change directly.
> 8. After completing a step, mark its status "Done" in the header.
> 9. Before starting a new step, verify that the previous step is marked as "Done".

**Prompt:**

```
Create a Dockerfile for deployment on Google Cloud Run.

File: Dockerfile (in project root)

Multi-stage build:
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

Also create .dockerignore file:
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

## Step 11 — Verify build locally ✅ Done

**Status:**

> **General rules (apply to EACH step):**
> 1. Code language — TypeScript.
> 2. Do not add comments to code, except JSDoc where necessary.
> 3. Do not commit automatically — wait for confirmation.
> 4. After each step run `npm run typecheck`, `npm run lint`, `npm run test`. All three must pass.
> 5. File structure: `src/` — source files, `src/**/*.test.ts` — tests next to source.
> 6. Use existing libraries, do not add new ones without necessity.
> 7. No feature flags and backwards-compat shims — if you change, change directly.
> 8. After completing a step, mark its status "Done" in the header.
> 9. Before starting a new step, verify that the previous step is marked as "Done".

**Prompt:**

```
Verify that the project builds and all checks pass.

Run sequentially:
1. npm run typecheck — should pass without errors
2. npm run lint — should pass without warnings
3. npm run test — all tests should pass
4. npm run build — dist/ folder should be created

If any command fails — fix the errors and retry.

After successful build, verify that the file dist/api/server.js exists.
```

---

## Step 12 — Set up Google Cloud project ✅ Done

**Status:**

> **General rules (apply to EACH step):**
> 1. Code language — TypeScript.
> 2. Do not add comments to code, except JSDoc where necessary.
> 3. Do not commit automatically — wait for confirmation.
> 4. After each step run `npm run typecheck`, `npm run lint`, `npm run test`. All three must pass.
> 5. File structure: `src/` — source files, `src/**/*.test.ts` — tests next to source.
> 6. Use existing libraries, do not add new ones without necessity.
> 7. No feature flags and backwards-compat shims — if you change, change directly.
> 8. After completing a step, mark its status "Done" in the header.
> 9. Before starting a new step, verify that the previous step is marked as "Done".

**Prompt:**

```
Set up Google Cloud project for deployment on Cloud Run.

Run commands:
1. gcloud config set project studious-pager-6k76w
2. gcloud services enable run.googleapis.com
3. gcloud services enable containerregistry.googleapis.com

Verify:
- gcloud config get-value project → studious-pager-6k76w
- gcloud auth list → shows active user
```

---

## Step 13 — Deploy to Cloud Run ✅ Done

**Status:**

> **General rules (apply to EACH step):**
> 1. Code language — TypeScript.
> 2. Do not add comments to code, except JSDoc where necessary.
> 3. Do not commit automatically — wait for confirmation.
> 4. After each step run `npm run typecheck`, `npm run lint`, `npm run test`. All three must pass.
> 5. File structure: `src/` — source files, `src/**/*.test.ts` — tests next to source.
> 6. Use existing libraries, do not add new ones without necessity.
> 7. No feature flags and backwards-compat shims — if you change, change directly.
> 8. After completing a step, mark its status "Done" in the header.
> 9. Before starting a new step, verify that the previous step is marked as "Done".

**Prompt:**

```
Deploy the application to Google Cloud Run.

Run deployment command:
gcloud run deploy interview-sim --source . --platform managed --region us-central1 --allow-unauthenticated --set-env-vars "DEEPSEEK_API_KEY=$DEEPSEEK_API_KEY,GOOGLE_CLOUD_PROJECT=studious-pager-6k76w,PORT=3001"

After deployment:
1. Copy the service URL from the command output
2. Verify that the URL works: curl <URL>/health
3. Expected response: {"status":"ok"}

If deployment fails — read the logs and fix the error.
```

---

## Step 14 — Deployment verification ✅ Done

**Status:**

> **General rules (apply to EACH step):**
> 1. Code language — TypeScript.
> 2. Do not add comments to code, except JSDoc where necessary.
> 3. Do not commit automatically — wait for confirmation.
> 4. After each step run `npm run typecheck`, `npm run lint`, `npm run test`. All three must pass.
> 5. File structure: `src/` — source files, `src/**/*.test.ts` — tests next to source.
> 6. Use existing libraries, do not add new ones without necessity.
> 7. No feature flags and backwards-compat shims — if you change, change directly.
> 8. After completing a step, mark its status "Done" in the header.
> 9. Before starting a new step, verify that the previous step is marked as "Done".

**Prompt:**

```
Verify that the Cloud Run deployment works correctly.

Run checks:
1. curl <CLOUD_RUN_URL>/health → should return {"status":"ok"}
2. Verify that the server responds to POST requests (even with validation error — this is normal, means the server is working)

Save the service URL — it will be needed for the frontend.

Write the URL to file .env.deploy:
CLOUD_RUN_URL=<your URL>
```