/**
 * 인증 미들웨어
 * Firebase Authentication 토큰 검증
 */

import { Request, Response, NextFunction } from 'express';
import admin from 'firebase-admin';

// Request에 user 추가
export interface AuthRequest extends Request {
  user?: admin.auth.DecodedIdToken;
}

/**
 * JWT 토큰 검증 미들웨어
 */
export const authenticateUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // 개발 모드에서 테스트용 바이패스
    if (process.env.NODE_ENV === 'development' || process.env.ALLOW_TEST_ACCESS === 'true') {
      const testHeader = req.headers['x-test-mode'];
      if (testHeader === 'true') {
        req.user = {
          uid: 'test-user',
          email: 'test@example.com',
          role: 'admin',  // 테스트용 관리자 권한
        } as unknown as admin.auth.DecodedIdToken;
        next();
        return;
      }
    }

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized: No token provided',
      });
      return;
    }

    const token = authHeader.split('Bearer ')[1];

    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      req.user = decodedToken;
      next();
    } catch (error) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized: Invalid token',
      });
      return;
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

/**
 * 선택적 인증 미들웨어 (토큰이 있으면 검증, 없어도 통과)
 */
export const optionalAuth = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      next();
      return;
    }

    const token = authHeader.split('Bearer ')[1];

    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      req.user = decodedToken;
    } catch (error) {
      // 토큰이 유효하지 않아도 계속 진행
      console.warn('Invalid token, but continuing:', error);
    }

    next();
  } catch (error) {
    next();
  }
};








