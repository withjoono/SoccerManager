# ⚽ Soccer Match Manager

축구 경기 기록 및 관리 모바일 애플리케이션

실시간으로 출석 체크, 팀 구성, 경기 결과를 기록하고 통계를 확인할 수 있는 종합 풋살/축구 관리 시스템입니다.

---

## 📱 주요 기능

### 1. 🏠 홈
- 📢 공지사항 (중요 공지 강조)
- ⚽ 다음 경기 안내
- 🏆 최근 경기 결과 (최근 3개)

### 2. ➕ 경기 등록
- 규칙적인 경기 일정 등록 (요일 선택)
- 시작/종료 시간 설정
- 경기장 및 메모
- 회원 알림 자동 발송

### 3. ✓ 출석 체크
- 드래그 앤 드롭으로 간편한 출석 체크
- 가나다순 회원 정렬
- 실시간 출석 상태 표시

### 4. 👥 팀 구성
- 출석한 회원만 자동 필터링
- 드래그 앤 드롭으로 팀 배정
- 2개 이상 다중 팀 지원
- 랜덤 배정 및 초기화 기능

### 5. 🏆 경기 결과
- 실시간 스코어 기록
- 골/어시스트 상세 기록
- 자책골, 모름 옵션 지원
- 다음 경기 바로 시작

### 6. 📊 통계 순위
- **경기 결과 탭**: 월/일 필터, 경기 상세 내역
- **개인 순위 탭**: 골/어시스트/출석률/승률 정렬
- 주간/월간/년간 기간 필터

### 7. 👤 회원/팀 관리
- 회원 정보 관리 (이름, 전화번호, 팀, 등번호, 포지션)
- 팀 생성 및 관리
- 포지션별 색상 구분 (FW, MF, DF, GK)

### 8. 🔔 알림
- 경기 등록 알림
- 팀 구성 완료 알림
- 공지사항 알림
- 읽음/안읽음 상태 관리

---

## 🛠 기술 스택

### Frontend (Mobile App)
- **Framework**: React Native + Expo
- **Language**: TypeScript
- **Navigation**: React Navigation (Tab + Stack)
- **UI Libraries**: 
  - react-native-gesture-handler (스와이프 제스처)
  - react-native-draggable-flatlist (드래그 앤 드롭)
  - @react-native-picker/picker (선택 UI)
  - react-native-modal-datetime-picker (날짜/시간 선택)
- **API Client**: Axios
- **Date Utils**: date-fns

### Backend
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Language**: TypeScript
- **Validation**: express-validator
- **Security**: Helmet, CORS

### Database
- **Primary DB**: Firebase Firestore (NoSQL)
- **Storage**: Firebase Cloud Storage
- **Authentication**: Firebase Authentication
- **Push Notifications**: Firebase Cloud Messaging (FCM)

### Deployment
- **Platform**: Google Cloud Platform (GCP)
- **Container**: Docker
- **Backend Service**: Cloud Run
- **Frontend Hosting**: Firebase Hosting (선택)
- **CI/CD**: Cloud Build

---

## 📂 프로젝트 구조

```
Soccer/
├── backend/                    # 백엔드 API 서버
│   ├── src/
│   │   ├── controllers/        # 비즈니스 로직
│   │   ├── routes/             # API 라우트
│   │   ├── middleware/         # 미들웨어 (인증, 검증 등)
│   │   ├── types/              # TypeScript 타입 정의
│   │   ├── config/             # 설정 파일
│   │   ├── scripts/            # 유틸리티 스크립트
│   │   │   └── seed.ts         # 데이터베이스 시드
│   │   └── index.ts            # 진입점
│   ├── Dockerfile              # Docker 이미지 설정
│   ├── package.json
│   └── tsconfig.json
│
├── mobile/                     # React Native 모바일 앱
│   ├── src/
│   │   ├── screens/            # 화면 컴포넌트
│   │   ├── components/         # 재사용 컴포넌트
│   │   ├── services/           # API 서비스
│   │   ├── types/              # TypeScript 타입 정의
│   │   ├── styles/             # 스타일 정의
│   │   └── config/             # 설정 파일
│   ├── App.tsx                 # 진입점
│   ├── app.json                # Expo 설정
│   ├── package.json
│   └── tsconfig.json
│
├── preview/                    # HTML 목업 (UI 프리뷰용)
│   ├── home.html
│   ├── match-form.html
│   ├── attendance.html
│   ├── team-assignment.html
│   ├── match-result.html
│   ├── stats.html
│   ├── members.html
│   ├── notifications.html
│   └── gesture-handler.js      # 스와이프 제스처
│
├── firestore.rules             # Firestore 보안 규칙
├── storage.rules               # Storage 보안 규칙
├── BACKEND_DATABASE_DESIGN.md  # 백엔드/DB 설계 문서
├── DEPLOYMENT.md               # 배포 가이드
├── QUICK_START.md              # 빠른 시작 가이드
└── README.md                   # 프로젝트 개요 (본 파일)
```

