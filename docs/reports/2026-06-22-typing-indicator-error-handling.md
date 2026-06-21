# 2026-06-22 — Typing Indicator Animation & Error Handling

## Goal

1. Добавить анимацию индикатора набора текста (typing indicator) в чат — показывать пока ИИ обрабатывает ответ
2. Исправить ошибку 500 на `/interview/answer` — добавить try-catch с логированием в маршруты

## Problem

1. После отправки ответа пользователем и до получения ответа от ИИ — пустое пространство без визуальной обратной связи
2. Маршруты `/interview/start` и `/interview/answer` не имели try-catch вокруг LLM-вызовов — при ошибке API DeepSeek или невалидном JSON от LLM, исключение летело в глобальный error handler Fastify, возвращая безликий `500 Internal Server Error`

## Changes

### `components/TypingIndicator.tsx` (новый)

- Компонент с аватаром ИИ () и bubble содержащим анимированный текст "Typing..."
- Адаптация анимации из `docs/design/typing.html`:
  - `typing` — текст появляется посимвольно через `width: 0 → 6.5ch` с `steps(6, end)`
  - `blink` — мигающий курсор через `border-right` + `border-color: transparent`
- Стили совпадают с MessageBubble: gradient аватар, glass bubble, `messageIn` анимация появления

### `app/globals.css`

- Добавлены `@keyframes typing` и `@keyframes blink` в глобальные стили

### `components/ChatWindow.tsx`

- Импорт `TypingIndicator`
- `{isLoading && <TypingIndicator />}` — рендерится после списка сообщений когда `isLoading === true`

### `src/api/routes/interview.ts`

- **`/interview/start`**: `startInterview()` обёрнут в try-catch, ошибки логируются через `request.log.error(e, "startInterview failed")`
- **`/interview/answer`**: `processAnswer()` обёрнут в try-catch, ошибки логируются через `request.log.error(e, "processAnswer failed")`
- Оба возвращают `{ error: "..." }` с 500 статусом вместо прокидывания в глобальный handler

### `docs/design/summary-view.html` (новый)

- Прототип страницы результатов интервью: статистика (средний/лучший/худший балл), навигация по вопросам, разбор ответа (сильные/слабые стороны, рекомендация, улучшенный ответ, советы)

### `docs/design/typing.html` (новый)

- Прототип анимации typing indicator, использован как источник для CSS-ключей

## Result

- typecheck: pass
- lint: pass
- tests: 158/158 pass
- Typing indicator появляется при ожидании ответа ИИ
- Ошибки LLM теперь логируются с деталями вместо безликого 500
