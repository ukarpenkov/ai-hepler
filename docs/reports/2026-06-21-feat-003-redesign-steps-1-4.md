# 003-redesign-main-page — Steps 1-4

**Date:** 2026-06-21

## What was done

### Step 1: Tailwind config
- Added custom colors: `primary` (#6366f1, hover #4f46e5, dark #818cf8), `surface` (bg, card, secondary), `content` (primary, secondary)
- Added `borderRadius`: glass (24px), card (16px), button (16px)
- Added `backdropBlur.glass` (30px)
- Added `boxShadow`: glass, button
- Added `animation`: slide-up, float
- Added `keyframes`: slideUp, float

### Step 2: globals.css
- Added CSS variables `:root` for light theme
- Added CSS variables `[data-theme="dark"]` for dark theme
- Added `.glass` utility class

### Step 3: ThemeToggle
- Created component `packages/web/components/ThemeToggle.tsx`
- Theme switching light/dark with localStorage persistence
- Auto-detection of prefers-color-scheme
- Setting data-theme on documentElement
- Created test `ThemeToggle.test.tsx` (3 tests)

### Step 4: BurgerMenu
- Created component `packages/web/components/BurgerMenu.tsx`
- Toggle sidebar with animation to cross icon
- Props: isOpen, onClick
- Created test `BurgerMenu.test.tsx` (3 tests)

## Changed files

| File | Type |
|------|------|
| `packages/web/tailwind.config.ts` | Modified |
| `packages/web/app/globals.css` | Modified |
| `packages/web/components/ThemeToggle.tsx` | Created |
| `packages/web/components/ThemeToggle.test.tsx` | Created |
| `packages/web/components/BurgerMenu.tsx` | Created |
| `packages/web/components/BurgerMenu.test.tsx` | Created |

## Verification results

- `npm run typecheck`: ✅ passes
- `npm run test`: ✅ all new tests pass (6/6)

## Known issues

- `ChatWindow.test.tsx` — pre-existing bug (test expects "Отличный ответ", component renders "Добавьте примеры"). Not related to these changes.

## Final status

✅ Steps 1-4 completed successfully