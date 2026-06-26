# Bug: Non-IT vacancies still received IT-style questions and evaluation (AWS/Python for design engineers)

**Date:** 2026-06-27
**Priority:** Medium
**Status:** Fixed
**Component:** Backend — ADK tools, interview/evaluation prompts, vacancy relevance guard
**Related:** `docs/spec/bugs/007-interview-it-only-not-vacancy-grounded.md`

## Description

After bug 007 (vacancy-grounded interviews), the simulator correctly branched IT vs non-IT prompt modes and passed `jobText` into question generation and evaluation. However, the LLM could still produce **off-topic software/cloud questions** for non-IT vacancies — especially design and engineering roles where the posting mentions company marketing ("innovative AI approach", "R&D center") but actual duties are CAD, electrical schematics, and production support.

**Example (real user report):** vacancy for **«Инженер-проектировщик»** (lighting control panels, КОМПАС 3D, ЕСКД, Э3/Э4, up to 1000V) produced a question about **Python microservices and AWS** — relevant for an IoT/backend role, but not for a design engineer position.

Evaluation could similarly suggest "perfect answers" with IT stack advice instead of tools and procedures from the vacancy text.

## Expected Behavior

- Questions for non-IT roles must use **only** duties, tools, standards, and requirements from the **original vacancy text**
- Questions should be **interesting and realistic** (production discrepancies, tradeoffs, compliance) — not textbook trivia and not generic IT scenarios
- Company marketing phrases ("ИИ", "инновации", "R&D") must **not** drive question topics unless listed under duties or requirements
- Evaluator feedback and `perfectAnswerSummary` must benchmark answers against **vacancy-specific** professional criteria — not Python/AWS/microservices unless the posting requires software development
- IT questions (AWS, microservices, etc.) remain appropriate **only** when `isItVacancy()` is true and the stack appears in the posting

## Actual Behavior

- LLM occasionally ignored non-IT prompt instructions and generated software architecture / cloud questions
- Job parser could infer IT-adjacent skills from marketing copy in the vacancy header
- No post-generation validation rejected off-topic IT terminology for non-IT profiles
- Evaluator had vacancy grounding block but no explicit rule forbidding IT-style perfect answers for non-IT roles

## Reproduction

1. Paste a Russian vacancy for **инженер-проектировщик** / electrical design engineer:
   - Duties: щиты освещения, КОМПАС 3D, ЕСКД, Э3/Э4, до 1000В
   - Company perks mention "инновационный подход с использованием ИИ" or "собственный R&D центр"
2. Start the interview
3. **Observation (before fix):** first or subsequent question could mention Python, AWS, microservices, or software architecture — none of which appear in job requirements
4. Submit an answer and check evaluation — `perfectAnswerSummary` could reference cloud/software concepts absent from the vacancy

## Root Cause

1. **Prompts alone are insufficient** — even with non-IT persona (bug 007), the LLM sometimes hallucinated IT scenarios, especially when marketing text mentioned "AI" or "innovation"
2. **`parse-job.tool.ts`** — skill extraction did not explicitly forbid inferring Python/AWS from marketing sections; design-engineer examples were not strict enough
3. **`generate-question.tool.ts`** — only retried on **wrong language**, not on **wrong topic/domain**
4. **`evaluate-answer.tool.ts`** — missing role-specific rules telling the evaluator not to suggest IT perfect answers for non-IT vacancies

## Fix

Added a **vacancy relevance guard** and strengthened prompts/parser/evaluator for non-IT roles.

### New module — `src/adk/utils/vacancy-relevance.ts`

| Export | Purpose |
|--------|---------|
| `isQuestionVacancyRelevant()` | Returns `false` for non-IT profiles when question/topic contains forbidden IT terms (AWS, microservices, React, etc.) not present in vacancy haystack |
| `extractForbiddenItTerms()` | Detects leaked IT terminology in generated question text |
| `buildStrictRelevanceRetryRule()` | Injected into system prompt on retry — instructs LLM to regenerate using only posting tools/duties |
| `filterMarketingKeywords()` | Filters marketing-only phrases from keyword lists |
| `buildAllowedTermsHaystack()` | Builds allowlist from role, domain, skills, keywords, and `jobText` |

### Question generation — relevance retry loop

`src/adk/tools/generate-question.tool.ts`:

