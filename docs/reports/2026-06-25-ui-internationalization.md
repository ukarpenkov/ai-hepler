# 2026-06-25 — UI Internationalization (i18n) — RU/EN Language Switcher

## Goal

Add frontend internationalization: extract all UI strings into translation dictionaries, add a language switcher (EN/RU dropdown) in the header, persist choice in localStorage.

## Problem

All UI text was hardcoded in Russian. No way to switch language. Non-Russian users couldn't navigate the interface.

## Changes

### 1. `packages/web/lib/i18n.ts` — Translation dictionaries

New file. Typed `Translations` interface with 27 keys. Two dictionaries: `ru` and `en`. Includes both static strings and a function `interviewComplete(n)`.

### 2. `packages/web/lib/i18n-context.tsx` — React Context + Provider

New file. `I18nContext` with `locale`, `setLocale`, `t`. Reads default from `localStorage` (fallback `"en"`). SSR-safe.

### 3. `packages/web/components/LanguageSwitcher.tsx` — Dropdown

New file. `<select>` with EN/RU options. Styled to match header glass design.

### 4. `packages/web/test-utils.tsx` — Test wrapper

New file. Exports `Wrapper` component that wraps children with `I18nProvider`.

### 5. `packages/web/app/layout.tsx` — Provider integration

Wrapped `{children}` with `<I18nProvider>`.

### 6. Component translations (10 files)

| Component | Keys used |
|-----------|-----------|
| `Header.tsx` | `closeChat` + added `LanguageSwitcher` |
| `Sidebar.tsx` | `sessionHistory` |
| `JobInputForm.tsx` | `pasteJobTitle`, `pasteJobPlaceholder`, `minChars`, `loading`, `startInterview` |
| `ChatWindow.tsx` | `errorPrefix`, `unknownError`, `answerPlaceholder`, `interviewFinished`, `score`, `interviewResults` |
| `SummaryView.tsx` | `interviewComplete`, `average`, `best`, `worst`, `question`, `yourAnswer`, `strengths`, `weaknesses`, `recommendation`, `answerAnalysis`, `improvedAnswer`, `tips` |
| `FeedbackCard.tsx` | `score`, `strengths`, `weaknesses`, `recommendation`, `answerAnalysis`, `improvedAnswer`, `tips` |
| `ProgressBar.tsx` | `question` |
| `JobUpload.tsx` | `pasteJobPlaceholder`, `minChars`, `loading`, `startInterview` |
| `app/page.tsx` | `newSession`, `error` |
| `app/interview/page.tsx` | `newSession`, `loading` |

### 7. Test updates (10 files)

All component tests wrapped with `Wrapper`. Assertions updated to English strings (default locale is EN). ChatWindow "finish" tests fixed — now send 5 answers to reach `TOTAL_QUESTIONS=6`.

## Verification

```bash
npm run typecheck   # 0 errors
npm run lint        # 0 warnings
npm run test        # 72/72 (web)
```

## Files changed (26 total)

| File | Change |
|------|--------|
| `packages/web/lib/i18n.ts` | **New** — translation dictionaries |
| `packages/web/lib/i18n-context.tsx` | **New** — React Context + Provider |
| `packages/web/components/LanguageSwitcher.tsx` | **New** — select dropdown |
| `packages/web/test-utils.tsx` | **New** — test wrapper |
| `packages/web/app/layout.tsx` | Wrap with `I18nProvider` |
| `packages/web/components/Header.tsx` | Add `LanguageSwitcher`, `t.closeChat` |
| `packages/web/components/Sidebar.tsx` | `t.sessionHistory` |
| `packages/web/components/JobInputForm.tsx` | All strings via `t.*` |
| `packages/web/components/ChatWindow.tsx` | All strings via `t.*` |
| `packages/web/components/SummaryView.tsx` | All strings via `t.*` |
| `packages/web/components/FeedbackCard.tsx` | All strings via `t.*` |
| `packages/web/components/ProgressBar.tsx` | `t.question` |
| `packages/web/components/JobUpload.tsx` | All strings via `t.*` |
| `packages/web/app/page.tsx` | `t.newSession`, `t.error` |
| `packages/web/app/interview/page.tsx` | `t.newSession`, `t.loading` |
| `docs/spec/features/011-ui-internationalization.md` | **New** — feature spec |
| 10 test files | Wrapper + EN assertions |
