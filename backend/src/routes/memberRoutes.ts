/**
 * 회원 관리 라우트
 */

import { Router } from 'express';
import * as memberController from '../controllers/memberController';
import { authenticateUser } from '../middleware/auth';
import { requireManager, requireAdmin } from '../middleware/authorization';
import { validateMemberCreate, validateMemberUpdate } from '../middleware/validator';

const router = Router();

// 모든 라우트는 인증 필요
router.use(authenticateUser);

// 회원 조회
router.get('/', memberController.getAllMembers);
router.get('/:id', memberController.getMemberById);

// 회원 생성 (Manager 이상)
router.post('/', requireManager, validateMemberCreate, memberController.createMember);

// 회원 수정 (Manager 이상)
router.put('/:id', requireManager, validateMemberUpdate, memberController.updateMember);

// 회원 삭제 (Manager 이상) - Soft Delete
router.delete('/:id', requireManager, memberController.deleteMember);

// 회원 완전 삭제 (Admin만)
router.delete('/:id/hard', requireAdmin, memberController.hardDeleteMember);

export default router;
