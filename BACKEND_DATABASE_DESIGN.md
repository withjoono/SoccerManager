# 백엔드 & 데이터베이스 설계

## 📚 목차
1. [기술 스택](#기술-스택)
2. [데이터베이스 구조](#데이터베이스-구조)
3. [API 엔드포인트](#api-엔드포인트)
4. [비즈니스 로직](#비즈니스-로직)
5. [보안 및 인증](#보안-및-인증)

---

## 🛠 기술 스택

### Backend
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Language**: TypeScript
- **Validation**: Joi

### Database
- **Primary DB**: Firebase Firestore (NoSQL)
- **Storage**: Firebase Cloud Storage (이미지, 파일)
- **Authentication**: Firebase Authentication

### Deployment
- **Platform**: Google Cloud Platform
- **Container**: Docker
- **Service**: Cloud Run
- **CI/CD**: Cloud Build

### Push Notifications
- **Service**: Firebase Cloud Messaging (FCM)

---

## 🗄 데이터베이스 구조

### 1. Members (회원) 컬렉션
회원 정보를 저장합니다.

```typescript
// Collection: members
{
  id: string;                    // 자동 생성 ID
  name: string;                  // 회원 이름
  phone?: string;                // 전화번호 (선택)
  email?: string;                // 이메일 (선택)
  teamId?: string;               // 소속 팀 ID (선택)
  position?: 'FW' | 'MF' | 'DF' | 'GK';  // 포지션 (선택)
  jerseyNumber?: number;         // 등번호 (선택)
  photoURL?: string;             // 프로필 사진 URL (선택)
  isActive: boolean;             // 활성 상태 (기본 true)
  createdAt: Timestamp;          // 생성 일시
  updatedAt: Timestamp;          // 수정 일시
}

// 인덱스
- name (ASC)
- teamId (ASC)
- isActive (ASC)
```

### 2. Teams (팀) 컬렉션
팀 정보를 저장합니다.

```typescript
// Collection: teams
{
  id: string;                    // 자동 생성 ID
  name: string;                  // 팀 이름
  color?: string;                // 팀 컬러 (HEX, 예: #FF5733)
  description?: string;          // 팀 설명
  captainId?: string;            // 주장 회원 ID
  isActive: boolean;             // 활성 상태
  createdAt: Timestamp;          // 생성 일시
  updatedAt: Timestamp;          // 수정 일시
}

// 인덱스
- name (ASC)
- isActive (ASC)
```

### 3. Matches (경기) 컬렉션
경기 일정 및 결과를 저장합니다.

```typescript
// Collection: matches
{
  id: string;                    // 자동 생성 ID
  title?: string;                // 경기 제목 (예: "정기 경기")
  date: Timestamp;               // 경기 날짜 및 시간
  matchNumber: number;           // 같은 날 경기 순서 (1st, 2nd, ...)
  location?: string;             // 경기장
  notes?: string;                // 메모 (시작~종료 시간 포함)
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  scoreA: number;                // A팀 스코어 (기본 0)
  scoreB: number;                // B팀 스코어 (기본 0)
  createdAt: Timestamp;          // 생성 일시
  updatedAt: Timestamp;          // 수정 일시
}

// 인덱스
- date (DESC)
- status (ASC), date (DESC)
- matchNumber (ASC)
```

### 4. Attendances (출석) 컬렉션
각 경기별 회원 출석 정보를 저장합니다.

```typescript
// Collection: attendances
{
  id: string;                    // 자동 생성 ID
  matchId: string;               // 경기 ID (FK)
  memberId: string;              // 회원 ID (FK)
  status: 'present' | 'absent' | 'pending';  // 출석 상태
  checkedAt?: Timestamp;         // 출석 체크 시간
  createdAt: Timestamp;          // 생성 일시
  updatedAt: Timestamp;          // 수정 일시
}

// 인덱스
- matchId (ASC), status (ASC)
- memberId (ASC), matchId (DESC)
- matchId, memberId (복합 유니크)
```

### 5. TeamAssignments (팀 구성) 컬렉션
각 경기별 팀 구성을 저장합니다.

```typescript
// Collection: teamAssignments
{
  id: string;                    // 자동 생성 ID
  matchId: string;               // 경기 ID (FK, 유니크)
  teamA: string[];               // A팀 회원 ID 배열
  teamB: string[];               // B팀 회원 ID 배열
  teamC?: string[];              // C팀 (선택, 3팀 이상 시)
  teamD?: string[];              // D팀 (선택)
  createdAt: Timestamp;          // 생성 일시
  updatedAt: Timestamp;          // 수정 일시
}

// 인덱스
- matchId (ASC, UNIQUE)
```

### 6. MatchEvents (경기 이벤트) 컬렉션
골, 어시스트, 경고/퇴장 등 경기 중 이벤트를 저장합니다.

```typescript
// Collection: matchEvents
{
  id: string;                    // 자동 생성 ID
  matchId: string;               // 경기 ID (FK)
  memberId: string | 'unknown' | 'own-goal';  // 회원 ID / 모름 / 자책골
  assisterId?: string | 'unknown' | 'none';   // 어시스트 회원 ID (골인 경우)
  team: 'A' | 'B' | 'C' | 'D';   // 팀 구분
  type: 'goal' | 'assist' | 'yellowCard' | 'redCard' | 'ownGoal';
  minute?: number;               // 경기 시간 (분, 선택)
  notes?: string;                // 추가 메모
  createdAt: Timestamp;          // 생성 일시
}

// 인덱스
- matchId (ASC), createdAt (ASC)
- memberId (ASC), type (ASC)
- type (ASC), matchId (ASC)
```

### 7. Notices (공지사항) 컬렉션
공지사항을 저장합니다.

```typescript
// Collection: notices
{
  id: string;                    // 자동 생성 ID
  title: string;                 // 공지 제목
  content: string;               // 공지 내용
  important: boolean;            // 중요 공지 여부
  authorId?: string;             // 작성자 ID (선택)
  attachments?: string[];        // 첨부파일 URL 배열 (선택)
  isActive: boolean;             // 활성 상태
  createdAt: Timestamp;          // 생성 일시
  updatedAt: Timestamp;          // 수정 일시
}

// 인덱스
- createdAt (DESC)
- important (DESC), createdAt (DESC)
- isActive (ASC), createdAt (DESC)
```

### 8. Notifications (알림) 컬렉션
사용자별 알림을 저장합니다.

```typescript
// Collection: notifications
{
  id: string;                    // 자동 생성 ID
  userId?: string;               // 수신자 회원 ID (null이면 전체)
  type: 'match' | 'team' | 'notice' | 'general';
  title: string;                 // 알림 제목
  content: string;               // 알림 내용
  relatedId?: string;            // 관련 항목 ID (경기, 공지 등)
  isRead: boolean;               // 읽음 여부 (기본 false)
  createdAt: Timestamp;          // 생성 일시
}

// 인덱스
- userId (ASC), createdAt (DESC)
- userId (ASC), isRead (ASC), createdAt (DESC)
```

### 9. Statistics (통계) 컬렉션 (집계용)
회원별 통계 데이터를 저장합니다. (주기적으로 재계산)

```typescript
// Collection: statistics
{
  id: string;                    // memberId와 동일
  memberId: string;              // 회원 ID (UNIQUE)
  totalMatches: number;          // 총 경기 수
  totalAttendance: number;       // 총 출석 수
  attendanceRate: number;        // 출석률 (%)
  totalGoals: number;            // 총 골 수
  totalAssists: number;          // 총 어시스트 수
  totalWins: number;             // 총 승리 수
  totalLosses: number;           // 총 패배 수
  totalDraws: number;            // 총 무승부 수
  winRate: number;               // 승률 (%)
  lastUpdated: Timestamp;        // 마지막 업데이트 시간
}

// 인덱스
- memberId (ASC, UNIQUE)
- totalGoals (DESC)
- totalAssists (DESC)
- attendanceRate (DESC)
- winRate (DESC)
```

---

## 🌐 API 엔드포인트

### 기본 URL
```
Production: https://soccer-api-xxxxx.run.app
Development: http://localhost:8080
```

### 1. Members (회원 관리)

#### GET `/api/members`
모든 회원 조회

**Query Parameters:**
- `teamId` (optional): 특정 팀의 회원만 조회
- `isActive` (optional): 활성 상태 필터

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "member123",
      "name": "홍길동",
      "phone": "010-1234-5678",
      "teamId": "team456",
      "position": "FW",
      "jerseyNumber": 10,
      "isActive": true,
      "createdAt": "2025-12-31T10:00:00Z",
      "updatedAt": "2025-12-31T10:00:00Z"
    }
  ]
}
```

#### POST `/api/members`
회원 생성

**Request Body:**
```json
{
  "name": "홍길동",
  "phone": "010-1234-5678",
  "teamId": "team456",
  "position": "FW",
  "jerseyNumber": 10
}
```

#### PUT `/api/members/:id`
회원 정보 수정

#### DELETE `/api/members/:id`
회원 삭제 (soft delete: isActive = false)

---

### 2. Teams (팀 관리)

#### GET `/api/teams`
모든 팀 조회

#### POST `/api/teams`
팀 생성

**Request Body:**
```json
{
  "name": "레드팀",
  "color": "#FF5733",
  "description": "공격형 팀"
}
```

#### PUT `/api/teams/:id`
팀 정보 수정

#### DELETE `/api/teams/:id`
팀 삭제

---

### 3. Matches (경기 관리)

#### GET `/api/matches`
모든 경기 조회

**Query Parameters:**
- `status` (optional): scheduled, completed, cancelled
- `startDate` (optional): 시작 날짜
- `endDate` (optional): 종료 날짜
- `month` (optional): 특정 월 (1-12)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "match123",
      "title": "정기 경기",
      "date": "2026-01-08T15:00:00Z",
      "matchNumber": 1,
      "location": "서울 운동장",
      "notes": "15:00 ~ 17:00",
      "status": "scheduled",
      "scoreA": 0,
      "scoreB": 0
    }
  ]
}
```

#### POST `/api/matches`
경기 생성 (단일 또는 반복 경기)

**Request Body (단일 경기):**
```json
{
  "title": "정기 경기",
  "date": "2026-01-08T15:00:00Z",
  "location": "서울 운동장",
  "notes": "15:00 ~ 17:00"
}
```

**Request Body (반복 경기):**
```json
{
  "title": "정기 경기",
  "daysOfWeek": [3, 5],          // 수요일, 금요일
  "startDate": "2026-01-01",
  "endDate": "2026-03-31",
  "startTime": "15:00",
  "endTime": "17:00",
  "location": "서울 운동장"
}
```

**Response:**
```json
{
  "success": true,
  "message": "13개의 경기가 생성되었습니다.",
  "data": {
    "created": 13,
    "matches": [/* 생성된 경기 목록 */]
  }
}
```

#### GET `/api/matches/:id`
특정 경기 조회

#### PUT `/api/matches/:id`
경기 정보 수정 (스코어 업데이트 포함)

**Request Body:**
```json
{
  "status": "completed",
  "scoreA": 3,
  "scoreB": 2
}
```

#### DELETE `/api/matches/:id`
경기 삭제 또는 취소

---

### 4. Attendances (출석 관리)

#### GET `/api/attendances`
출석 목록 조회

**Query Parameters:**
- `matchId` (required): 경기 ID
- `status` (optional): present, absent, pending

#### POST `/api/attendances/bulk`
출석 일괄 등록/수정

**Request Body:**
```json
{
  "matchId": "match123",
  "attendances": [
    { "memberId": "member1", "status": "present" },
    { "memberId": "member2", "status": "absent" },
    { "memberId": "member3", "status": "pending" }
  ]
}
```

#### PUT `/api/attendances/:id`
출석 상태 변경

---

### 5. TeamAssignments (팀 구성)

#### GET `/api/team-assignments`
팀 구성 조회

**Query Parameters:**
- `matchId` (required): 경기 ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "assignment123",
    "matchId": "match123",
    "teamA": ["member1", "member2", "member3"],
    "teamB": ["member4", "member5", "member6"],
    "createdAt": "2025-12-31T14:00:00Z"
  }
}
```

#### POST `/api/team-assignments`
팀 구성 저장

**Request Body:**
```json
{
  "matchId": "match123",
  "teamA": ["member1", "member2", "member3"],
  "teamB": ["member4", "member5", "member6"]
}
```

#### PUT `/api/team-assignments/:id`
팀 구성 수정

---

### 6. MatchEvents (경기 이벤트)

#### GET `/api/match-events`
경기 이벤트 조회

**Query Parameters:**
- `matchId` (required): 경기 ID
- `type` (optional): goal, assist, yellowCard, redCard

#### POST `/api/match-events`
이벤트 추가 (골, 어시스트 등)

**Request Body (골 기록):**
```json
{
  "matchId": "match123",
  "memberId": "member1",
  "assisterId": "member2",
  "team": "A",
  "type": "goal"
}
```

**Request Body (자책골):**
```json
{
  "matchId": "match123",
  "memberId": "own-goal",
  "team": "B",
  "type": "ownGoal"
}
```

#### DELETE `/api/match-events/:id`
이벤트 삭제

---

### 7. Notices (공지사항)

#### GET `/api/notices`
공지사항 목록 조회

**Query Parameters:**
- `important` (optional): true/false
- `isActive` (optional): true/false

#### POST `/api/notices`
공지사항 생성

**Request Body:**
```json
{
  "title": "새해 첫 경기 일정 공지",
  "content": "2026년 첫 경기가 1월 8일에 진행됩니다.",
  "important": true
}
```

#### PUT `/api/notices/:id`
공지사항 수정

#### DELETE `/api/notices/:id`
공지사항 삭제

---

### 8. Notifications (알림)

#### GET `/api/notifications`
사용자 알림 목록 조회

**Query Parameters:**
- `userId` (optional): 특정 사용자 (없으면 전체)
- `isRead` (optional): true/false

#### POST `/api/notifications`
알림 생성 및 발송

**Request Body:**
```json
{
  "userId": null,                // null이면 전체 발송
  "type": "match",
  "title": "새 경기 등록",
  "content": "1월 8일 수요일 정기 경기가 등록되었습니다.",
  "relatedId": "match123"
}
```

#### PUT `/api/notifications/:id/read`
알림 읽음 처리

---

### 9. Statistics (통계)

#### GET `/api/statistics`
전체 회원 통계 조회

**Query Parameters:**
- `sortBy` (optional): goals, assists, attendanceRate, winRate
- `period` (optional): weekly, monthly, yearly
- `limit` (optional): 결과 개수 (기본 50)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "memberId": "member1",
      "memberName": "홍길동",
      "totalMatches": 22,
      "totalGoals": 12,
      "totalAssists": 5,
      "attendanceRate": 95.5,
      "winRate": 68.2,
      "totalWins": 15,
      "totalLosses": 2,
      "totalDraws": 5
    }
  ]
}
```

