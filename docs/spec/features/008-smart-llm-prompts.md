# Feature: Smart LLM Prompts — anti-cheat evaluation + adaptive questions

**Date:** 2026-06-24
**Priority:** High
**Status:** Done
**Component:** AI Core — Tools (evaluate-answer, generate-question, parse-job-description) + Coach Agent

---

## Description

Reworked prompts for LLM calls in answer evaluation, question generation, job description parsing, and coaching tools. The main goal is to eliminate the possibility of scoring inflation by copy-pasting the question, make questions more diverse and intelligent, and improve feedback quality.

The key problem before changes: a candidate could copy the question text and paste it as an answer — receiving 7/10, because the LLM saw relevant keywords and had no criteria for detecting cheating.

---

## Current Behavior (before changes)

### Answer Evaluation (`evaluate-answer.tool.ts`)
- Flat user message without system prompt
- Single score 1-10 without dimensions
- No anti-cheat checks: question copy-paste → 7/10
- No rubric — model evaluates arbitrarily

### Question Generation (`generate-question.tool.ts`)
- Flat user message without system prompt
- Questions are homogeneous, without categories (only theoretical)
- No expected answer criteria for evaluator
- Questions not tied to specific domain/keywords in job description

### Coaching (`coach.agent.ts`)
- Flat user message
- Tips not tied to specific weaknesses
- No dimensional scores in context

### Job Description Parsing (`parse-job-description.tool.ts`)
- Doesn't separate hard skills and soft skills
- Doesn't extract experience requirements (years of experience)

### Types
- `EvaluationResult`: only score, strengths, weaknesses, recommendation
- `QuestionResult`: only question, topic, difficulty
- `ParsedJob`: no softSkills, minYearsExperience

---

## Expected Behavior

### 1. Anti-Cheat Multi-Dimension Evaluation

**System prompt** sets role of a strict technical interviewer with clear rules:

- **Anti-cheat rules:**
  - Paraphrase/echo of question without original content → score 1-2, flag `paraphrasing_question`
  - Copy-paste of question text → score 1
  - Buzzwords without demonstrating understanding → flag `buzzwords_without_substance`
  - Generic phrases without specifics → flag `generic_answer`
  - No original thought → flag `no_original_thought`
  - Off-topic answer → flag `off_topic`

- **4-dimension rubric (total 0-10):**
  - Technical Accuracy (0-3) — correctness of technical statements
  - Depth of Understanding (0-3) — depth, explanation of WHY, tradeoffs
  - Relevance & Specificity (0-2) — relevance and specificity
  - Examples & Application (0-2) — examples and practical application

- **New fields in response:**
  - `accuracy`, `depth`, `relevance`, `examples` — dimensional scores
  - `antiCheatFlags: string[]` — flags for suspicious behavior
  - `perfectAnswerSummary: string` — what should be in a perfect answer

### 2. Smarter Question Generation

**System prompt** sets persona of an experienced interviewer:

- **5 question types:**
  - `theoretical_explanation` — concept explanation
  - `practical_implementation` — practical implementation
  - `system_design` — system design
  - `debugging_scenario` — debugging/bug analysis
  - `behavioral_experience` — behavioral question

- **Difficulty guidelines:**
  - easy — fundamental concepts
  - medium — comparison, practical scenarios, reasoning
  - hard — system design, tradeoff analysis, edge cases

- **`expectedAnswerCriteria: string[]`** — 3-5 key points that a good answer should cover (hidden from candidate, used by evaluator)

- Questions use keywords and domain from job description for contextualization

### 3. Personalized Coaching

**System prompt** with role of supportive but honest coach:

- Tips tied to specific weaknesses and antiCheatFlags
- Model answer demonstrates level 9-10/10
- Dimensional scores passed to context

### 4. Better Job Description Parsing

- Separation of `skills` (hard/technical) and `softSkills` (soft/interpersonal)
- Extraction of `minYearsExperience: number | null`
- Improved system prompt with instructions for precise extraction

### 5. Type Updates

```typescript
// EvaluationResult — new fields
accuracy: number;       // 0-3
depth: number;          // 0-3
relevance: number;      // 0-2
examples: number;       // 0-2
antiCheatFlags: string[];
perfectAnswerSummary: string;

// QuestionResult — new fields
questionType: "theoretical_explanation" | "practical_implementation" | "system_design" | "debugging_scenario" | "behavioral_experience";
expectedAnswerCriteria: string[];

// ParsedJob — new fields
softSkills: string[];
minYearsExperience: number | null;
```

---

## Affected Files

| File | Change |
|------|--------|
| `src/tools/evaluate-answer.tool.ts` | Rewritten: system prompt, multi-dimension rubric, anti-cheat rules, 9 fields in response |
| `src/tools/generate-question.tool.ts` | Rewritten: system prompt, 5 question types, expectedAnswerCriteria, questionType validation |
| `src/tools/parse-job-description.tool.ts` | Rewritten: system prompt, softSkills, minYearsExperience |
| `src/agents/coach.agent.ts` | Rewritten: system prompt, dimensional scores in context, antiCheatFlags |
| `src/agents/types.ts` | EvaluationResult +5 fields, QuestionResult +2 fields, ParsedJob +2 fields |
| `src/security/schemas.ts` | JobProfileSchema +2 fields, EvaluationSchema +6 fields |
| `src/types/index.ts` | SessionSchema.jobProfile +2 fields |
| `src/storage/session-store.ts` | JobProfile interface +2 fields |
| `src/agents/orchestrator.ts` | Default QuestionResult with new fields |
| `src/tools/__tests__/*.test.ts` | Updated mocks (8 files) |
| `src/agents/__tests__/*.test.ts` | Updated mocks (6 files) |
| `src/api/__tests__/*.test.ts` | Updated mocks (4 files) |
| `src/__tests__/agentWorkflow.test.ts` | Updated mocks |
| `src/security/schemas.test.ts` | Updated test data |
| `src/types/index.test.ts` | Updated test data |

---

## Verification

```bash
npm run typecheck   # 0 errors
npm run lint        # 0 warnings
npm run test        # 157/157 passed, 29 test files
```

### Manual smoke test

1. **Parse job description** — verify that `softSkills` and `minYearsExperience` are populated
2. **Generate question** — verify that `questionType` and `expectedAnswerCriteria` are present
3. **Submit copy-pasted answer** (answer === question) — score should be ≤2, `antiCheatFlags` contains `paraphrasing_question`
4. **Submit buzzword-only answer** — score ≤3, flag `buzzwords_without_substance`
5. **Submit genuinely good answer** — score 7-10, meaningful dimensional scores, empty `antiCheatFlags`