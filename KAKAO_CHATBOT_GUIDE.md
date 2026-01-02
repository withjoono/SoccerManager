# 💬 카카오톡 챗봇 연동 가이드

Soccer Match Manager의 데이터를 카카오톡 챗봇을 통해 조회하는 방법입니다.

---

## 📚 목차

1. [개요](#개요)
2. [카카오톡 챗봇 아키텍처](#카카오톡-챗봇-아키텍처)
3. [카카오 채널 & 챗봇 생성](#카카오-채널--챗봇-생성)
4. [챗봇 서버 구축](#챗봇-서버-구축)
5. [시나리오 구성](#시나리오-구성)
6. [배포 및 테스트](#배포-및-테스트)

---

## 📖 개요

### 카카오톡 챗봇으로 할 수 있는 것

- ⚽ **다음 경기 조회**: "다음 경기 언제야?"
- 🏆 **최근 경기 결과**: "지난 경기 결과 알려줘"
- 📊 **개인 통계 조회**: "내 통계 보여줘"
- 👥 **팀 순위**: "팀 순위 알려줘"
- 🎯 **득점왕**: "득점왕 누구야?"
- ✅ **출석 확인**: "다음 경기 출석할게"
- 📢 **공지사항**: "최근 공지사항 보여줘"

---

## 🏗 카카오톡 챗봇 아키텍처

```
┌─────────────┐
│ 카카오톡 앱  │
└──────┬──────┘
       │ 사용자 메시지
       ↓
┌─────────────────┐
│ 카카오 i 오픈빌더 │ (시나리오 관리)
└──────┬──────────┘
       │ Webhook
       ↓
┌─────────────────┐
│  챗봇 서버 (NEW) │ ← 우리가 만들 서버
│  /webhook        │
└──────┬──────────┘
       │ API 호출
       ↓
┌─────────────────┐
│ 기존 백엔드 API  │ (Firebase + Cloud Run)
│ /api/matches     │
│ /api/statistics  │
└─────────────────┘
```

---

## 🎯 카카오 채널 & 챗봇 생성

### 1. 카카오 비즈니스 계정 생성

1. **카카오 비즈니스** 접속: https://business.kakao.com
2. **카카오 채널 만들기**
   - 채널 이름: "축구팀 매니저" (원하는 이름)
   - 검색용 ID: `@soccer_manager`
   - 카테고리: 스포츠/레저

### 2. 카카오 i 오픈빌더 설정

1. **오픈빌더** 접속: https://i.kakao.com
2. **새 챗봇 만들기**
   - 봇 이름: "축구팀 매니저 봇"
   - 카카오 채널 연결
3. **스킬 서버 등록**
   - URL: `https://your-chatbot-server.run.app/webhook`

---

## 🛠 챗봇 서버 구축

### 프로젝트 구조

```
chatbot/
├── src/
│   ├── index.ts              # Express 서버
│   ├── handlers/
│   │   ├── matchHandler.ts   # 경기 관련 핸들러
│   │   ├── statsHandler.ts   # 통계 관련 핸들러
│   │   ├── noticeHandler.ts  # 공지사항 핸들러
│   │   └── helpHandler.ts    # 도움말 핸들러
│   ├── services/
│   │   └── apiService.ts     # 백엔드 API 호출
│   ├── utils/
│   │   ├── formatter.ts      # 메시지 포맷팅
│   │   └── validator.ts      # 입력 검증
│   └── types/
│       └── kakao.ts          # 카카오 타입 정의
├── Dockerfile
├── package.json
└── tsconfig.json
```

### 챗봇 서버 코드

#### 1. 메인 서버 (`chatbot/src/index.ts`)

```typescript
import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { handleKakaoWebhook } from './handlers';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 8081;

app.use(cors());
app.use(express.json());

// Health Check
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Chatbot server is running' });
});

// 카카오 웹훅 엔드포인트
app.post('/webhook', handleKakaoWebhook);

app.listen(PORT, () => {
  console.log(`🤖 Chatbot server running on port ${PORT}`);
});

export default app;
```

#### 2. 웹훅 핸들러 (`chatbot/src/handlers/index.ts`)

```typescript
import { Request, Response } from 'express';
import { KakaoRequest, KakaoResponse } from '../types/kakao';
import { getNextMatch, getRecentMatches } from './matchHandler';
import { getMyStats, getLeaderboard } from './statsHandler';
import { getNotices } from './noticeHandler';
import { getHelp } from './helpHandler';

export async function handleKakaoWebhook(req: Request, res: Response) {
  try {
    const kakaoReq: KakaoRequest = req.body;
    const userRequest = kakaoReq.userRequest;
    const utterance = userRequest.utterance; // 사용자가 입력한 텍스트
    const action = kakaoReq.action;

    let response: KakaoResponse;

    // 인텐트별 처리
    switch (action.name) {
      case '다음경기조회':
        response = await getNextMatch();
        break;

      case '최근경기조회':
        response = await getRecentMatches();
        break;

      case '내통계조회':
        const userId = userRequest.user.id;
        response = await getMyStats(userId);
        break;

      case '순위조회':
        const category = action.params?.category || 'goals';
        response = await getLeaderboard(category);
        break;

      case '공지사항조회':
        response = await getNotices();
        break;

      case '도움말':
        response = getHelp();
        break;

      default:
        response = {
          version: '2.0',
          template: {
            outputs: [
              {
                simpleText: {
                  text: '죄송합니다. 이해하지 못했습니다.\n"도움말"을 입력해보세요.',
                },
              },
            ],
          },
        };
    }

    res.json(response);
  } catch (error) {
    console.error('Webhook error:', error);
    res.json({
      version: '2.0',
      template: {
        outputs: [
          {
            simpleText: {
              text: '오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
            },
          },
        ],
      },
    });
  }
}
```

#### 3. 경기 핸들러 (`chatbot/src/handlers/matchHandler.ts`)

```typescript
import { KakaoResponse } from '../types/kakao';
import { callBackendAPI } from '../services/apiService';
import { formatDate, formatMatchCard } from '../utils/formatter';

export async function getNextMatch(): Promise<KakaoResponse> {
  try {
    const matches = await callBackendAPI('/api/matches?status=scheduled');

    if (matches.length === 0) {
      return {
        version: '2.0',
        template: {
          outputs: [
            {
              simpleText: {
                text: '예정된 경기가 없습니다.',
              },
            },
          ],
        },
      };
    }

    const nextMatch = matches[0];
    const matchDate = new Date(nextMatch.date);

    return {
      version: '2.0',
      template: {
        outputs: [
          {
            basicCard: {
              title: `⚽ ${nextMatch.title || '다음 경기'}`,
              description: `📅 ${formatDate(matchDate)}\n📍 ${nextMatch.location || '미정'}\n\n출석 체크는 앱에서 해주세요!`,
              buttons: [
                {
                  action: 'webLink',
                  label: '앱에서 보기',
                  webLinkUrl: 'https://your-app-link.com',
                },
              ],
            },
          },
        ],
      },
    };
  } catch (error) {
    console.error('Error fetching next match:', error);
    throw error;
  }
}

export async function getRecentMatches(): Promise<KakaoResponse> {
  try {
    const matches = await callBackendAPI('/api/matches?status=completed&limit=3');

    if (matches.length === 0) {
      return {
        version: '2.0',
        template: {
          outputs: [
            {
              simpleText: {
                text: '최근 경기 기록이 없습니다.',
              },
            },
          ],
        },
      };
    }

    const matchCards = matches.map((match: any) => {
      const matchDate = new Date(match.date);
      return {
        title: `${formatDate(matchDate)} ${match.title || '경기'}`,
        description: `🏆 A팀 ${match.scoreA} : ${match.scoreB} B팀\n📍 ${match.location || '미정'}`,
        buttons: [
          {
            action: 'block',
            label: '상세보기',
            blockId: 'match_detail_block_id', // 오픈빌더에서 설정
            extra: {
              matchId: match.id,
            },
          },
        ],
      };
    });

    return {
      version: '2.0',
      template: {
        outputs: [
          {
            carousel: {
              type: 'basicCard',
              items: matchCards.slice(0, 3), // 최대 3개
            },
          },
        ],
      },
    };
  } catch (error) {
    console.error('Error fetching recent matches:', error);
    throw error;
  }
}
```

#### 4. 통계 핸들러 (`chatbot/src/handlers/statsHandler.ts`)

```typescript
import { KakaoResponse } from '../types/kakao';
import { callBackendAPI } from '../services/apiService';

export async function getMyStats(kakaoUserId: string): Promise<KakaoResponse> {
  try {
    // 카카오 유저 ID를 회원 ID로 매핑 (사전에 연동 필요)
    const memberId = await getMemberIdByKakaoId(kakaoUserId);

    if (!memberId) {
      return {
        version: '2.0',
        template: {
          outputs: [
            {
              simpleText: {
                text: '회원 정보를 찾을 수 없습니다.\n앱에서 카카오톡 연동을 해주세요.',
              },
            },
          ],
        },
      };
    }

    const stats = await callBackendAPI(`/api/statistics/${memberId}`);

    return {
      version: '2.0',
      template: {
        outputs: [
          {
            basicCard: {
              title: `📊 ${stats.memberName}님의 통계`,
              description: 
                `⚽ 골: ${stats.totalGoals}개\n` +
                `🎯 어시스트: ${stats.totalAssists}개\n` +
                `✅ 출석률: ${stats.attendanceRate.toFixed(1)}%\n` +
                `🔥 승률: ${stats.winRate.toFixed(1)}%\n` +
                `📊 경기: ${stats.totalMatches}경기\n` +
                `   승: ${stats.totalWins} | 무: ${stats.totalDraws} | 패: ${stats.totalLosses}`,
              buttons: [
                {
                  action: 'webLink',
                  label: '자세히 보기',
                  webLinkUrl: 'https://your-app-link.com/stats',
                },
              ],
            },
          },
        ],
      },
    };
  } catch (error) {
    console.error('Error fetching stats:', error);
    throw error;
  }
}

export async function getLeaderboard(category: string): Promise<KakaoResponse> {
  try {
    const leaderboard = await callBackendAPI(
      `/api/statistics/leaderboard?category=${category}&limit=5`
    );

    const categoryName = {
      goals: '⚽ 득점왕',
      assists: '🎯 도움왕',
      attendance: '✅ 출석왕',
      winRate: '🔥 승률왕',
    }[category] || '순위';

    let text = `${categoryName}\n\n`;

    leaderboard.leaderboard.forEach((player: any, index: number) => {
      const medal = ['🥇', '🥈', '🥉'][index] || `${index + 1}.`;
      text += `${medal} ${player.memberName} - ${player.value}\n`;
    });

    return {
      version: '2.0',
      template: {
        outputs: [
          {
            simpleText: {
              text,
            },
          },
        ],
        quickReplies: [
          {
            action: 'block',
            label: '득점왕',
            blockId: 'leaderboard_block_id',
            extra: { category: 'goals' },
          },
          {
            action: 'block',
            label: '도움왕',
            blockId: 'leaderboard_block_id',
            extra: { category: 'assists' },
          },
          {
            action: 'block',
            label: '출석왕',
            blockId: 'leaderboard_block_id',
            extra: { category: 'attendance' },
          },
        ],
      },
    };
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    throw error;
  }
}

// 카카오 유저 ID를 회원 ID로 매핑
async function getMemberIdByKakaoId(kakaoUserId: string): Promise<string | null> {
  // TODO: Firestore에 kakaoUserId -> memberId 매핑 테이블 구축
  // 예시: members 컬렉션에 kakaoUserId 필드 추가
  try {
    const response = await callBackendAPI(`/api/members?kakaoUserId=${kakaoUserId}`);
    return response[0]?.id || null;
  } catch {
    return null;
  }
}
```

#### 5. API 서비스 (`chatbot/src/services/apiService.ts`)

```typescript
import axios from 'axios';

const BACKEND_URL = process.env.BACKEND_API_URL || 'https://your-backend.run.app';
const API_TOKEN = process.env.BACKEND_API_TOKEN; // 서버 간 인증용

export async function callBackendAPI(endpoint: string): Promise<any> {
  try {
    const response = await axios.get(`${BACKEND_URL}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
      },
      timeout: 5000,
    });

    return response.data.data;
  } catch (error) {
    console.error('Backend API call failed:', error);
    throw new Error('Failed to fetch data from backend');
  }
}
```

#### 6. 타입 정의 (`chatbot/src/types/kakao.ts`)

```typescript
export interface KakaoRequest {
  bot: {
    id: string;
    name: string;
  };
  intent: {
    id: string;
    name: string;
  };
  action: {
    name: string;
    clientExtra?: any;
    params?: Record<string, any>;
    detailParams?: Record<string, any>;
  };
  userRequest: {
    timezone: string;
    params: {
      ignoreMe?: string;
    };
    block: {
      id: string;
      name: string;
    };
    utterance: string;
    lang?: string;
    user: {
      id: string;
      type: string;
      properties?: Record<string, any>;
    };
  };
}

export interface KakaoResponse {
  version: string;
  template: {
    outputs: Array<
      | { simpleText: { text: string } }
      | { simpleImage: { imageUrl: string; altText: string } }
      | { basicCard: BasicCard }
      | { carousel: Carousel }
    >;
    quickReplies?: QuickReply[];
  };
}

interface BasicCard {
  title?: string;
  description?: string;
  thumbnail?: {
    imageUrl: string;
  };
  buttons?: Button[];
}

interface Carousel {
  type: 'basicCard' | 'commerceCard';
  items: BasicCard[];
}

interface Button {
  action: 'webLink' | 'block' | 'share' | 'message';
  label: string;
  webLinkUrl?: string;
  blockId?: string;
  messageText?: string;
  extra?: any;
}

interface QuickReply {
  action: 'block' | 'message';
  label: string;
  messageText?: string;
  blockId?: string;
  extra?: any;
}
```

#### 7. `package.json`

```json
{
  "name": "soccer-chatbot",
  "version": "1.0.0",
  "description": "Soccer Match Manager Kakao Chatbot",
  "main": "dist/index.js",
  "scripts": {
    "dev": "nodemon src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "axios": "^1.6.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17",
    "@types/node": "^20.10.6",
    "typescript": "^5.3.3",
    "nodemon": "^3.0.2",
    "ts-node": "^10.9.2"
  }
}
```

---

## 🎭 시나리오 구성 (카카오 i 오픈빌더)

### 1. 블록 만들기

#### 시작 블록
```
사용자: (시작)
봇: 안녕하세요! 축구팀 매니저 봇입니다 ⚽

무엇을 도와드릴까요?

[다음 경기] [최근 경기] [내 통계] [순위]
```

#### 다음 경기 조회 블록
```
발화 예시:
- 다음 경기
- 다음 경기 언제야
- 다음 경기 일정
- 경기 언제

스킬: webhook → /webhook (액션: 다음경기조회)
```

#### 최근 경기 조회 블록
```
발화 예시:
- 최근 경기
- 지난 경기
- 경기 결과
- 최근 결과

스킬: webhook → /webhook (액션: 최근경기조회)
```

#### 내 통계 조회 블록
```
발화 예시:
- 내 통계
- 내 기록
- 내 순위

스킬: webhook → /webhook (액션: 내통계조회)
```

#### 순위 조회 블록
```
발화 예시:
- 순위
- 랭킹
- 득점왕
- 도움왕

스킬: webhook → /webhook (액션: 순위조회)
파라미터: category (goals/assists/attendance/winRate)
```

### 2. 폴백 블록 (Fallback)

```
사용자: (인식 불가)
봇: 죄송합니다. 이해하지 못했습니다.

다음 명령어를 사용해보세요:
• 다음 경기
• 최근 경기
• 내 통계
• 순위

[도움말]
```

---

## 🚀 배포 및 테스트

### 1. 챗봇 서버 배포

```bash
cd chatbot

# Docker 이미지 빌드 & Cloud Run 배포
gcloud run deploy soccer-chatbot \
  --source . \
  --platform managed \
  --region asia-northeast3 \
  --allow-unauthenticated \
  --set-env-vars "BACKEND_API_URL=https://your-backend.run.app"

# 배포 완료 후 URL 확인
# 예: https://soccer-chatbot-xxxxx.run.app
```

### 2. 카카오 오픈빌더 스킬 등록

1. **오픈빌더 > 스킬**
2. **새 스킬 만들기**
   - 이름: `다음경기조회`
   - URL: `https://soccer-chatbot-xxxxx.run.app/webhook`
   - Method: POST
3. **파라미터 설정** (필요시)
4. **저장**

### 3. 테스트

1. **오픈빌더에서 테스트**
   - 우측 "봇 테스트" 패널에서 테스트

2. **카카오톡에서 테스트**
   - 카카오톡 > 검색 > `@soccer_manager` 검색
   - 채팅 시작
   - "다음 경기" 입력

---

## 💡 고급 기능

### 1. 출석 체크 (버튼 인터랙션)

```typescript
// 다음 경기에 출석 체크 버튼 추가
{
  basicCard: {
    title: "다음 경기",
    description: "1월 8일 (수) 15:00\n서울 운동장",
    buttons: [
      {
        action: 'block',
        label: '✅ 출석할게요',
        blockId: 'attendance_confirm_block',
        extra: {
          matchId: 'match123',
          status: 'present'
        }
      },
      {
        action: 'block',
        label: '❌ 불참할게요',
        blockId: 'attendance_confirm_block',
        extra: {
          matchId: 'match123',
          status: 'absent'
        }
      }
    ]
  }
}
```

### 2. 알림 발송 (프로액티브 메시지)

경기 등록 시 자동으로 카카오톡 알림 발송:

```typescript
// backend/src/services/notificationService.ts
import axios from 'axios';

async function sendKakaoNotification(userIds: string[], message: string) {
  // 카카오 알림톡 API 사용
  // https://developers.kakao.com/docs/latest/ko/message/rest-api
  
  for (const userId of userIds) {
    try {
      await axios.post('https://kapi.kakao.com/v2/api/talk/memo/default/send', {
        template_object: {
          object_type: 'text',
          text: message,
          link: {
            web_url: 'https://your-app.com',
            mobile_web_url: 'https://your-app.com'
          }
        }
      }, {
        headers: {
          'Authorization': `Bearer ${KAKAO_ACCESS_TOKEN}`
        }
      });
    } catch (error) {
      console.error('Failed to send Kakao notification:', error);
    }
  }
}
```

### 3. 카카오톡 로그인 연동

모바일 앱에서 카카오 로그인:

```typescript
// mobile/src/screens/LoginScreen.tsx
import * as AuthSession from 'expo-auth-session';

async function loginWithKakao() {
  const redirectUri = AuthSession.makeRedirectUri();
  const result = await AuthSession.startAsync({
    authUrl: `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_APP_KEY}&redirect_uri=${redirectUri}&response_type=code`,
  });

  if (result.type === 'success') {
    const { code } = result.params;
    // 백엔드로 code 전송 → 카카오 ID 연동
  }
}
```

