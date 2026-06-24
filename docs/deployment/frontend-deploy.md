# Frontend Deployment

## Option 1: Vercel

1. Connect GitHub repository to Vercel
2. Set Root Directory: `packages/web`
3. Build Command: `npm run build`
4. Framework Preset: Next.js
5. Add environment variable:
   - `NEXT_PUBLIC_API_URL` — Backend URL on Cloud Run

## Option 2: Cloud Run

```bash
cd packages/web

# Build Docker image
docker build -t gcr.io/$PROJECT_ID/interview-sim-frontend .

# Push to Container Registry
docker push gcr.io/$PROJECT_ID/interview-sim-frontend

# Deploy to Cloud Run
gcloud run deploy interview-sim-frontend \
  --image gcr.io/$PROJECT_ID/interview-sim-frontend \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --port 3000 \
  --set-secrets "NEXT_PUBLIC_API_URL=next-public-api-url:latest"
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| NEXT_PUBLIC_API_URL | Backend API URL | http://localhost:3001 |
