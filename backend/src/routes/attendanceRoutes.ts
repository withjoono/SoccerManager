/**
 * 출석 관리 라우트
 */

import { Router } from 'express';
import * as attendanceController from '../controllers/attendanceController';
import { authenticateUser } from '../middleware/auth';
import { requireManager } from '../middleware/authorization';
import { validateAttendanceBulk } from '../middleware/validator';

const router = Router();

router.use(authenticateUser);

// 출석 조회
router.get('/', attendanceController.getAttendances);

// 출석 일괄 등록/수정 (Manager 이상)
router.post('/bulk', requireManager, validateAttendanceBulk, attendanceController.bulkUpdateAttendances);

// 출석 수정
router.put('/:id', attendanceController.updateAttendance);

export default router;
