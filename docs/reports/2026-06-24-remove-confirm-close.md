# 2026-06-24 — Remove confirm dialog on session close

## Goal

Закрытие сессии (кнопка «×» в Header) происходит без диалога подтверждения — мгновенный редирект на главную.

## Problem

При нажатии на «×» появлялся `confirm("Вы уверены, что хотите завершить интервью?")`. Пользователь уже принял решение, когда нажал кнопку — подтверждение избыточно.

## Changes

### `packages/web/app/interview/page.tsx`

Удалён `confirm()` из `handleClose` — теперь `router.push("/")` вызывается напрямую.

## Verification

- `npm run typecheck` — passed
- `npm run lint` — passed
- `npm run test` — passed
