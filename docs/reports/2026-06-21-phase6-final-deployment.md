# Финальный деплой — Backend + Frontend на Cloud Run

**Дата:** 2026-06-21
**Статус:** ✅ Успешно

---

## URLs

| Сервис | URL |
|--------|-----|
| **Backend** | https://interview-sim-606232140580.us-central1.run.app |
| **Frontend** | https://interview-sim-frontend-606232140580.us-central1.run.app |

## Параметры деплоя

### Backend

| Параметр | Значение |
|----------|----------|
| Сервис | interview-sim |
| Проект | project-045dea81-cef3-4b7e-a28 |
| Регион | us-central1 |
| Порт | 3001 |
| Память | 512Mi |
| CPU | 1 |
| Secrets | DEEPSEEK_API_KEY |

### Frontend

| Параметр | Значение |
|----------|----------|
| Сервис | interview-sim-frontend |
| Проект | project-045dea81-cef3-4b7e-a28 |
| Регион | us-central1 |
| Порт | 3000 |
| Память | 512Mi |
| CPU | 1 |

## Smoke Test

### Backend

```
POST /job/parse
{
  "text": "Frontend developer React TypeScript 3 years experience"
}

Ответ:
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

### Frontend

```
GET /
Ответ: HTML страница
```

**Статус:** ✅ Pass

## Исправления

- Удалена строка `COPY --from=builder /app/public ./public` из Dockerfile frontend (директория `public` отсутствует)
- Добавлен `.dockerignore` для frontend

## Файлы

- `docs/deployment/backend-url.txt` — URL backend
- `docs/deployment/frontend-url.txt` — URL frontend
- `docs/reports/2026-06-21-phase6-deploy.md` — отчёт backend деплоя
- `docs/reports/2026-06-21-phase6-final-deployment.md` — этот отчёт
- `README.md` — обновлён с URLs деплоя
