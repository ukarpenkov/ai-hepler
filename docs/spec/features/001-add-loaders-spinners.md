# Feature: Loaders/Spinners for Frontend

**Date:** 2026-06-21
**Priority:** Medium
**Status:** Open
**Component:** Frontend

---

## Description

When sending an answer to an interview and waiting for a response from the LLM (~18 seconds), the user sees no loading indication. The "Submit" button changes text to "...", but there's no visual feedback that the system is working.

## Current Behavior

- "Submit" button → "..." (text changes)
- No loading animation
- No progress indication
- User doesn't understand if the system is working or frozen

## Expected Behavior

### 1. Submitting Answer
- Show **spinner** next to the user's last message
- Show text "Analyzing answer..." or "Evaluating..."
- Block input and submit button

### 2. Generating Question
- Show **typing indicator** (three dots) before new question
- Show text "Generating next question..."

### 3. Parsing Job Description
- On job description upload page, show **full-screen spinner**
- Text: "Analyzing job description..."
- Progress bar (if possible)

### 4. Starting Interview
- When clicking "Start Interview", show **spinner**
- Text: "Preparing questions..."

---

## Technical Details

### Where to Add

| Component | Loader Type | When |
|-----------|-------------|------|
| `ChatWindow.tsx` | Inline spinner + text | `isLoading === true` |
| `JobUpload.tsx` | Full-screen spinner | Form submission |
| `page.tsx` (interview) | Spinner at start | Interview start |

### Implementation Options

**Option 1: CSS-only spinner**
```css
.spinner {
  border: 3px solid #f3f3f3;
  border-top: 3px solid #3498db;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
```

**Option 2: Tailwind animation**
```tsx
<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
```

**Option 3: Dots indicator**
```tsx
<div className="flex gap-1">
  <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
  <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
  <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
</div>
```

---

## Priorities

| Element | Priority | Description |
|---------|----------|-------------|
| Chat input loader | **High** | Main UX - user waits 18 sec |
| Typing indicator | **Medium** | Visual before new question |
| Job upload loader | **Medium** | Parsing ~1.5 sec |
| Start interview loader | **Low** | Fast operation |

---

## Related Files

- `packages/web/components/ChatWindow.tsx` — main location
- `packages/web/components/JobUpload.tsx` — job description upload
- `packages/web/app/interview/page.tsx` — interview start
- `packages/web/app/page.tsx` — main page

---

## Acceptance Criteria

- [ ] Spinner displays when submitting answer
- [ ] Input is blocked during loading
- [ ] Text "Analyzing answer..." is shown
- [ ] Typing indicator before new question
- [ ] Spinner when parsing job description
- [ ] All loaders use unified style
- [ ] No flash of content