/**
 * 경기 관리 라우트
 */

import { Router } from 'express';
import * as matchController from '../controllers/matchController';
import { authenticateUser } from '../middleware/auth';
import { requireManager } from '../middleware/authorization';
import { validateMatchCreate, validateMatchUpdate, validateDateRange } from '../middleware/validator';

const router = Router();

router.use(authenticateUser);

// 경기 조회
router.get('/', validateDateRange, matchController.getAllMatches);
router.get('/:id', matchController.getMatchById);

// 경기 생성 (Manager 이상)
router.post('/', requireManager, validateMatchCreate, matchController.createMatch);

// 경기 수정 (Manager 이상)
router.put('/:id', requireManager, validateMatchUpdate, matchController.updateMatch);

// 경기 삭제/취소 (Manager 이상)
router.delete('/:id', requireManager, matchController.deleteMatch);

export default router;
