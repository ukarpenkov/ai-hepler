# 2026-06-24 — Fix: correct explanation when question is parsed as answer

## Problem

When copying question as answer:
- Score 1/10 — **correct** (anti-cheat works)
- Recommendation: "Never leave an answer empty" — **incorrect** (doesn't explain the reason)

## Root cause

The prompt in `evaluate-answer.tool.ts` had anti-cheat rules with flags, but didn't instruct LLM to tie `recommendation` to specific flags. Model chose a generic warning instead of a targeted explanation.

## Solution

Added direct instructions to anti-cheat rules:

**For `paraphrasing_question` (strong case — copy-paste):**
```
When "paraphrasing_question" is flagged, the recommendation MUST explicitly state
that copying or paraphrasing the question is unacceptable and not a real answer
— e.g. "Copying the question is not an answer. On a real interview this would
be an immediate rejection. Answer honestly even if you don't know everything."
```

**For paraphrase without added content:**
```
When flagged, the recommendation MUST explain that paraphrasing the question
is not a valid answer and the candidate should provide original content.
```

## Files changed

| File | Change |
|------|--------|
| `src/tools/evaluate-answer.tool.ts` | 2 anti-cheat rules updated with recommendation binding instructions |

## Verification

```bash
npm run typecheck   # 0 errors
npm run lint        # 0 warnings
```

## Expected behavior after fix

When copying question → recommendation contains:
> "Copying the question is not an answer. On a real interview this would be an immediate rejection. Answer honestly even if you don't know everything."