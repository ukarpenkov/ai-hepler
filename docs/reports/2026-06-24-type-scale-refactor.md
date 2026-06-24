# 2026-06-24 — Refactor type-scale: unified font scale

## Goal

Align font sizes to a unified type-scale. Fix responsive inversion (mobile > desktop), bring to consistent scale: 18px primary, 16px tags, 15px caption.

## Type Scale

```
15px  — caption, timestamp
16px  — topic tags, labels (mobile)
18px  — primary body (chat, inputs, result sections)
28px  — hero heading
40/56px — display scores (mobile/desktop)
```

## Changes

### `packages/web/components/MessageBubble.tsx`

- Bubble text: `text-[15px]` → `text-lg` (18px)
- Topic tag: `text-xs` → `text-sm` (12→16px)
- Timestamp: `text-[11px]` → `text-[15px]` (11→15px)

### `packages/web/components/ChatWindow.tsx`

- Input textarea: `text-[15px]` → `text-lg` (18px)
- Feedback score label: `text-xs sm:text-sm` → `text-sm sm:text-lg` (14→16/18)
- Feedback tips: `text-xs sm:text-sm` → `text-sm sm:text-lg` (14→16/18)

### `packages/web/components/JobInputForm.tsx`

- Title: `text-[30px]` → `text-[28px]`
- Textarea: `text-base` → `text-lg` (16→18px)
- Button text: `text-base` → `text-lg` (16→18px)

### `packages/web/components/SummaryView.tsx`

- "Интервью завершено": `text-base sm:text-xl` → `text-lg sm:text-xl` (16→18 mobile)
- Big scores: `text-[36px] sm:text-5xl` → `text-[40px] sm:text-[56px]`
- Score labels: `text-[10px] sm:text-sm` → `text-sm sm:text-lg` (10→16/18)
- Question tabs: `text-xs sm:text-sm` → `text-sm sm:text-lg` (12→16/18)
- "Вопрос N/M": `text-[14px] sm:text-lg` → `text-lg` (remove responsive)
- Section headers: `text-sm sm:text-lg` → `text-lg` (remove responsive)
- Section content: `text-sm sm:text-base` → `text-lg` (remove responsive)

## Responsive Fix

Fixed inversion: previously mobile font was larger than desktop. Now:
- Mobile: base size (16-18px)
- Desktop: 18px or larger (for labels/scores via `sm:text-lg`)

## Result

- typecheck: pass
- lint: pass (1 pre-existing warning)
- tests: 69/69 pass
- Unified scale: 15 / 16 / 18 / 28 / 40/56px
- No responsive inversion
- A11y: no sizes < 12px