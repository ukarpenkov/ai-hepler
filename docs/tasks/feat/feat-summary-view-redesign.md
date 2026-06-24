# Prompted: Summary view — full-screen bottom sheet

**Feature:** 004-summary-view-redesign

---

## Context

The current summary implementation is embedded directly in `ChatWindow.tsx` as an inline block at the bottom of the chat. This creates issues:

- Summary takes up half the screen along with the chat — inconvenient for viewing
- The 10th question is not included in the summary (the last question has no answer/evaluation)
- There is no way to collapse/expand the summary

**Prototype:** `C:\JS\ai-helper\ai-interview-simulator\docs\design\summary-view.html`
**Status:** New feature

---

## Requirements

1. **Full-screen summary:** After the interview is completed, the summary takes up the entire screen, covering the chat
2. **9 questions:** Questions 1–9 are included in the summary (the 10th question is asked but has no answer — the interview ends after 9 answers)
3. **Bottom sheet:** Summary is implemented as a bottom sheet (similar to Android bottom sheet / pull-down menu):
   - By default, expanded to full screen
   - Can be collapsed by dragging the handle bar down
   - Can be expanded back by dragging the handle bar up or clicking on the handle bar
   - Smooth collapse/expand animation
   - When collapsed — only the top strip (handle bar) with the title is visible
4. **Design from prototype:** All visual elements are taken from `docs/design/summary-view.html`

---

## Data changes

- `TOTAL_QUESTIONS` remains = 10
- Questions 1–9 are displayed in the summary (answers + evaluations)
- The 10th question is asked but the interview ends without waiting for an answer — the summary shows results for 9 questions
- Statistics (average, best, worst score) are calculated for 9 questions

---

## General rules (for each step)

1. Code must compile without errors (`npm run typecheck` in `packages/web`)
2. Tests must pass (`npm run test` in `packages/web`)
3. Use existing CSS variables from `docs/design/summary-view.html`
4. Follow project conventions: Next.js App Router, TypeScript, Tailwind CSS
5. Do not add comments to the code
6. Do not remove existing functionality
7. After implementation — run tests and write a report in `docs/reports/`

---

## Steps

### Step 1: Update Tailwind config — ✅

**Status:** Done

**General rules for the step:**
1. Code must compile without errors (`npm run typecheck` in `packages/web`)
2. Tests must pass (`npm run test` in `packages/web`)
3. Use existing CSS variables from `docs/design/summary-view.html`
4. Follow project conventions: Next.js App Router, TypeScript, Tailwind CSS
5. Do not add comments to the code
6. Do not remove existing functionality
7. After implementation — run tests and write a report in `docs/reports/`

---

Add animations and keyframes for the bottom sheet to `packages/web/tailwind.config.ts`.

```
Update the file packages/web/tailwind.config.ts.

Add to theme.extend:
- animation: slide-up-bottom-sheet, slide-down-bottom-sheet, fade-in-overlay
- keyframes:
  - slideUpBottomSheet: from translateY(100%) to translateY(0)
  - slideDownBottomSheet: from translateY(0) to translateY(100%)
  - fadeInOverlay: from opacity 0 to opacity 1

Preserve existing settings.
```

**Test:** `npm run typecheck` in `packages/web`

---

### Step 2: Create BottomSheet component — ✅

**Status:** Done

**General rules for the step:**
1. Code must compile without errors (`npm run typecheck` in `packages/web`)
2. Tests must pass (`npm run test` in `packages/web`)
3. Follow project conventions: Next.js App Router, TypeScript, Tailwind CSS
4. Do not add comments to the code

---

Create a reusable component `packages/web/components/BottomSheet.tsx`.

