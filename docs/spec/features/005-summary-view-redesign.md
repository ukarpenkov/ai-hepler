# Feature: Summary view — full-screen bottom sheet

**Date:** 2026-06-22
**Priority:** High
**Status:** Open
**Component:** Frontend — UI/UX

---

## Description

Complete redesign of the summary block (interview results). Current implementation is embedded in `ChatWindow` as an inline block and takes up half the screen along with chat. The new version is a full-screen bottom sheet analogous to Android pull-down menu: summary covers the entire screen, can be collapsed with a drag gesture or click on the handle bar.

**Prototype:** `docs/design/summary-view.html`
**Task file:** `docs/tasks/feat/feat-summary-view-redesign.md`

---

## Current Behavior

- Summary is embedded in `ChatWindow.tsx` as a conditional block (when `isFinished === true`)
- Takes up the lower part of the screen with chat — inconvenient for viewing
- 10th question doesn't appear in summary (after 9 answers interview ends, but summary shows all 10 navigation buttons)
- No ability to collapse/expand summary
- Design differs from prototype `summary-view.html`

---

## Expected Behavior

### 1. Bottom Sheet (main container)

Summary implemented as a **bottom sheet** — panel rising from the bottom:

- **Expanded state (default):** takes full screen (`h-full`), covers chat
- **Collapsed state:** only the handle bar (h-16, ~64px) visible at bottom of screen + title "Interview Results"
- **Switching:**
  - Click on handle bar — toggle (collapse/expand)
  - Drag down > 80px — collapse
  - Drag up > 80px — expand
- **Animation:** `transition-all duration-300 ease-in-out` (smooth slide)
- **Positioning:** `fixed bottom-0 left-0 right-0 z-50`
- **Handle bar:** centered horizontal line (w-12 h-1.5 rounded-full) + title on left

### 2. Summary Content

When interview is completed, summary shows:

#### 2.1 Success Banner
- Gradient background (success colors: `rgba(16,185,129,0.1)` → `rgba(52,211,153,0.1)`)
- Text: "Interview completed! All N questions asked." (where N = number of questions with answers + 1)
- `slideDown` animation on appearance

#### 2.2 Stats Grid (3 cards)
| Card | Value | Text Color |
|------|-------|------------|
| Average Score | Arithmetic mean of scores | Gradient: accent → pink |
| Best | Maximum score | Gradient: success → green |
| Worst | Minimum score | Gradient: danger → red |

- Styles: glass, backdrop-blur(30px), border, rounded-2xl, p-7, text-center
- `slideUp` animation on appearance

#### 2.3 Questions Navigation
- "Question 1" ... "Question N" buttons in a row with `flex-wrap`
- Active button: `bg-accent`, `text-white`
- Hover: `bg-accent`, `translateY(-2px)`, `box-shadow`
- Container: glass, border, rounded-2xl, p-5

#### 2.4 Question Detail Card
For the selected question, a card is displayed:

- **Header:** "Question N / M" + large score (`/10`)
- **Sections:**
  - Strengths — green heading, list
  - Weaknesses — red heading, list
  - Recommendation — accent heading, text
  - Analysis — orange heading, text
  - Improved answer — green heading, pre-wrap text
  - Tips — accent heading, list

### 3. Question Logic (9 vs 10)

- `TOTAL_QUESTIONS = 10`
- Interview ends after **9 answers**
- 10th question is asked but answer is not collected — summary is shown immediately
- Summary contains **9 feedback entries** (questions 1–9)
- Statistics are calculated from 9 questions
- Progress in Header: 9/10 → 10/10 on completion

### 4. Integration with ChatWindow

- When `isFinished === true` → BottomSheet with SummaryView covers entire screen
- Chat input area is hidden behind summary
- Handle bar of bottom sheet is always visible (even in collapsed state)
- When bottom sheet is collapsed — user sees handle bar with title

---

## Design System (CSS Variables)

### Light Theme

| Variable | Value |
|----------|-------|
| `--bg-primary` | `#f5f7fa` |
| `--bg-secondary` | `rgba(255,255,255,0.7)` |
| `--text-primary` | `#1a1a1a` |
| `--text-secondary` | `#6b7280` |
| `--accent` | `#6366f1` |
| `--accent-hover` | `#4f46e5` |
| `--border` | `rgba(255,255,255,0.3)` |
| `--shadow` | `rgba(0,0,0,0.08)` |
| `--glass-bg` | `rgba(255,255,255,0.6)` |
| `--success` | `#10b981` |
| `--success-bg` | `rgba(16,185,129,0.1)` |
| `--danger` | `#ef4444` |
| `--danger-bg` | `rgba(239,68,68,0.1)` |
| `--warning` | `#f59e0b` |
| `--warning-bg` | `rgba(245,158,11,0.1)` |