#### GET `/api/statistics/:memberId`
특정 회원 통계 조회

#### POST `/api/statistics/recalculate`
전체 통계 재계산 (Admin only)

---

## 🔐 보안 및 인증

### 인증 방식
Firebase Authentication을 사용하여 사용자 인증을 처리합니다.

```typescript
// 미들웨어: 토큰 검증
async function authenticateUser(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const token = authHeader.split('Bearer ')[1];
  
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
```

### 권한 관리
```typescript
// 역할 기반 접근 제어 (RBAC)
enum UserRole {
  ADMIN = 'admin',      // 모든 권한
  MANAGER = 'manager',  // 경기, 팀 관리
  MEMBER = 'member'     // 읽기, 출석 체크
}

// User 정보 (Firebase Auth Custom Claims)
{
  uid: string;
  email: string;
  role: UserRole;
  memberId?: string;  // members 컬렉션과 연결
}
```

### API 보호
```typescript
// 예시: Admin 전용 엔드포인트
router.post('/api/statistics/recalculate', 
  authenticateUser, 
  requireRole('admin'), 
  recalculateStatistics
);
```

---

## 🔄 비즈니스 로직

### 1. 경기 생성 시
```typescript
async function createMatch(data) {
  // 1. 경기 생성
  const match = await db.collection('matches').add({
    ...data,
    status: 'scheduled',
    scoreA: 0,
    scoreB: 0,
    createdAt: FieldValue.serverTimestamp()
  });
  
  // 2. 모든 회원에 대해 출석 레코드 생성 (status: 'pending')
  const members = await db.collection('members').where('isActive', '==', true).get();
  const batch = db.batch();
  
  members.forEach(member => {
    const attendanceRef = db.collection('attendances').doc();
    batch.set(attendanceRef, {
      matchId: match.id,
      memberId: member.id,
      status: 'pending',
      createdAt: FieldValue.serverTimestamp()
    });
  });
  
  await batch.commit();
  
  // 3. 알림 발송
  if (data.sendNotification) {
    await sendNotificationToAll({
      type: 'match',
      title: '새 경기 등록',
      content: `${data.title} 경기가 ${formatDate(data.date)}에 등록되었습니다.`,
      relatedId: match.id
    });
  }
  
  return match;
}
```

