# 2026-06-23 — Fix: jobProfile API Mismatch & Chat Error Handling

## Goal

Исправить ошибку "jobProfile is required" при запуске интервью и ошибку "Произошла ошибка" при отправке ответа в чат.

## Problem

Две бага блокировали основной флоу интервью:

1. **Frontend API не передавал данные на бэкенд** — `startInterview()` и `sendAnswer()` в `packages/web/lib/api.ts` игнорировали параметры `sessionData` от вызывающего кода. Бэкенд получал запрос без `jobProfile` и возвращал 400.

2. **Несовпадение типов `ParsedJob`** — фронтенд использовал `{ title, company, seniority, requirements }`, а бэкенд возвращает `{ role, level, skills, keywords, domain }`. Агенты получали `undefined` для ключевых полей.

3. **Race condition с `sessionData`** — данные загружались из IndexedDB асинхронно, но `ChatWindow` инициализировал состояние до их появления,导致 `null` при отправке ответа.

## Changes

### `packages/web/lib/api.ts`

- `startInterview` — добавлен второй параметр `sessionData`, передаёт `jobProfile`, `weakSkills`, `history` в тело запроса
- `sendAnswer` — добавлен третий параметр `sessionData`, передаётся как `sessionData` в JSON

### `packages/web/lib/types.ts`

- `ParsedJob` приведён к единому виду с бэкендом: `{ role, level, skills, keywords, domain }`

### `packages/web/app/page.tsx`

- `s.jobProfile?.title` → `s.jobProfile?.role` (sidebar session title)
- `session.jobProfile?.title` → `session.jobProfile?.role` (fallback topic)

### `packages/web/components/ChatWindow.tsx`

- Добавлен `useEffect` для синхронизации `sessionData` prop с внутренним state
- Добавлен null-guard `!currentSessionData?.jobProfile` в `handleSend`
- Catch-блок теперь логирует ошибку в консоль и показывает конкретное сообщение вместо generic "Произошла ошибка"

## Verification

- `npm run typecheck` — passed
- `npm run lint` — passed
- Ручной тест: вставить вакансию → первый вопрос → отправить ответ → получить оценку и следующий вопрос
