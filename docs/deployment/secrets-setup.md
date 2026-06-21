# Создание secrets в Google Cloud

## Шаг 1: Создание secrets

```bash
# Создание secret для API ключа OpenRouter
echo "YOUR_OPENROUTER_API_KEY" | gcloud secrets create openrouter-api-key --data-file=-

# Создание secret для URL Redis (опционально)
echo "YOUR_REDIS_URL" | gcloud secrets create redis-url --data-file=-
```

## Шаг 2: Использование secrets в Cloud Run

```bash
gcloud run deploy interview-sim \
  --set-secrets "OPENROUTER_API_KEY=openrouter-api-key:latest" \
  --set-secrets "REDIS_URL=redis-url:latest"
```

## Шаг 3: Обновление secrets

```bash
# Обновление существующего secret
echo "NEW_API_KEY" | gcloud secrets versions add openrouter-api-key --data-file=-
```

## Шаг 4: Просмотр secrets

```bash
# Список всех secrets
gcloud secrets list

# Просмотр версий secret
gcloud secrets versions list openrouter-api-key
```

## Переменные окружения

| Переменная | Обязательна | Описание | Дефолт |
|------------|-------------|----------|--------|
| OPENROUTER_API_KEY | Да | API ключ OpenRouter | - |
| DEEPSEEK_API_KEY | Нет | API ключ DeepSeek (fallback) | - |
| REDIS_URL | Нет | URL подключения к Redis | redis://localhost:6379 |
| PORT | Нет | Порт сервера | 3001 |
