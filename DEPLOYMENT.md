# 배포 가이드

축구 경기 기록 앱을 Google Cloud Platform에 배포하는 가이드입니다.

## 📋 사전 준비

### 1. Google Cloud 프로젝트 설정

```bash
# Google Cloud SDK 설치 확인
gcloud --version

# 로그인
gcloud auth login

# 프로젝트 생성
gcloud projects create soccer-manager-project --name="Soccer Manager"

# 프로젝트 설정
gcloud config set project soccer-manager-project

# 필요한 API 활성화
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable firestore.googleapis.com
gcloud services enable storage.googleapis.com
```

### 2. Firebase 설정

1. [Firebase Console](https://console.firebase.google.com/)에 접속
2. 새 프로젝트 생성 또는 기존 GCP 프로젝트 연결
3. Firestore Database 생성 (서울 리전 권장)
4. 서비스 계정 키 생성:
   - 프로젝트 설정 > 서비스 계정
   - 새 비공개 키 생성 (JSON)
   - 키 파일을 안전한 곳에 보관

## 🚀 Backend 배포 (Google Cloud Run)

### 방법 1: 배포 스크립트 사용

```bash
cd backend

# 환경변수 설정
export GCP_PROJECT_ID=soccer-manager-project
export GCP_REGION=asia-northeast3

# 배포 스크립트 실행
chmod +x deploy.sh
./deploy.sh
```

### 방법 2: gcloud 명령어 직접 사용

```bash
cd backend

# Cloud Run에 직접 배포
gcloud run deploy soccer-backend \
  --source . \
  --region asia-northeast3 \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production

# 환경변수 설정 (배포 후)
gcloud run services update soccer-backend \
  --region asia-northeast3 \
  --set-env-vars FIREBASE_PROJECT_ID=soccer-manager-project \
  --set-env-vars ALLOWED_ORIGINS=https://your-app-url
```

### 방법 3: Cloud Build 사용 (CI/CD)

```bash
cd backend

# Cloud Build 트리거 생성
gcloud builds submit --config cloudbuild.yaml
```

### 배포된 서비스 URL 확인

```bash
gcloud run services describe soccer-backend \
  --region asia-northeast3 \
  --format 'value(status.url)'
```

출력 예시: `https://soccer-backend-xxxxx-an.a.run.app`

## 📱 Mobile 앱 배포

### 1. API URL 업데이트

`mobile/src/config/api.ts` 파일에서 프로덕션 URL을 업데이트하세요:

```typescript
export const API_BASE_URL = __DEV__ 
  ? 'http://localhost:8080/api'
  : 'https://soccer-backend-xxxxx-an.a.run.app/api';  // 실제 URL로 변경
```

### 2. Expo 빌드

```bash
cd mobile

# Expo 계정 로그인
npx expo login

# Android 빌드
npx expo build:android

# iOS 빌드 (Mac에서만 가능)
npx expo build:ios
```

빌드가 완료되면 Expo에서 APK/IPA 파일 다운로드 링크를 제공합니다.

### 3. Google Play Store / App Store 배포

생성된 APK/IPA 파일을 각 스토어에 업로드하세요.

#### Android (Google Play)
1. Google Play Console에서 앱 생성
2. APK 업로드
3. 스토어 등록 정보 작성
4. 심사 제출

#### iOS (App Store)
1. Apple Developer Program 가입
2. App Store Connect에서 앱 생성
3. IPA 업로드 (Xcode 또는 Transporter 사용)
4. 심사 제출

## 🔒 보안 설정

### 1. 환경변수 관리

민감한 정보는 절대 코드에 하드코딩하지 마세요. Cloud Run의 환경변수 또는 Secret Manager를 사용하세요:

```bash
# Secret 생성
echo -n "your-firebase-private-key" | \
  gcloud secrets create firebase-private-key --data-file=-

# Cloud Run에 Secret 마운트
gcloud run services update soccer-backend \
  --region asia-northeast3 \
  --update-secrets FIREBASE_PRIVATE_KEY=firebase-private-key:latest
```

### 2. CORS 설정

백엔드의 CORS 설정을 프로덕션 URL만 허용하도록 업데이트:

```bash
gcloud run services update soccer-backend \
  --region asia-northeast3 \
  --set-env-vars ALLOWED_ORIGINS=https://your-app-domain.com
```

### 3. Firestore 보안 규칙

Firebase Console에서 Firestore 보안 규칙을 설정하세요:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 읽기는 모두 허용, 쓰기는 인증된 사용자만
    match /{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## 📊 모니터링

### Cloud Run 로그 확인

```bash
# 최근 로그 보기
gcloud run logs read soccer-backend \
  --region asia-northeast3 \
  --limit 50

# 실시간 로그 스트리밍
gcloud run logs tail soccer-backend \
  --region asia-northeast3
```

### Cloud Console 모니터링

1. [Cloud Console](https://console.cloud.google.com/)에서 Cloud Run 서비스 선택
2. 메트릭 탭에서 요청 수, 응답 시간, 오류율 등 확인
3. 로그 탭에서 상세 로그 확인

## 🔄 업데이트 배포

### Backend 업데이트

```bash
cd backend

# 코드 수정 후
./deploy.sh

# 또는
gcloud run deploy soccer-backend --source .
```

### Mobile 앱 업데이트

```bash
cd mobile

# 버전 업데이트 (app.json)
# "version": "1.0.0" -> "1.0.1"

# 새 빌드 생성
npx expo build:android
npx expo build:ios

# 스토어에 업데이트 제출
```

## 💰 비용 최적화

### Cloud Run
- 요청이 없을 때는 자동으로 0으로 스케일
- 첫 300,000 요청/월은 무료
- CPU 할당 방식: "CPU is only allocated during request processing"으로 설정

### Firestore
- 일일 읽기/쓰기 무료 할당량 있음
- 인덱스 최적화로 읽기 비용 절감

### Cloud Storage
- 이미지는 압축하여 저장
- CDN 사용 고려

## 🐛 문제 해결

### Backend 배포 실패
```bash
# 빌드 로그 확인
gcloud builds log [BUILD_ID]

# 서비스 상태 확인
gcloud run services describe soccer-backend --region asia-northeast3
```

### 연결 오류
- API URL이 올바른지 확인
- CORS 설정 확인
- 네트워크 방화벽 설정 확인

### Firebase 인증 오류
- 서비스 계정 키가 올바른지 확인
- 환경변수가 제대로 설정되었는지 확인

## 📞 지원

문제가 있다면 다음을 확인하세요:
- [Cloud Run 문서](https://cloud.google.com/run/docs)
- [Firebase 문서](https://firebase.google.com/docs)
- [Expo 문서](https://docs.expo.dev/)