### 2. 경기 결과 저장 시
```typescript
async function saveMatchResult(matchId, scoreA, scoreB, events) {
  // 1. 경기 상태 업데이트
  await db.collection('matches').doc(matchId).update({
    status: 'completed',
    scoreA,
    scoreB,
    updatedAt: FieldValue.serverTimestamp()
  });
  
  // 2. 이벤트 저장
  const batch = db.batch();
  events.forEach(event => {
    const eventRef = db.collection('matchEvents').doc();
    batch.set(eventRef, {
      ...event,
      matchId,
      createdAt: FieldValue.serverTimestamp()
    });
  });
  await batch.commit();
  
  // 3. 관련 회원 통계 업데이트 (비동기)
  updateMemberStatistics(matchId);
  
  return true;
}
```

### 3. 통계 계산
```typescript
async function calculateMemberStatistics(memberId) {
  // 1. 출석 통계
  const attendances = await db.collection('attendances')
    .where('memberId', '==', memberId)
    .get();
  
  const totalMatches = attendances.size;
  const totalAttendance = attendances.docs.filter(
    doc => doc.data().status === 'present'
  ).length;
  const attendanceRate = (totalAttendance / totalMatches) * 100;
  
  // 2. 골/어시스트 통계
  const goalEvents = await db.collection('matchEvents')
    .where('memberId', '==', memberId)
    .where('type', '==', 'goal')
    .get();
  const totalGoals = goalEvents.size;
  
  const assistEvents = await db.collection('matchEvents')
    .where('assisterId', '==', memberId)
    .get();
  const totalAssists = assistEvents.size;
  
  // 3. 승률 계산
  const teamAssignments = await db.collection('teamAssignments').get();
  let wins = 0, losses = 0, draws = 0;
  
  for (const assignment of teamAssignments.docs) {
    const data = assignment.data();
    const match = await db.collection('matches').doc(data.matchId).get();
    const matchData = match.data();
    
    if (matchData.status !== 'completed') continue;
    
    let memberTeam = null;
    if (data.teamA.includes(memberId)) memberTeam = 'A';
    if (data.teamB.includes(memberId)) memberTeam = 'B';
    
    if (!memberTeam) continue;
    
    const memberScore = memberTeam === 'A' ? matchData.scoreA : matchData.scoreB;
    const opponentScore = memberTeam === 'A' ? matchData.scoreB : matchData.scoreA;
    
    if (memberScore > opponentScore) wins++;
    else if (memberScore < opponentScore) losses++;
    else draws++;
  }
  
  const totalCompletedMatches = wins + losses + draws;
  const winRate = totalCompletedMatches > 0 ? (wins / totalCompletedMatches) * 100 : 0;
  
  // 4. 통계 저장
  await db.collection('statistics').doc(memberId).set({
    memberId,
    totalMatches,
    totalAttendance,
    attendanceRate,
    totalGoals,
    totalAssists,
    totalWins: wins,
    totalLosses: losses,
    totalDraws: draws,
    winRate,
    lastUpdated: FieldValue.serverTimestamp()
  }, { merge: true });
  
  return true;
}
```

