# 2026-06-26 — LLM response language optimization (job-description binding)

## Goal

Ensure that all LLM-generated interview content — questions, evaluation feedback, and coaching tips — is written in the **same language as the job description**, not in the language selected in the website UI.

The UI locale (`LanguageSwitcher`) should only affect interface labels (buttons, placeholders, sidebar). It must **not** influence agent prompts or model output.

## Problem

After the initial language-binding work (2026-06-24), users still reported English responses when pasting Russian job descriptions.

Root causes:

1. **Weak heuristic detection** — `detectLanguageFromText()` required a high Cyrillic count (`> 20`) and Cyrillic ≥ 40% of Latin letters. Typical Russian vacancies contain many English tech terms (`React`, `TypeScript`, `CI/CD`, `microservices`), so the detector often returned `"en"`.

2. **LLM parser bias** — the job parser sometimes returned `"language": "en"` even for Russian text. The fallback logic did not always override this when Latin characters dominated the sample.

3. **No original job text in session** — after parsing, only structured `jobProfile` was stored. Without the raw vacancy text, later interview rounds could not re-derive language reliably.

4. **Frontend type gap** — `ParsedJob` in the web package did not declare `language`, making it easy to miss during development (runtime data was still passed, but the contract was incomplete).

## Solution Overview

```
Job description text
        │
        ▼
 parseJobTool ──► resolveInterviewLanguage(jobProfile, jobText)
        │
        ▼
 Session stores jobText + jobProfile.language
        │
        ▼
 Interview pipeline (start / answer)
        │
        ├── InterviewerAgent  ──► generateQuestion (language in prompt + retry)
        ├── EvaluatorAgent    ──► evaluateAnswer   (language in prompt)
        └── CoachAgent        ──► coachAnswer      (language in prompt)
```

Language is resolved once per tool call from:

- ISO code returned by the parser (when non-English)
- Heuristic detection on the original job text
- Heuristic detection on parsed profile fields (role, domain, keywords, softSkills, skills)

## Changes

### 1. `src/adk/utils/language.ts` — improved detection and unified resolver

**`detectLanguageFromText()`**

- Switched from absolute thresholds to **ratio-based** script detection.
- Cyrillic jobs with mixed Latin tech terms are now detected as `"ru"` when:
  - Cyrillic count ≥ 5 **and** Cyrillic ratio ≥ 8% of (Cyrillic + Latin), **or**
  - Cyrillic count ≥ 15.
- Lowered thresholds for CJK / Korean / Japanese detection as well.

**New helpers**

| Function | Purpose |
|----------|---------|
| `buildInterviewLanguageText()` | Combines job text + profile fields into one detection sample |
| `resolveInterviewLanguage()` | Single entry point for interview language across all agents/tools |

**Existing behavior preserved**

- Explicit non-English codes from the LLM (`de`, `fr`, `es`, …) are kept.
- `questionMatchesLanguage()` still validates generated questions and triggers a strict retry in `generateQuestionTool`.

### 2. `src/adk/tools/parse-job.tool.ts`

- Uses `resolveInterviewLanguage()` instead of `resolveLanguage()` with job text only.
- Language is corrected using both LLM output and parsed profile fields (Russian keywords, softSkills, etc.).

### 3. `src/adk/tools/generate-question.tool.ts`

- Resolves language via `resolveInterviewLanguage(jobProfile)` before building prompts.
- Keeps existing `CRITICAL LANGUAGE RULE` in system prompt and retry loop when output script does not match.

### 4. `src/adk/tools/evaluate-answer.tool.ts`

- Uses `resolveInterviewLanguage(jobProfile)` for:
  - Anti-cheat fallback messages (paraphrasing copy in `ru` / `en`)
  - `buildEvaluatorLanguageRule()` in the system prompt
  - Final evaluation output language

### 5. ADK agents — language injected before tool calls

**`src/adk/agents/interviewer.agent.ts`**

- Reads `jobText` from agent state.
- Builds `resolvedProfile` with `language: resolveInterviewLanguage(jobProfile, jobText)`.
- Passes resolved profile to `generateQuestion`.

