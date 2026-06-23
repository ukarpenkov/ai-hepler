# 2026-06-23 — Fix: Session History Not Shown on Interview Page

## Goal

Исправить отсутствие истории сессий в сайдбаре на странице интервью.

## Problem

На странице интервью (`/interview`) сайдбар был пустым — история сессий не отображалась, хотя на главной странице всё работало корректно. Две причины:

1. **Неправильный источник данных** — в `interview/page.tsx` сессии загружались из бэкенд API (`fetch(${apiBase}/sessions)`), а не из IndexedDB. Бэкенд не хранит сессии — они хранятся только в браузере через `idb`.

2. **Отсутствует обработчик клика** — в компонент `Sidebar` не передавался проп `onSessionClick`, поэтому клик по сессиям ничего не делал.

## Changes

### `packages/web/app/interview/page.tsx`

- Добавлен импорт `listSessions` из `@/lib/session-store`
- Заменён `fetch(${apiBase}/sessions)` на `listSessions()` с маппингом `{ id, title: jobProfile.role, date }` — аналогично главной странице
- Добавлена функция `handleSessionClick` — загружает сессию из IndexedDB, извлекает последний вопрос из `history`, формирует URL-параметры и выполняет `router.push`
- В `Sidebar` добавлен проп `onSessionClick={handleSessionClick}`

## Verification

- `npm run typecheck` — passed
- `npm run lint` — passed
