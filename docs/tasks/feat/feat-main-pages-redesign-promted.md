# Prompted: Main page redesign

**Feature:** 003-redesign-main-page


---

## General rules (for each step)

1. Code must compile without errors (`npm run typecheck` in `packages/web`)
1.1. **Prototype:** `C:\JS\ai-helper\ai-interview-simulator\docs\design\main-page.html`
**Status:** In progress
2. Tests must pass (`npm run test` in `packages/web`)
3. Use existing CSS variables from the prototype `docs/design/main-page.html`
4. Follow project conventions: Next.js App Router, TypeScript, Tailwind CSS
5. Do not add comments to the code
6. Do not remove existing functionality
7. After implementation — run tests and write a report in `docs/reports/`

---

## Steps

### Step 1: Update Tailwind config — ✅

**Status:** Done

**General rules for the step:**
1. Code must compile without errors (`npm run typecheck` in `packages/web`)
2. Tests must pass (`npm run test` in `packages/web`)
3. Use existing CSS variables from the prototype `docs/design/main-page.html`
4. Follow project conventions: Next.js App Router, TypeScript, Tailwind CSS
5. Do not add comments to the code
6. Do not remove existing functionality
7. After implementation — run tests and write a report in `docs/reports/`

---

Add custom colors, animations, and keyframes from the prototype `docs/design/main-page.html` to `packages/web/tailwind.config.ts`.

```
Update the file packages/web/tailwind.config.ts.

Add to theme.extend:
- colors: primary (#6366f1, hover #4f46e5, dark #818cf8), surface (bg, card, secondary via CSS variables), content (primary, secondary via CSS variables)
- borderRadius: glass 24px, card 16px, button 16px
- backdropBlur: glass 30px
- boxShadow: glass and button
- animation: slide-up, float
- keyframes: slideUp, float

Preserve existing content and plugins settings.
```

**Test:** `npm run typecheck` in `packages/web`

---

### Step 2: Update globals.css — ✅

**Status:** Done

**General rules for the step:**
1. Code must compile without errors (`npm run typecheck` in `packages/web`)
2. Tests must pass (`npm run test` in `packages/web`)
3. Use existing CSS variables from the prototype `docs/design/main-page.html`
4. Follow project conventions: Next.js App Router, TypeScript, Tailwind CSS
5. Do not add comments to the code
6. Do not remove existing functionality
7. After implementation — run tests and write a report in `docs/reports/`

---

Add CSS variables for the design system in `packages/web/app/globals.css`. Variable values are taken from the prototype `docs/design/main-page.html`.

```
Update the file packages/web/app/globals.css.

Add after @tailwind directives:
- :root with variables for light theme (bg-primary, bg-secondary, text-primary, text-secondary, accent, accent-hover, border, shadow, glass-bg)
- [data-theme="dark"] with variables for dark theme
- body styles (font-family, background, color, transition)
- .glass utility class (background, backdrop-filter, border)

Variable values should be taken from prototype docs/design/main-page.html.
```

**Test:** `npm run typecheck` in `packages/web`

---

### Step 3: Create ThemeToggle component — ✅

**Status:** Done

**General rules for the step:**
1. Code must compile without errors (`npm run typecheck` in `packages/web`)
2. Tests must pass (`npm run test` in `packages/web`)
3. Use existing CSS variables from the prototype `docs/design/main-page.html`
4. Follow project conventions: Next.js App Router, TypeScript, Tailwind CSS
5. Do not add comments to the code
6. Do not remove existing functionality
7. After implementation — run tests and write a report in `docs/reports/`

---

Create component `packages/web/components/ThemeToggle.tsx` for toggling dark/light theme.

