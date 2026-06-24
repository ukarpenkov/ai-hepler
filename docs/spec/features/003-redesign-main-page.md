# Feature: Main Page Redesign

**Date:** 2026-06-21
**Priority:** Medium
**Status:** Open
**Component:** Frontend — UI/UX

---

## Description

Redesign of the main application page based on prototype `docs/design/main.html`. Update the visual style, preserve CSS variables for the design system, add sidebar with session history.

## Current Behavior

- Simple job description input form
- Minimalist design without sidebar
- No session history in UI

## Expected Behavior

### 1. Header
- Logo (gradient box 36×36 + "AI Interview" text)
- Theme toggle (dark/light theme switch)
- Burger menu button (right side) — hides/shows sidebar

### 2. Sidebar (session history)
- Always visible by default (left side)
- Session list: job title + date
- Hover effect (shift + highlight)
- Click on burger menu — hides sidebar, second click — shows

### 3. Main Container
- Centered block (max-width: 800px), shifts right when sidebar is open
- Title "AI Interview Simulator" (gradient text)
- Textarea for pasting job description
- "Start Interview" button (gradient + ripple effect)

### 4. Animations
- `slideUp` — container appearance on load
- `float` — floating background circles (radial gradient)
- Smooth theme switching (~300ms)

### 5. Layout
- Sidebar always visible on left by default (w-80, 320px)
- Main container: margin-left: 320px when sidebar visible, margin-left: 0 when hidden
- Burger menu: right in header, toggle sidebar state

### 6. Responsiveness
- Mobile version (<768px): sidebar hidden by default, burger shows overlay

---

## Design System (CSS Variables)

### Light Theme

| Variable | Value |
|----------|-------|
| `--bg-primary` | `#f5f7fa` |
| `--bg-secondary` | `rgba(255,255,255,0.7)` |
| `--text-primary` | `#1a1a1a` |
| `--text-secondary` | `#6b7280` |
| `--accent` | `#6366f1` |
| `--accent-hover` | `#4f46e5` |
| `--border` | `rgba(255,255,255,0.3)` |
| `--shadow` | `rgba(0,0,0,0.08)` |
| `--glass-bg` | `rgba(255,255,255,0.6)` |

### Dark Theme

| Variable | Value |
|----------|-------|
| `--bg-primary` | `#0f172a` |
| `--bg-secondary` | `rgba(30,41,59,0.7)` |
| `--text-primary` | `#f1f5f9` |
| `--text-secondary` | `#94a3b8` |
| `--accent` | `#818cf8` |
| `--accent-hover` | `#6366f1` |
| `--border` | `rgba(255,255,255,0.1)` |
| `--shadow` | `rgba(0,0,0,0.3)` |
| `--glass-bg` | `rgba(30,41,59,0.6)` |

---

## Technical Implementation

### Tailwind CSS Config

```ts
// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#6366f1",
          hover: "#4f46e5",
          dark: "#818cf8",
        },
        surface: {
          bg: "var(--bg-primary)",
          card: "var(--glass-bg)",
          secondary: "var(--bg-secondary)",
        },
        content: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
        },
      },
      borderRadius: {
        glass: "24px",
        card: "16px",
        button: "16px",
      },
      backdropBlur: {
        glass: "30px",
      },
      boxShadow: {
        glass: "0 20px 60px var(--shadow)",
        button: "0 8px 25px rgba(99,102,241,0.3)",
      },
      animation: {
        "slide-up": "slideUp 0.6s ease",
        float: "float 20s infinite ease-in-out",
      },
      keyframes: {
        slideUp: {
          from: { opacity: "0", transform: "translateY(30px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translate(0,0) scale(1)" },
          "33%": { transform: "translate(30px,-30px) scale(1.1)" },
          "66%": { transform: "translate(-20px,20px) scale(0.9)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
```

### Global Styles

```css
/* app/globals.css */
:root {
  --bg-primary: #f5f7fa;
  --bg-secondary: rgba(255, 255, 255, 0.7);
  --text-primary: #1a1a1a;
  --text-secondary: #6b7280;
  --accent: #6366f1;
  --accent-hover: #4f46e5;
  --border: rgba(255, 255, 255, 0.3);
  --shadow: rgba(0, 0, 0, 0.08);
  --glass-bg: rgba(255, 255, 255, 0.6);
}

[data-theme="dark"] {
  --bg-primary: #0f172a;
  --bg-secondary: rgba(30, 41, 59, 0.7);
  --text-primary: #f1f5f9;
  --text-secondary: #94a3b8;
  --accent: #818cf8;
  --accent-hover: #6366f1;
  --border: rgba(255, 255, 255, 0.1);
  --shadow: rgba(0, 0, 0, 0.3);
  --glass-bg: rgba(30, 41, 59, 0.6);
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  background: var(--bg-primary);
  color: var(--text-primary);
  transition: all 0.3s ease;
}

/* Glass morphism utility */
.glass {
  background: var(--glass-bg);
  backdrop-filter: blur(30px);
  border: 1px solid var(--border);
}
```

