# Feature 012 — Integrate Google ADK for Multi-Agent Orchestration

---

> **⚠️ IMPORTANT: LLM remains DeepSeek, NOT Gemini**
>
> Despite using Google ADK for agent orchestration, we continue using **DeepSeek API directly** as the LLM provider. ADK is only the agent framework — it does NOT mean we switch to Gemini.
>
> - Model: `deepseek-chat` (напрямую DeepSeek API, без OpenRouter)
> - Base URL: `https://api.deepseek.com` (configured LLM_BASE_URL)
> - API Key: `DEEPSEEK_API_KEY`
>
> **⚠️ CRITICAL: ADK TypeScript does NOT have built-in support for non-Google models!**
>
> ADK TypeScript SDK supports only:
> - `Gemini` class — Google Gemini models
> - `ApigeeLlm` class — Apigee AI Gateway
> - `BaseLlm` abstract class — for custom implementations
>
> **Unlike ADK Python** (which has `LiteLlm(model="openai/gpt-4o")`), **ADK TypeScript has NO LiteLLM connector**.
>
> **Solution:** We need to create a custom `DeepSeekLlm` class extending `BaseLlm` that implements the DeepSeek API (OpenAI-compatible format).

---

## Step 1 — Install ADK Dependencies

**Status: Done**

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
Install Google ADK TypeScript SDK and related dependencies.

Run:
npm install @google/adk @google/genai

Verify installation:
- Check that node_modules/@google/adk exists
- Check that node_modules/@google/genai exists
- Run npm run typecheck — should still pass

Read docs/spec/features/012-integrate-google-adk.md for reference on ADK APIs:
- LlmAgent, FunctionTool, SequentialAgent, Runner from @google/adk
- z from zod (already installed)
- Type from @google/genai
```

---

## Step 2 — Create Custom DeepSeekLlm Class

**Status: Done**

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
Create a custom DeepSeekLlm class that extends BaseLlm from @google/adk.

Since ADK TypeScript has no built-in support for non-Google models (unlike Python's LiteLLM),
we need to create our own adapter for DeepSeek API (which is OpenAI-compatible).

1. Create file src/adk/models/deepseek-llm.ts:

import { BaseLlm, LlmRequest, LlmResponse, BaseLlmConnection } from "@google/adk";

interface DeepSeekConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
}

export class DeepSeekLlm extends BaseLlm {
  private apiKey: string;
  private baseUrl: string;
  private model: string;

  constructor(config: DeepSeekConfig) {
    super({ model: config.model });
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl;
    this.model = config.model;
  }

  async generateContentAsync(
    llmRequest: LlmRequest,
    stream?: boolean
  ): AsyncGenerator<LlmResponse, void> {
    // Implement DeepSeek API call (OpenAI-compatible format)
    // POST to ${this.baseUrl}/chat/completions
    // Convert LlmRequest to OpenAI format
    // Convert OpenAI response to LlmResponse
    // Yield the response
  }

  async connect(llmRequest: LlmRequest): Promise<BaseLlmConnection> {
    // Implement live connection if needed, or throw "not supported"
    throw new Error("Live connection not supported for DeepSeek");
  }
}

2. The class should:
   - Extend BaseLlm from @google/adk
   - Implement generateContentAsync() method
   - Make HTTP requests to DeepSeek API (OpenAI-compatible format)
   - Convert between ADK LlmRequest/LlmResponse and OpenAI format
   - Support both streaming and non-streaming responses

3. Read the BaseLlm API reference:
   - https://adk.dev/api-reference/typescript/classes/BaseLlm.html
   - Methods to implement: generateContentAsync, connect

4. Create test src/adk/models/__tests__/deepseek-llm.test.ts:
   - Test that DeepSeekLlm extends BaseLlm
   - Test that it makes correct API calls to DeepSeek
   - Test response conversion from OpenAI format to LlmResponse

Run npm run typecheck, npm run lint, npm run test after implementation.
```

---

