import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

// Firebase Admin SDK 초기화
const initializeFirebase = () => {
  // 이미 초기화된 경우 스킵
  if (admin.apps.length > 0) {
    console.log('✅ Firebase Admin already initialized');
    return;
  }

  try {
    // 환경변수에서 Firebase 설정 가져오기
    const projectId = process.env.FIREBASE_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT || 'soccer-match-mgr';
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (clientEmail && privateKey) {
      // 환경변수로 초기화 (명시적 서비스 계정)
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
        projectId,
      });
      console.log('✅ Firebase Admin initialized with service account credentials');
    } else {
      // Google Cloud Run에서 실행시 Application Default Credentials(ADC) 사용
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId,
      });
      console.log('✅ Firebase Admin initialized with Application Default Credentials');
    }
  } catch (error) {
    console.error('❌ Error initializing Firebase Admin:', error);
    throw error;
  }
};

// Firestore 인스턴스 (지연 초기화)
export const getFirestore = () => {
  // 초기화되지 않은 경우 초기화
  if (admin.apps.length === 0) {
    initializeFirebase();
  }
  return admin.firestore();
};

// 컨트롤러에서 사용할 DB 인스턴스 getter (지연 초기화)
export const getDb = () => getFirestore();

// Storage 인스턴스
export const getStorage = () => {
  // 초기화되지 않은 경우 초기화
  if (admin.apps.length === 0) {
    initializeFirebase();
  }
  return admin.storage();
};

export default initializeFirebase;