---

## 📊 사용 예시

### 대화 예시 1: 경기 조회

```
사용자: 다음 경기 언제야?

봇: ⚽ 정기 경기
📅 1월 8일 (수) 15:00
📍 서울 운동장

출석 체크는 앱에서 해주세요!

[앱에서 보기]
```

### 대화 예시 2: 통계 조회

```
사용자: 내 통계

봇: 📊 홍길동님의 통계

⚽ 골: 12개
🎯 어시스트: 5개
✅ 출석률: 95.5%
🔥 승률: 68.2%
📊 경기: 22경기
   승: 15 | 무: 5 | 패: 2

[자세히 보기]
```

### 대화 예시 3: 순위 조회

```
사용자: 득점왕 누구야?

봇: ⚽ 득점왕

🥇 홍길동 - 12골
🥈 김철수 - 8골
🥉 박영희 - 7골
4. 이민준 - 5골
5. 최수진 - 3골

[득점왕] [도움왕] [출석왕]
```

---

## 🔐 보안 고려사항

### 1. 웹훅 검증

```typescript
// 카카오에서 온 요청인지 확인
function verifyKakaoRequest(req: Request): boolean {
  const signature = req.headers['x-kakao-signature'];
  // HMAC 검증 로직
  return true;
}
```

### 2. 사용자 인증

```typescript
// 민감한 정보는 인증 후에만 제공
if (!isUserAuthenticated(kakaoUserId)) {
  return {
    simpleText: {
      text: '먼저 앱에서 카카오톡 연동을 해주세요.'
    }
  };
}
```

---

## 💰 비용

- **카카오 채널**: 무료
- **카카오 i 오픈빌더**: 무료 (월 1000건)
- **챗봇 서버 (Cloud Run)**: 무료 할당량 내 사용 가능
- **카카오 알림톡**: 유료 (건당 ~8원)

---

## 🎯 다음 단계

1. ✅ 챗봇 서버 구축
2. ✅ 기본 대화 시나리오 구성
3. 🔄 카카오 로그인 연동
4. 🔄 출석 체크 기능 추가
5. 🔄 알림톡 발송 기능
6. 🔄 자연어 처리 개선

---

**카카오톡 챗봇으로 더 편리한 팀 관리를! ⚽💬**