## Step 3 — Create ADK Tool: parseJobDescription

**Status: Done**

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
Create ADK FunctionTool for job description parsing.

1. Create directory: src/adk/tools/

2. Create file src/adk/tools/parse-job.tool.ts:

import { FunctionTool } from "@google/adk";
import { z } from "zod";

const parseJobParams = z.object({
  jobText: z.string().describe("The job description text to parse"),
});

async function executeParseJob(params: z.infer<typeof parseJobParams>) {
  // Import and use existing parseJobDescriptionTool logic from src/tools/parse-job-description.tool.ts
  // But wrap it for ADK: take config from environment or closure
  // Keep the same LLM call logic (fetch to baseUrl/chat/completions)
  // Return the parsed job profile as object (not string)
  return parsedJobProfile;
}

export const parseJobTool = new FunctionTool({
  name: "parseJobDescription",
  description: "Extracts structured job profile from a job description text. Returns role, level, skills, softSkills, keywords, domain, language, minYearsExperience.",
  parameters: parseJobParams,
  execute: executeParseJob,
});

3. The tool should:
   - Accept { jobText: string } as parameters
   - Use the same LLM call logic as src/tools/parse-job-description.tool.ts
   - Read API config (apiKey, baseUrl, model) from process.env or a config module
   - Return a structured object with: role, level, skills, softSkills, keywords, domain, language, minYearsExperience
   - Include the same JSON parsing and validation logic

4. Create test src/adk/tools/__tests__/parse-job.tool.test.ts:
   - Test that parseJobTool is a FunctionTool instance
   - Test that execute function calls LLM API with correct parameters
   - Test error handling for invalid JSON response
   - Test validation of required fields

Run npm run typecheck, npm run lint, npm run test after implementation.
```

---

## Step 4 — Create ADK Tool: generateQuestion

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
Create ADK FunctionTool for question generation.

1. Create file src/adk/tools/generate-question.tool.ts:

import { FunctionTool } from "@google/adk";
import { z } from "zod";

const generateQuestionParams = z.object({
  jobProfile: z.object({
    role: z.string(),
    level: z.enum(["junior", "middle", "senior"]),
    skills: z.array(z.string()),
    softSkills: z.array(z.string()),
    keywords: z.array(z.string()),
    domain: z.string(),
    language: z.string(),
    minYearsExperience: z.number().nullable(),
  }).describe("The parsed job profile"),
  weakSkills: z.array(z.string()).describe("Skills the user is weak in"),
  previousQuestions: z.array(z.string()).describe("Questions already asked"),
});

async function executeGenerateQuestion(params: z.infer<typeof generateQuestionParams>) {
  // Import and use existing generateQuestionTool logic from src/tools/generate-question.tool.ts
  // Wrap for ADK: take config from environment
  // Return question, topic, difficulty, questionType, expectedAnswerCriteria as object
  return questionResult;
}

export const generateQuestionTool = new FunctionTool({
  name: "generateQuestion",
  description: "Generates an interview question based on job profile, weak skills, and previous questions",
  parameters: generateQuestionParams,
  execute: executeGenerateQuestion,
});

2. The tool should:
   - Accept jobProfile, weakSkills, previousQuestions as parameters
   - Use the same LLM call logic as src/tools/generate-question.tool.ts
   - Return { question, topic, difficulty, questionType, expectedAnswerCriteria }

3. Create test src/adk/tools/__tests__/generate-question.tool.test.ts

Run npm run typecheck, npm run lint, npm run test after implementation.
```

---

## Step 5 — Create ADK Tool: evaluateAnswer

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
Create ADK FunctionTool for answer evaluation.

1. Create file src/adk/tools/evaluate-answer.tool.ts:

import { FunctionTool } from "@google/adk";
import { z } from "zod";

