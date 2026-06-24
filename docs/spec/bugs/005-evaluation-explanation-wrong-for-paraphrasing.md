# Bug: Evaluation explanation doesn't match paraphrasing cheat detection

**Date:** 2026-06-24
**Priority:** Medium
**Status:** Fixed
**Component:** Backend — `src/tools/evaluate-answer.tool.ts`

## Description

When copying the question as an answer, the anti-cheat system correctly detects cheating and assigns a score of 1/10 with the `paraphrasing_question` flag. However, the `recommendation` field contains a generic message like "Never leave an answer empty. Even if you don't know exactly..." instead of explaining that copying the question is not an answer.

## Expected Behavior

When `paraphrasing_question` is detected, the `recommendation` should clearly explain:
- Copying/paraphrasing the question is not an answer
- On a real interview, this results in immediate rejection
- You need to answer honestly, even if you don't know everything

## Actual Behavior

`recommendation`: "Never leave an answer empty. Even if you don't know exactly, say what you know about React.memo, useMemo, useCallback, and start explaining. An empty answer is a failure on an interview."

The explanation does not match the actual reason for the low score — the problem is not an empty answer, but copying the question.

## Reproduction

1. Start an interview
2. Copy the question text and paste it as the answer
3. Get a score of 1/10 (correct)
4. Read the recommendation — message about "empty answer" (incorrect)

## Root Cause

The LLM prompt does not contain an instruction to bind the `recommendation` to specific `antiCheatFlags`. The model generates a generic warning instead of a targeted explanation.

## File to Fix

`src/tools/evaluate-answer.tool.ts` — lines 23-24, anti-cheat instructions.

## Components to Change

| File | Change |
|------|--------|
| `src/tools/evaluate-answer.tool.ts` | Add instruction to anti-cheat rules: when `paraphrasing_question`, recommendation MUST contain an explanation that copying the question is cheating |
