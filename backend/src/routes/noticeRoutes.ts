/**
 * 공지사항 & 알림 라우트
 */

import { Router } from 'express';
import * as noticeController from '../controllers/noticeController';
import { authenticateUser } from '../middleware/auth';
import { requireManager } from '../middleware/authorization';
import { validateNoticeCreate, validateNoticeUpdate } from '../middleware/validator';

const router = Router();

router.use(authenticateUser);

// ========================================
// 공지사항
// ========================================
router.get('/notices', noticeController.getAllNotices);
router.get('/notices/:id', noticeController.getNoticeById);
router.post('/notices', requireManager, validateNoticeCreate, noticeController.createNotice);
router.put('/notices/:id', requireManager, validateNoticeUpdate, noticeController.updateNotice);
router.delete('/notices/:id', requireManager, noticeController.deleteNotice);

// ========================================
// 알림
// ========================================
router.get('/notifications', noticeController.getNotifications);
router.put('/notifications/:id/read', noticeController.markAsRead);
router.delete('/notifications/:id', noticeController.deleteNotification);

export default router;








