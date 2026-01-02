# 빠른 시작 가이드

개발 환경에서 축구 경기 기록 앱을 실행하는 가이드입니다.

## 🚀 5분 안에 시작하기

### 1단계: 프로젝트 클론 및 설치

```bash
# 프로젝트 폴더로 이동 (이미 클론된 상태라고 가정)
cd Soccer

# Backend 설치
cd backend
npm install

# Mobile 설치
cd ../mobile
npm install
```

### 2단계: Firebase 설정 (개발용)

개발 환경에서는 Firebase Emulator를 사용할 수도 있지만, 간단하게 실제 Firebase를 설정하겠습니다:

1. [Firebase Console](https://console.firebase.google.com/) 접속
2. 새 프로젝트 생성
3. Firestore Database 생성 (테스트 모드로 시작)
4. 프로젝트 설정 > 서비스 계정 > Firebase Admin SDK > 새 비공개 키 생성

### 3단계: Backend 환경변수 설정

```bash
cd backend
cp .env.example .env
```

`.env` 파일 수정:

```env
PORT=8080
NODE_ENV=development
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_PRIVATE_KEY="your-private-key"
ALLOWED_ORIGINS=http://localhost:19006,exp://localhost:19000
```

**간단한 방법 (개발용):**
환경변수를 설정하지 않으면 자동으로 기본 인증을 사용합니다.

### 4단계: Backend 실행

```bash
cd backend
npm run dev
```

서버가 `http://localhost:8080`에서 실행됩니다.

### 5단계: Mobile 앱 실행

새 터미널을 열고:

```bash
cd mobile
npm start
```

그러면 Expo 개발 서버가 시작되고 QR 코드가 표시됩니다.

**실행 옵션:**
- `a` - Android 에뮬레이터에서 실행
- `i` - iOS 시뮬레이터에서 실행 (Mac만 가능)
- `w` - 웹 브라우저에서 실행
- Expo Go 앱으로 QR 코드 스캔 (실제 디바이스)

## 📱 Expo Go로 실제 디바이스에서 테스트

1. 스마트폰에 Expo Go 앱 설치
   - [Android](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - [iOS](https://apps.apple.com/app/expo-go/id982107779)

2. 같은 Wi-Fi 네트워크에 연결

3. Expo Go 앱에서 QR 코드 스캔

4. **중요:** 실제 디바이스에서는 `localhost` 대신 컴퓨터의 IP 주소 사용

`mobile/src/config/api.ts` 파일 수정:

```typescript
export const API_BASE_URL = __DEV__ 
  ? 'http://192.168.x.x:8080/api'  // 컴퓨터의 IP 주소로 변경
  : 'https://your-cloud-run-url/api';
```

컴퓨터 IP 확인:
- Windows: `ipconfig`
- Mac/Linux: `ifconfig` 또는 `ip addr`

## 🎯 첫 데이터 추가하기

### 1. 회원 추가

앱을 실행하고:
1. 하단의 "회원" 탭 클릭
2. 우측 하단의 `+` 버튼 클릭
3. 회원 정보 입력
4. "추가하기" 버튼 클릭

몇 명의 회원을 더 추가해보세요!

### 2. 경기 생성

1. 하단의 "홈" 탭 클릭
2. 우측 하단의 `+` 버튼 클릭
3. 경기 날짜와 장소 입력
4. "경기 생성" 버튼 클릭

### 3. 출석 체크 (드래그 앤 드롭!)

1. 생성한 경기 카드 클릭
2. "출석 체크" 버튼 클릭
3. 회원 카드를 길게 눌러서 드래그하거나
4. 우측의 체크/X 버튼으로 출석/결석 표시
5. "저장하기" 버튼 클릭

### 4. 팀 구성 (드래그 앤 드롭!)

1. 경기 상세에서 "팀 구성" 버튼 클릭
2. 출석한 회원들이 표시됩니다
3. 회원을 드래그해서 A팀/B팀으로 배정하거나
4. "랜덤 배정" 버튼으로 자동 배정
5. "저장하기" 버튼 클릭

### 5. 통계 확인

1. 하단의 "통계" 탭 클릭
2. 순위와 개인 통계 확인

## 🔧 문제 해결

### Backend가 시작되지 않을 때

```bash
# 포트가 이미 사용 중인지 확인
# Windows
netstat -ano | findstr :8080

# Mac/Linux
lsof -i :8080

# 다른 포트 사용
PORT=3000 npm run dev
```

### Mobile 앱이 Backend에 연결되지 않을 때

1. Backend가 실행 중인지 확인
2. `http://localhost:8080/health` 접속해서 서버 응답 확인
3. Mobile 앱의 API URL 확인 (`mobile/src/config/api.ts`)
4. CORS 설정 확인 (Backend `.env`의 `ALLOWED_ORIGINS`)

### Firestore 연결 오류

1. Firebase 프로젝트가 생성되었는지 확인
2. Firestore Database가 활성화되었는지 확인
3. 서비스 계정 키가 올바른지 확인
4. 개발 모드에서는 환경변수 없이도 실행 가능 (기본 인증 사용)

### 드래그 앤 드롭이 작동하지 않을 때

1. 회원 카드를 **길게** 누르고 있어야 합니다 (1초 정도)
2. 또는 우측의 버튼을 사용하세요
3. iOS 시뮬레이터에서는 클릭+드래그로 작동

## 🎓 더 알아보기

- Backend API 문서: `backend/README.md`
- Mobile 앱 가이드: `mobile/README.md`
- 배포 가이드: `DEPLOYMENT.md`
- 메인 README: `README.md`

## 💡 개발 팁

### Hot Reload

- Backend: 코드 수정 시 자동으로 재시작됨 (nodemon)
- Mobile: 코드 수정 시 자동으로 리로드됨 (Expo Fast Refresh)

### API 테스트

Postman이나 curl로 API를 직접 테스트할 수 있습니다:

```bash
# Health check
curl http://localhost:8080/health

# 회원 목록 조회
curl http://localhost:8080/api/members

# 회원 생성
curl -X POST http://localhost:8080/api/members \
  -H "Content-Type: application/json" \
  -d '{"name":"홍길동","position":"FW"}'
```

### 로그 확인

- Backend: 터미널에서 실시간 로그 확인
- Mobile: Expo 개발자 도구에서 로그 확인 (터미널에서 `d` 누르기)

## 🎉 완료!

이제 앱을 사용할 준비가 되었습니다! 경기를 추가하고, 출석을 체크하고, 팀을 구성해보세요! ⚽








