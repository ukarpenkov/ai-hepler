# Feature: Dark and Light Theme

**Date:** 2026-06-21
**Priority:** Low
**Status:** Open
**Component:** Frontend — UI/UX

---

## Description

The application only works in light theme. Need to add a dark/light theme toggle with automatic detection of the user's system preferences.

## Current Behavior

- Only light theme
- No theme toggle
- Application doesn't consider `prefers-color-scheme` from OS

## Expected Behavior

### 1. Theme Toggle
- Button/toggle in header or sidebar
- Icons: ☀️ (light) / 🌙 (dark) / 🔄 (auto)
- Position: top right corner or next to logo

### 2. Auto-detection
- On first launch — follow `prefers-color-scheme` from OS
- Save user choice in `localStorage`
- On subsequent launches — use saved setting

### 3. Smooth Switching
- Transition animation between themes (~200ms)
- No flash of unstyled content

---

## Color Palettes

### Light Theme (default)

| Element | Color |
|---------|-------|
| Primary background | `#ffffff` |
| Secondary background | `#f9fafb` |
| Primary text | `#111827` |
| Secondary text | `#6b7280` |
| Accent | `#2563eb` |
| Border | `#e5e7eb` |
| Success | `#16a34a` |
| Error | `#dc2626` |

### Dark Theme

| Element | Color |
|---------|-------|
| Primary background | `#111827` |
| Secondary background | `#1f2937` |
| Primary text | `#f9fafb` |
| Secondary text | `#9ca3af` |
| Accent | `#3b82f6` |
| Border | `#374151` |
| Success | `#22c55e` |
| Error | `#ef4444` |

---

## Technical Implementation

### Option 1: Tailwind CSS (recommended)

```tsx
// next.config.mjs
const config = {
  darkMode: 'class', // or 'media'
};
```

```tsx
// toggle component
<button onClick={() => document.documentElement.classList.toggle('dark')}>
  🌙
</button>
```

```html
<!-- in layout -->
<html class="dark">
```

```css
/* tailwind.config.ts */
darkMode: 'class',
```

```tsx
// usage
<div className="bg-white dark:bg-gray-900 text-black dark:text-white">
```

### Option 2: CSS Custom Properties

```css
:root {
  --bg-primary: #ffffff;
  --text-primary: #111827;
}

.dark {
  --bg-primary: #111827;
  --text-primary: #f9fafb;
}
```

---

## Files to Modify

| File | Change |
|------|--------|
| `tailwind.config.ts` | Add `darkMode: 'class'` |
| `packages/web/app/layout.tsx` | Add `dark` class on load |
| `packages/web/components/ThemeToggle.tsx` | **New** — toggle component |
| `packages/web/components/Header.tsx` | Add ThemeToggle |
| `packages/web/components/ChatWindow.tsx` | Add dark: classes |
| `packages/web/components/MessageBubble.tsx` | Add dark: classes |
| `packages/web/components/FeedbackCard.tsx` | Add dark: classes |
| `packages/web/components/JobUpload.tsx` | Add dark: classes |
| `packages/web/app/page.tsx` | Add dark: classes |
| `packages/web/app/interview/page.tsx` | Add dark: classes |

---

## ThemeToggle Component

```tsx
"use client";

import { useState, useEffect } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const saved = localStorage.getItem("theme") as "light" | "dark" | null;
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial = saved || (systemDark ? "dark" : "light");
    setTheme(initial);
    document.documentElement.classList.toggle("dark", initial === "dark");
  }, []);

  const toggle = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  return (
    <button onClick={toggle} className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700">
      {theme === "light" ? "🌙" : "☀️"}
    </button>
  );
}
```

---

## Acceptance Criteria

- [ ] Theme toggle displays in header
- [ ] Click switches theme
- [ ] Choice is saved in localStorage
- [ ] On page load, saved theme is applied
- [ ] Auto-detection of system theme on first launch
- [ ] Smooth switching animation
- [ ] All components display correctly in both themes
- [ ] No "flash of unstyled content"
- [ ] Same UX in both themes

---

## Priorities

| Element | Priority |
|---------|----------|
| ThemeToggle component | **High** |
| Tailwind dark mode config | **High** |
| ChatWindow theme | **Medium** |
| Other components | **Medium** |
| Transition animation | **Low** |