const evaluateAnswerParams = z.object({
  question: z.string().describe("The interview question"),
  answer: z.string().describe("The user's answer"),
  jobProfile: z.object({
    role: z.string(),
    level: z.enum(["junior", "middle", "senior"]),
    skills: z.array(z.string()),
    softSkills: z.array(z.string()),
    keywords: z.array(z.string()),
    domain: z.string(),
    language: z.string(),
    minYearsExperience: z.number().nullable(),
  }).describe("The parsed job profile"),
});

async function executeEvaluateAnswer(params: z.infer<typeof evaluateAnswerParams>) {
  // Import and use existing evaluateAnswerTool logic from src/tools/evaluate-answer.tool.ts
  // Return evaluation result as object
  return evaluationResult;
}

export const evaluateAnswerTool = new FunctionTool({
  name: "evaluateAnswer",
  description: "Evaluates an interview answer and returns score, strengths, weaknesses, and recommendations",
  parameters: evaluateAnswerParams,
  execute: executeEvaluateAnswer,
});

2. The tool should:
   - Accept question, answer, jobProfile as parameters
   - Return { score, accuracy, depth, relevance, examples, strengths, weaknesses, recommendation, antiCheatFlags, perfectAnswerSummary }

3. Create test src/adk/tools/__tests__/evaluate-answer.tool.test.ts

Run npm run typecheck, npm run lint, npm run test after implementation.
```

---

## Step 6 — Create ADK Tool: updateMemory

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
Create ADK FunctionTool for memory updates.

1. Create file src/adk/tools/update-memory.tool.ts:

import { FunctionTool } from "@google/adk";
import { z } from "zod";

const updateMemoryParams = z.object({
  evaluation: z.object({
    score: z.number(),
    strengths: z.array(z.string()),
    weaknesses: z.array(z.string()),
  }).describe("The evaluation result"),
  topic: z.string().describe("The question topic"),
});

async function executeUpdateMemory(params: z.infer<typeof updateMemoryParams>) {
  // Logic: update weakSkills based on evaluation score
  // score < 5 → add topic to weakSkills
  // score >= 7 → remove topic from weakSkills
  // Return { weakSkills, answeredTopics }
  return memoryUpdate;
}

export const updateMemoryTool = new FunctionTool({
  name: "updateMemory",
  description: "Updates user memory with weak skills and answered topics based on evaluation",
  parameters: updateMemoryParams,
  execute: executeUpdateMemory,
});

2. Create test src/adk/tools/__tests__/update-memory.tool.test.ts

Run npm run typecheck, npm run lint, npm run test after implementation.
```

---

## Step 7 — Create ADK Tool: fetchWeakTopics

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
Create ADK FunctionTool for fetching weak topics.

1. Create file src/adk/tools/fetch-weak-topics.tool.ts:

import { FunctionTool } from "@google/adk";
import { z } from "zod";

const fetchWeakTopicsParams = z.object({
  sessionId: z.string().describe("The session ID to fetch weak topics for"),
});

async function executeFetchWeakTopics(params: z.infer<typeof fetchWeakTopicsParams>) {
  // Fetch weak topics from session store
  // Return { weakSkills: string[] }
  return { weakSkills };
}

export const fetchWeakTopicsTool = new FunctionTool({
  name: "fetchWeakTopics",
  description: "Fetches the list of weak topics/skills for a given session",
  parameters: fetchWeakTopicsParams,
  execute: executeFetchWeakTopics,
});

2. Create test src/adk/tools/__tests__/fetch-weak-topics.tool.test.ts

Run npm run typecheck, npm run lint, npm run test after implementation.
```

---

## Step 8 — Create ADK Agent: JobParserAgent

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
Create ADK LlmAgent for job parsing.

1. Create directory: src/adk/agents/

2. Create file src/adk/agents/job-parser.agent.ts:

import { LlmAgent } from "@google/adk";
import { parseJobTool } from "../tools/parse-job.tool.js";

export const jobParserAgent = new LlmAgent({
  name: "JobParserAgent",
  model: process.env.LLM_MODEL || "deepseek/deepseek-chat",
  description: "Parses job descriptions and extracts structured data including role, level, skills, and domain",
  instruction: `You are a job description analyzer. Your task is to extract structured data from job postings.

