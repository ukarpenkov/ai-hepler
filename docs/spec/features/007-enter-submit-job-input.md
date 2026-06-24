# Feature: Submit form with Ctrl+Enter key

**Date:** 2026-06-24
**Priority:** Low
**Status:** Done
**Component:** Frontend

---

## Description

User is forced to click the "Start Interview" button with the mouse every time after pasting job description text. This is an extra step, especially when the text is already pasted from clipboard.

## Current Behavior

- Text input in `<textarea>`
- Click on "Start Interview" button
- Enter creates a new line in textarea
- No way to submit the form via keyboard

## Expected Behavior

- **Ctrl+Enter** (or Cmd+Enter on Mac) when `text.length >= 50` → calls `handleSubmit()`
- **Enter** → inserts line break (standard textarea behavior)
- **Ctrl+Enter** when `text.length < 50` → does nothing (no error)
- When `isLoading === true` → Ctrl+Enter doesn't submit the form

---

## Technical Details

### Implementation

Added `onKeyDown` handler on `<textarea>` in `JobInputForm.tsx`:

```tsx
onKeyDown={(e) => {
  if (e.key === "Enter" && (e.ctrlKey || e.metaKey) && jobText.length >= 50 && !isLoading) {
    e.preventDefault();
    handleSubmit();
  }
}}
```

### Related Files

- `packages/web/components/JobInputForm.tsx` — component with textarea

---

## Acceptance Criteria

- [x] Ctrl+Enter at >= 50 characters submits the form
- [x] Enter inserts a line break
- [x] Ctrl+Enter at < 50 characters doesn't submit the form
- [x] Ctrl+Enter during loading doesn't submit the form
- [x] typecheck and lint pass without errors