### Dark Theme

| Variable | Value |
|----------|-------|
| `--bg-primary` | `#0f172a` |
| `--bg-secondary` | `rgba(30,41,59,0.7)` |
| `--text-primary` | `#f1f5f9` |
| `--text-secondary` | `#94a3b8` |
| `--accent` | `#818cf8` |
| `--accent-hover` | `#6366f1` |
| `--border` | `rgba(255,255,255,0.1)` |
| `--shadow` | `rgba(0,0,0,0.3)` |
| `--glass-bg` | `rgba(30,41,59,0.6)` |
| `--success` | `#34d399` |
| `--success-bg` | `rgba(52,211,153,0.1)` |
| `--danger` | `#f87171` |
| `--danger-bg` | `rgba(248,113,113,0.1)` |
| `--warning` | `#fbbf24` |
| `--warning-bg` | `rgba(251,191,36,0.1)` |

---

## Technical Implementation

### Tailwind CSS — new animations

```ts
// tailwind.config.ts — add to theme.extend
animation: {
  "slide-up-bottom-sheet": "slideUpBottomSheet 0.3s ease-in-out",
  "slide-down-bottom-sheet": "slideDownBottomSheet 0.3s ease-in-out",
  "fade-in-overlay": "fadeInOverlay 0.3s ease",
},
keyframes: {
  slideUpBottomSheet: {
    from: { transform: "translateY(100%)" },
    to: { transform: "translateY(0)" },
  },
  slideDownBottomSheet: {
    from: { transform: "translateY(0)" },
    to: { transform: "translateY(100%)" },
  },
  fadeInOverlay: {
    from: { opacity: "0" },
    to: { opacity: "1" },
  },
},
```

### BottomSheet.tsx

```tsx
"use client";

import { useState, useRef, useCallback } from "react";

interface BottomSheetProps {
  isOpen: boolean;
  onToggle: () => void;
  title: string;
  children: React.ReactNode;
}

export default function BottomSheet({ isOpen, onToggle, title, children }: BottomSheetProps) {
  const [isDragging, setIsDragging] = useState(false);
  const dragStartY = useRef(0);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    setIsDragging(true);
    dragStartY.current = e.clientY;
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    const delta = e.clientY - dragStartY.current;
    if (delta > 80) { onToggle(); setIsDragging(false); }
    else if (delta < -80) { onToggle(); setIsDragging(false); }
  }, [isDragging, onToggle]);

  const handlePointerUp = useCallback(() => setIsDragging(false), []);

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${
        isOpen ? "h-full" : "h-16"
      }`}
      style={{ background: "var(--glass-bg)", backdropFilter: "blur(30px)", borderTop: "1px solid var(--border)" }}
    >
      <div
        className="h-16 flex items-center justify-center cursor-grab select-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onClick={onToggle}
      >
        <div className="w-12 h-1.5 rounded-full bg-gray-300" />
        <span className="ml-4 text-sm font-medium">{title}</span>
      </div>
      {isOpen && <div className="overflow-y-auto h-[calc(100%-64px)] p-[30px]">{children}</div>}
    </div>
  );
}
```

### SummaryView.tsx

```tsx
"use client";

import { useState } from "react";

interface QuestionFeedback {
  number: number;
  score: number;
  strengths: string[];
  weaknesses: string[];
  recommendation: string;
  analysis: string;
  improved: string;
  tips: string[];
}

interface SummaryViewProps {
  feedbacks: QuestionFeedback[];
}

