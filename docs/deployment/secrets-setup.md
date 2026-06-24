# Creating secrets in Google Cloud

## Step 1: Creating secrets

```bash
# Create secret for OpenRouter API key
echo "YOUR_OPENROUTER_API_KEY" | gcloud secrets create openrouter-api-key --data-file=-

# Create secret for Redis URL (optional)
echo "YOUR_REDIS_URL" | gcloud secrets create redis-url --data-file=-
```

## Step 2: Using secrets in Cloud Run

```bash
gcloud run deploy interview-sim \
  --set-secrets "OPENROUTER_API_KEY=openrouter-api-key:latest" \
  --set-secrets "REDIS_URL=redis-url:latest"
```

## Step 3: Updating secrets

```bash
# Update existing secret
echo "NEW_API_KEY" | gcloud secrets versions add openrouter-api-key --data-file=-
```

## Step 4: Viewing secrets

```bash
# List all secrets
gcloud secrets list

# View secret versions
gcloud secrets versions list openrouter-api-key
```

## Environment Variables

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| OPENROUTER_API_KEY | Yes | OpenRouter API key | - |
| DEEPSEEK_API_KEY | No | DeepSeek API key (fallback) | - |
| REDIS_URL | No | Redis connection URL | redis://localhost:6379 |
| PORT | No | Server port | 3001 |