- Up to **4 attempts**: normal → strict language → strict relevance → both strict
- Returns question only when **language** and **vacancy relevance** checks pass
- Throws if all attempts fail both checks

### Stronger non-IT interview prompts

`src/adk/utils/interview-prompts.ts`:

- Vacancy block renamed/clarified: **ORIGINAL VACANCY TEXT** — primary source; ignore marketing slogans unless they are job requirements
- Non-IT design rules: every question must reference at least one concrete duty/tool from the posting
- **STRICTLY FORBIDDEN** for non-IT unless in vacancy: Python, AWS, microservices, Docker, Kubernetes, REST/API, React, Vue, DevOps, etc.
- **Interesting question shapes** with domain inspiration (e.g. Э3 vs assembly discrepancy, protection device selection for lighting panels up to 1000V)
- `strictRelevanceRetry` option adds `CRITICAL RELEVANCE RETRY` block with offending terms from previous attempt

### Evaluator — role-specific rules

`src/adk/utils/evaluation-prompts.ts`:

- New `buildEvaluatorRoleRules()` — IT vs non-IT evaluation benchmarks
- Non-IT: do not penalize for lacking software knowledge; do not suggest Python/AWS perfect answers; reward practical judgment using employer terminology

`src/adk/tools/evaluate-answer.tool.ts`:

- System prompt includes `buildEvaluatorRoleRules(jobProfile)`

### Job parser — stricter skill extraction

`src/adk/tools/parse-job.tool.ts`:

- Do not infer Python/AWS/Vue from marketing ("инновационный подход", "R&D", "использование ИИ")
- Explicit rule for **инженер-проектировщик**: extract КОМПАС, ЕСКД, Э3/Э4, protection devices — not cloud/programming unless in requirements
- Marketing phrases go to keywords for context only, never to `skills`

### Updated / new tests

| File | Coverage |
|------|----------|
| `src/adk/utils/__tests__/vacancy-relevance.test.ts` | **New** — flags AWS/Python question for design engineer; accepts ЕСКД/Э3 question; allows AWS for IT profile |
| `src/adk/utils/__tests__/interview-prompts.test.ts` | Strict relevance retry rule; STRICTLY FORBIDDEN block for electrical design engineer |
| `src/adk/utils/__tests__/evaluation-prompts.test.ts` | Non-IT evaluator forbids IT perfect answers |
| `src/adk/tools/__tests__/generate-question.tool.test.ts` | Retries when first question is off-topic (AWS/Python) for design engineer vacancy |

## Verification

```bash
npm run typecheck   # pass
npm run lint        # pass
npm run test        # 252/252 pass
```

### Manual smoke checklist

- [ ] Paste **инженер-проектировщик** vacancy (КОМПАС, ЕСКД, щиты освещения) with "ИИ" in company perks → questions mention CAD/schematics/production, **not** AWS/Python
- [ ] Paste **Backend Developer** vacancy with AWS/Python in requirements → IT questions about cloud/architecture are still generated
- [ ] Evaluation `perfectAnswerSummary` for design engineer references posting tools, not software stack
- [ ] Warehouse / sales / accounting vacancies unchanged — still use professional (non-IT) mode from bug 007

## Out of scope (not changed)

- Separate **candidate resume** input — simulator still uses one text field (vacancy description); resume-aware personalization is a future feature
- Frontend UI copy — no changes to paste-job labels
- `isItVacancy()` heuristics — not expanded beyond bug 007; edge-case misclassification may still occur for hybrid roles

## Files changed

| File | Type |
|------|------|
| `src/adk/utils/vacancy-relevance.ts` | **New** |
| `src/adk/utils/interview-prompts.ts` | Enhanced non-IT rules + relevance retry |
| `src/adk/utils/evaluation-prompts.ts` | `buildEvaluatorRoleRules()` |
| `src/adk/tools/generate-question.tool.ts` | Relevance retry loop |
| `src/adk/tools/evaluate-answer.tool.ts` | Role-specific evaluation rules |
| `src/adk/tools/parse-job.tool.ts` | Stricter skill extraction |
| `src/adk/utils/__tests__/vacancy-relevance.test.ts` | **New** |
| `src/adk/utils/__tests__/interview-prompts.test.ts` | Extended |
| `src/adk/utils/__tests__/evaluation-prompts.test.ts` | Extended |
| `src/adk/tools/__tests__/generate-question.tool.test.ts` | Off-topic retry test |
