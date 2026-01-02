# 모바일 앱 설치 가이드

축구 경기 기록 앱을 휴대폰에 설치하는 방법을 안내합니다.

---

## 🚀 방법 1: Expo Go로 즉시 테스트 (추천 ⭐⭐⭐)

가장 빠르고 간단한 방법입니다!

### 1단계: Expo Go 앱 설치

**안드로이드:**
- [Google Play Store - Expo Go](https://play.google.com/store/apps/details?id=host.exp.exponent)

**iOS:**
- [App Store - Expo Go](https://apps.apple.com/app/expo-go/id982107779)

### 2단계: 개발 서버 실행

```powershell
cd E:\Dev\github\Soccer\mobile
npx expo start
```

### 3단계: 앱 실행

#### 방법 A: QR 코드 스캔
- 터미널에 표시된 QR 코드를 스캔
- 안드로이드: Expo Go 앱에서 스캔
- iOS: 카메라 앱으로 스캔 → "Expo Go에서 열기"

#### 방법 B: 같은 WiFi 연결
- 휴대폰과 PC가 같은 WiFi에 연결되어 있으면
- Expo Go 앱에서 자동으로 프로젝트 표시됨

### 장점
- ✅ 5분 안에 테스트 가능
- ✅ 코드 수정 시 실시간 반영 (Hot Reload)
- ✅ 빌드 시간 불필요
- ✅ 무료

### 단점
- ❌ Expo Go 앱이 필요함
- ❌ 오프라인 사용 제한
- ❌ 앱 아이콘/스플래시 화면이 Expo 기본값

---

## 📦 방법 2: APK/IPA 파일로 설치 (독립 앱)

실제 앱처럼 독립적으로 설치합니다.

### 사전 준비

1. **Expo 계정 생성**
   - [https://expo.dev/signup](https://expo.dev/signup)

2. **EAS CLI 로그인**
   ```powershell
   cd E:\Dev\github\Soccer\mobile
   npx eas login
   ```

### 안드로이드 APK 빌드

#### 1단계: EAS 프로젝트 설정

```powershell
cd E:\Dev\github\Soccer\mobile
npx eas build:configure
```

프롬프트에 따라 설정:
- Android 빌드 선택
- `eas.json` 파일 자동 생성

#### 2단계: APK 빌드

```powershell
# 개발용 APK (빠름, 테스트용)
npx eas build --platform android --profile preview

# 프로덕션 APK (최적화됨)
npx eas build --platform android --profile production
```

#### 3단계: APK 다운로드

- 빌드 완료 후 링크가 표시됨
- 링크를 휴대폰 브라우저에서 열기
- APK 다운로드 및 설치

#### 4단계: 안드로이드 설치

1. 다운로드한 APK 파일 실행
2. "알 수 없는 출처" 허용 (설정에서)
3. 설치 진행

### iOS IPA 빌드 (Apple 개발자 계정 필요)

```powershell
# Apple 개발자 계정 등록 필요 ($99/년)
npx eas build --platform ios --profile preview
```

**참고:** iOS는 Apple 개발자 계정이 없으면 빌드 불가

### 장점
- ✅ 독립 실행 앱
- ✅ 앱 아이콘, 스플래시 화면 커스터마이징
- ✅ 오프라인 사용 가능
- ✅ 실제 배포 전 테스트

### 단점
- ❌ 빌드 시간 소요 (10-30분)
- ❌ Expo 계정 필요
- ❌ iOS는 Apple 개발자 계정 필요 ($99/년)

---

## 🌐 방법 3: 로컬 빌드 (고급)

컴퓨터에서 직접 APK를 빌드합니다.

### 사전 준비

1. **Android Studio 설치**
2. **Java JDK 설치**
3. **Android SDK 설정**

### 빌드 명령

```powershell
cd E:\Dev\github\Soccer\mobile

# Prebuild (네이티브 코드 생성)
npx expo prebuild

# 안드로이드 APK 빌드
cd android
./gradlew assembleRelease

# APK 위치
# android/app/build/outputs/apk/release/app-release.apk
```

### 장점
- ✅ 완전한 제어
- ✅ 오프라인 빌드 가능
- ✅ 무료

### 단점
- ❌ 복잡한 설정
- ❌ 시간 소요 (최초 설정 1-2시간)
- ❌ 개발 환경 지식 필요

---

## 📱 추천 순서

### 단계별 접근

1. **개발/테스트 단계** → **Expo Go** ⭐⭐⭐
   - 빠른 테스트 및 디버깅
   - 코드 수정 후 즉시 확인

2. **내부 테스트 단계** → **EAS Build (Preview)** ⭐⭐
   - 실제 앱처럼 동작 확인
   - 팀원/지인에게 APK 공유

3. **정식 배포 준비** → **EAS Build (Production)** ⭐
   - Google Play Store 업로드 준비
   - 최적화된 빌드

---

## 🎯 지금 바로 시작하기 (Expo Go)

### 1분 만에 앱 실행하기

```powershell
# 1. 개발 서버 시작
cd E:\Dev\github\Soccer\mobile
npx expo start

# 2. 휴대폰에 Expo Go 설치
# (Play Store 또는 App Store에서)

# 3. QR 코드 스캔
# (터미널에 표시된 QR 코드)
```

---

## 🆘 문제 해결

### 문제 1: QR 코드가 안 보여요
**해결:**
```powershell
npx expo start --tunnel
```

### 문제 2: 같은 WiFi인데 연결 안 돼요
**해결:**
- 방화벽 확인
- PC와 휴대폰 네트워크 설정 확인
- `--tunnel` 옵션 사용

### 문제 3: APK 설치가 차단돼요 (안드로이드)
**해결:**
1. 설정 → 보안
2. "알 수 없는 출처" 허용
3. Chrome 또는 파일 관리자에 설치 권한 부여

### 문제 4: EAS 빌드가 실패해요
**해결:**
```powershell
# 로그 확인
npx eas build:list

# app.json 확인
# version, versionCode 설정 확인
```

---

## 📊 방법 비교표

| 방법 | 속도 | 난이도 | 비용 | 오프라인 | 앱스토어 배포 |
|------|------|--------|------|----------|---------------|
| **Expo Go** | ⚡ 1분 | ⭐ 쉬움 | 무료 | ❌ | ❌ |
| **EAS Build** | ⏱️ 20분 | ⭐⭐ 보통 | 무료* | ✅ | ✅ |
| **로컬 빌드** | ⏱️ 30분+ | ⭐⭐⭐ 어려움 | 무료 | ✅ | ✅ |

*EAS 무료 플랜: 월 30회 빌드 제한

---

## 🎓 다음 단계

### 앱 배포 준비

1. **Google Play Store 배포**
   - Google Play Console 계정 등록 ($25 일회성)
   - 프로덕션 APK 업로드
   - [배포 가이드](https://docs.expo.dev/submit/android/)

2. **Apple App Store 배포**
   - Apple 개발자 계정 등록 ($99/년)
   - TestFlight 베타 테스트
   - App Store 심사 및 배포
   - [배포 가이드](https://docs.expo.dev/submit/ios/)

3. **OTA 업데이트 설정**
   - EAS Update로 코드 변경 시 자동 업데이트
   - 앱스토어 재배포 없이 업데이트 가능

---

## 📚 참고 자료

- [Expo 공식 문서](https://docs.expo.dev/)
- [EAS Build 가이드](https://docs.expo.dev/build/introduction/)
- [EAS Submit 가이드](https://docs.expo.dev/submit/introduction/)
- [Expo Go 다운로드](https://expo.dev/client)

---

## ✅ 체크리스트

### Expo Go 테스트
- [ ] Expo Go 앱 설치
- [ ] 개발 서버 실행
- [ ] QR 코드 스캔
- [ ] 앱 실행 확인

### APK 빌드
- [ ] Expo 계정 생성
- [ ] EAS CLI 로그인
- [ ] `eas build:configure` 실행
- [ ] APK 빌드 시작
- [ ] APK 다운로드
- [ ] 휴대폰에 설치

### 최종 배포
- [ ] Play Console 계정 등록
- [ ] 프로덕션 빌드
- [ ] 스토어 등록 정보 작성
- [ ] 스크린샷 및 설명 준비
- [ ] 배포 신청