### 4. 알림 발송
```typescript
async function sendNotificationToAll(notification) {
  // 1. 알림 저장
  const batch = db.batch();
  const members = await db.collection('members').where('isActive', '==', true).get();
  
  members.forEach(member => {
    const notificationRef = db.collection('notifications').doc();
    batch.set(notificationRef, {
      userId: member.id,
      ...notification,
      isRead: false,
      createdAt: FieldValue.serverTimestamp()
    });
  });
  
  await batch.commit();
  
  // 2. FCM 푸시 알림 발송
  const tokens = await getDeviceTokens(members.docs.map(m => m.id));
  
  if (tokens.length > 0) {
    await admin.messaging().sendMulticast({
      tokens,
      notification: {
        title: notification.title,
        body: notification.content
      },
      data: {
        type: notification.type,
        relatedId: notification.relatedId || ''
      }
    });
  }
  
  return true;
}
```

---

## 📊 데이터베이스 관계도

```
Members ──┬── Attendances (1:N)
          ├── MatchEvents (1:N)
          ├── Statistics (1:1)
          └── Teams (N:1)

Teams ──── Members (1:N)

Matches ──┬── Attendances (1:N)
          ├── TeamAssignments (1:1)
          ├── MatchEvents (1:N)
          └── Notifications (1:N)

Notices ──── Notifications (1:N)
```

