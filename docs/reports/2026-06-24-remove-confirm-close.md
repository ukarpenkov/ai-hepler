# 2026-06-24 — Remove confirm dialog on session close

## Goal

Session close (the "×" button in Header) happens without confirmation dialog — instant redirect to the main page.

## Problem

When clicking "×", a `confirm("Are you sure you want to end the interview?")` dialog appeared. The user already made a decision when clicking the button — confirmation is redundant.

## Changes

### `packages/web/app/interview/page.tsx`

Removed `confirm()` from `handleClose` — now `router.push("/")` is called directly.

## Verification

- `npm run typecheck` — passed
- `npm run lint` — passed
- `npm run test` — passed