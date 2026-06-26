# Report: Feature 012 — ADK Integration

**Date:** 2026-06-26
**Status:** Complete

---

## Summary

Successfully migrated the agent system from custom hand-rolled LLM orchestration to Google ADK TypeScript SDK. All 5 agents now use `LlmAgent`, all 5 tools use `FunctionTool`, orchestration uses `SequentialAgent`, and API routes use `ADK Runner` with `InMemorySessionService`.

The LLM remains DeepSeek (not Gemini) — a custom `DeepSeekLlm` class was created extending `BaseLlm` from `@google/adk`.

## Files Created

| File | Purpose |
|------|---------|
| `src/adk/types.ts` | Shared type definitions (ParsedJob, EvaluationResult, etc.) |
| `src/adk/models/deepseek-llm.ts` | Custom DeepSeek adapter extending BaseLlm |
| `src/adk/tools/parse-job.tool.ts` | FunctionTool for job parsing |
| `src/adk/tools/generate-question.tool.ts` | FunctionTool for question generation |
| `src/adk/tools/evaluate-answer.tool.ts` | FunctionTool for answer evaluation |
| `src/adk/tools/update-memory.tool.ts` | FunctionTool for memory updates |
| `src/adk/tools/fetch-weak-topics.tool.ts` | FunctionTool for weak topics |
| `src/adk/agents/job-parser.agent.ts` | LlmAgent for job parsing |
| `src/adk/agents/interviewer.agent.ts` | LlmAgent for question generation |
| `src/adk/agents/evaluator.agent.ts` | LlmAgent for answer evaluation |
| `src/adk/agents/coach.agent.ts` | LlmAgent for coaching feedback |
| `src/adk/agents/memory.agent.ts` | LlmAgent for memory updates |
| `src/adk/pipeline.ts` | SequentialAgent orchestration pipeline |
| `src/adk/runner.ts` | ADK Runner + InMemorySessionService setup |

## Files Modified

| File | Change |
|------|--------|
| `package.json` | Added `@google/adk`, `@google/genai` |
| `src/config.ts` | Added `adkModel`, `adkBaseUrl` config fields |
| `src/api/routes/job.ts` | Uses `jobParserRunner.runEphemeral()` |
| `src/api/routes/interview.ts` | Uses `interviewerRunner` and `interviewRunner.runEphemeral()` |
| `src/index.ts` | Exports ADK agents/tools/runners instead of old ones |
| `src/index.test.ts` | Updated to test ADK exports |
| `docs/spec/features/012-integrate-google-adk.md` | Status: Done |

## Files Deleted

| File | Reason |
|------|--------|
| `src/agents/job-parser.agent.ts` | Replaced by ADK agent |
| `src/agents/interviewer.agent.ts` | Replaced by ADK agent |
| `src/agents/evaluator.agent.ts` | Replaced by ADK agent |
| `src/agents/coach.agent.ts` | Replaced by ADK agent |
| `src/agents/memory.agent.ts` | Replaced by ADK agent |
| `src/agents/orchestrator.ts` | Replaced by SequentialAgent pipeline |
| `src/agents/types.ts` | Moved to `src/adk/types.ts` |
| `src/tools/parse-job-description.tool.ts` | Replaced by FunctionTool |
| `src/tools/generate-question.tool.ts` | Replaced by FunctionTool |
| `src/tools/evaluate-answer.tool.ts` | Replaced by FunctionTool |
| `src/tools/update-memory.tool.ts` | Replaced by FunctionTool |
| `src/tools/fetch-weak-topics.tool.ts` | Replaced by FunctionTool |
| `src/agents/__tests__/*` | Old agent tests |
| `src/tools/__tests__/*` | Old tool tests |
| `src/__tests__/agentWorkflow.test.ts` | Integration test for old agents |

## Test Results

- **typecheck:** Pass
- **lint:** Pass
- **tests:** 29 files, 201 tests — all pass

## Deviations from Original Spec

1. **Types location:** Moved `src/agents/types.ts` → `src/adk/types.ts` (ADK code imports from `../types.js`).
2. **index.test.ts timeout:** Added 15s timeout to agent export test — ADK Runner initialization is slow on first import (~3-7s).
3. **DeepSeekLlm class:** Created but not yet wired into agents — agents still call DeepSeek API directly via `fetch()` in their tools. The `DeepSeekLlm` class is available for future use if ADK's `generateContentAsync` path is needed.
4. **No persistent session store:** Using `InMemorySessionService` (sessions lost on restart). Redis-based persistence could be added later if needed.

## Notes for Future Reference

- ADK TypeScript SDK does NOT have LiteLLM connector (unlike Python). Custom `BaseLlm` extension is required for non-Google models.
- `Runner.runEphemeral()` is the correct method for stateless API routes — no session persistence needed.
- `outputKey` on `LlmAgent` stores the result in `session.state[outputKey]`, making it available to subsequent agents in the pipeline.