When given a job description text, use the parseJobDescription tool to extract:
- role: normalized job title
- level: junior/middle/senior
- skills: technical skills
- softSkills: interpersonal skills
- keywords: key phrases
- domain: industry
- language: ISO code
- minYearsExperience: years required

Always call the parseJobDescription tool with the provided job text.`,
  tools: [parseJobTool],
  outputKey: "parsedJob",
});

3. The agent should:
   - Use model from process.env.LLM_MODEL or default to "deepseek/deepseek-chat"
   - Have the parseJobTool attached
   - Output structured job profile via outputKey "parsedJob"

4. Create test src/adk/agents/__tests__/job-parser.agent.test.ts:
   - Test that jobParserAgent is an LlmAgent instance
   - Test that it has the correct name and tools

Run npm run typecheck, npm run lint, npm run test after implementation.
```

---

## Step 9 — Create ADK Agent: InterviewerAgent

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
Create ADK LlmAgent for interview question generation.

1. Create file src/adk/agents/interviewer.agent.ts:

import { LlmAgent } from "@google/adk";
import { generateQuestionTool } from "../tools/generate-question.tool.js";

export const interviewerAgent = new LlmAgent({
  name: "InterviewerAgent",
  model: process.env.LLM_MODEL || "deepseek/deepseek-chat",
  description: "Generates personalized interview questions based on job profile and user's weak areas",
  instruction: `You are an expert technical interviewer. Generate interview questions based on:
- The job profile (role, level, skills)
- User's weak skills (focus more on these)
- Previous questions (avoid repetition)

Use the generateQuestion tool with:
- jobProfile: the parsed job profile from session state
- weakSkills: array of weak skill topics
- previousQuestions: array of previously asked questions

Generate questions appropriate for the seniority level.`,
  tools: [generateQuestionTool],
  outputKey: "currentQuestion",
});

2. The agent should:
   - Read jobProfile, weakSkills, previousQuestions from session state
   - Generate appropriate questions via the tool
   - Output via outputKey "currentQuestion"

3. Create test src/adk/agents/__tests__/interviewer.agent.test.ts

Run npm run typecheck, npm run lint, npm run test after implementation.
```

---

## Step 10 — Create ADK Agent: EvaluatorAgent

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
Create ADK LlmAgent for answer evaluation.

1. Create file src/adk/agents/evaluator.agent.ts:

import { LlmAgent } from "@google/adk";
import { evaluateAnswerTool } from "../tools/evaluate-answer.tool.js";

export const evaluatorAgent = new LlmAgent({
  name: "EvaluatorAgent",
  model: process.env.LLM_MODEL || "deepseek/deepseek-chat",
  description: "Evaluates interview answers and provides detailed feedback with scores",
  instruction: `You are an expert technical evaluator. Evaluate the candidate's answer to the interview question.

Use the evaluateAnswer tool with:
- question: the current interview question
- answer: the user's answer
- jobProfile: the parsed job profile

Provide a comprehensive evaluation including:
- Overall score (0-10)
- Accuracy, depth, relevance, examples scores
- Strengths and weaknesses
- Recommendation
- Perfect answer summary

Be fair but thorough in your evaluation.`,
  tools: [evaluateAnswerTool],
  outputKey: "evaluation",
});

2. The agent should:
   - Read question, answer, jobProfile from session state
   - Evaluate via the tool
   - Output via outputKey "evaluation"

3. Create test src/adk/agents/__tests__/evaluator.agent.test.ts

Run npm run typecheck, npm run lint, npm run test after implementation.
```

---

## Step 11 — Create ADK Agent: CoachAgent

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
Create ADK LlmAgent for coaching feedback.

1. Create file src/adk/agents/coach.agent.ts:

import { LlmAgent } from "@google/adk";

