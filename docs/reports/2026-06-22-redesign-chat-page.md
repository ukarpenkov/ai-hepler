# 2026-06-22 — Redesign Chat Page to Match Prototype

## Goal

Redesign the interview chat page to match the `docs/design/chat-page.html` prototype while maintaining style consistency with the main page. Port Header, BurgerMenu, Sidebar and ThemeToggle from the main page.

## Problem

The interview page had simplified markup: `h-screen flex flex-col` with ChatWindow filling the entire screen. Issues included:

1. `body` in `globals.css` has `overflow: hidden` + `display: flex; align-items: center; justify-content: center` — broke chat layout
2. Progress bar was inside ChatWindow, not in the header
3. No Sidebar, close button, or navigation to the main page
4. MessageBubble — plain grey/blue bubbles without avatars
5. Input area — standard textarea without prototype styling

## Changes

### `components/Header.tsx`

- Added optional props: `progress`, `totalQuestions`, `onClose`
- Logo clickable → `router.push("/")`
- Chat close button (×) with hover animation (rotate 90deg, red background)
- Gradient progress bar `from-primary via-purple-500 to-pink-500` + `gradientShift` animation
- Exported as default for main page compatibility

### `components/MessageBubble.tsx`

- Avatars:  (AI, gradient primary→pink),  (USER, gradient emerald)
- Bubbles: user — gradient `from-primary to-pink-500`, assistant — `var(--msg-ai)` with backdrop-blur
- Radii: `rounded-tr-[4px]` for user, `rounded-tl-[4px]` for assistant
- Timestamps (HH:MM) under each message
- `messageIn` appear animation

### `components/ChatWindow.tsx`

- Removed ProgressBar — now in Header via `onProgressChange` callback
- Outer container: `rounded-glass border border-[var(--border)] bg-[var(--chat-bg)] backdrop-blur-glass shadow-glass`
- Input area: glass background, textarea with `--input-bg`, gradient send button (➤)
- Auto-height for textarea
- `min-h-[50px] max-h-[120px]` for textarea

### `app/interview/page.tsx`

- Uses Header (with progress, onClose props), Sidebar, mobile overlay
- Chat — fixed container: `fixed top-[80px] left-5 right-5 bottom-5`
- Sidebar with fetched sessions
- `confirm()` before closing interview

### `app/interview/layout.tsx`

- `useEffect` resets body styles (`overflow: visible`, `display: block`)
- Restores on unmount

### `app/globals.css`

- Added CSS variables in `:root` and `[data-theme="dark"]`:
  - `--chat-bg`, `--msg-ai`, `--msg-user`, `--input-bg`
- Added `@keyframes messageIn` and `@keyframes gradientShift`

### Tests

- `Header.test.tsx` — added `next/navigation` mock
- `MessageBubble.test.tsx` — `self-end`/`self-start` instead of `justify-end`/`justify-start`
- `ChatWindow.test.tsx` — placeholder "Введите ваш ответ...", `onProgressChange` instead of ProgressBar, Enter key instead of button
- `interview/page.test.tsx` — added Header and Sidebar mocks

## Result

- typecheck: pass
- lint: pass
- tests: 52/52 pass
- Chat page looks like the prototype: glass container, avatars, gradient bubbles, progress in header, close button, Sidebar