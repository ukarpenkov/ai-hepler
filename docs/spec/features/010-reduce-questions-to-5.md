# Feature: Сокращение количества вопросов до 5

**Дата:** 2026-06-24
**Приоритет:** Medium
**Статус:** Done
**Компонент:** Frontend (ChatWindow, InterviewPage)

---

## Описание

Ранее интервью содержало 10 вопросов — это слишком много для типичного кандидата. Решено сократить до 5 вопросов.

---

## Что было

- `TOTAL_QUESTIONS = 1` (в ChatWindow) — константа была снижена до 1 для тестов
- Default progress: `{ current: 1, total: 10 }` (в interview/page.tsx)
- UI отображал прогресс вида `1/10`, `2/10` и т.д.

## Что стало

- `TOTAL_QUESTIONS = 6` (в ChatWindow) — внутренний лимит, при котором интервью завершается
- Default progress: `{ current: 1, total: 5 }` (в interview/page.tsx)
- UI отображает прогресс как `1/5`, `2/5`, ... `5/5`

---

## Логика завершения

Файл: `packages/web/components/ChatWindow.tsx`

```
questionCount = 1          → Q1
answer → nextCount = 2     → 2 < 6 → Q2
answer → nextCount = 3     → 3 < 6 → Q3
answer → nextCount = 4     → 4 < 6 → Q4
answer → nextCount = 5     → 5 < 6 → Q5
answer → nextCount = 6     → 6 >= 6 → завершено
```

Итого: **5 вопросов**, 5 ответов. Константа `TOTAL_QUESTIONS = 6` используется как порог завершения.

## Отображение прогресса

Файл: `packages/web/components/ChatWindow.tsx`

```typescript
onProgressChange?.(Math.min(questionCount, TOTAL_QUESTIONS - 1), TOTAL_QUESTIONS - 1);
```

Прогресс считается относительно `TOTAL_QUESTIONS - 1 = 5`, поэтому в Header отображается `5/5`.

---

## Изменённые файлы

| Файл | Изменение |
|------|-----------|
| `packages/web/components/ChatWindow.tsx:15` | `TOTAL_QUESTIONS = 6` (было 1) |
| `packages/web/components/ChatWindow.tsx:142` | Прогресс: `Math.min(questionCount, TOTAL_QUESTIONS - 1) / (TOTAL_QUESTIONS - 1)` |
| `packages/web/app/interview/page.tsx:32` | Default `total: 5` (было 10) |

## Критерии приёмки

- [x] Интервью задаёт ровно 5 вопросов
- [x] UI отображает прогресс 1/5, 2/5, ... 5/5
- [x] После 5-го ответа интервью завершается и показывается SummaryView
- [x] TypeScript check проходит
- [x] ESLint проходит
- [x] Все 157 тестов проходят
