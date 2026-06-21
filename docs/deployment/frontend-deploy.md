# Деплой фронтенда

## Вариант 1: Vercel

1. Подключи GitHub репозиторий к Vercel
2. Укажи Root Directory: `packages/web`
3. Build Command: `npm run build`
4. Framework Preset: Next.js
5. Добавь переменную окружения:
   - `NEXT_PUBLIC_API_URL` — URL бэкенда на Cloud Run

## Вариант 2: Cloud Run

```bash
cd packages/web

# Сборка Docker образа
docker build -t gcr.io/$PROJECT_ID/interview-sim-frontend .

# Пуш в Container Registry
docker push gcr.io/$PROJECT_ID/interview-sim-frontend

# Деплой на Cloud Run
gcloud run deploy interview-sim-frontend \
  --image gcr.io/$PROJECT_ID/interview-sim-frontend \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --port 3000 \
  --set-secrets "NEXT_PUBLIC_API_URL=next-public-api-url:latest"
```

## Переменные окружения

| Переменная | Описание | Дефолт |
|------------|----------|--------|
| NEXT_PUBLIC_API_URL | URL бэкенда API | http://localhost:3001 |
