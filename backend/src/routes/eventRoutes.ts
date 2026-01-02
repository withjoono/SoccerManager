import { Router } from 'express';
import { body } from 'express-validator';
import {
  getEventsByMatch,
  createEvent,
  deleteEvent,
} from '../controllers/eventController';
import { validate } from '../middleware/validation';

const router = Router();

// GET /api/events/match/:matchId - 특정 경기의 이벤트 조회
router.get('/match/:matchId', getEventsByMatch);

// POST /api/events - 이벤트 생성
router.post(
  '/',
  [
    body('matchId').trim().notEmpty().withMessage('Match ID is required'),
    body('memberId').trim().notEmpty().withMessage('Member ID is required'),
    body('team').isIn(['A', 'B']).withMessage('Team must be A or B'),
    body('type').isIn(['goal', 'assist', 'yellowCard', 'redCard']).withMessage('Valid type is required'),
    body('minute').optional().isInt({ min: 0, max: 999 }),
    body('notes').optional().trim(),
    validate,
  ],
  createEvent
);

// DELETE /api/events/:id - 이벤트 삭제
router.delete('/:id', deleteEvent);

export default router;