export default function SummaryView({ feedbacks }: SummaryViewProps) {
  const [activeQuestion, setActiveQuestion] = useState(1);

  const averageScore = feedbacks.reduce((sum, f) => sum + f.score, 0) / feedbacks.length;
  const bestScore = Math.max(...feedbacks.map((f) => f.score));
  const worstScore = Math.min(...feedbacks.map((f) => f.score));

  const active = feedbacks.find((f) => f.number === activeQuestion) || feedbacks[0];

  return (
    <div>
      {/* Success Banner */}
      <div className="bg-gradient-to-r from-[rgba(16,185,129,0.1)] to-[rgba(52,211,153,0.1)] border border-[rgba(16,185,129,0.3)] rounded-2xl p-5 text-center mb-7">
        <h2 className="text-[var(--success)] text-xl font-semibold">
          Interview completed! All {feedbacks.length + 1} questions asked.
        </h2>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-5 mb-10">
        <div className="glass rounded-[20px] p-7 text-center">
          <div className="text-5xl font-bold bg-gradient-to-br from-[var(--accent)] to-pink-500 bg-clip-text text-transparent mb-2">
            {averageScore.toFixed(1)}
          </div>
          <div className="text-sm text-[var(--text-secondary)] font-medium">Average Score</div>
        </div>
        <div className="glass rounded-[20px] p-7 text-center">
          <div className="text-5xl font-bold bg-gradient-to-br from-[var(--success)] to-green-400 bg-clip-text text-transparent mb-2">
            {bestScore}
          </div>
          <div className="text-sm text-[var(--text-secondary)] font-medium">Best</div>
        </div>
        <div className="glass rounded-[20px] p-7 text-center">
          <div className="text-5xl font-bold bg-gradient-to-br from-[var(--danger)] to-red-400 bg-clip-text text-transparent mb-2">
            {worstScore}
          </div>
          <div className="text-sm text-[var(--text-secondary)] font-medium">Worst</div>
        </div>
      </div>

      {/* Questions Navigation */}
      <div className="flex gap-2.5 flex-wrap p-5 glass border border-[var(--border)] rounded-2xl mb-7">
        {feedbacks.map((f) => (
          <button
            key={f.number}
            onClick={() => setActiveQuestion(f.number)}
            className={`px-5 py-3 rounded-[10px] border border-[var(--border)] text-sm font-medium cursor-pointer transition-all duration-300 ${
              activeQuestion === f.number
                ? "bg-[var(--accent)] text-white shadow-[0_4px_12px_rgba(99,102,241,0.3)]"
                : "bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-[var(--accent)] hover:text-white hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(99,102,241,0.3)]"
            }`}
          >
            Question {f.number}
          </button>
        ))}
      </div>

      {/* Question Detail Card */}
      <div className="glass border border-[var(--border)] rounded-3xl p-10 mb-7">
        <div className="flex justify-between items-center mb-7 pb-5 border-b border-[var(--border)]">
          <div className="text-lg font-semibold text-[var(--text-secondary)]">Question {active.number} / {feedbacks.length}</div>
          <div className="flex items-baseline gap-2">
            <span className="text-7xl font-bold bg-gradient-to-br from-[var(--accent)] to-pink-500 bg-clip-text text-transparent leading-none">
              {active.score}
            </span>
            <span className="text-2xl text-[var(--text-secondary)] font-medium">/ 10</span>
          </div>
        </div>

        {/* Sections: strengths, weaknesses, recommendation, analysis, improved, tips */}
        {/* ... each section with section-title and section-content ... */}
      </div>
    </div>
  );
}
```

---

## Files to Modify

| File | Action |
|------|--------|
| `packages/web/tailwind.config.ts` | Update — add bottom sheet animations |
| `packages/web/components/BottomSheet.tsx` | **New** — universal bottom sheet with drag |
| `packages/web/components/SummaryView.tsx` | **New** — summary design from prototype |
| `packages/web/components/ChatWindow.tsx` | Update — replace inline summary with BottomSheet + SummaryView, 9/10 logic |
| `packages/web/components/__tests__/BottomSheet.test.tsx` | **New** — bottom sheet tests |
| `packages/web/components/__tests__/SummaryView.test.tsx` | **New** — summary view tests |
| `packages/web/components/__tests__/ChatWindow.test.tsx` | Update — tests for new logic |

---

## Acceptance Criteria

- [ ] Summary takes full screen after interview completion
- [ ] Handle bar visible at center top of summary (line + title)
- [ ] Click on handle bar collapses/expands summary
- [ ] Drag down > 80px collapses summary
- [ ] Drag up > 80px expands summary
- [ ] Collapse/expand animation is smooth (300ms)
- [ ] When summary is collapsed, only handle bar with title "Interview Results" is visible
- [ ] Summary contains 9 questions (1–9)
- [ ] Statistics (average/best/worst) calculated from 9 questions
- [ ] Success banner shows correct question count
- [ ] Question navigation works (buttons 1–9)
- [ ] Question card contains all 6 sections (strengths, weaknesses, recommendation, analysis, improved, tips)
- [ ] Design matches prototype `docs/design/summary-view.html`
- [ ] 10th question displays in chat but answer is not collected
- [ ] Progress in Header: 9/10 → 10/10 on completion
- [ ] All tests pass
- [ ] typecheck without errors

---

## Priorities

| Element | Priority |
|---------|----------|
| BottomSheet component (drag + toggle) | **High** |
| SummaryView (design from prototype) | **High** |
| 9/10 question logic | **High** |
| ChatWindow integration | **High** |
| Animations | **Medium** |
| Tests | **Medium** |

---

## Prototype

Prototype file: `docs/design/summary-view.html`