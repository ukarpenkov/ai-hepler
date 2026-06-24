# 2026-06-24 — Refactor type-scale: единая шкала шрифтов

## Goal

Выровнять размеры шрифтов по единой type-scale. Устранить инверсию responsive (моб > десктоп), привести к консистентной шкале: 18px основной, 16px теги, 15px caption.

## Type Scale

```
15px  — caption, timestamp
16px  — topic tags, labels (mobile)
18px  — primary body (чат, инпуты, секции результатов)
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

Исправлена инверсия: ранее мобильный шрифт был больше десктопного. Теперь:
- Мобильный: базовый размер (16-18px)
- Десктоп: 18px или больше (для labels/scores через `sm:text-lg`)

## Result

- typecheck: pass
- lint: pass (1 pre-existing warning)
- tests: 69/69 pass
- Единая шкала: 15 / 16 / 18 / 28 / 40/56px
- Нет инверсии responsive
- A11y: нет размеров < 12px
