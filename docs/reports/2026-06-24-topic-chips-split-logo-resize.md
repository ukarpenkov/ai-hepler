# 2026-06-24 — Topic Chips Split & Logo Resize

## Goal

Split single topic chip into separate chips by commas; increase HireChat logo font size.

## Changes

### `components/MessageBubble.tsx`

- Topic now split by commas: `topic.split(",").map(...)`
- Each topic rendered as separate `<span>` chip
- Chip container: `flex flex-wrap gap-1.5` for wrapping and spacing
- Spaces around topics trimmed via `t.trim()`

### `components/MessageBubble.test.tsx`

- Added test: single chip rendering
- Added test: multiple chips from string `"React, JSX, SCSS"`
- Added test: space trimming `"React , JSX , SCSS"`

### `components/Header.tsx`

- HireChat font size: `text-[1.5rem]` (24px) → `text-[1.875rem]` (30px)

## Before / After

```
BEFORE:
┌──────────────────────────────────┐
│ Архитектура навигации (React..)  │  ← single chip for all topics
│ Расскажите о...                  │
└──────────────────────────────────┘

AFTER:
┌──────────────────────────────────┐
│ Архитектура  React  Navigation  │  ← separate chips
│ Расскажите о...                  │
└──────────────────────────────────┘
```

## Result

- typecheck: pass
- lint: pass
- tests: 157/157 pass
- Topic displays as set of separate chips
- HireChat logo increased by 6px