---

## Files to Modify

| File | Action |
|------|--------|
| `packages/web/tailwind.config.ts` | Update — add custom colors, animations |
| `packages/web/app/globals.css` | Update — CSS variables for design system |
| `packages/web/app/layout.tsx` | Update — data-theme attribute |
| `packages/web/app/page.tsx` | **Rewrite** — new main page design |
| `packages/web/components/Header.tsx` | **New** — logo + theme toggle + burger |
| `packages/web/components/Sidebar.tsx` | **New** — session history (visible by default) |
| `packages/web/components/ThemeToggle.tsx` | **New** — theme toggle |
| `packages/web/components/BurgerMenu.tsx` | **New** — menu button |
| `packages/web/components/JobInputForm.tsx` | **New** — textarea + "Start" button |
| `packages/web/components/BackgroundEffects.tsx` | **New** — decorative background circles |

---

## Components

### Header.tsx

```tsx
"use client";

import ThemeToggle from "./ThemeToggle";
import BurgerMenu from "./BurgerMenu";

interface HeaderProps {
  onMenuToggle: () => void;
  isMenuOpen: boolean;
}

export default function Header({ onMenuToggle, isMenuOpen }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 glass border-b border-[var(--border)]">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-primary to-pink-500 flex items-center justify-center text-white text-lg shadow-lg shadow-primary/30">
          AI
        </div>
        <span className="text-xl font-semibold text-content-primary">AI Interview</span>
      </div>
      <div className="flex items-center gap-5">
        <ThemeToggle />
        <BurgerMenu isOpen={isMenuOpen} onClick={onMenuToggle} />
      </div>
    </header>
  );
}
```

### Sidebar.tsx

```tsx
"use client";

interface Session {
  id: string;
  title: string;
  date: string;
}

interface SidebarProps {
  isOpen: boolean;
  sessions: Session[];
}

export default function Sidebar({ isOpen, sessions }: SidebarProps) {
  return (
    <aside
      className={`fixed top-0 left-0 w-80 h-screen glass border-r border-[var(--border)] z-[99] pt-[100px] px-5 pb-5 transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-y-auto ${
        isOpen ? "left-0" : "-left-80"
      }`}
    >
      <div className="text-xs font-semibold text-content-secondary uppercase tracking-wider mb-5 px-2.5">
        Session History
      </div>
      <div className="space-y-2">
        {sessions.map((session) => (
          <div
            key={session.id}
            className="p-3.5 px-4 rounded-xl bg-surface-secondary border border-[var(--border)] cursor-pointer transition-all duration-300 hover:bg-primary hover:text-white hover:translate-x-1.5 hover:shadow-lg hover:shadow-primary/30"
          >
            <div className="text-sm font-medium mb-1">{session.title}</div>
            <div className="text-xs text-content-secondary">{session.date}</div>
          </div>
        ))}
      </div>
    </aside>
  );
}
```

### ThemeToggle.tsx

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
    document.documentElement.setAttribute("data-theme", initial);
  }, []);

  const toggle = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.setAttribute("data-theme", next);
  };

  return (
    <button
      onClick={toggle}
      className="relative w-[60px] h-8 rounded-2xl cursor-pointer transition-all duration-300 border border-[var(--border)] glass"
      aria-label="Toggle theme"
    >
      <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-sm transition-all duration-300">
        {theme === "light" ? "☀️" : "🌙"}
      </span>
      <span
        className={`absolute w-[26px] h-[26px] bg-primary rounded-full top-[3px] transition-all duration-300 shadow-lg shadow-primary/40 ${
          theme === "light" ? "left-[3px]" : "left-[31px]"
        }`}
      />
    </button>
  );
}
```

### BurgerMenu.tsx

```tsx
"use client";

interface BurgerMenuProps {
  isOpen: boolean;
  onClick: () => void;
}

export default function BurgerMenu({ isOpen, onClick }: BurgerMenuProps) {
  return (
    <button
      onClick={onClick}
      className={`w-10 h-10 flex flex-col justify-center items-center gap-1.5 rounded-[10px] glass border border-[var(--border)] transition-all duration-300 hover:bg-primary hover:scale-105 ${
        isOpen ? "bg-primary" : ""
      }`}
      aria-label="Toggle menu"
    >
      <span
        className={`w-5 h-0.5 rounded-sm transition-all duration-300 ${
          isOpen ? "bg-white rotate-45 translate-x-[5px] translate-y-[5px]" : "bg-content-primary"
        }`}
      />
      <span
        className={`w-5 h-0.5 rounded-sm transition-all duration-300 ${
          isOpen ? "opacity-0" : "bg-content-primary"
        }`}
      />
      <span
        className={`w-5 h-0.5 rounded-sm transition-all duration-300 ${
          isOpen ? "bg-white -rotate-45 translate-x-[7px] -translate-y-[6px]" : "bg-content-primary"
        }`}
      />
    </button>
  );
}
```

### JobInputForm.tsx

```tsx
"use client";

