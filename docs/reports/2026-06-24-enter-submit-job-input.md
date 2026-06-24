# 2026-06-24 — Ctrl+Enter submit for job input

## Goal

Submit the "Start Interview" form via Ctrl+Enter (Cmd+Enter on Mac) directly from textarea, without needing to click the button.

## Problem

After pasting job description text, users had to reach for the mouse each time to click the button. This is an extra step, especially when text is already pasted from clipboard.

## Changes

### `packages/web/components/JobInputForm.tsx`

Added `onKeyDown` handler on `<textarea>`:

- **Ctrl+Enter** (or Cmd+Enter) with `text.length >= 50` → calls `handleSubmit()`
- **Enter** → standard line break
- When `isLoading === true` → Ctrl+Enter doesn't submit form

### `docs/spec/features/007-enter-submit-job-input.md`

Created feature spec following the format of existing specs.

## Verification

- `npm run typecheck` — passed
- `npm run lint` — passed