export const coachAgent = new LlmAgent({
  name: "CoachAgent",
  model: process.env.LLM_MODEL || "deepseek/deepseek-chat",
  description: "Provides coaching feedback and improvement tips based on evaluation",
  instruction: `You are an expert interview coach. Based on the evaluation of the candidate's answer, provide helpful feedback.

Read from session state:
- evaluation: the evaluation result with score, strengths, weaknesses
- question: the interview question
- answer: the user's answer

Provide:
- explanation: detailed explanation of what was good/bad
- improvedAnswer: a model answer they should learn from
- tips: specific tips for improvement

Be encouraging but honest. Focus on actionable advice.`,
  outputKey: "coachFeedback",
});

2. The agent should:
   - Read evaluation, question, answer from session state
   - Generate coaching feedback
   - Output via outputKey "coachFeedback"

3. Create test src/adk/agents/__tests__/coach.agent.test.ts

Run npm run typecheck, npm run lint, npm run test after implementation.
```

---

## Step 12 — Create ADK Agent: MemoryAgent

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
Create ADK LlmAgent for memory updates.

1. Create file src/adk/agents/memory.agent.ts:

import { LlmAgent } from "@google/adk";
import { updateMemoryTool } from "../tools/update-memory.tool.js";

export const memoryAgent = new LlmAgent({
  name: "MemoryAgent",
  model: process.env.LLM_MODEL || "deepseek/deepseek-chat",
  description: "Updates user memory with weak skills and answered topics",
  instruction: `You are a memory manager for the interview system. Update the user's skill memory based on their performance.

Use the updateMemory tool with:
- evaluation: the evaluation result
- topic: the question topic

The tool will update weakSkills based on the score:
- Score < 5: topic added to weakSkills
- Score >= 7: topic removed from weakSkills

Return the updated memory state.`,
  tools: [updateMemoryTool],
  outputKey: "memoryUpdate",
});

2. The agent should:
   - Read evaluation, topic from session state
   - Update memory via the tool
   - Output via outputKey "memoryUpdate"

3. Create test src/adk/agents/__tests__/memory.agent.test.ts

Run npm run typecheck, npm run lint, npm run test after implementation.
```

---

## Step 13 — Create SequentialAgent Pipeline

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
Create ADK SequentialAgent pipeline for interview processing.

1. Create file src/adk/pipeline.ts:

import { SequentialAgent } from "@google/adk";
import { evaluatorAgent } from "./agents/evaluator.agent.js";
import { coachAgent } from "./agents/coach.agent.js";
import { memoryAgent } from "./agents/memory.agent.js";
import { interviewerAgent } from "./agents/interviewer.agent.js";

export const interviewPipeline = new SequentialAgent({
  name: "InterviewPipeline",
  subAgents: [
    evaluatorAgent,
    coachAgent,
    memoryAgent,
    interviewerAgent,
  ],
  description: "Evaluates answer, provides coaching, updates memory, and generates next question",
});

2. The pipeline should:
   - Execute agents in sequence: Evaluator → Coach → Memory → Interviewer
   - Pass data between agents via session state (using outputKey)
   - Evaluator outputs "evaluation" → Coach reads it
   - Memory updates weakSkills
   - Interviewer generates next question

3. Create test src/adk/__tests__/pipeline.test.ts:
   - Test that interviewPipeline is a SequentialAgent
   - Test that it has the correct subAgents in order

Run npm run typecheck, npm run lint, npm run test after implementation.
```

---

## Step 14 — Create ADK Runner + Session Service

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
Create ADK Runner and SessionService setup.

1. Create file src/adk/runner.ts:

import { InMemorySessionService, Runner } from "@google/adk";
import { jobParserAgent } from "./agents/job-parser.agent.js";
import { interviewPipeline } from "./pipeline.js";

const sessionService = new InMemorySessionService();

export const jobParserRunner = new Runner({
  agent: jobParserAgent,
  sessionService,
});

export const interviewRunner = new Runner({
  agent: interviewPipeline,
  sessionService,
});

export { sessionService };

2. The runner should:
   - Use InMemorySessionService for session management
   - Create separate runners for job parsing and interview pipeline
   - Export sessionService for external access if needed

3. Create test src/adk/__tests__/runner.test.ts:
   - Test that runners are created successfully
   - Test that sessionService is accessible

Run npm run typecheck, npm run lint, npm run test after implementation.
```

