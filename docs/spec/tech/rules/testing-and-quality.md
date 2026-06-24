# Testing Rules

## General Principles

- Every PR must pass all checks before merging
- Tests are written in the same language as the project (TypeScript)
- Tests run automatically in CI

---

## 1. Unit Tests

**Framework:** Vitest (or Jest — choose one)

**What gets covered:**
- utilities and helpers — 100%
- agent business logic (parsing, evaluation, generation) — where possible
- input data validation
- data transformation between layers

**What is NOT covered:**
- UI components (covered by integration / E2E tests if needed)
- external API calls (mocked)

**File structure:**

```
src/
  utils/
    parseJob.ts
    parseJob.test.ts    # test next to source
```

**Running:**

```bash
npm run test
```

---

## 2. Type Checking

**Tool:** TypeScript (`tsc`)

**Rule:** the project must compile without type errors.

```bash
npx tsc --noEmit
```

Run before every commit. In CI — mandatory.

---

## 3. Linting

**Tool:** ESLint

**ESLint** — checks for logical errors and code style:
- unused variables
- non-existent imports
- dangerous constructs
- consistency with project rules

**Run:**

```bash
npx eslint . --max-warnings 0
```

**Auto-fix:**

```bash
npx eslint . --fix
```

---

## 4. Pre-commit Check Order

```
1. npm run typecheck     # type checking
2. npm run lint          # linting
3. npm run test          # unit tests
4. git commit
```

All three must pass. If something fails — fix before committing.

---

## 5. Expected package.json Scripts

```json
{
  "scripts": {
    "typecheck": "tsc --noEmit",
    "lint": "eslint . --max-warnings 0",
    "lint:fix": "eslint . --fix",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

---

## 6. CI (GitHub Actions / any system)

Required CI steps:

```yaml
- run: npm run typecheck
- run: npm run lint
- run: npm run test
```

PR cannot be merged until at least one of the steps fails.
