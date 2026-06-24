# Feature: Prompt Language Binding + Input Hint

**Date:** 2026-06-24
**Priority:** Medium
**Status:** In Progress
**Component:** AI Core (tools) + Frontend (ChatWindow)

---

## Description

Two tasks:

1. **Language binding** — interview questions, evaluation, and coaching should be output in the same language the job description is written in. Currently all prompts are always in English, even if the job description is in Russian.

2. **Input hint** — add keyboard shortcut information to the textarea placeholder (Enter to send, Shift+Enter for line break).

---

## Task 1: Prompt Language Binding

### What needs to be done

#### 1. Add `language` field to `ParsedJob`

**File:** `src/agents/types.ts`

- Add `language: string` to the `ParsedJob` interface
- Value — ISO 639-1 language code (`"en"`, `"ru"`, `"de"`, `"fr"`, `"es"`, `"zh"`, etc.)

#### 2. Update validation schemas

**Files:**
- `src/security/schemas.ts` — `JobProfileSchema`: add `language: z.string().min(1)`
- `src/types/index.ts` — `SessionSchema.jobProfile`: add `language: z.string()`
- `src/storage/session-store.ts` — `JobProfile` interface: add `language: string`

#### 3. Detect job language in parser

**File:** `src/tools/parse-job-description.tool.ts`

- Add `language` field to parser user prompt: `"language: ISO 639-1 code of the language the job description is written in"`
- Add `language` to response JSON schema
- When parsing result: check `typeof parsed.language === "string"`, fallback to `"en"` if undefined

#### 4. Pass language to question generation prompts

**File:** `src/tools/generate-question.tool.ts`

- In system prompt add block:
  ```
  LANGUAGE: The job description is in ${langName}. You MUST generate the question, topic, and expectedAnswerCriteria in ${langName}.
  ```
- Code-to-name mapping: `{ ru: "Russian", de: "German", fr: "French", es: "Spanish", zh: "Chinese" }`, fallback → `"English"`

#### 5. Pass language to evaluation prompt

**File:** `src/tools/evaluate-answer.tool.ts`

- In system prompt add:
  ```
  LANGUAGE: The job description and interview are in ${langName}. You MUST output all evaluation fields (strengths, weaknesses, recommendation, perfectAnswerSummary) in ${langName}.
  ```

#### 6. Pass language to coaching prompt

**File:** `src/agents/coach.agent.ts`

- In system prompt add:
  ```
  LANGUAGE: The job description and interview are in ${langName}. You MUST output all coaching feedback (explanation, improvedAnswer, tips) in ${langName}.
  ```

#### 7. Update all tests

All `ParsedJob` literals and JSON mocks in tests must contain `language: "en"`.

### Acceptance Criteria

- [ ] Job in Russian → questions in Russian, evaluation in Russian, coaching in Russian
- [ ] Job in English → everything in English (as before)
- [ ] If language is not determined → fallback `"en"`
- [ ] All tests pass (typecheck, lint, test)

---

## Task 2: Input Hint

### What needs to be done

#### Update placeholder in ChatWindow

**File:** `packages/web/components/ChatWindow.tsx` (line ~279)

**Before:**
```
placeholder={isFinished ? "Interview completed" : "Enter your answer..."}
```

**After:**
```
placeholder={isFinished ? "Interview completed" : "Enter your answer... (Enter — send, Shift+Enter — line break)"}
```

#### Update tests

**File:** `packages/web/components/ChatWindow.test.tsx`

- All `getByPlaceholderText("Enter your answer...")` → `getByPlaceholderText("Enter your answer... (Enter — send, Shift+Enter — line break)")`
- Count: 6 occurrences

### Acceptance Criteria

- [ ] Placeholder contains keyboard shortcut hint
- [ ] Hint is visible only when interview is active (not when completed)
- [ ] All ChatWindow tests pass
