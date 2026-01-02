import { Router } from 'express';
import {
  getMemberStats,
  getAllMembersStats,
} from '../controllers/statsController';

const router = Router();

// GET /api/stats/member/:memberId - 특정 회원 통계 조회
router.get('/member/:memberId', getMemberStats);

// GET /api/stats/members - 전체 회원 통계 조회
router.get('/members', getAllMembersStats);

export default router;






