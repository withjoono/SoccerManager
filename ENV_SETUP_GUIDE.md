# 환경 변수 설정 가이드

이 문서는 프로젝트의 환경 변수 설정 방법을 안내합니다.

## 📋 목차

1. [Backend 환경 변수 설정](#backend-환경-변수-설정)
2. [Chatbot 환경 변수 설정](#chatbot-환경-변수-설정)
3. [Mobile 환경 변수 설정](#mobile-환경-변수-설정)
4. [Firebase 설정](#firebase-설정)
5. [카카오 채널 설정](#카카오-채널-설정)

---

## Backend 환경 변수 설정

### 1. Firebase 서비스 계정 키 발급

1. [Firebase Console](https://console.firebase.google.com/) 접속
2. 프로젝트 선택
3. **⚙️ 프로젝트 설정** → **서비스 계정** 탭
4. **새 비공개 키 생성** 클릭
5. JSON 파일 다운로드 (안전한 곳에 보관)

### 2. Backend .env 파일 설정

```bash
cd backend
cp .env.example .env
```

다운로드한 Firebase JSON 파일의 내용을 `.env` 파일에 입력:

```env
PORT=8080
NODE_ENV=development

# Firebase JSON 파일의 내용 복사
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=abc123...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBA...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=123456789
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40your-project.iam.gserviceaccount.com

# 로컬 개발 시
ALLOWED_ORIGINS=http://localhost:19006,http://localhost:8081

# 프로덕션 배포 시 (실제 도메인으로 변경)
# ALLOWED_ORIGINS=https://your-app.com,https://chatbot.your-app.com
```

### 3. Cloud Run 환경 변수 설정

Cloud Run에 배포 시 Secret Manager 사용 권장:

```bash
# Secret 생성
gcloud secrets create firebase-config --data-file=path/to/serviceAccountKey.json

# Cloud Run에 Secret 연결
gcloud run deploy soccer-backend \
  --set-secrets=FIREBASE_CONFIG=firebase-config:latest \
  --set-env-vars="PORT=8080,NODE_ENV=production,ALLOWED_ORIGINS=https://your-app.com"
```

---

## Chatbot 환경 변수 설정

### 1. 카카오 채널 접근 토큰 발급

[카카오 채널 설정](#카카오-채널-설정) 섹션 참조

### 2. Chatbot .env 파일 설정

```bash
cd chatbot
cp .env.example .env
```

`.env` 파일 수정:

```env
PORT=8081
NODE_ENV=development

# 로컬 개발 시
BACKEND_API_URL=http://localhost:8080

# 프로덕션 배포 시 (백엔드 Cloud Run URL로 변경)
# BACKEND_API_URL=https://soccer-backend-xxxxx-an.a.run.app

# 카카오 i Open Builder에서 발급받은 토큰
KAKAO_CHANNEL_ACCESS_TOKEN=your_access_token_here
```

### 3. Cloud Run 환경 변수 설정

```bash
gcloud run deploy soccer-chatbot \
  --set-env-vars="PORT=8081,NODE_ENV=production,BACKEND_API_URL=https://soccer-backend-xxxxx-an.a.run.app,KAKAO_CHANNEL_ACCESS_TOKEN=your_token"
```

---

## Mobile 환경 변수 설정

### 1. API 설정 파일 수정

`mobile/src/config/api.ts` 파일:

```typescript
const API_BASE_URL = __DEV__
  ? 'http://localhost:8080'  // 로컬 개발
  : 'https://soccer-backend-xxxxx-an.a.run.app';  // 프로덕션

export const API_CONFIG = {
  baseURL: `${API_BASE_URL}/api`,
  timeout: 10000,
};
```

### 2. Firebase 설정

`mobile/src/config/firebase.ts` 파일에 Firebase 웹 설정 추가:

```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
```

Firebase 웹 설정은 [Firebase Console](https://console.firebase.google.com/) → **프로젝트 설정** → **일반** 탭에서 확인 가능

---

## Firebase 설정

### 1. Firestore 데이터베이스 생성

1. Firebase Console → **Firestore Database**
2. **데이터베이스 만들기** 클릭
3. **프로덕션 모드**로 시작 (보안 규칙 적용)
4. 위치 선택 (예: `asia-northeast3` - 서울)

### 2. 보안 규칙 적용

프로젝트 루트의 `firestore.rules` 파일을 Firebase에 배포:

```bash
firebase deploy --only firestore:rules
```

### 3. Storage 설정

1. Firebase Console → **Storage**
2. **시작하기** 클릭
3. 보안 규칙 선택 후 위치 설정

`storage.rules` 파일 배포:

```bash
firebase deploy --only storage
```

### 4. Authentication 설정

1. Firebase Console → **Authentication**
2. **시작하기** 클릭
3. 로그인 방법 설정:
   - **이메일/비밀번호** 사용 설정
   - **Google** 로그인 (선택사항)
   - **전화번호** 로그인 (선택사항)

---

## 카카오 채널 설정

### 1. 카카오 비즈니스 채널 생성

1. [카카오 비즈니스](https://business.kakao.com/) 접속
2. **채널 만들기** 클릭
3. 채널 정보 입력 (이름, 프로필 사진 등)
4. 채널 생성 완료

### 2. Kakao i Open Builder 설정

1. [Kakao i Open Builder](https://i.kakao.com/) 접속
2. **봇 만들기** 클릭
3. 봇 정보 입력
4. **설정** → **채널 연결**에서 위에서 만든 채널 연결

### 3. 스킬 서버 등록

1. **스킬** 탭 → **스킬 추가** 클릭
2. URL 입력: `https://soccer-chatbot-xxxxx-an.a.run.app/webhook`
3. 각 스킬(경기 조회, 통계 조회 등) 생성 및 URL 연결

### 4. 시나리오 구성

1. **시나리오** 탭에서 대화 흐름 구성
2. 사용자 발화 예시 등록
3. 각 발화에 해당하는 스킬 연결

### 5. 채널 배포

1. **배포** 탭에서 테스트 후 배포
2. 카카오톡에서 채널 검색하여 친구 추가

---

## 🔒 보안 주의사항

### 절대 Git에 커밋하지 말 것

- `.env` 파일
- Firebase 서비스 계정 JSON 파일
- API 키, 토큰 등 민감한 정보

### .gitignore 확인

```gitignore
# 환경 변수
.env
.env.local
*.env
!.env.example

# Firebase
serviceAccountKey.json
*-firebase-adminsdk-*.json

# 로그
*.log
npm-debug.log*
```

### Secret 관리

- **로컬 개발**: `.env` 파일 사용
- **프로덕션**: Google Cloud Secret Manager 사용
- **팀 공유**: 안전한 비밀번호 관리자 사용 (1Password, LastPass 등)

---

## 🚀 빠른 시작

### 전체 환경 설정 체크리스트

- [ ] Firebase 프로젝트 생성
- [ ] Firebase 서비스 계정 키 다운로드
- [ ] `backend/.env` 파일 설정
- [ ] `chatbot/.env` 파일 설정
- [ ] `mobile/src/config/api.ts` 수정
- [ ] `mobile/src/config/firebase.ts` 설정
- [ ] Firestore 보안 규칙 배포
- [ ] Storage 보안 규칙 배포
- [ ] 카카오 채널 생성 및 연결
- [ ] 카카오 스킬 서버 등록
- [ ] 로컬 테스트
- [ ] 프로덕션 배포

---

## 🆘 문제 해결

### Backend 연결 오류

```bash
# 환경 변수 확인
cd backend
cat .env

# Firebase 연결 테스트
npm run dev
curl http://localhost:8080/health
```

### Chatbot 연결 오류

```bash
# 백엔드 URL 확인
cd chatbot
cat .env | grep BACKEND_API_URL

# Chatbot 서버 테스트
npm run dev
curl http://localhost:8081/health
```

### Firebase 권한 오류

- Firebase Console에서 서비스 계정 권한 확인
- **편집자** 또는 **소유자** 역할 필요
- API 활성화 확인 (Firestore API, Cloud Storage API 등)

---

## 📚 참고 자료

- [Firebase 문서](https://firebase.google.com/docs)
- [Google Cloud Secret Manager](https://cloud.google.com/secret-manager/docs)
- [Kakao i Open Builder 가이드](https://i.kakao.com/docs)
- [Cloud Run 환경 변수 설정](https://cloud.google.com/run/docs/configuring/environment-variables)