```
Create a new file packages/web/components/ThemeToggle.tsx.

Component:
- "use client" directive
- useState for theme ("light" | "dark")
- useEffect: load from localStorage, check prefers-color-scheme, set data-theme on documentElement
- toggle function: switch theme, save to localStorage, update data-theme
- JSX: button with aria-label "Toggle theme", positioned dot (circle), icons ☀️/🌙
- Styles from prototype: w-[60px] h-8 rounded-2xl, glass, border, transition

Create a test packages/web/components/__tests__/ThemeToggle.test.tsx:
- Renders without errors
- Click toggles theme
- Saves to localStorage
```

**Test:** `npm run test` in `packages/web`

---

### Step 4: Create BurgerMenu component — ✅

**Status:** Done

**General rules for the step:**
1. Code must compile without errors (`npm run typecheck` in `packages/web`)
2. Tests must pass (`npm run test` in `packages/web`)
3. Use existing CSS variables from the prototype `docs/design/main-page.html`
4. Follow project conventions: Next.js App Router, TypeScript, Tailwind CSS
5. Do not add comments to the code
6. Do not remove existing functionality
7. After implementation — run tests and write a report in `docs/reports/`

---

Create component `packages/web/components/BurgerMenu.tsx` for sidebar toggle.

```
Create a new file packages/web/components/BurgerMenu.tsx.

Component:
- "use client" directive
- Props: isOpen (boolean), onClick (() => void)
- JSX: button with three span bars
- Animation: when isOpen=true, bars transform into an X (rotate 45/-45, opacity 0 for middle bar)
- Styles from prototype: w-10 h-10, glass, border, gap-1.5, hover:bg-primary hover:scale-105

Create a test packages/web/components/__tests__/BurgerMenu.test.tsx:
- Renders without errors
- Calls onClick on click
- Applies active classes when isOpen=true
```

**Test:** `npm run test` in `packages/web`

---

### Step 5: Create Header component — ✅

**Status:** Done

**General rules for the step:**
1. Code must compile without errors (`npm run typecheck` in `packages/web`)
2. Tests must pass (`npm run test` in `packages/web`)
3. Use existing CSS variables from the prototype `docs/design/main-page.html`
4. Follow project conventions: Next.js App Router, TypeScript, Tailwind CSS
5. Do not add comments to the code
6. Do not remove existing functionality
7. After implementation — run tests and write a report in `docs/reports/`

---

Create component `packages/web/components/Header.tsx` with logo, ThemeToggle, and BurgerMenu.

```
Create a new file packages/web/components/Header.tsx.

Component:
- "use client" directive
- Props: isSidebarOpen (boolean), onMenuToggle (() => void)
- JSX: fixed header (top-0, left-0, right-0, z-50)
  - Left part: logo (gradient box 36x36 with "AI" text + span "AI Interview")
  - Right part: ThemeToggle + BurgerMenu
- Styles from prototype: glass, border-b, px-6 py-4, flex justify-between

Create a test packages/web/components/__tests__/Header.test.tsx:
- Renders without errors
- Displays logo and text
- Contains ThemeToggle and BurgerMenu
```

**Test:** `npm run test` in `packages/web`

---

### Step 6: Create Sidebar component — ✅

**Status:** Done

**General rules for the step:**
1. Code must compile without errors (`npm run typecheck` in `packages/web`)
2. Tests must pass (`npm run test` in `packages/web`)
3. Use existing CSS variables from the prototype `docs/design/main-page.html`
4. Follow project conventions: Next.js App Router, TypeScript, Tailwind CSS
5. Do not add comments to the code
6. Do not remove existing functionality
7. After implementation — run tests and write a report in `docs/reports/`

---

Create component `packages/web/components/Sidebar.tsx` for displaying session history.

```
Create a new file packages/web/components/Sidebar.tsx.

Component:
- "use client" directive
- Interface Session { id: string, title: string, date: string }
- Props: isOpen (boolean), sessions (Session[])
- JSX: aside (fixed, top-0, left-0, w-80, h-screen)
  - Heading "Session History"
  - List of sessions with hover effects
- Visible by default: isOpen=true → left-0, isOpen=false → -left-80
- Styles from prototype: glass, border-r, z-[99], pt-[100px], transition-all

Create a test packages/web/components/__tests__/Sidebar.test.tsx:
- Renders without errors
- Displays list of sessions
- Applies classes based on isOpen
```

