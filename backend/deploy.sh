#!/bin/bash

# Google Cloud Run 배포 스크립트
# 사용법: ./deploy.sh

set -e

echo "🚀 Starting deployment to Google Cloud Run..."

# 프로젝트 ID 설정 (환경변수 또는 기본값)
PROJECT_ID=${GCP_PROJECT_ID:-"your-project-id"}
REGION=${GCP_REGION:-"asia-northeast3"}
SERVICE_NAME="soccer-backend"

echo "📦 Project ID: $PROJECT_ID"
echo "🌏 Region: $REGION"
echo "🔧 Service Name: $SERVICE_NAME"

# 1. Docker 이미지 빌드
echo "🔨 Building Docker image..."
docker build -t gcr.io/$PROJECT_ID/$SERVICE_NAME:latest .

# 2. Container Registry에 푸시
echo "📤 Pushing image to Container Registry..."
docker push gcr.io/$PROJECT_ID/$SERVICE_NAME:latest

# 3. Cloud Run에 배포
echo "🚀 Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image gcr.io/$PROJECT_ID/$SERVICE_NAME:latest \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --project $PROJECT_ID

echo "✅ Deployment completed successfully!"
echo "🌐 Service URL:"
gcloud run services describe $SERVICE_NAME --platform managed --region $REGION --format 'value(status.url)'








