# Feature: UI Internationalization (i18n) — RU/EN Language Switcher

**Date:** 2026-06-25
**Priority:** Medium
**Status:** Done
**Component:** Frontend — UI/UX

---

## Description

Add internationalization support to the frontend. All UI strings (buttons, headings, labels, placeholders, errors) are extracted into translation dictionaries. A language switcher dropdown in the header allows toggling between Russian and English. The selected language is persisted in `localStorage`.

## What Was Done

### 1. i18n System

**New files:**

| File | Purpose |
|------|---------|
| `packages/web/lib/i18n.ts` | Translation dictionaries (RU/EN) with typed `Translations` interface |
| `packages/web/lib/i18n-context.tsx` | React Context + `I18nProvider`, reads/writes locale from `localStorage` |
| `packages/web/components/LanguageSwitcher.tsx` | `<select>` dropdown with EN/RU options |
| `packages/web/test-utils.tsx` | `Wrapper` component for tests (wraps with `I18nProvider`) |

### 2. Translated Strings

All hardcoded Russian text was replaced with `t.*` references:

| Component | Strings translated |
|-----------|--------------------|
| `Header.tsx` | `closeChat` |
| `Sidebar.tsx` | `sessionHistory` |
| `JobInputForm.tsx` | `pasteJobTitle`, `pasteJobPlaceholder`, `minChars`, `loading`, `startInterview` |
| `ChatWindow.tsx` | `errorPrefix`, `unknownError`, `answerPlaceholder`, `interviewFinished`, `score`, `interviewResults` |
| `SummaryView.tsx` | `interviewComplete`, `average`, `best`, `worst`, `question`, `yourAnswer`, `strengths`, `weaknesses`, `recommendation`, `answerAnalysis`, `improvedAnswer`, `tips` |
| `FeedbackCard.tsx` | `score`, `strengths`, `weaknesses`, `recommendation`, `answerAnalysis`, `improvedAnswer`, `tips` |
| `ProgressBar.tsx` | `question` |
| `JobUpload.tsx` | `pasteJobPlaceholder`, `minChars`, `loading`, `startInterview` |
| `app/page.tsx` | `newSession`, `error` |
| `app/interview/page.tsx` | `newSession`, `loading` |

### 3. Default Language

- Default locale: **EN**
- SSR fallback: `"en"`
- Persisted in `localStorage` under key `"locale"`

### 4. Layout Integration

`app/layout.tsx` wraps children with `<I18nProvider>`.

### 5. Test Updates

All 17 test files updated to:
- Wrap components with `Wrapper` (I18nProvider)
- Use English strings for assertions (since default is EN)

**Result:** 72/72 tests pass, typecheck clean, lint clean.

---

## Architecture

```
app/layout.tsx
  └── <I18nProvider>
        ├── useI18n() → { locale, setLocale, t }
        │     ├── t.pasteJobTitle   (string)
        │     ├── t.interviewComplete(n)  (function)
        │     └── ...
        ├── <Header>
        │     └── <LanguageSwitcher />  (select dropdown)
        ├── <Sidebar>
        ├── <JobInputForm>
        └── ...
```

## Translation Keys

```typescript
interface Translations {
  newSession: string;
  error: string;
  sessionHistory: string;
  pasteJobTitle: string;
  pasteJobPlaceholder: string;
  minChars: string;
  loading: string;
  startInterview: string;
  score: string;
  interviewResults: string;
  interviewComplete: (n: number) => string;
  average: string;
  best: string;
  worst: string;
  question: string;
  yourAnswer: string;
  strengths: string;
  weaknesses: string;
  recommendation: string;
  answerAnalysis: string;
  improvedAnswer: string;
  tips: string;
  answerPlaceholder: string;
  interviewFinished: string;
  closeChat: string;
  errorPrefix: string;
  unknownError: string;
}
```

---

## Files Modified

| File | Change |
|------|--------|
| `packages/web/lib/i18n.ts` | **New** — translations dictionary |
| `packages/web/lib/i18n-context.tsx` | **New** — React Context + Provider |
| `packages/web/components/LanguageSwitcher.tsx` | **New** — select dropdown |
| `packages/web/test-utils.tsx` | **New** — test wrapper |
| `packages/web/app/layout.tsx` | Wrap with `I18nProvider` |
| `packages/web/components/Header.tsx` | Add `LanguageSwitcher`, use `t.closeChat` |
| `packages/web/components/Sidebar.tsx` | Use `t.sessionHistory` |
| `packages/web/components/JobInputForm.tsx` | Use `t.*` for all strings |
| `packages/web/components/ChatWindow.tsx` | Use `t.*` for all strings |
| `packages/web/components/SummaryView.tsx` | Use `t.*` for all strings |
| `packages/web/components/FeedbackCard.tsx` | Use `t.*` for all strings |
| `packages/web/components/ProgressBar.tsx` | Use `t.question` |
| `packages/web/components/JobUpload.tsx` | Use `t.*` for all strings |
| `packages/web/app/page.tsx` | Use `t.newSession`, `t.error` |
| `packages/web/app/interview/page.tsx` | Use `t.newSession`, `t.loading` |
| `packages/web/components/Header.test.tsx` | Add Wrapper, EN assertions |
| `packages/web/components/Sidebar.test.tsx` | Add Wrapper, EN assertions |
| `packages/web/components/JobInputForm.test.tsx` | Add Wrapper, EN assertions |
| `packages/web/components/ChatWindow.test.tsx` | Add Wrapper, EN assertions |
| `packages/web/components/SummaryView.test.tsx` | Add Wrapper, EN assertions |
| `packages/web/components/FeedbackCard.test.tsx` | Add Wrapper, EN assertions |
| `packages/web/components/ProgressBar.test.tsx` | Add Wrapper, EN assertions |
| `packages/web/components/JobUpload.test.tsx` | Add Wrapper, EN assertions |
| `packages/web/app/__tests__/page.test.tsx` | Add Wrapper |
| `packages/web/app/interview/__tests__/page.test.tsx` | Add Wrapper |

---

## Acceptance Criteria

- [x] All UI strings use `t.*` from i18n context
- [x] Language switcher (dropdown) in header — EN / RU
- [x] Default language: EN
- [x] Language persisted in `localStorage`
- [x] RU translations preserved (not deleted)
- [x] All 17 test files pass (72/72 tests)
- [x] TypeScript typecheck passes
- [x] ESLint passes
