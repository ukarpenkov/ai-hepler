# Commit Convention

Проект использует **Conventional Commits**.

## Формат

```
<type>(scope): <description>
```

- `scope` — опциональный контекст (модуль, слой, пакет)
- `description` — краткое описание на английском, без заглавной, без точки

## Примеры

```
feat(auth): add JWT login flow
fix(api): handle null response from server
refactor(db): simplify user query logic
```

## Типы коммитов

| Тип | Назначение |
|-----|------------|
| `feat` | новая функциональность |
| `fix` | исправление багов |
| `refactor` | изменение кода без изменения поведения |
| `perf` | улучшение производительности |
| `test` | добавление / изменение тестов |
| `docs` | документация |
| `style` | форматирование (без логики) |
| `chore` | инфраструктура, зависимости, конфиги |
| `build` | сборка и билды |
| `ci` | CI/CD конфигурации |
