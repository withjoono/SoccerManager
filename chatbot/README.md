# 🤖 Soccer Match Manager - 카카오톡 챗봇

카카오톡 채널 챗봇을 통해 경기 일정, 결과, 통계를 조회할 수 있습니다.

## 🚀 빠른 시작

### 1. 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env` 파일 생성:

```env
NODE_ENV=development
PORT=8081

# 백엔드 API URL
BACKEND_API_URL=https://your-backend.run.app
BACKEND_API_TOKEN=your-api-token

# 앱 URL
APP_URL=https://your-app.com
```

### 3. 개발 서버 실행

```bash
npm run dev
```

### 4. 배포

```bash
# Cloud Run에 배포
gcloud run deploy soccer-chatbot \
  --source . \
  --region asia-northeast3 \
  --allow-unauthenticated
```

## 📚 지원 기능

- ⚽ 다음 경기 조회
- 🏆 최근 경기 결과
- 📊 개인 통계 (카카오 연동 필요)
- 🎯 팀 순위 (득점왕, 도움왕 등)
- 📢 공지사항

## 🛠 카카오 오픈빌더 설정

1. https://i.kakao.com 접속
2. 새 챗봇 만들기
3. 스킬 서버 등록: `https://your-chatbot.run.app/webhook`
4. 시나리오 구성 (블록 생성)

## 📝 API 엔드포인트

- `POST /webhook` - 카카오 웹훅
- `GET /health` - 헬스 체크

## 🔧 개발

```bash
# 개발 서버 (hot reload)
npm run dev

# 빌드
npm run build

# 프로덕션 실행
npm start
```

## 📚 더 보기

상세한 가이드는 [KAKAO_CHATBOT_GUIDE.md](../KAKAO_CHATBOT_GUIDE.md)를 참고하세요.