**Test:** `npm run test` in `packages/web`

---

### Step 7: Create JobInputForm component — ✅

**Status:** Done

**General rules for the step:**
1. Code must compile without errors (`npm run typecheck` in `packages/web`)
2. Tests must pass (`npm run test` in `packages/web`)
3. Use existing CSS variables from the prototype `docs/design/main-page.html`
4. Follow project conventions: Next.js App Router, TypeScript, Tailwind CSS
5. Do not add comments to the code
6. Do not remove existing functionality
7. After implementation — run tests and write a report in `docs/reports/`

---

Create component `packages/web/components/JobInputForm.tsx` with textarea and button.

```
Create a new file packages/web/components/JobInputForm.tsx.

Component:
- "use client" directive
- Props: onSubmit ((jobText: string) => void), isLoading (boolean)
- State: jobText (string)
- JSX:
  - Heading h1 "AI Interview Simulator" with gradient
  - Textarea with placeholder "Paste job description text..."
  - "Start Interview" button with gradient
- Styles from prototype: animate-slide-up, gradient text, glass textarea, gradient button

Create a test packages/web/components/__tests__/JobInputForm.test.tsx:
- Renders without errors
- Displays heading and textarea
- Calls onSubmit with text when clicking button
- Displays loading state
```

**Test:** `npm run test` in `packages/web`

---

### Step 8: Create BackgroundEffects component — ✅

**Status:** Done

**General rules for the step:**
1. Code must compile without errors (`npm run typecheck` in `packages/web`)
2. Tests must pass (`npm run test` in `packages/web`)
3. Use existing CSS variables from the prototype `docs/design/main-page.html`
4. Follow project conventions: Next.js App Router, TypeScript, Tailwind CSS
5. Do not add comments to the code
6. Do not remove existing functionality
7. After implementation — run tests and write a report in `docs/reports/`

---

Create component `packages/web/components/BackgroundEffects.tsx` for decorative background elements.

```
Create a new file packages/web/components/BackgroundEffects.tsx.

Component:
- "use client" directive is not needed (no hooks)
- JSX: two decorative div elements with radial-gradient
  - First: accent color, top-right, opacity-15, animate-float
  - Second: pink color, bottom-left, opacity-10, reverse animation
- Styles from prototype: fixed, rounded-full, pointer-events-none

Create a test packages/web/components/__tests__/BackgroundEffects.test.tsx:
- Renders without errors
- Contains two decorative elements
```

**Test:** `npm run test` in `packages/web`

---

### Step 9: Update layout.tsx — ✅

**Status:** Done

**General rules for the step:**
1. Code must compile without errors (`npm run typecheck` in `packages/web`)
2. Tests must pass (`npm run test` in `packages/web`)
3. Use existing CSS variables from the prototype `docs/design/main-page.html`
4. Follow project conventions: Next.js App Router, TypeScript, Tailwind CSS
5. Do not add comments to the code
6. Do not remove existing functionality
7. After implementation — run tests and write a report in `docs/reports/`

---

Update `packages/web/app/layout.tsx` to support the data-theme attribute.

```
Update the file packages/web/app/layout.tsx.

Add:
- Script to load theme from localStorage before rendering (to prevent FOUC)
- data-theme attribute on html tag (via dangerouslySetInnerHTML or script)

Import globals.css if not already imported.
```

**Test:** `npm run typecheck` in `packages/web`

---

### Step 10: Rewrite page.tsx — ✅

**Status:** Done

**General rules for the step:**
1. Code must compile without errors (`npm run typecheck` in `packages/web`)
2. Tests must pass (`npm run test` in `packages/web`)
3. Use existing CSS variables from the prototype `docs/design/main-page.html`
4. Follow project conventions: Next.js App Router, TypeScript, Tailwind CSS
5. Do not add comments to the code
6. Do not remove existing functionality
7. After implementation — run tests and write a report in `docs/reports/`

