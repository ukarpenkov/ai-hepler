#!/bin/bash
# Deploy AI Interview Simulator to Google Cloud Run
# Usage: bash deploy-cloud-run.sh

set -e

PROJECT_ID="project-045dea81-cef3-4b7e-a28"
REGION="us-central1"
SERVICE_NAME="interview-sim"

echo "=== Setting up Google Cloud project ==="
gcloud config set project "$PROJECT_ID"

echo "=== Enabling required APIs ==="
gcloud services enable run.googleapis.com artifactregistry.googleapis.com cloudbuild.googleapis.com --project="$PROJECT_ID"

echo "=== Loading API key from .env ==="
DEEPSEEK_KEY=$(grep DEEPSEEK_API_KEY .env | cut -d= -f2-)

if [ -z "$DEEPSEEK_KEY" ]; then
  echo "ERROR: DEEPSEEK_API_KEY not found in .env"
  exit 1
fi

echo "=== Creating secret for DeepSeek API key ==="
echo "$DEEPSEEK_KEY" | gcloud secrets create deepseek-api-key --data-file=- --project="$PROJECT_ID" 2>/dev/null || echo "Secret may already exist, continuing..."

echo "=== Deploying to Cloud Run ==="
gcloud run deploy "$SERVICE_NAME" \
  --source . \
  --platform managed \
  --region "$REGION" \
  --allow-unauthenticated \
  --port 3001 \
  --memory 512Mi \
  --cpu 1 \
  --max-instances 10 \
  --set-secrets="DEEPSEEK_API_KEY=deepseek-api-key:latest" \
  --project="$PROJECT_ID"

echo "=== Getting service URL ==="
URL=$(gcloud run services describe "$SERVICE_NAME" --region "$REGION" --format="value(status.url)" --project="$PROJECT_ID")
echo "Service URL: $URL"

echo "=== Saving URL to file ==="
mkdir -p docs/deployment
echo "$URL" > docs/deployment/backend-url.txt
echo "URL saved to docs/deployment/backend-url.txt"

echo "=== Smoke test ==="
curl -X POST "$URL/job/parse" \
  -H "Content-Type: application/json" \
  -d '{"text":"Frontend developer React TypeScript"}'

echo ""
echo "=== Deployment complete! ==="
