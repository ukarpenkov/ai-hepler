# Feature: Integrate Google ADK for Multi-Agent Orchestration

**Date:** 2026-06-26
**Priority:** Critical
**Status:** Open
**Component:** Backend — AI Core

---

## Description

Migrate the agent system from custom hand-rolled LLM orchestration to Google Agent Development Kit (ADK) **TypeScript SDK**. This is a **Kaggle Capstone requirement** — judges evaluate projects on usage of at least 3 course concepts, and ADK is the primary one.

**Language:** TypeScript (not Python)

**ADK TypeScript Documentation:** https://adk.dev/get-started/typescript/

**Key ADK TypeScript APIs:**
- `LlmAgent` — core agent class (from `@google/adk`)
- `FunctionTool` — tool definition with Zod schema (from `@google/adk`)
- `SequentialAgent` — deterministic multi-agent pipeline (from `@google/adk`)
- `Runner` — execution engine for agents (from `@google/adk`)
- `z` from `zod` — parameter schemas for tools
- `Type` from `@google/genai` — output schema definitions

## Current State

- 5 agents implemented as plain async functions calling LLM via `fetch()`
- Manual orchestration in `orchestrator.ts` (sequential calls)
- Custom session management via Redis
- 5 tools as standalone async functions

**Package:** `@google/adk` (TypeScript)

## Why ADK

- Capstone judges require demonstration of course concepts
- ADK provides built-in: multi-agent orchestration, tool system, session management, structured output
- Using ADK = "Agent / Multi-agent system (ADK)" + "Agent skills" = 2 of 3 required concepts

---

## What To Do

### 1. Install Dependencies

```bash
npm install @google/adk @google/genai
```

### 2. Rewrite Agents as `LlmAgent`

**Current** (`src/agents/job-parser.agent.ts`):
```typescript
export async function jobParserAgent(input: AgentInput, config: Config): Promise<AgentOutput> {
  const sanitized = sanitizeJobText(input.content);
  const parsed = await parseJobDescriptionTool(sanitized, config);
  return { agentName: "job-parser", result: JSON.stringify(parsed) };
}
```

**New** (`src/adk/job-parser.agent.ts`):
```typescript
import { LlmAgent } from "@google/adk";
import { parseJobTool } from "../adk/tools/parse-job.tool.js";

export const jobParserAgent = new LlmAgent({
  name: "JobParserAgent",
  model: "deepseek/deepseek-chat",
  description: "Parses job descriptions and extracts structured data",
  instruction: `You are a job description analyzer. Extract structured data from job postings...`,
  tools: [parseJobTool],
  outputKey: "parsedJob",
});
```

**Repeat for all 5 agents:**

| Agent | File | Key Output |
|-------|------|------------|
| `JobParserAgent` | `job-parser.agent.ts` | `parsedJob` |
| `InterviewerAgent` | `interviewer.agent.ts` | `currentQuestion` |
| `EvaluatorAgent` | `evaluator.agent.ts` | `evaluation` |
| `CoachAgent` | `coach.agent.ts` | `coachFeedback` |
| `MemoryAgent` | `memory.agent.ts` | `memoryUpdate` |

### 3. Rewrite Tools as `FunctionTool`

**Current** (`src/tools/parse-job-description.tool.ts`):
```typescript
export async function parseJobDescriptionTool(text: string, config: Config): Promise<ParsedJob> {
  const response = await fetch(`${config.baseUrl}/chat/completions`, { ... });
  // ... parsing logic
}
```

**New** (`src/adk/tools/parse-job.tool.ts`):
```typescript
import { FunctionTool } from "@google/adk";
import { z } from "zod";

const parseJobParams = z.object({
  jobText: z.string().describe("The job description text to parse"),
});

async function executeParseJob(params: z.infer<typeof parseJobParams>) {
  // Same LLM call logic, wrapped for ADK
  return { parsed: jobProfile };
}

export const parseJobTool = new FunctionTool({
  name: "parseJobDescription",
  description: "Extracts structured job profile from a job description text",
  parameters: parseJobParams,
  execute: executeParseJob,
});
```

**Repeat for all 5 tools:**

| Tool | FunctionTool Name | Parameters |
|------|-------------------|------------|
| `parseJobDescriptionTool` | `parseJobDescription` | `{ jobText: string }` |
| `generateQuestionTool` | `generateQuestion` | `{ jobProfile, weakSkills, previousQuestions }` |
| `evaluateAnswerTool` | `evaluateAnswer` | `{ question, answer, jobProfile }` |
| `updateMemoryTool` | `updateMemory` | `{ evaluation, topic }` |
| `fetchWeakTopicsTool` | `fetchWeakTopics` | `{ sessionId }` |

### 4. Replace Orchestrator with `SequentialAgent`

**Current** (`src/agents/orchestrator.ts`):
```typescript
export async function processAnswer(sessionId, answer, redis, config) {
  const evalOutput = await evaluatorAgent({ ... });
  const coachOutput = await coachAgent({ ... });
  const memOutput = await memoryAgent({ ... });
  const questionOutput = await interviewerAgent({ ... });
  return { evaluation, coach, memory, nextQuestion };
}
```

**New** (`src/adk/interview-pipeline.agent.ts`):
```typescript
import { SequentialAgent } from "@google/adk";

export const interviewPipeline = new SequentialAgent({
  name: "InterviewPipeline",
  subAgents: [
    evaluatorAgent,
    coachAgent,
    memoryAgent,
    interviewerAgent,
  ],
  description: "Evaluates answer, provides coaching, updates memory, generates next question",
});
```

