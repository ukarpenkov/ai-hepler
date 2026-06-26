# Report: DeepSeek LLM Tool Support + Centralized Instance

**Date:** 2026-06-26
**Branch:** main
**Status:** Ready to commit

---

## Summary

Added function calling (tool support) to DeepSeekLlm adapter and centralized LLM instance creation. Agents now use a shared `llm` instance instead of constructing model strings from env vars.

---

## Staged Changes (9 files, +494 / -37 lines)

### Created

| File | Purpose |
|------|---------|
| `src/adk/llm.ts` | Centralized DeepSeekLlm instance from config |

### Modified — DeepSeekLlm Core (`src/adk/models/deepseek-llm.ts`)

| Change | Description |
|--------|-------------|
| New interfaces | `OpenAIToolCall`, `OpenAIStreamToolCall`, `OpenAIToolDefinition` |
| `googleSchemaToOpenAI()` | Converts Google GenAI schema types to OpenAI format |
| `declarationsToOpenAITools()` | Wraps ADK FunctionDeclarations into OpenAI tool format |
| `extractTools()` | Reads `toolsDict` from LlmRequest, returns OpenAI tool definitions |
| `convertToOpenAIMessages()` | Handles `functionCall` parts as `assistant` + `tool_calls`, `functionResponse` as `tool` role with `tool_call_id` |
| `nonStreamingResponse()` | Passes tools to API, parses `tool_calls` response into `functionCall` parts |
| `streamResponse()` | Accumulates streamed tool call deltas, yields assembled `functionCall` parts on finish |
| `OpenAIMessage.content` | Changed from `string` to `string \| null` (tool-only assistant messages) |

### Modified — Agents (5 files)

| File | Change |
|------|--------|
| `src/adk/agents/coach.agent.ts` | Import `llm`, use as model |
| `src/adk/agents/evaluator.agent.ts` | Import `llm`, use as model |
| `src/adk/agents/interviewer.agent.ts` | Import `llm`, use as model |
| `src/adk/agents/job-parser.agent.ts` | Import `llm`, use as model. Rewrote instruction to force immediate tool call without text |
| `src/adk/agents/memory.agent.ts` | Import `llm`, use as model |

### Modified — Tests

| File | Change |
|------|--------|
| `src/adk/models/__tests__/deepseek-llm.test.ts` | 3 new test cases: tool in request, tool_call in response, tool result round-trip |

### Modified — API Routes

| File | Change |
|------|--------|
| `src/api/routes/job.ts` | Extracts `parsedJob` from `functionResponse` parts (not just `delta.parsedJob`) |

---

## Key Design Decisions

1. **OpenAI tool format**: DeepSeek uses OpenAI-compatible function calling. Google GenAI `FunctionDeclaration` schemas are converted via `googleSchemaToOpenAI()` before sending.
2. **Streaming tool accumulation**: Tool call deltas are collected in a `Map<number, OpenAIToolCall>` and assembled on `finish_reason`.
3. **Null content for tool-only messages**: Assistant messages with only tool calls have `content: null` per OpenAI spec.
4. **Centralized Llm instance**: Single `DeepSeekLlm` created from config, shared across all agents — eliminates repeated env var reads.

---

## Quality Gate

| Check | Result |
|-------|--------|
| `npm run typecheck` | ✅ Pass |
| `npm run lint` | ✅ Pass |
| `npm run test` | ✅ 29 files, 204 tests, all pass |

---

## Related Documentation

- Previous ADK integration: `docs/reports/2026-06-26-012-adk-integration.md`
- Feature spec: `docs/spec/features/012-integrate-google-adk.md`
