/**
 * 팀 관리 라우트
 */

import { Router } from 'express';
import * as teamController from '../controllers/teamController';
import { authenticateUser } from '../middleware/auth';
import { requireManager } from '../middleware/authorization';
import { validateTeamCreate, validateTeamUpdate } from '../middleware/validator';

const router = Router();

router.use(authenticateUser);

// 팀 조회
router.get('/', teamController.getAllTeams);
router.get('/:id', teamController.getTeamById);

// 팀 생성 (Manager 이상)
router.post('/', requireManager, validateTeamCreate, teamController.createTeam);

// 팀 수정 (Manager 이상)
router.put('/:id', requireManager, validateTeamUpdate, teamController.updateTeam);

// 팀 삭제 (Manager 이상)
router.delete('/:id', requireManager, teamController.deleteTeam);

export default router;
