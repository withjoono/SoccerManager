# 🏃‍♂️ Soccer Match Manager - Backend

Express + TypeScript + Firebase Firestore 기반 REST API 서버

---

## 📚 목차

1. [개요](#개요)
2. [기술 스택](#기술-스택)
3. [프로젝트 구조](#프로젝트-구조)
4. [설치 및 실행](#설치-및-실행)
5. [API 문서](#api-문서)
6. [인증 및 권한](#인증-및-권한)
7. [배포](#배포)

---

## 📖 개요

축구/풋살 경기 관리 시스템의 백엔드 API 서버입니다.

### 주요 기능
- 🔐 **인증**: Firebase Authentication + JWT
- 👥 **회원 관리**: CRUD, 팀 배정, 포지션 관리
- ⚽ **경기 관리**: 일정 생성 (단일/반복), 결과 기록
- ✅ **출석 관리**: 일괄 업데이트, 상태 추적
- 🎯 **팀 구성**: 동적 팀 배정, 다중 팀 지원
- 📊 **통계**: 실시간 통계 계산, 리더보드
- 📢 **알림**: FCM 푸시 알림, 공지사항

---

## 🛠 기술 스택

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: Firebase Firestore (NoSQL)
- **Storage**: Firebase Cloud Storage
- **Authentication**: Firebase Authentication
- **Validation**: express-validator
- **Security**: Helmet, CORS

---

## 📂 프로젝트 구조

```
backend/
├── src/
│   ├── config/              # 설정 파일
│   │   └── firebase.ts      # Firebase Admin 초기화
│   ├── controllers/         # 비즈니스 로직
│   │   ├── memberController.ts
│   │   ├── teamController.ts
│   │   ├── matchController.ts
│   │   ├── attendanceController.ts
│   │   ├── teamAssignmentController.ts
│   │   ├── matchEventController.ts
│   │   ├── noticeController.ts
│   │   └── statisticsController.ts
│   ├── middleware/          # 미들웨어
│   │   ├── auth.ts          # JWT 인증
│   │   ├── authorization.ts # RBAC 권한 관리
│   │   ├── validator.ts     # 입력 검증
│   │   └── errorHandler.ts  # 에러 처리
│   ├── routes/              # API 라우트
│   │   ├── memberRoutes.ts
│   │   ├── teamRoutes.ts
│   │   ├── matchRoutes.ts
│   │   ├── attendanceRoutes.ts
│   │   ├── teamAssignmentRoutes.ts
│   │   ├── matchEventRoutes.ts
│   │   ├── noticeRoutes.ts
│   │   └── statisticsRoutes.ts
│   ├── services/            # 서비스 계층
│   │   ├── statisticsService.ts    # 통계 계산
│   │   └── notificationService.ts  # 알림 발송
│   ├── scripts/             # 유틸리티 스크립트
│   │   └── seed.ts          # 데이터베이스 시드
│   ├── types/               # TypeScript 타입
│   │   └── index.ts
│   └── index.ts             # 진입점
├── Dockerfile               # Docker 설정
├── .dockerignore
├── package.json
├── tsconfig.json
└── README.md                # 본 파일
```

---

## 🚀 설치 및 실행

### 1. 사전 요구사항

- Node.js 18+
- npm or yarn
- Firebase 프로젝트 (Firestore, Authentication 활성화)

### 2. 의존성 설치

```bash
npm install
```

### 3. 환경 변수 설정

`.env` 파일 생성:

```env
NODE_ENV=development
PORT=8080

# Firebase (Firebase Console에서 확인)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com

# Storage
STORAGE_BUCKET=your-project-id.appspot.com

# CORS
ALLOWED_ORIGINS=http://localhost:19000,http://localhost:19006
```

**Firebase 서비스 계정 키 가져오기:**
1. Firebase Console > 프로젝트 설정 > 서비스 계정
2. "새 비공개 키 생성" 클릭
3. 다운로드한 JSON 파일에서 값 복사

### 4. 개발 서버 실행

```bash
npm run dev
```

서버가 `http://localhost:8080`에서 실행됩니다.

### 5. 데이터베이스 시드 (선택)

더미 데이터 생성:

```bash
npm run seed
```

생성되는 데이터:
- 팀 3개
- 회원 12명
- 경기 5개 (과거 3개, 미래 2개)
- 출석 기록
- 팀 구성
- 경기 이벤트
- 공지사항 3개
- 통계 자동 계산

---

## 📚 API 문서

### 기본 URL

```
Development: http://localhost:8080/api
Production: https://your-domain.run.app/api
```

### 인증

모든 API 요청에는 JWT 토큰 필요:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

### 엔드포인트

#### 회원 관리

| Method | Endpoint | 설명 | 권한 |
|--------|----------|------|------|
| GET | `/members` | 전체 회원 조회 | 인증 |
| GET | `/members/:id` | 특정 회원 조회 | 인증 |
| POST | `/members` | 회원 생성 | Manager+ |
| PUT | `/members/:id` | 회원 수정 | Manager+ |
| DELETE | `/members/:id` | 회원 삭제 | Manager+ |

#### 경기 관리

| Method | Endpoint | 설명 | 권한 |
|--------|----------|------|------|
| GET | `/matches` | 경기 목록 조회 | 인증 |
| GET | `/matches/:id` | 특정 경기 조회 | 인증 |
| POST | `/matches` | 경기 생성 (단일/반복) | Manager+ |
| PUT | `/matches/:id` | 경기 수정 | Manager+ |
| DELETE | `/matches/:id` | 경기 취소 | Manager+ |

#### 출석 관리

| Method | Endpoint | 설명 | 권한 |
|--------|----------|------|------|
| GET | `/attendances?matchId=xxx` | 출석 목록 조회 | 인증 |
| POST | `/attendances/bulk` | 출석 일괄 업데이트 | Manager+ |
| PUT | `/attendances/:id` | 출석 상태 변경 | 인증 |

#### 통계

| Method | Endpoint | 설명 | 권한 |
|--------|----------|------|------|
| GET | `/statistics` | 전체 통계 조회 | 인증 |
| GET | `/statistics/leaderboard` | 리더보드 | 인증 |
| GET | `/statistics/:memberId` | 특정 회원 통계 | 인증 |
| POST | `/statistics/recalculate` | 전체 재계산 | Admin |

**전체 API 문서:** [BACKEND_DATABASE_DESIGN.md](../BACKEND_DATABASE_DESIGN.md)

---

## 🔐 인증 및 권한

### 역할 (Roles)

```typescript
enum UserRole {
  ADMIN = 'admin',      // 모든 권한
  MANAGER = 'manager',  // 경기, 팀, 회원 관리
  MEMBER = 'member'     // 읽기, 본인 출석 체크
}
```

### Custom Claims 설정

Firebase Authentication Custom Claims에 역할 저장:

```javascript
admin.auth().setCustomUserClaims(uid, {
  role: 'manager',
  memberId: 'member123'
});
```

### 토큰 발급

```bash
# Firebase Admin SDK 사용
const token = await admin.auth().createCustomToken(uid);

# 또는 클라이언트에서 signInWithEmailAndPassword
```

---

## 📦 배포

### Docker

```bash
# 이미지 빌드
docker build -t soccer-backend .

# 컨테이너 실행
docker run -p 8080:8080 \
  -e FIREBASE_PROJECT_ID=xxx \
  -e FIREBASE_PRIVATE_KEY=xxx \
  -e FIREBASE_CLIENT_EMAIL=xxx \
  soccer-backend
```

### Google Cloud Run

```bash
# Cloud Build로 빌드 및 배포
gcloud run deploy soccer-backend \
  --source . \
  --platform managed \
  --region asia-northeast3 \
  --allow-unauthenticated \
  --set-env-vars "NODE_ENV=production,PORT=8080"

# 환경 변수 설정
gcloud run services update soccer-backend \
  --set-env-vars "FIREBASE_PROJECT_ID=xxx,..." \
  --region asia-northeast3
```

### Firestore 보안 규칙 배포

```bash
firebase deploy --only firestore:rules
firebase deploy --only storage
```

---

## 🧪 테스트

### Health Check

```bash
curl http://localhost:8080/health
```

**응답:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2025-12-31T10:00:00.000Z"
}
```

### API 테스트

```bash
# 회원 목록 조회
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:8080/api/members

# 경기 생성
curl -X POST \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"title":"정기 경기","date":"2026-01-08T15:00:00Z","location":"서울 운동장"}' \
     http://localhost:8080/api/matches
```

---

## 🔧 개발 명령어

```bash
# 개발 서버 실행 (hot reload)
npm run dev

# TypeScript 빌드
npm run build

# 프로덕션 실행
npm start

# 데이터베이스 시드
npm run seed

# 프로덕션용 시드
npm run seed:prod

# 배포 (Cloud Run)
npm run deploy
```

---

## 📊 성능 최적화

### 1. Firestore 인덱싱

주요 쿼리 패턴에 대한 복합 인덱스 설정:

```
- members: name (ASC), isActive (ASC)
- matches: date (DESC), status (ASC)
- attendances: matchId (ASC), status (ASC)
- statistics: totalGoals (DESC), totalAssists (DESC)
```

### 2. 배치 처리

- 출석 일괄 업데이트 (Firestore Batch)
- 통계 재계산 (비동기)

### 3. 캐싱 (추후 도입)

- Redis: 자주 조회되는 데이터
- CDN: 정적 자산

---

## 🐛 문제 해결

### Firebase 초기화 오류

```
Error: Could not load the default credentials
```

**해결:**
- 환경 변수 확인
- Firebase 서비스 계정 키 재생성
- `GOOGLE_APPLICATION_CREDENTIALS` 환경 변수 설정

### CORS 오류

```
Access to XMLHttpRequest has been blocked by CORS policy
```

**해결:**
- `ALLOWED_ORIGINS` 환경 변수에 프론트엔드 URL 추가

### 권한 오류 (403 Forbidden)

```
Forbidden: Insufficient permissions
```

**해결:**
- Firebase Custom Claims에 역할 설정 확인
- 토큰 재발급

---

## 📝 관련 문서

- [Backend & Database Design](../BACKEND_DATABASE_DESIGN.md)
- [Implementation Complete](../IMPLEMENTATION_COMPLETE.md)
- [Deployment Guide](../DEPLOYMENT.md)
- [Project README](../README.md)

---

## 🤝 기여

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

## 📄 라이선스

MIT License

---

**Made with ❤️ for Soccer Managers**
