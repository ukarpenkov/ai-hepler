# Деплой Backend на Cloud Run

**Дата:** 2026-06-21
**Статус:** ✅ Успешно

---

## URL сервиса

```
https://interview-sim-606232140580.us-central1.run.app
```

## Параметры деплоя

| Параметр | Значение |
|----------|----------|
| Проект | `project-045dea81-cef3-4b7e-a28` |
| Регион | `us-central1` |
| Платформа | Managed |
| Порт | 3001 |
| Память | 512Mi |
| CPU | 1 |
| Max instances | 10 |
| Auth | Unauthenticated |

## Secrets

| Secret | Env Variable |
|--------|-------------|
| `deepseek-api-key` | `DEEPSEEK_API_KEY` |

Redis не используется (in-memory сессии).

## Smoke Test

**Запрос:**
```json
POST /job/parse
{
  "text": "Frontend developer React TypeScript 3 years experience"
}
```

**Ответ:**
```json
{
  "sessionId": "a6155c51-1550-4a26-ab63-72f3f7d1c7b3",
  "jobProfile": {
    "role": "Frontend developer",
    "level": "middle",
    "skills": ["React", "TypeScript"],
    "keywords": ["frontend", "React", "TypeScript", "3 years experience"],
    "domain": "Technology"
  }
}
```

**Статус:** ✅ Pass

## Файлы

- URL сохранён в `docs/deployment/backend-url.txt`
- Dockerfile — многостадийная сборка (builder + runtime)
- Secrets management через Google Cloud Secret Manager
