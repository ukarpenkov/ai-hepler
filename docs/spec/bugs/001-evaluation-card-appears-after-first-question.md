# Bug: Evaluation card appears after first question, blocks chat

**Date:** 2026-06-21
**Priority:** High
**Status:** Open
**Component:** Frontend — `ChatWindow.tsx`, `FeedbackCard.tsx`

## Description

After sending the first answer in an interview, a full evaluation card (FeedbackCard) immediately appears at the bottom of the screen. This takes up too much space and makes the chat window narrow and unreadable.

## Expected Behavior

- Questions 1-9: after answering, show only **brief feedback** (score + 1 tip) inside the chat, without the full card
- Question 10 (last): show **full final evaluation** with all 10 answers, statistics, and recommendations

## Actual Behavior

- After **the very first answer**, a full FeedbackCard appears with the score, strengths/weaknesses, recommendation, and answer analysis
- The card is displayed **outside the scroll area** of the chat, in the input block
- This compresses the input window and makes the interface unreadable
- The user sees "final evaluation" already on question 2 of 10

## Reproduction

1. Open http://localhost:3000
2. Paste a job description, start the interview
3. Answer the first question
4. **Observation:** a full card "Score 6/10" with analysis appears immediately

## Screenshot

![Bug screenshot](bug-feedback-after-first-question.png)

## Where to Fix

**`packages/web/components/ChatWindow.tsx`:**
- FeedbackCard renders when `lastFeedback && lastCoach` (line ~112)
- `questionCount` is not checked — it always shows after the first answer

**Fix:**
- Show FeedbackCard **only when** `questionCount >= TOTAL_QUESTIONS` (10)
- Before that — show inline notification "Score: X/10. Tip: ..." inside the chat
- After 10 questions — show final summary with all scores and statistics

## Components to Change

| File | Change |
|------|--------|
| `packages/web/components/ChatWindow.tsx` | Add `isFinished` condition for showing FeedbackCard, collect all answers for final summary |
| `packages/web/components/FeedbackCard.tsx` | Optional: compact mode support for inline display |
