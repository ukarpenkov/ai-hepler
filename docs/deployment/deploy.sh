#!/bin/bash
set -e

PROJECT_ID=$(gcloud config get-value project)
IMAGE="gcr.io/$PROJECT_ID/interview-sim"

echo "Building Docker image..."
docker build -t $IMAGE .

echo "Pushing to Container Registry..."
docker push $IMAGE

echo "Deploying to Cloud Run..."
gcloud run deploy interview-sim \
  --image $IMAGE \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --port 3001 \
  --set-secrets "OPENROUTER_API_KEY=openrouter-api-key:latest"

echo "Getting service URL..."
gcloud run services describe interview-sim --region us-central1 --format 'value(status.url)'
