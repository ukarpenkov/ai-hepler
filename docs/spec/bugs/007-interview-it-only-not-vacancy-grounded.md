# Bug: Interview questions and evaluation were IT-biased and not grounded in job posting text

**Date:** 2026-06-26
**Priority:** Medium
**Status:** Fixed
**Component:** Backend — ADK tools and interview prompts

## Description

The interview simulator treated all vacancies as IT/technical roles. Question generation used a generic "technical interviewer at a top tech company" persona regardless of the parsed role. Non-IT job descriptions (e.g. warehouse worker, sales manager, accountant) could produce irrelevant or awkward questions — software-style prompts such as system design and debugging were applied even when the vacancy had nothing to do with programming.

Evaluation and coaching already had partial non-IT support (`isItVacancy`, "master practitioner" persona), but the interviewer agent did not. The original job posting text (`jobText`) was stored in session state but was not passed into question generation or answer evaluation, so questions relied only on the parsed profile summary instead of the employer's actual wording.

## Expected Behavior

- Questions and evaluation should be **grounded in the original job posting text** for **any profession**
- For **non-IT roles**: practical workplace scenarios, procedures, safety, tools, and requirements from the vacancy (e.g. WMS, inventory, FIFO for a warehouse worker)
- For **IT roles**: more challenging, engaging technical questions — system design, debugging, tradeoffs, failure modes — not trivia or generic definitions
- Language, domain, skills, and keywords from the posting should drive both question topics and evaluation criteria

## Actual Behavior

- Question generator always used an IT-centric system prompt ("seasoned technical interviewer at a top tech company")
- Question types (`system_design`, `debugging_scenario`) were framed as software concepts for every role
- `jobText` was available in session state but omitted from `generateQuestion` and `evaluateAnswer` tool calls
- Job parser examples and skill extraction wording skewed toward developers and tech stacks
- Non-IT users could receive questions that felt like a developer interview instead of a role-specific hiring conversation

## Reproduction

1. Paste a non-IT job description (e.g. Russian vacancy for a warehouse worker with WMS and inventory duties)
2. Start the interview
3. **Observation:** questions could sound like generic technical interviews or ignore specific duties from the posting
4. Compare with an IT vacancy (e.g. Backend Developer) — both paths used the same interviewer framing before the fix

## Root Cause

1. `src/adk/tools/generate-question.tool.ts` — single IT-focused prompt with no branch for non-IT vacancies
2. `src/adk/agents/interviewer.agent.ts` and `src/adk/agents/evaluator.agent.ts` — did not pass `jobText` into tools
3. `src/adk/tools/parse-job.tool.ts` — parser examples and field descriptions implied IT-only roles
4. Evaluation/coach had `isItVacancy()` logic, but question generation did not reuse it

## Fix

Introduced vacancy-grounded interview prompts with IT vs non-IT modes and wired `jobText` through the pipeline.

### New module

| File | Change |
|------|--------|
| `src/adk/utils/interview-prompts.ts` | Shared prompt builders: vacancy context block, IT vs general interviewer persona, IT vs professional question design rules, evaluator vacancy grounding |

### IT mode (when `isItVacancy()` is true)

- Persona: senior technical interviewer at a top tech company
- Questions: thinking-heavy, tradeoffs, system design, debugging, failure modes
- Difficulty scaled by level (junior / middle / senior)

### Non-IT mode

- Persona: hiring manager + senior practitioner in the role's domain
- Questions: realistic workplace scenarios from the posting; `system_design` reinterpreted as workflow/process design (not software architecture)
- Focus: safety, quality, compliance, tools, and hands-on judgment from the vacancy text

### Updated files

| File | Change |
|------|--------|
| `src/adk/tools/generate-question.tool.ts` | Optional `jobText` param; uses `interview-prompts` builders |
| `src/adk/tools/evaluate-answer.tool.ts` | Optional `jobText` param; evaluator grounded in original posting |
| `src/adk/tools/parse-job.tool.ts` | Broadened examples for any profession (warehouse, sales, accounting, etc.) |
| `src/adk/agents/interviewer.agent.ts` | Passes `jobText` to `generateQuestion` |
| `src/adk/agents/evaluator.agent.ts` | Passes `jobText` to `evaluateAnswer` |
| `src/adk/utils/__tests__/interview-prompts.test.ts` | Unit tests for IT vs non-IT prompts and vacancy grounding |
| `src/adk/tools/__tests__/generate-question.tool.test.ts` | Test for non-IT warehouse profile with job text in prompt |

## Verification

- `npm run typecheck` — pass
- `npm run lint` — pass
- `npm run test` — pass (includes new `interview-prompts` and updated generate-question tests)
- Manual check: paste a warehouse worker vacancy and a developer vacancy; question tone and topics should differ clearly
