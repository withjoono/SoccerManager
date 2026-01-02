/**
 * 입력 검증 미들웨어
 * express-validator 사용
 */

import { body, param, query, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

/**
 * 검증 결과 확인 미들웨어
 */
export const validate = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array(),
    });
    return;
  }

  next();
};

// ========================================
// 회원 검증
// ========================================
export const validateMemberCreate = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('phone').optional().trim().isMobilePhone('ko-KR').withMessage('Invalid phone number'),
  body('email').optional().trim().isEmail().withMessage('Invalid email'),
  body('teamId').optional().trim(),
  body('position').optional().isIn(['FW', 'MF', 'DF', 'GK']).withMessage('Invalid position'),
  body('jerseyNumber').optional().isInt({ min: 1, max: 99 }).withMessage('Invalid jersey number'),
  validate,
];

export const validateMemberUpdate = [
  param('id').trim().notEmpty().withMessage('Member ID is required'),
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('phone').optional().trim().isMobilePhone('ko-KR').withMessage('Invalid phone number'),
  body('email').optional().trim().isEmail().withMessage('Invalid email'),
  body('teamId').optional().trim(),
  body('position').optional().isIn(['FW', 'MF', 'DF', 'GK']).withMessage('Invalid position'),
  body('jerseyNumber').optional().isInt({ min: 1, max: 99 }).withMessage('Invalid jersey number'),
  validate,
];

// ========================================
// 팀 검증
// ========================================
export const validateTeamCreate = [
  body('name').trim().notEmpty().withMessage('Team name is required'),
  body('color').optional().trim().matches(/^#[0-9A-Fa-f]{6}$/).withMessage('Invalid color format'),
  body('description').optional().trim(),
  validate,
];

export const validateTeamUpdate = [
  param('id').trim().notEmpty().withMessage('Team ID is required'),
  body('name').optional().trim().notEmpty().withMessage('Team name cannot be empty'),
  body('color').optional().trim().matches(/^#[0-9A-Fa-f]{6}$/).withMessage('Invalid color format'),
  body('description').optional().trim(),
  validate,
];

// ========================================
// 경기 검증
// ========================================
export const validateMatchCreate = [
  body('title').optional().trim(),
  body('date').notEmpty().isISO8601().withMessage('Valid date is required'),
  body('location').optional().trim(),
  body('notes').optional().trim(),
  validate,
];

export const validateMatchUpdate = [
  param('id').trim().notEmpty().withMessage('Match ID is required'),
  body('title').optional().trim(),
  body('date').optional().isISO8601().withMessage('Invalid date format'),
  body('location').optional().trim(),
  body('notes').optional().trim(),
  body('status').optional().isIn(['scheduled', 'in_progress', 'completed', 'cancelled']),
  body('scoreA').optional().isInt({ min: 0 }).withMessage('Invalid score'),
  body('scoreB').optional().isInt({ min: 0 }).withMessage('Invalid score'),
  validate,
];

// ========================================
// 출석 검증
// ========================================
export const validateAttendanceBulk = [
  body('matchId').trim().notEmpty().withMessage('Match ID is required'),
  body('attendances').isArray().withMessage('Attendances must be an array'),
  body('attendances.*.memberId').trim().notEmpty().withMessage('Member ID is required'),
  body('attendances.*.status').isIn(['present', 'absent', 'pending']).withMessage('Invalid status'),
  validate,
];

// ========================================
// 팀 구성 검증
// ========================================
export const validateTeamAssignment = [
  body('matchId').trim().notEmpty().withMessage('Match ID is required'),
  body('teamA').isArray().withMessage('Team A must be an array'),
  body('teamB').isArray().withMessage('Team B must be an array'),
  body('teamC').optional().isArray().withMessage('Team C must be an array'),
  body('teamD').optional().isArray().withMessage('Team D must be an array'),
  validate,
];

// ========================================
// 경기 이벤트 검증
// ========================================
export const validateMatchEvent = [
  body('matchId').trim().notEmpty().withMessage('Match ID is required'),
  body('memberId').trim().notEmpty().withMessage('Member ID is required'),
  body('team').isIn(['A', 'B', 'C', 'D']).withMessage('Invalid team'),
  body('type').isIn(['goal', 'assist', 'yellowCard', 'redCard', 'ownGoal']).withMessage('Invalid event type'),
  body('assisterId').optional().trim(),
  body('minute').optional().isInt({ min: 0 }).withMessage('Invalid minute'),
  body('notes').optional().trim(),
  validate,
];

// ========================================
// 공지사항 검증
// ========================================
export const validateNoticeCreate = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('content').trim().notEmpty().withMessage('Content is required'),
  body('important').optional().isBoolean().withMessage('Important must be boolean'),
  validate,
];

export const validateNoticeUpdate = [
  param('id').trim().notEmpty().withMessage('Notice ID is required'),
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('content').optional().trim().notEmpty().withMessage('Content cannot be empty'),
  body('important').optional().isBoolean().withMessage('Important must be boolean'),
  body('isActive').optional().isBoolean().withMessage('isActive must be boolean'),
  validate,
];

// ========================================
// 알림 검증
// ========================================
export const validateNotificationCreate = [
  body('userId').optional().trim(),
  body('type').isIn(['match', 'team', 'notice', 'general']).withMessage('Invalid type'),
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('content').trim().notEmpty().withMessage('Content is required'),
  body('relatedId').optional().trim(),
  validate,
];

// ========================================
// 쿼리 파라미터 검증
// ========================================
export const validatePagination = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be >= 1'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1-100'),
  validate,
];

export const validateDateRange = [
  query('startDate').optional().isISO8601().withMessage('Invalid start date'),
  query('endDate').optional().isISO8601().withMessage('Invalid end date'),
  validate,
];






