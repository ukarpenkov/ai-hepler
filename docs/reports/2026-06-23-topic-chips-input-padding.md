# 2026-06-23 — Topic Chips & Input Padding

## Goal

Заменить текстовый формат `[topic] question` на визуальные чипы для тем вопросов, увеличить padding окна ввода сообщений.

## Changes

### `components/MessageBubble.tsx`

- Добавлен опциональный проп `topic?: string`
- Topic рендерится как визуальный чип (`<span>`) над текстом вопроса
- Стили чипа: `rounded-full`, `bg-primary/15`, `text-primary`, `border-primary/20`, `text-xs`

### `components/ChatWindow.tsx`

- Интерфейс `ChatMessage` расширен полем `topic?: string`
- Начальное сообщение и следующий вопрос теперь передают `topic` отдельно от `content` (вместо конкатенации `[${topic}] ${question}`)
- `MessageBubble` получает проп `topic={msg.topic}`
- Padding контейнера ввода: `p-[15px] sm:p-4 md:p-5` → `p-4 sm:p-5 md:p-6`
- Padding textarea: `p-3.5` → `p-4`

### `components/ChatWindow.test.tsx`

- Assertion обновлён: вместо regex `/\[Введение\] Расскажите о себе/` проверяются два отдельных элемента `"Введение"` и `"Расскажите о себе"`

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
- Topic отображается как визуальный чип вместо текста в скобках
- Padding ввода увеличен для лучшей читаемости
