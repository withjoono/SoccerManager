/**
 * 팀 구성 라우트
 */

import { Router } from 'express';
import * as teamAssignmentController from '../controllers/teamAssignmentController';
import { authenticateUser } from '../middleware/auth';
import { requireManager } from '../middleware/authorization';
import { validateTeamAssignment } from '../middleware/validator';

const router = Router();

router.use(authenticateUser);

// 팀 구성 조회
router.get('/', teamAssignmentController.getTeamAssignment);

// 팀 구성 생성/업데이트 (Manager 이상)
router.post('/', requireManager, validateTeamAssignment, teamAssignmentController.createTeamAssignment);

// 팀 구성 수정 (Manager 이상)
router.put('/:id', requireManager, teamAssignmentController.updateTeamAssignment);

// 팀 구성 삭제 (Manager 이상)
router.delete('/:id', requireManager, teamAssignmentController.deleteTeamAssignment);

export default router;








