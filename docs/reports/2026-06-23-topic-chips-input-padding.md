# 2026-06-23 — Topic Chips & Input Padding

## Goal

Replace text format `[topic] question` with visual chips for question topics, increase message input area padding.

## Changes

### `components/MessageBubble.tsx`

- Added optional `topic?: string` prop
- Topic rendered as visual chip (`<span>`) above question text
- Chip styles: `rounded-full`, `bg-primary/15`, `text-primary`, `border-primary/20`, `text-xs`

### `components/ChatWindow.tsx`

- `ChatMessage` interface extended with `topic?: string` field
- Initial message and next question now pass `topic` separately from `content` (instead of concatenating `[${topic}] ${question}`)
- `MessageBubble` receives `topic={msg.topic}` prop
- Input container padding: `p-[15px] sm:p-4 md:p-5` → `p-4 sm:p-5 md:p-6`
- Textarea padding: `p-3.5` → `p-4`

### `components/ChatWindow.test.tsx`

- Assertion updated: instead of regex `/\[Введение\] Расскажите о себе/`, two separate elements `"Введение"` and `"Расскажите о себе"` are checked

## Before / After

```
BEFORE:
[Архитектура навигации (React Navigation, deep links)] Расскажите о...

AFTER:
┌──────────────────────────────────┐
│ А р х и т е к т у р а ...       │  ← chip (rounded-full, bg-primary/15)
│                                  │
│ Расскажите о...                  │  ← question text
└──────────────────────────────────┘
```

## Result

- typecheck: pass
- lint: pass
- tests: 157/157 pass
- Topic displays as visual chip instead of text in parentheses
- Input padding increased for better readability