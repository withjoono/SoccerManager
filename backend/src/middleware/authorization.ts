/**
 * 권한 검증 미들웨어
 * Role-Based Access Control (RBAC)
 */

import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  MEMBER = 'member',
}

/**
 * 특정 역할을 요구하는 미들웨어 팩토리
 */
export const requireRole = (...allowedRoles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized: Authentication required',
      });
      return;
    }

    const userRole = req.user.role as UserRole;

    if (!userRole || !allowedRoles.includes(userRole)) {
      res.status(403).json({
        success: false,
        error: 'Forbidden: Insufficient permissions',
        requiredRoles: allowedRoles,
        userRole: userRole || 'none',
      });
      return;
    }

    next();
  };
};

/**
 * Admin 권한 요구
 */
export const requireAdmin = requireRole(UserRole.ADMIN);

/**
 * Manager 이상 권한 요구
 */
export const requireManager = requireRole(UserRole.ADMIN, UserRole.MANAGER);

/**
 * 인증된 사용자 요구 (모든 역할)
 */
export const requireAuth = requireRole(
  UserRole.ADMIN,
  UserRole.MANAGER,
  UserRole.MEMBER
);

/**
 * 본인 또는 Manager 이상인지 확인
 */
export const requireSelfOrManager = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'Unauthorized: Authentication required',
    });
    return;
  }

  const userRole = req.user.role as UserRole;
  const targetUserId = req.params.id || req.body.memberId;
  const currentUserId = req.user.memberId;

  // Admin이나 Manager면 통과
  if (userRole === UserRole.ADMIN || userRole === UserRole.MANAGER) {
    next();
    return;
  }

  // 본인이면 통과
  if (currentUserId === targetUserId) {
    next();
    return;
  }

  res.status(403).json({
    success: false,
    error: 'Forbidden: Can only access your own data',
  });
};