import { useState } from "react";

interface JobInputFormProps {
  onSubmit: (jobText: string) => void;
}

export default function JobInputForm({ onSubmit }: JobInputFormProps) {
  const [jobText, setJobText] = useState("");

  return (
    <div className="animate-slide-up">
      <h1 className="text-[42px] font-bold text-center mb-10 bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">
        AI Interview Simulator
      </h1>
      <div className="relative mb-8">
        <textarea
          value={jobText}
          onChange={(e) => setJobText(e.target.value)}
          placeholder="Paste job description text..."
          className="w-full min-h-[200px] p-5 bg-surface-secondary border-2 border-[var(--border)] rounded-card text-base font-inherit text-content-primary resize-y transition-all duration-300 glass focus:outline-none focus:border-primary focus:shadow-[0_0_0_4px_rgba(99,102,241,0.1)] focus:-translate-y-0.5"
        />
      </div>
      <button
        onClick={() => onSubmit(jobText)}
        className="w-full py-[18px] bg-gradient-to-r from-primary to-pink-500 text-white border-none rounded-button text-lg font-semibold cursor-pointer transition-all duration-300 shadow-button relative overflow-hidden hover:-translate-y-[3px] hover:shadow-[0_12px_35px_rgba(99,102,241,0.4)] active:-translate-y-px"
      >
        Start Interview
      </button>
    </div>
  );
}
```

### Page Layout (page.tsx)

```tsx
"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import JobInputForm from "@/components/JobInputForm";
import BackgroundEffects from "@/components/BackgroundEffects";

interface Session {
  id: string;
  title: string;
  date: string;
}

export default function HomePage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    fetch("/api/sessions")
      .then((res) => res.json())
      .then(setSessions)
      .catch(() => {});
  }, []);

  const handleStartInterview = (jobText: string) => {
    // TODO: call POST /job/parse then redirect to /interview
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <BackgroundEffects />
      <Header
        isSidebarOpen={isSidebarOpen}
        onMenuToggle={() => setIsSidebarOpen((prev) => !prev)}
      />
      <Sidebar isOpen={isSidebarOpen} sessions={sessions} />
      <main
        className={`pt-[100px] px-5 transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          isSidebarOpen ? "ml-80" : "ml-0"
        }`}
      >
        <div className="max-w-[800px] mx-auto">
          <JobInputForm onSubmit={handleStartInterview} />
        </div>
      </main>
    </div>
  );
}
```

### BackgroundEffects.tsx

```tsx
export default function BackgroundEffects() {
  return (
    <>
      <div className="fixed w-[600px] h-[600px] bg-[radial-gradient(circle,var(--accent)_0%,transparent_70%)] opacity-15 -top-[200px] -right-[200px] rounded-full animate-float pointer-events-none" />
      <div className="fixed w-[500px] h-[500px] bg-[radial-gradient(circle,#ec4899_0%,transparent_70%)] opacity-10 -bottom-[200px] -left-[200px] rounded-full animate-float pointer-events-none [animation-direction:reverse] [animation-duration:25s]" />
    </>
  );
}
```

---

## Acceptance Criteria

- [ ] Header displays with logo, theme toggle and burger menu (right side)
- [ ] Sidebar is visible by default on page load
- [ ] Burger menu hides sidebar, second click shows
- [ ] Sidebar shows session list from API
- [ ] Click on session in sidebar navigates to interview page
- [ ] Main container correctly shifts when sidebar is hidden/shown
- [ ] Theme toggle switches theme (light/dark)
- [ ] Theme choice is saved in localStorage
- [ ] CSS variables for design system are defined in globals.css
- [ ] Tailwind config updated with custom values
- [ ] `slideUp` animation works on load
- [ ] Decorative background elements are displayed
- [ ] Responsive: mobile (<768px) — sidebar hidden by default, burger shows overlay
- [ ] All styles match prototype `docs/design/main.html`

---

## Priorities

| Element | Priority |
|---------|----------|
| CSS variables for design system | **High** |
| Tailwind config | **High** |
| Header component | **High** |
| JobInputForm | **High** |
| ThemeToggle | **High** |
| Sidebar | **Medium** |
| BurgerMenu | **Medium** |
| BackgroundEffects | **Low** |
| Animations | **Low** |

---

## Prototype

Prototype file: `docs/design/main.html`