```
Create a new file packages/web/components/BottomSheet.tsx.

Component:
- "use client" directive
- Props:
  - isOpen (boolean) — expanded/collapsed
  - onToggle (() => void) — toggle state
  - title (string) — title in collapsed state
  - children (ReactNode) — content
- State:
  - isDragging (boolean) — drag flag
  - dragStartY (number) — initial drag position
- Behavior:
  - Drag: touch/mouse events on handle bar
    - onPointerDown: fix startY
    - onPointerMove: if dragging down > 80px → onToggle (collapse), if dragging up > 80px → onToggle (expand)
    - onPointerUp: reset
  - Click on handle bar: toggle state
- Styles (from prototype summary-view.html):
  - Container: fixed, bottom-0, left-0, right-0, z-50
  - Expanded: h-full (full screen), transition-all duration-300
  - Collapsed: h-16 (handle bar only), transition-all duration-300
  - Handle bar: h-16, flex items-center justify-center, cursor-grab
    - Center line: w-12 h-1.5 rounded-full bg-gray-300 (or via CSS variable)
    - Title: ml-4, text-sm, font-medium
  - Content: overflow-y-auto, padding 30px
  - Background: glass-bg, backdrop-blur(30px), border-top
- Animation: transition-all duration-300 ease-in-out

Create a test packages/web/components/__tests__/BottomSheet.test.tsx:
- Renders without errors
- Displays handle bar and title
- Calls onToggle when clicking handle bar
- Applies correct styles based on isOpen
```

**Test:** `npm run test` in `packages/web`

---

### Step 3: Create SummaryView component — ✅

**Status:** Done

**General rules for the step:**
1. Code must compile without errors (`npm run typecheck` in `packages/web`)
2. Tests must pass (`npm run test` in `packages/web`)
3. Use the design from prototype `docs/design/summary-view.html`
4. Follow project conventions: Next.js App Router, TypeScript, Tailwind CSS
5. Do not add comments to the code

---

Create component `packages/web/components/SummaryView.tsx` with the full design from the prototype.

```
Create a new file packages/web/components/SummaryView.tsx.

Types:
- QuestionFeedback: { number: number, score: number, strengths: string[], weaknesses: string[], recommendation: string, analysis: string, improved: string, tips: string[] }

Component:
- "use client" directive
- Props: feedbacks (QuestionFeedback[]) — array of evaluations for questions 1-9
- State: activeQuestion (number) — selected question for viewing
- Computed statistics:
  - averageScore: average score across all feedbacks
  - bestScore: maximum score
  - worstScore: minimum score

JSX (inside BottomSheet, content section):
1. Success banner:
   - Gradient background (success colors from prototype: rgba(16,185,129,0.1))
   - Text: "Interview completed! All ${feedbacks.length + 1} questions asked."
   - slideDown animation

2. Stats grid (3 cards):
   - Average score (averageScore) — gradient text (accent → pink)
   - Best (bestScore) — gradient text (success → green)
   - Worst (worstScore) — gradient text (danger → red)
   - Each card: glass, border, rounded-2xl, p-7, text-center
   - slideUp animation

3. Questions navigation:
   - Buttons "Question 1" ... "Question N" (where N = feedbacks.length)
   - Buttons in a row with flex-wrap
   - Active button: bg-accent, text-white
   - Hover: bg-accent, translateY(-2px)

4. Question detail card (for the selected question):
   - Header: "Question N / ${feedbacks.length}" + large score display (/10)
   - Sections:
     - Strengths (strengths) — green heading, list
     - Weaknesses (weaknesses) — red heading, list
     - Recommendation (recommendation) — accent heading
     - Answer analysis (analysis) — orange heading
     - Improved answer (improved) — green heading, pre-wrap
     - Tips (tips) — accent heading, list

Styles are taken from prototype docs/design/summary-view.html:
- .success-banner: bg gradient success, border success, rounded-2xl, p-5, text-center, mb-7
- .stats-grid: grid, repeat(auto-fit, minmax(200px, 1fr)), gap-5, mb-10
- .stat-card: glass, backdrop-blur(30px), border, rounded-[20px], p-7, text-center
- .stat-value: text-5xl, font-bold, gradient text
- .questions-nav: flex, gap-2.5, mb-7, flex-wrap, p-5, glass, border, rounded-2xl
- .question-btn: px-5 py-3, bg-secondary, border, rounded-[10px], cursor-pointer
- .question-card: glass, border, rounded-3xl, p-10, mb-7
- .section-title: text-lg, font-semibold, mb-4
- .section-content: bg-secondary, rounded-xl, p-5, border, leading-relaxed

Create a test packages/web/components/__tests__/SummaryView.test.tsx:
- Renders without errors
- Displays stats grid with correct values
- Displays question navigation
- Switches question when clicking a button
- Displays all feedback sections
```

**Test:** `npm run test` in `packages/web`

---

### Step 4: Integrate SummaryView into ChatWindow — ✅

**Status:** Done

**General rules for the step:**
1. Code must compile without errors (`npm run typecheck` in `packages/web`)
2. Tests must pass (`npm run test` in `packages/web`)
3. Follow project conventions: Next.js App Router, TypeScript, Tailwind CSS
4. Do not add comments to the code
5. Do not remove existing functionality