---

Rewrite `packages/web/app/page.tsx` for the new main page design.

```
Rewrite the file packages/web/app/page.tsx.

New code:
- "use client" directive
- Imports: Header, Sidebar, JobInputForm, BackgroundEffects
- State: isSidebarOpen (default true), sessions (Session[])
- useEffect: load sessions from API (fetch /api/sessions)
- handleStartInterview: call parseJob + startInterview, redirect to /interview
- JSX layout:
  - BackgroundEffects
  - Header (isSidebarOpen, onMenuToggle)
  - Sidebar (isOpen, sessions)
  - Main with transition margin-left (ml-80 when sidebar is open)
  - JobInputForm inside main

Preserve existing logic with API calls.
```

**Test:** `npm run test` in `packages/web`

---

### Step 11: Update page.tsx test — ✅

**Status:** Done

**General rules for the step:**
1. Code must compile without errors (`npm run typecheck` in `packages/web`)
2. Tests must pass (`npm run test` in `packages/web`)
3. Use existing CSS variables from the prototype `docs/design/main-page.html`
4. Follow project conventions: Next.js App Router, TypeScript, Tailwind CSS
5. Do not add comments to the code
6. Do not remove existing functionality
7. After implementation — run tests and write a report in `docs/reports/`

---

Update the test `packages/web/app/__tests__/page.test.tsx` for the new design.

```
Update the file packages/web/app/__tests__/page.test.tsx.

Update mocks:
- Add mocks for Header, Sidebar, JobInputForm, BackgroundEffects

Update tests:
- Renders without errors
- Contains Header
- Contains Sidebar
- Contains JobInputForm
- Contains BackgroundEffects
```

**Test:** `npm run test` in `packages/web`

---

### Step 12: Run typecheck and lint — ✅

**Status:** Done

**General rules for the step:**
1. Code must compile without errors (`npm run typecheck` in `packages/web`)
2. Tests must pass (`npm run test` in `packages/web`)
3. Use existing CSS variables from the prototype `docs/design/main-page.html`
4. Follow project conventions: Next.js App Router, TypeScript, Tailwind CSS
5. Do not add comments to the code
6. Do not remove existing functionality
7. After implementation — run tests and write a report in `docs/reports/`

---

Run type check and linter for the entire project.

```
Run in packages/web:
1. npm run typecheck — check that there are no type errors
2. npm run lint — check that there are no linter errors

If there are errors — fix them.
```

**Test:** All checks pass without errors

---

### Step 13: Run all tests — ✅

**Status:** Done

**General rules for the step:**
1. Code must compile without errors (`npm run typecheck` in `packages/web`)
2. Tests must pass (`npm run test` in `packages/web`)
3. Use existing CSS variables from the prototype `docs/design/main-page.html`
4. Follow project conventions: Next.js App Router, TypeScript, Tailwind CSS
5. Do not add comments to the code
6. Do not remove existing functionality
7. After implementation — run tests and write a report in `docs/reports/`

---

Run all project tests and ensure they pass.

```
Run in packages/web:
npm run test

Ensure all tests pass.
If there are failures — fix the tests or the code.
```

**Test:** All tests pass

---

### Step 14: Write report — ✅

**Status:** Done

**General rules for the step:**
1. Code must compile without errors (`npm run typecheck` in `packages/web`)
2. Tests must pass (`npm run test` in `packages/web`)
3. Use existing CSS variables from the prototype `docs/design/main-page.html`
4. Follow project conventions: Next.js App Router, TypeScript, Tailwind CSS
5. Do not add comments to the code
6. Do not remove existing functionality
7. After implementation — run tests and write a report in `docs/reports/`

---

Write a final report on the feature implementation.

```
Create the file docs/reports/2026-06-21-feat-003-redesign-main-page.md

Contents:
- What was done
- List of modified files
- Test results
- Issues (if any)
- Final status
```

---