---

## 🚀 성능 최적화

### 1. 인덱싱
모든 주요 쿼리 경로에 복합 인덱스 생성

### 2. 캐싱
- **Redis**: 자주 조회되는 데이터 (회원 목록, 팀 목록)
- **CDN**: 정적 자산 (이미지, 프로필 사진)

### 3. 페이지네이션
```typescript
// 경기 목록 페이지네이션
GET /api/matches?page=1&limit=20
```

### 4. 배치 처리
- 출석 일괄 등록
- 통계 재계산 (스케줄러로 매일 자정 실행)

---

## 🔧 환경 변수

```bash
# .env
NODE_ENV=production
PORT=8080

# Firebase
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email

# Database
FIRESTORE_EMULATOR_HOST=localhost:8081  # 개발 환경

# Cloud Storage
STORAGE_BUCKET=your-bucket-name

# CORS
ALLOWED_ORIGINS=https://yourdomain.com,https://app.yourdomain.com
```

---

## 📝 다음 단계

1. ✅ 데이터베이스 구조 설계 완료
2. ✅ API 엔드포인트 정의 완료
3. 🔄 백엔드 컨트롤러 구현
4. 🔄 Firestore 보안 규칙 작성
5. 🔄 FCM 푸시 알림 설정
6. 🔄 테스트 코드 작성
7. 🔄 배포 및 모니터링 설정