---

Update `packages/web/components/ChatWindow.tsx` to replace the inline-summary with BottomSheet + SummaryView.

```
Update the file packages/web/components/ChatWindow.tsx.

Changes:
1. Imports: add BottomSheet, SummaryView
2. New state: isSummaryOpen (boolean, default true)
3. Completion logic:
   - When isFinished=true → isSummaryOpen=true (summary opens automatically)
   - On 10th question: interview ends after 9 answers, 10th question does not wait for an answer
4. Replace inline-summary:
   - Remove the current inline-summary block from ChatWindow (lines ~138-176)
   - Instead: show BottomSheet with SummaryView when isFinished=true
   - BottomSheet wraps SummaryView
   - When BottomSheet is collapsed — chat is hidden behind it (summary covers the entire screen)
   - Handle bar bottom sheet: "Interview Results"
5. Data transformation:
   - allFeedbacks → map to QuestionFeedback[] format (ensure fields match)
6. When bottom sheet is collapsed:
   - Handle bar remains visible at the bottom of the screen
   - Chat is not displayed (summary covers it)
   - User can expand it back

ChatWindow styles:
- Remove conditional rendering of input area / summary
- Chat input area: always visible when !isFinished
- When isFinished: BottomSheet covers the entire screen
```

**Test:** `npm run test` in `packages/web`

---

### Step 5: Update question logic (9 vs 10) — ✅

**Status:** Done

**General rules for the step:**
1. Code must compile without errors (`npm run typecheck` in `packages/web`)
2. Tests must pass (`npm run test` in `packages/web`)
3. Do not remove existing functionality

---

Update the interview completion logic in `ChatWindow.tsx`.

```
Update the file packages/web/components/ChatWindow.tsx.

Changes:
- TOTAL_QUESTIONS remains = 10
- Interview ends when questionCount >= 9 (after 9 answers)
- The 10th question is asked but the user does not answer — summary is shown immediately
- allFeedbacks contains 9 elements (questions 1-9)
- Progress in Header: shows 9/10 → 10/10 upon completion

Logic:
- Send answer to question N → receive nextQuestion (question N+1)
- If N+1 = 10: show the 10th question, but do not wait for an answer, isFinished=true immediately
- If N < 9: normal cycle
```

**Test:** `npm run test` in `packages/web`

---

### Step 6: Update ChatWindow tests — ✅

**Status:** Done

**General rules for the step:**
1. Code must compile without errors (`npm run typecheck` in `packages/web`)
2. Tests must pass (`npm run test` in `packages/web`)

---

Update tests for ChatWindow.

```
Update the file packages/web/components/__tests__/ChatWindow.test.tsx (or create if not present).

Update mocks:
- Add mocks for BottomSheet and SummaryView

Update tests:
- Renders without errors
- Sending an answer calls the API
- Upon completion (9 answers) BottomSheet is shown
- SummaryView receives 9 feedbacks
- BottomSheet toggles between open/closed state
```

**Test:** `npm run test` in `packages/web`

---

### Step 7: Run typecheck and lint — ✅

**Status:** Done

**General rules for the step:**
1. Code must compile without errors (`npm run typecheck` in `packages/web`)
2. Tests must pass (`npm run test` in `packages/web`)

---

```
Run in packages/web:
1. npm run typecheck — check that there are no type errors
2. npm run lint — check that there are no linter errors

If there are errors — fix them.
```

**Test:** All checks pass without errors

---

### Step 8: Run all tests — ✅

**Status:** Done

**General rules for the step:**
1. Code must compile without errors (`npm run typecheck` in `packages/web`)
2. Tests must pass (`npm run test` in `packages/web`)

---

```
Run in packages/web:
npm run test

Ensure all tests pass.
If there are failures — fix the tests or the code.
```

**Test:** All tests pass

---

### Step 9: Write report — ✅

**Status:** Done

**General rules for the step:**
1. Code must compile without errors (`npm run typecheck` in `packages/web`)
2. Tests must pass (`npm run test` in `packages/web`)

---

Write a final report on the feature implementation.

```
Create the file docs/reports/2026-06-22-feat-004-summary-view-redesign.md

Contents:
- What was done
- List of modified files
- Test results
- Issues (if any)
- Final status
```

---
