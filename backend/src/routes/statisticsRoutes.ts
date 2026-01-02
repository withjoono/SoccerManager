/**
 * 통계 라우트
 */

import { Router } from 'express';
import * as statisticsController from '../controllers/statisticsController';
import { authenticateUser } from '../middleware/auth';
import { requireAdmin } from '../middleware/authorization';

const router = Router();

router.use(authenticateUser);

// 통계 조회
router.get('/', statisticsController.getAllStatistics);
router.get('/leaderboard', statisticsController.getLeaderboard);
router.get('/:memberId', statisticsController.getMemberStatistics);

// 통계 재계산 (Admin만)
router.post('/recalculate', requireAdmin, statisticsController.recalculateStatistics);
router.post('/:memberId/recalculate', requireAdmin, statisticsController.recalculateMemberStatistics);

export default router;






