# 2026-06-24 — Ctrl+Enter submit for job input

## Goal

Отправка формы «Начать интервью» по нажатию Ctrl+Enter (Cmd+Enter на Mac) прямо из textarea, без необходимости кликать кнопку мышкой.

## Problem

После вставки текста вакансии пользователю приходилось каждый раз тянуться за мышкой, чтобы нажать кнопку. Это лишний шаг, особенно когда текст уже вставлен из буфера обмена.

## Changes

### `packages/web/components/JobInputForm.tsx`

Добавлен `onKeyDown` handler на `<textarea>`:

- **Ctrl+Enter** (или Cmd+Enter) при `text.length >= 50` → вызывает `handleSubmit()`
- **Enter** → стандартный перенос строки
- При `isLoading === true` → Ctrl+Enter не отправляет форму

### `docs/spec/features/007-enter-submit-job-input.md`

Создана feature-спека по формату остальных.

## Verification

- `npm run typecheck` — passed
- `npm run lint` — passed
