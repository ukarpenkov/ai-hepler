# 2026-06-24 — Smart LLM Prompts: anti-cheat evaluation + adaptive questions + smarter coaching

## Goal

Rework prompts for DeepSeek API in all AI tools to:
1. Prevent score inflation from question copy-paste (was 7/10, now ≤2)
2. Make questions more diverse and tied to the actual job description
3. Improve coaching quality — tips tied to specific weaknesses
4. Improve job description parsing — separate hard/soft skills, extract experience requirements

## Problem

Before changes:
1. **`evaluate-answer.tool.ts`** — flat user message, no system prompt, no rubric. Candidate copies question → pastes as answer → 7/10. Model sees relevant keywords and assigns high score.
2. **`generate-question.tool.ts`** — questions homogeneous (only theoretical), no expected answer criteria for evaluator, not tied to job domain/keywords.
3. **`coach.agent.ts`** — flat prompt, generic tips, not tied to specific weaknesses.
4. **`parse-job-description.tool.ts`** — doesn't separate hard/soft skills, doesn't extract experience.

## Changes

### 1. `src/tools/evaluate-answer.tool.ts` — Anti-Cheat Multi-Dimension Evaluation

**System prompt:**
- Strict technical interviewer persona
- 5 anti-cheat rules: question paraphrase → score ≤2, copy-paste → 1, buzzwords without substance, generic phrases, lack of original thought
- 6 flags: `paraphrasing_question`, `generic_answer`, `no_original_thought`, `buzzwords_without_substance`, `off_topic`

**4-dimension rubric (total 0-10):**
- Technical Accuracy (0-3) — correctness
- Depth of Understanding (0-3) — depth, WHY, tradeoffs
- Relevance & Specificity (0-2) — relevance and specificity
- Examples & Application (0-2) — examples and application

**New response fields:**
- `accuracy`, `depth`, `relevance`, `examples` — dimensional scores
- `antiCheatFlags: string[]` — cheat flags
- `perfectAnswerSummary: string` — what a perfect answer should contain
- Validation: clamp per dimension

### 2. `src/tools/generate-question.tool.ts` — Smarter Questions

**System prompt:**
- Experienced interviewer from top tech company persona
- Principles: questions require THINKING, not recall; avoid "What is X?"
- Difficulty guidelines: junior=fundamentals, middle=architecture+tradeoffs, senior=system design+leadership

**5 question types:**
- `theoretical_explanation` — concept explanation
- `practical_implementation` — practical implementation
- `system_design` — system design
- `debugging_scenario` — debugging/bug analysis
- `behavioral_experience` — behavioral question

**`expectedAnswerCriteria: string[]`** — 3-5 points for a good answer (hidden from candidate, for evaluator)

**Validation:**
- questionType must be one of 5 allowed values
- Questions use job description keywords and domain

### 3. `src/agents/coach.agent.ts` — Personalized Coaching

**System prompt:**
- Supportive but honest coach persona
- Rules: be direct, model answer at 9-10/10 level, tips tied to weaknesses, antiCheatFlags in context

**User message:**
- Dimensional scores (accuracy, depth, relevance, examples)
- AntiCheatFlags passed for addressing cheating behavior
- perfectAnswerSummary used as benchmark

### 4. `src/tools/parse-job-description.tool.ts` — Better Extraction

- System prompt with precise extraction instructions
- Separated `skills` (hard/technical) and `softSkills` (interpersonal)
- `minYearsExperience: number | null`
- Sanitization: softSkills filtered to strings, minYearsExperience rounded and checked >0

### 5. Types & Schemas

| Type | New fields |
|------|------------|
| `EvaluationResult` | `accuracy`, `depth`, `relevance`, `examples`, `antiCheatFlags`, `perfectAnswerSummary` |
| `QuestionResult` | `questionType`, `expectedAnswerCriteria` |
| `ParsedJob` | `softSkills`, `minYearsExperience` |

**Affected schema files:**
- `src/security/schemas.ts` — `JobProfileSchema`, `EvaluationSchema`
- `src/types/index.ts` — `SessionSchema.jobProfile`
- `src/storage/session-store.ts` — `JobProfile` interface

### 6. Test Updates (18 files)

All mocks updated for new fields. Special cases:
- `generate-question.tool.test.ts` — check `body.messages[1].content` instead of `[0]` (system prompt became first message)
- `orchestrator.ts` — default `QuestionResult` with `questionType` and `expectedAnswerCriteria`

## Verification

```bash
npm run typecheck   # 0 errors
npm run lint        # 0 warnings
npm run test        # 157/157 tests passed, 29 test files
```

## Manual smoke checklist

- [x] Parse job description → `softSkills` and `minYearsExperience` populated
- [x] Generate question → `questionType` and `expectedAnswerCriteria` present
- [x] Submit copy-pasted answer (answer === question) → score ≤2, `paraphrasing_question` in flags
- [x] Submit buzzword-only answer → score ≤3, `buzzwords_without_substance`
- [x] Submit genuinely good answer → score 7-10, dimensional scores meaningful, antiCheatFlags empty

## Files changed (18 production + 18 test)

| File | Type |
|------|------|
| `src/tools/evaluate-answer.tool.ts` | Rewrite |
| `src/tools/generate-question.tool.ts` | Rewrite |
| `src/tools/parse-job-description.tool.ts` | Rewrite |
| `src/agents/coach.agent.ts` | Rewrite |
| `src/agents/types.ts` | 3 interfaces extended |
| `src/security/schemas.ts` | 2 schemas extended |
| `src/types/index.ts` | SessionSchema extended |
| `src/storage/session-store.ts` | JobProfile interface extended |
| `src/agents/orchestrator.ts` | Default QuestionResult updated |
| `src/tools/__tests__/evaluate-answer.tool.test.ts` | Mocks updated |
| `src/tools/__tests__/generate-question.tool.test.ts` | Mocks updated + message index fix |
| `src/tools/__tests__/parse-job-description.tool.test.ts` | Mocks updated |
| `src/tools/__tests__/update-memory.tool.test.ts` | Mocks updated |
| `src/security/schemas.test.ts` | Test data updated |
| `src/types/index.test.ts` | Test data updated |
| `src/agents/__tests__/types.test.ts` | Type assertions updated |
| `src/agents/__tests__/evaluator.agent.test.ts` | Mocks updated |
| `src/agents/__tests__/coach.agent.test.ts` | Mocks updated |
| `src/agents/__tests__/interviewer.agent.test.ts` | Mocks updated |
| `src/agents/__tests__/job-parser.agent.test.ts` | Mocks updated |
| `src/agents/__tests__/memory.agent.test.ts` | Mocks updated |
| `src/agents/__tests__/orchestrator.test.ts` | Mocks updated |
| `src/api/__tests__/server.test.ts` | Mocks updated |
| `src/api/__tests__/job.test.ts` | Mocks updated |
| `src/api/__tests__/interview.test.ts` | Mocks updated |
| `src/api/__tests__/integration.test.ts` | Mocks updated |
| `src/__tests__/agentWorkflow.test.ts` | Mocks updated |