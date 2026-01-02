/**
 * 경기 이벤트 라우트
 */

import { Router } from 'express';
import * as matchEventController from '../controllers/matchEventController';
import { authenticateUser } from '../middleware/auth';
import { requireManager } from '../middleware/authorization';
import { validateMatchEvent } from '../middleware/validator';

const router = Router();

router.use(authenticateUser);

// 경기 이벤트 조회
router.get('/', matchEventController.getMatchEvents);

// 경기 이벤트 생성 (Manager 이상)
router.post('/', requireManager, validateMatchEvent, matchEventController.createMatchEvent);

// 경기 이벤트 삭제 (Manager 이상)
router.delete('/:id', requireManager, matchEventController.deleteMatchEvent);

export default router;