---

## 🚀 빠른 시작

### 1. 사전 요구사항
- Node.js 18+
- npm or yarn
- Google Cloud SDK
- Firebase CLI
- Expo CLI (모바일 개발)

### 2. 설치

```bash
# 저장소 클론
git clone https://github.com/yourusername/Soccer.git
cd Soccer

# 백엔드 설치
cd backend
npm install

# 프론트엔드 설치
cd ../mobile
npm install
```

### 3. 환경 설정

#### Backend (.env)
```bash
# backend/.env
NODE_ENV=development
PORT=8080

# Firebase
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email

# Storage
STORAGE_BUCKET=your-bucket-name

# CORS
ALLOWED_ORIGINS=http://localhost:19000,http://localhost:19006
```

#### Mobile (app.json)
```json
{
  "expo": {
    "extra": {
      "apiBaseUrl": "http://localhost:8080/api",
      "firebaseConfig": {
        "apiKey": "your-api-key",
        "authDomain": "your-auth-domain",
        "projectId": "your-project-id"
      }
    }
  }
}
```

### 4. 데이터베이스 시드

```bash
cd backend
npm run seed
```

### 5. 실행

#### Backend
```bash
cd backend
npm run dev
# http://localhost:8080
```

#### Mobile
```bash
cd mobile
npx expo start
# 스캔 QR 코드 또는 에뮬레이터에서 실행
```

#### Preview (HTML 목업)
```bash
# preview 폴더의 HTML 파일을 브라우저에서 열기
open preview/home.html
```

---

## 📚 문서

- [**Backend & Database Design**](./BACKEND_DATABASE_DESIGN.md) - 데이터베이스 구조, API 엔드포인트, 비즈니스 로직
- [**Deployment Guide**](./DEPLOYMENT.md) - Google Cloud 배포 가이드
- [**Quick Start**](./QUICK_START.md) - 로컬 개발 빠른 시작
- [**Backend README**](./backend/README.md) - 백엔드 상세 문서

---

## 🔐 보안

### Firestore 보안 규칙
```bash
# 규칙 배포
firebase deploy --only firestore:rules
```

### Storage 보안 규칙
```bash
# 규칙 배포
firebase deploy --only storage
```

### 역할 기반 접근 제어 (RBAC)
- **Admin**: 모든 권한
- **Manager**: 경기, 팀, 회원 관리
- **Member**: 읽기, 본인 출석 체크

---

## 🧪 테스트

```bash
# 백엔드 테스트
cd backend
npm test

# 프론트엔드 테스트
cd mobile
npm test
```

---

## 📦 배포

### Backend (Cloud Run)
```bash
cd backend
npm run build
gcloud run deploy soccer-backend \
  --source . \
  --platform managed \
  --region asia-northeast3 \
  --allow-unauthenticated
```

### Mobile (Expo EAS Build)
```bash
cd mobile
eas build --platform android
eas build --platform ios
```

---

## 🎨 UI/UX 특징

- **드래그 앤 드롭**: 직관적인 출석 체크 및 팀 구성
- **스와이프 제스처**: 페이지 간 자연스러운 이동
- **실시간 업데이트**: Firestore 실시간 동기화
- **반응형 디자인**: 다양한 화면 크기 지원
- **다크 모드**: 추후 지원 예정

---

## 🤝 기여

기여를 환영합니다! Pull Request를 보내주세요.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 라이선스

MIT License

---

## 📞 문의

프로젝트 관련 문의: [이메일 주소]

Project Link: [https://github.com/yourusername/Soccer](https://github.com/yourusername/Soccer)

---

## 🙏 감사의 말

- React Native 커뮤니티
- Firebase 팀
- Google Cloud Platform
- 모든 오픈소스 기여자들
