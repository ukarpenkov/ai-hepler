# Commit Convention

The project uses **Conventional Commits**.

## Format

```
<type>(scope): <description>
```

- `scope` — optional context (module, layer, package)
- `description` — brief description in English, lowercase, no period

## Examples

```
feat(auth): add JWT login flow
fix(api): handle null response from server
refactor(db): simplify user query logic
```

## Commit Types

| Type | Purpose |
|------|---------|
| `feat` | new feature |
| `fix` | bug fix |
| `refactor` | code change without behavior change |
| `perf` | performance improvement |
| `test` | adding / modifying tests |
| `docs` | documentation |
| `style` | formatting (no logic changes) |
| `chore` | infrastructure, dependencies, configs |
| `build` | build and bundling |
| `ci` | CI/CD configurations |