**`src/adk/agents/evaluator.agent.ts`**

- Same pattern for `evaluateAnswer`.

**`src/adk/agents/coach.agent.ts`**

- `readLanguage()` now calls `resolveInterviewLanguage(jobProfile, jobText)` instead of defaulting to `"en"` when language is missing.

### 6. API routes — propagate job text through pipeline

**`src/api/routes/interview.ts`**

- `POST /interview/start` accepts optional `jobText` and passes it in `stateDelta`.
- `POST /interview/answer` accepts optional `sessionData.jobText` and passes it in `stateDelta`.

**`src/api/routes/job.ts`**

- `isValidParsedJob()` now requires a non-empty `language` field in parsed output.

### 7. Frontend — persist original vacancy text

| File | Change |
|------|--------|
| `packages/web/lib/session-store.ts` | Added `jobText: string \| null` to `SessionRecord` |
| `packages/web/app/page.tsx` | Saves `jobText` when creating a session; sends it to `startInterview` |
| `packages/web/lib/api.ts` | `startInterview` / `sendAnswer` accept optional `jobText` |
| `packages/web/components/ChatWindow.tsx` | Sends `jobText` with each answer request |
| `packages/web/lib/types.ts` | `ParsedJob` now includes `language`, `softSkills`, `minYearsExperience` |

### 8. Tests

**`src/adk/utils/__tests__/language.test.ts`**

- Added case: mixed Russian/English tech job description → `"ru"`.
- Added case: `resolveInterviewLanguage()` overrides LLM `"en"` when profile + text are Russian.

**`packages/web/components/ChatWindow.test.tsx`**

- Mock session updated with `jobText` and `language: "ru"`.

## What is NOT affected

- **Website UI locale** (`packages/web/lib/i18n-context.tsx`, `LanguageSwitcher`) — unchanged; still controls only UI strings.
- **LLM provider** — still DeepSeek via custom ADK adapter; no model switch.
- **Question quality / anti-cheat prompts** — unchanged from 2026-06-24 smart-prompts work; only language resolution layer was strengthened.

## Expected behavior after fix

| Job description language | UI locale | LLM output language |
|--------------------------|-----------|---------------------|
| Russian                  | English   | Russian             |
| Russian                  | Russian   | Russian             |
| English                  | Russian   | English             |
| German (LLM returns `de`) | Any      | German              |

## Limitations

- Sessions created **before** this change may lack `jobText`. Language is still inferred from profile fields, but starting a **new session** is recommended for best accuracy.
- Cyrillic detection maps both Russian and Ukrainian text to `"ru"` (no `uk` split in heuristics yet).
- Latin-script languages (German, French, Spanish) rely primarily on the parser's ISO code, not script heuristics.

## Verification

```bash
npm run typecheck   # 0 errors
npm run lint        # 0 warnings
npm run test        # 232/232 passed
```

Manual check:

1. Set UI language to English.
2. Paste a Russian job description with English tech stack terms.
3. Confirm the first question, evaluation, and coach feedback are in Russian.

## Files changed

| Area | Files |
|------|-------|
| Language utils | `src/adk/utils/language.ts`, `src/adk/utils/__tests__/language.test.ts` |
| Tools | `src/adk/tools/parse-job.tool.ts`, `generate-question.tool.ts`, `evaluate-answer.tool.ts` |
| Agents | `src/adk/agents/interviewer.agent.ts`, `evaluator.agent.ts`, `coach.agent.ts` |
| API | `src/api/routes/interview.ts`, `src/api/routes/job.ts` |
| Frontend | `packages/web/lib/types.ts`, `session-store.ts`, `api.ts`, `app/page.tsx`, `components/ChatWindow.tsx`, `ChatWindow.test.tsx` |

## Related docs

- `docs/reports/2026-06-24-language-binding-input-hint.md` — initial language field + prompt binding
- `docs/spec/features/009-language-bindling-and-input-hint.md` — original feature spec
- `docs/reports/2026-06-25-ui-internationalization.md` — UI i18n (separate from LLM language)