---

## Step 15 — Update Config for ADK

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
Update config to support ADK model configuration.

1. Update file src/config.ts:

Add new fields:
- adkModel: string (default: process.env.ADK_MODEL || "deepseek/deepseek-chat")
- adkBaseUrl: string (default: process.env.ADK_BASE_URL || process.env.LLM_BASE_URL || "https://api.deepseek.com")

Keep existing fields (apiKey, llmBaseUrl, llmModel) for backward compatibility during migration.

2. Update .env.example:
Add:
ADK_MODEL=deepseek/deepseek-chat
ADK_BASE_URL=https://api.deepseek.com

3. Update test src/utils/__tests__/config.test.ts:
- Test that adkModel defaults to "deepseek/deepseek-chat"
- Test that adkBaseUrl defaults to LLM_BASE_URL or "https://api.deepseek.com"

Run npm run typecheck, npm run lint, npm run test after implementation.
```

---

## Step 16 — Update Job Route to Use ADK Runner

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
Update job route to use ADK Runner for job parsing.

1. Update file src/api/routes/job.ts:

Replace:
import { parseJob } from "../../agents/orchestrator.js";

With:
import { jobParserRunner } from "../../adk/runner.js";

Update the route handler:
- Use jobParserRunner.run() instead of parseJob()
- Pass userId as sessionId
- Pass userMessage as the job text
- Extract parsedJob from runner result

2. The route should:
   - Still accept POST /job/parse with { text }
   - Still validate input (sanitizeJobText, isValidJobText)
   - Use ADK Runner internally
   - Return { jobProfile } as before

3. Update test src/api/__tests__/job.test.ts:
   - Mock ADK Runner instead of orchestrator
   - Test that jobParserRunner.run is called with correct parameters

Run npm run typecheck, npm run lint, npm run test after implementation.
```

---

## Step 17 — Update Interview Routes to Use ADK Runner

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
Update interview routes to use ADK Runner.

1. Update file src/api/routes/interview.ts:

Replace:
import { startInterviewStateless, processAnswerStateless } from "../../agents/orchestrator.js";

With:
import { interviewRunner } from "../../adk/runner.js";

Update /interview/start handler:
- Use interviewRunner.run() instead of startInterviewStateless()
- Pass session data (jobProfile, weakSkills, history) via session state
- Extract question from runner result

Update /interview/answer handler:
- Use interviewRunner.run() instead of processAnswerStateless()
- Pass answer and session data
- Extract evaluation, coach, nextQuestion from runner result

2. The routes should:
   - Still accept same request/response format
   - Still validate input
   - Use ADK Runner internally
   - Return same response structure

3. Update test src/api/__tests__/interview.test.ts:
   - Mock ADK Runner
   - Test that interviewRunner.run is called correctly

Run npm run typecheck, npm run lint, npm run test after implementation.
```

---

## Step 18 — Run Full Test Suite and Fix Issues

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
Run the full test suite and fix any issues.

Run sequentially:
1. npm run typecheck — should pass without errors
2. npm run lint — should pass without warnings
3. npm run test — all tests should pass

If any command fails:
- Read the error output
- Fix the issue in the relevant file
- Re-run the failed command
- Repeat until all three pass

Common issues to watch for:
- Import paths (use .js extension for ESM)
- Type mismatches between old and new code
- Mock setup for ADK classes
- Missing exports

Document any issues encountered and how they were fixed.
```

---

## Step 19 — Verify End-to-End Flow

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
Verify that the end-to-end interview flow works with ADK.

