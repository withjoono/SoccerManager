# 📱 앱 업데이트 가이드

Soccer Match Manager 앱을 업데이트하는 방법을 단계별로 설명합니다.

---

## 📚 목차

1. [로컬 개발 업데이트](#1-로컬-개발-업데이트)
2. [백엔드 업데이트 & 배포](#2-백엔드-업데이트--배포)
3. [모바일 앱 업데이트 & 배포](#3-모바일-앱-업데이트--배포)
4. [데이터베이스 업데이트](#4-데이터베이스-업데이트)
5. [버전 관리](#5-버전-관리)
6. [롤백 방법](#6-롤백-방법)

---

## 1. 로컬 개발 업데이트

### 새로운 기능 추가 시

#### A. 백엔드 기능 추가

```bash
cd backend

# 1. 새 브랜치 생성
git checkout -b feature/new-feature

# 2. 필요한 파일 수정/생성
# - controllers/
# - routes/
# - services/
# - types/

# 3. 로컬 테스트
npm run dev

# 4. 변경사항 커밋
git add .
git commit -m "feat: Add new feature"
```

**예시: 새 API 엔드포인트 추가**

```typescript
// 1. 컨트롤러 추가/수정
// backend/src/controllers/yourController.ts
export async function newFunction(req: AuthRequest, res: Response) {
  // 로직 구현
}

// 2. 라우트 추가
// backend/src/routes/yourRoutes.ts
router.get('/new-endpoint', newFunction);

// 3. 타입 정의 (필요시)
// backend/src/types/index.ts
export interface NewType {
  // 타입 정의
}
```

#### B. 모바일 앱 기능 추가

```bash
cd mobile

# 1. 새 화면 추가
# mobile/src/screens/NewScreen.tsx

# 2. 서비스 추가 (API 연동)
# mobile/src/services/newService.ts

# 3. 네비게이션 업데이트
# mobile/App.tsx

# 4. 로컬 테스트
npx expo start

# 5. 커밋
git add .
git commit -m "feat: Add new screen"
```

---

## 2. 백엔드 업데이트 & 배포

### A. 코드 변경 후 배포

```bash
cd backend

# 1. 코드 변경 완료 후 빌드 테스트
npm run build

# 2. 로컬 테스트
npm run dev

# 3. Git 푸시
git push origin main

# 4. Cloud Run 배포
gcloud run deploy soccer-backend \
  --source . \
  --platform managed \
  --region asia-northeast3 \
  --allow-unauthenticated
```

### B. 환경 변수 업데이트

```bash
# 환경 변수 추가/수정
gcloud run services update soccer-backend \
  --set-env-vars "NEW_VAR=value" \
  --region asia-northeast3

# 여러 변수 한번에 업데이트
gcloud run services update soccer-backend \
  --set-env-vars "VAR1=value1,VAR2=value2" \
  --region asia-northeast3

# 환경 변수 확인
gcloud run services describe soccer-backend \
  --region asia-northeast3 \
  --format="value(spec.template.spec.containers[0].env)"
```

### C. API 버전 관리 (선택)

새로운 breaking change가 있는 경우:

```typescript
// backend/src/index.ts
app.use('/api/v1', v1Routes);  // 기존 버전
app.use('/api/v2', v2Routes);  // 새 버전
```

---

## 3. 모바일 앱 업데이트 & 배포

### A. 버전 번호 업데이트

```json
// mobile/app.json
{
  "expo": {
    "version": "1.0.1",        // ← 버전 번호 증가
    "android": {
      "versionCode": 2         // ← 빌드 번호 증가
    },
    "ios": {
      "buildNumber": "1.0.1"   // ← 빌드 번호 증가
    }
  }
}
```

**버전 번호 규칙 (Semantic Versioning):**
- **Major (1.0.0)**: 큰 변경, breaking changes
- **Minor (1.1.0)**: 새 기능 추가
- **Patch (1.0.1)**: 버그 수정

### B. Expo 업데이트 (OTA - Over The Air)

JavaScript 코드 변경만 있는 경우 (빌드 불필요):

```bash
cd mobile

# 1. EAS CLI 설치 (최초 1회)
npm install -g eas-cli

# 2. EAS 로그인
eas login

# 3. 업데이트 배포
eas update --branch production --message "Bug fix: Fix login issue"
```

**OTA 업데이트가 가능한 경우:**
- ✅ JavaScript/TypeScript 코드 변경
- ✅ 이미지, 폰트 등 에셋 변경
- ✅ 설정 파일 변경

**OTA 업데이트가 불가능한 경우 (새 빌드 필요):**
- ❌ 네이티브 코드 변경
- ❌ `app.json`에서 권한 추가
- ❌ 새 네이티브 라이브러리 추가

### C. 전체 빌드 & 스토어 배포

네이티브 코드 변경이 있는 경우:

#### Android 빌드

```bash
cd mobile

# 1. Android 빌드 (APK 또는 AAB)
eas build --platform android --profile production

# 2. 빌드 완료 후 다운로드
# EAS가 제공하는 URL에서 다운로드

# 3. Google Play Console에 업로드
# https://play.google.com/console
# - 앱 선택 > 출시 관리 > 프로덕션
# - 새 버전 만들기
# - AAB 파일 업로드
# - 출시 노트 작성
# - 검토를 위해 제출
```

#### iOS 빌드

```bash
cd mobile

# 1. iOS 빌드
eas build --platform ios --profile production

# 2. 빌드 완료 후
# EAS가 자동으로 App Store Connect에 업로드

# 3. App Store Connect에서
# https://appstoreconnect.apple.com
# - 앱 선택 > 버전 또는 플랫폼 > iOS 앱
# - 새 버전 추가
# - 빌드 선택
# - 스크린샷, 설명 업데이트
# - 검토를 위해 제출
```

### D. EAS Build 설정

최초 설정 (한 번만):

```bash
cd mobile

# 1. EAS 프로젝트 초기화
eas init

# 2. eas.json 생성
eas build:configure
```

`eas.json` 예시:

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {
      "android": {
        "buildType": "apk"
      },
      "ios": {
        "autoIncrement": true
      }
    }
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json"
      },
      "ios": {
        "appleId": "your-apple-id@example.com",
        "ascAppId": "1234567890",
        "appleTeamId": "ABCD123"
      }
    }
  }
}
```

---

## 4. 데이터베이스 업데이트

### A. Firestore 스키마 변경

```bash
# 1. 새 필드 추가 (기존 문서는 영향 없음)
# Firestore는 스키마리스이므로 자동으로 처리됨

# 2. 기존 문서 마이그레이션 (필요시)
# backend/src/scripts/migrate.ts 생성
```

**마이그레이션 스크립트 예시:**

```typescript
// backend/src/scripts/migrate.ts
import admin from 'firebase-admin';

admin.initializeApp();
const db = admin.firestore();

async function migrateMembers() {
  const snapshot = await db.collection('members').get();
  const batch = db.batch();

  snapshot.docs.forEach((doc) => {
    // 새 필드 추가
    batch.update(doc.ref, {
      newField: 'defaultValue',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  });

  await batch.commit();
  console.log(`Migrated ${snapshot.size} members`);
}

migrateMembers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
```

실행:

```bash
cd backend
npx ts-node src/scripts/migrate.ts
```

### B. Firestore 보안 규칙 업데이트

```bash
# 1. firestore.rules 파일 수정

# 2. 규칙 테스트 (로컬)
firebase emulators:start

# 3. 규칙 배포
firebase deploy --only firestore:rules

# 4. 배포 확인
firebase firestore:rules get
```

### C. Firebase 인덱스 추가

```bash
# 1. firestore.indexes.json 생성/수정
{
  "indexes": [
    {
      "collectionGroup": "matches",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "date", "order": "DESCENDING" }
      ]
    }
  ]
}

# 2. 인덱스 배포
firebase deploy --only firestore:indexes
```

---

## 5. 버전 관리

### Git 워크플로우

```bash
# 1. 기능 개발
git checkout -b feature/new-feature
# ... 개발 ...
git commit -m "feat: Add new feature"

# 2. 메인 브랜치에 머지
git checkout main
git merge feature/new-feature

# 3. 태그 생성 (릴리즈)
git tag -a v1.0.1 -m "Release v1.0.1"
git push origin v1.0.1

# 4. 릴리즈 노트 작성 (GitHub)
# https://github.com/your-repo/releases
```

### 커밋 메시지 규칙

```
feat: 새 기능 추가
fix: 버그 수정
docs: 문서 변경
style: 코드 포맷팅
refactor: 코드 리팩토링
test: 테스트 추가
chore: 빌드 설정 등
```

예시:
```bash
git commit -m "feat: Add push notification for match registration"
git commit -m "fix: Resolve attendance status update issue"
git commit -m "docs: Update API documentation"
```

---

## 6. 롤백 방법

### A. 백엔드 롤백

#### Cloud Run 이전 버전으로 롤백

```bash
# 1. 배포 히스토리 확인
gcloud run revisions list \
  --service=soccer-backend \
  --region=asia-northeast3

# 2. 이전 리비전으로 트래픽 전환
gcloud run services update-traffic soccer-backend \
  --to-revisions=soccer-backend-00005-abc=100 \
  --region=asia-northeast3

# 또는 태그로 롤백
gcloud run services update-traffic soccer-backend \
  --to-tags=stable=100 \
  --region=asia-northeast3
```

#### Git으로 롤백

```bash
cd backend

# 1. 이전 커밋 확인
git log --oneline

# 2. 특정 커밋으로 되돌리기
git revert HEAD

# 또는 강제 롤백 (주의!)
git reset --hard <commit-hash>
git push --force

# 3. 재배포
gcloud run deploy soccer-backend --source .
```

### B. 모바일 앱 롤백

#### Expo OTA 업데이트 롤백

```bash
# 1. 이전 업데이트로 롤백
eas update --branch production --message "Rollback to previous version"

# 2. 특정 업데이트로 롤백
eas channel:rollback production --group-id <update-group-id>
```

#### 앱 스토어 롤백

**Google Play Store:**
1. Play Console > 앱 선택 > 출시 관리 > 프로덕션
2. 이전 버전 선택 > "이 버전으로 복원"

**App Store:**
1. App Store Connect > 앱 선택
2. "제출 준비 중"으로 변경
3. 이전 빌드 선택 > "제출"

### C. 데이터베이스 롤백

⚠️ **주의: 데이터베이스는 자동 롤백이 어렵습니다!**

**예방 조치:**

```bash
# 1. 정기적인 백업
# Firestore 자동 백업 설정 (Google Cloud Console)

# 2. 수동 백업
gcloud firestore export gs://your-bucket/backup-$(date +%Y%m%d)

# 3. 복원
gcloud firestore import gs://your-bucket/backup-20251231
```

---

## 🔄 일반적인 업데이트 시나리오

### 시나리오 1: 버그 수정 (Hot Fix)

```bash
# 1. 버그 수정
cd backend  # 또는 mobile
git checkout -b hotfix/fix-critical-bug

# 2. 수정 후 테스트
npm run dev

# 3. 커밋 & 푸시
git commit -m "fix: Fix critical bug in attendance"
git push origin hotfix/fix-critical-bug

# 4. 즉시 배포
# 백엔드:
gcloud run deploy soccer-backend --source .

# 모바일:
cd mobile
eas update --branch production --message "Hotfix: Critical bug"

# 5. 메인 브랜치에 머지
git checkout main
git merge hotfix/fix-critical-bug
```

### 시나리오 2: 새 기능 추가

```bash
# 1. 백엔드 API 추가
cd backend
# ... API 구현 ...
git commit -m "feat: Add leaderboard API"
gcloud run deploy soccer-backend --source .

# 2. 모바일 앱 화면 추가
cd mobile
# ... 화면 구현 ...
git commit -m "feat: Add leaderboard screen"

# 3. 버전 업데이트
# mobile/app.json에서 version: 1.1.0

# 4. OTA 업데이트 또는 새 빌드
eas update --branch production  # OTA
# 또는
eas build --platform all  # 새 빌드
```

### 시나리오 3: 보안 패치

```bash
# 1. 패키지 업데이트
cd backend
npm audit fix
npm update

cd ../mobile
npm audit fix
npm update

# 2. 테스트
npm run dev

# 3. 배포
# 백엔드: Cloud Run 재배포
# 모바일: 새 빌드 필요
```

---

## 📋 체크리스트

### 배포 전 체크리스트

- [ ] 로컬에서 테스트 완료
- [ ] 버전 번호 업데이트 (app.json)
- [ ] 변경사항 문서화 (CHANGELOG.md)
- [ ] Git 커밋 & 푸시
- [ ] 환경 변수 확인
- [ ] 데이터베이스 마이그레이션 필요 여부 확인
- [ ] 보안 규칙 변경 여부 확인
- [ ] 백업 완료 (중요한 변경 시)

### 배포 후 체크리스트

- [ ] Health Check 확인
- [ ] API 엔드포인트 테스트
- [ ] 앱 스토어에서 다운로드 테스트
- [ ] 주요 기능 동작 확인
- [ ] 에러 로그 모니터링
- [ ] 사용자 피드백 확인

---

## 🚨 긴급 상황 대응

### 프로덕션에서 치명적 버그 발견 시

1. **즉시 롤백**
   ```bash
   # 백엔드
   gcloud run services update-traffic soccer-backend \
     --to-revisions=<previous-revision>=100

   # 모바일
   eas channel:rollback production
   ```

2. **원인 파악**
   ```bash
   # 백엔드 로그 확인
   gcloud logging read "resource.type=cloud_run_revision" \
     --limit 50 \
     --format json

   # Firestore 로그 확인
   # Firebase Console > Firestore > Usage 탭
   ```

3. **수정 & 재배포**
   - Hotfix 브랜치에서 수정
   - 철저한 테스트 후 재배포

---

## 📞 문의 및 지원

문제 발생 시:
1. GitHub Issues에 등록
2. 개발팀에 연락
3. 로그 파일 첨부

---

**마지막 업데이트: 2025-12-31**