### 5. Add ADK Session Service

Replace custom Redis session management with ADK's built-in session service:

```typescript
import { InMemorySessionService } from "@google/adk";

const sessionService = new InMemorySessionService();
// Or use a persistent backend adapter if needed
```

### 6. Update API Routes

**Current** (`src/api/routes/interview.ts`):
```typescript
const evaluation = await evaluatorAgent({ question, answer, config });
const coach = await coachAgent({ ... });
```

**New:**
```typescript
import { Runner } from "@google/adk";

const runner = new AgentRunner({
  agent: interviewPipeline,
  sessionService,
});

const result = await runner.run({
  userId: sessionId,
  messageId: answerId,
  userMessage: answer,
});
```

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/adk/agents/job-parser.agent.ts` | ADK LlmAgent for job parsing |
| `src/adk/agents/interviewer.agent.ts` | ADK LlmAgent for question generation |
| `src/adk/agents/evaluator.agent.ts` | ADK LlmAgent for answer evaluation |
| `src/adk/agents/coach.agent.ts` | ADK LlmAgent for coaching feedback |
| `src/adk/agents/memory.agent.ts` | ADK LlmAgent for memory updates |
| `src/adk/tools/parse-job.tool.ts` | FunctionTool for job parsing |
| `src/adk/tools/generate-question.tool.ts` | FunctionTool for question generation |
| `src/adk/tools/evaluate-answer.tool.ts` | FunctionTool for answer evaluation |
| `src/adk/tools/update-memory.tool.ts` | FunctionTool for memory updates |
| `src/adk/tools/fetch-weak-topics.tool.ts` | FunctionTool for weak topics |
| `src/adk/pipeline.ts` | SequentialAgent orchestration |
| `src/adk/runner.ts` | ADK Runner + SessionService setup |

## Files to Modify

| File | Change |
|------|--------|
| `package.json` | Add `@google/adk`, `@google/genai` |
| `src/api/routes/interview.ts` | Use ADK Runner instead of manual agent calls |
| `src/api/routes/job.ts` | Use ADK Runner for job parsing |
| `src/config.ts` | Add ADK model configuration |

## Files to Remove (after migration verified)

| File | Reason |
|------|--------|
| `src/agents/orchestrator.ts` | Replaced by `SequentialAgent` |
| `src/agents/job-parser.agent.ts` | Replaced by ADK agent |
| `src/agents/interviewer.agent.ts` | Replaced by ADK agent |
| `src/agents/evaluator.agent.ts` | Replaced by ADK agent |
| `src/agents/coach.agent.ts` | Replaced by ADK agent |
| `src/agents/memory.agent.ts` | Replaced by ADK agent |
| `src/tools/*.tool.ts` | Replaced by FunctionTool instances |

---

## Technical Notes

### Model Configuration

ADK uses `@google/genai` for model config. Since project uses DeepSeek via OpenRouter:

```typescript
import { LlmAgent } from "@google/adk";

const agent = new LlmAgent({
  model: "deepseek/deepseek-chat", // OpenRouter model ID
  // ADK will route through configured base URL
});
```

May need to configure ADK to use OpenRouter endpoint instead of Google's API. Check ADK docs for custom model provider support.

### Structured Output

ADK supports `outputSchema` for structured JSON output. Can replace manual JSON parsing:

```typescript
import { Type } from "@google/genai";

const agent = new LlmAgent({
  outputSchema: {
    type: Type.OBJECT,
    properties: {
      role: { type: Type.STRING },
      level: { type: Type.STRING },
      skills: { type: Type.ARRAY, items: { type: Type.STRING } },
    },
    required: ["role", "level", "skills"],
  },
});
```

### Session State

ADK agents communicate via session state. Use `outputKey` to pass data between agents:

```typescript
const evaluator = new LlmAgent({
  outputKey: "evaluation", // stored in session.state.evaluation
});

const coach = new LlmAgent({
  instruction: "Based on evaluation: {evaluation}...",
  // Reads from state automatically
});
```

---

## Risks

| Risk | Mitigation |
|------|------------|
| ADK may not support OpenRouter/custom endpoints | Check ADK source; may need adapter or use Google Gemini |
| Breaking change to existing API contract | Keep API routes stable, only change internal implementation |
| Test failures during migration | Migrate incrementally, run tests after each agent |
| ADK TypeScript SDK may be unstable | Pin version, check GitHub issues |

---

## Acceptance Criteria

- [ ] `@google/adk` and `@google/genai` installed
- [ ] All 5 agents rewritten as `LlmAgent` instances
- [ ] All 5 tools rewritten as `FunctionTool` instances
- [ ] `SequentialAgent` replaces manual orchestration
- [ ] API routes use ADK Runner
- [ ] Session management uses ADK SessionService
- [ ] All existing tests pass (adapted for ADK)
- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes
- [ ] No API keys or secrets in code
- [ ] Demo works end-to-end: parse job → start interview → answer → evaluate → next question

---

## References

| Resource | URL |
|----------|-----|
| ADK TypeScript Quickstart | https://adk.dev/get-started/typescript/ |
| ADK LlmAgent docs | https://adk.dev/agents/llm-agents/ |
| ADK SequentialAgent | https://adk.dev/agents/workflow-agents/sequential-agents/ |
| ADK FunctionTool | https://adk.dev/tools-custom/function-tools/ |
| ADK API Reference (TS) | https://adk.dev/api-reference/typescript/ |
| GitHub: @google/adk | https://github.com/google/adk-js |