Manual verification steps:
1. Start the dev server: npm run dev:api
2. Test job parsing:
   curl -X POST http://localhost:3001/job/parse \
     -H "Content-Type: application/json" \
     -d '{"text": "We are looking for a Senior Backend Developer with 5+ years of experience in Node.js, TypeScript, and PostgreSQL. Must have experience with microservices and cloud deployment."}'
   → Should return { jobProfile: { role: "Backend Developer", level: "senior", ... } }

3. Test interview start:
   curl -X POST http://localhost:3001/interview/start \
     -H "Content-Type: application/json" \
     -d '{"sessionId": "<uuid>", "jobProfile": <from step 2>}'
   → Should return { question: { question: "...", topic: "...", ... }, updatedHistory: [...] }

4. Test answer submission:
   curl -X POST http://localhost:3001/interview/answer \
     -H "Content-Type: application/json" \
     -d '{"sessionId": "<uuid>", "answer": "I have 6 years of experience...", "sessionData": {...}}'
   → Should return { evaluation: {...}, coach: {...}, nextQuestion: {...}, ... }

5. Verify all responses are valid JSON with expected structure

Document the test results and any issues encountered.
```

---

## Step 20 — Clean Up Old Files (Optional, After Verification)

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
Clean up old agent and tool files after ADK migration is verified.

IMPORTANT: Only do this step if Step 18 verification passed successfully.

Files to remove:
1. src/agents/job-parser.agent.ts (replaced by src/adk/agents/job-parser.agent.ts)
2. src/agents/interviewer.agent.ts (replaced by src/adk/agents/interviewer.agent.ts)
3. src/agents/evaluator.agent.ts (replaced by src/adk/agents/evaluator.agent.ts)
4. src/agents/coach.agent.ts (replaced by src/adk/agents/coach.agent.ts)
5. src/agents/memory.agent.ts (replaced by src/adk/agents/memory.agent.ts)
6. src/agents/orchestrator.ts (replaced by src/adk/pipeline.ts + runner.ts)
7. src/tools/parse-job-description.tool.ts (replaced by src/adk/tools/parse-job.tool.ts)
8. src/tools/generate-question.tool.ts (replaced by src/adk/tools/generate-question.tool.ts)
9. src/tools/evaluate-answer.tool.ts (replaced by src/adk/tools/evaluate-answer.tool.ts)
10. src/tools/update-memory.tool.ts (replaced by src/adk/tools/update-memory.tool.ts)
11. src/tools/fetch-weak-topics.tool.ts (replaced by src/adk/tools/fetch-weak-topics.tool.ts)

After removing:
1. Run npm run typecheck — should pass
2. Run npm run lint — should pass
3. Run npm run test — all tests should pass
4. Verify no imports reference the deleted files

If any issues arise, restore the deleted files and fix the imports first.
```

---

## Step 21 — Final Verification and Documentation

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
Final verification and documentation of ADK integration.

1. Run final checks:
   npm run typecheck
   npm run lint
   npm run test

2. Verify file structure:
   src/adk/
   ├── agents/
   │   ├── job-parser.agent.ts
   │   ├── interviewer.agent.ts
   │   ├── evaluator.agent.ts
   │   ├── coach.agent.ts
   │   └── memory.agent.ts
   ├── tools/
   │   ├── parse-job.tool.ts
   │   ├── generate-question.tool.ts
   │   ├── evaluate-answer.tool.ts
   │   ├── update-memory.tool.ts
   │   └── fetch-weak-topics.tool.ts
   ├── pipeline.ts
   └── runner.ts

3. Update docs/spec/features/012-integrate-google-adk.md:
   - Change Status from "Open" to "Done"
   - Add completion date
   - Note any deviations from original spec

4. Create report file: docs/reports/2026-06-26-012-adk-integration.md
   Contents:
   - Summary of changes
   - Files created/modified/deleted
   - Test results
   - Issues encountered and resolved
   - Notes for future reference

Run npm run typecheck, npm run lint, npm run test one final time to confirm everything passes.
```
