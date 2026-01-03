/**
 * 회원 관리 라우트
 */

import { Router } from 'express';
import multer from 'multer';
import * as memberController from '../controllers/memberController';
import { authenticateUser } from '../middleware/auth';
import { requireManager, requireAdmin } from '../middleware/authorization';
import { validateMemberCreate, validateMemberUpdate } from '../middleware/validator';

const router = Router();

// 파일 업로드 설정 (메모리 저장)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB 제한
  fileFilter: (_req, file, cb) => {
    // 확장자로 체크
    const ext = file.originalname.toLowerCase().split('.').pop();
    if (ext === 'xlsx' || ext === 'xls') {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files (.xlsx, .xls) are allowed'));
    }
  },
});

// 모든 라우트는 인증 필요
router.use(authenticateUser);

// 엑셀 템플릿 다운로드 (/:id 보다 먼저 정의해야 함)
router.get('/template/excel', memberController.downloadTemplate);

// 엑셀로 회원 일괄 등록 (Manager 이상)
router.post('/upload/excel', requireManager, upload.single('file'), memberController.bulkUploadMembers);

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
