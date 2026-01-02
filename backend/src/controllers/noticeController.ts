/**
 * 공지사항 & 알림 컨트롤러
 */

import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { FieldValue } from 'firebase-admin/firestore';
import { sendNotificationToAll } from '../services/notificationService';
import { getDb } from '../config/firebase';

// ========================================
// 공지사항
// ========================================

export async function getAllNotices(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { important, isActive } = req.query;

    let query: any = getDb().collection('notices');

    if (important !== undefined) {
      query = query.where('important', '==', important === 'true');
    }

    if (isActive !== undefined) {
      query = query.where('isActive', '==', isActive === 'true');
    }

    const snapshot = await query.orderBy('createdAt', 'desc').get();

    const notices = snapshot.docs.map((doc: FirebaseFirestore.QueryDocumentSnapshot) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({
      success: true,
      data: notices,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch notices',
    });
  }
}

export async function getNoticeById(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const doc = await getDb().collection('notices').doc(id).get();

    if (!doc.exists) {
      res.status(404).json({
        success: false,
        error: 'Notice not found',
      });
      return;
    }

    res.json({
      success: true,
      data: {
        id: doc.id,
        ...doc.data(),
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch notice',
    });
  }
}

export async function createNotice(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { title, content, important, attachments, sendNotification } = req.body;

    const noticeData = {
      title,
      content,
      important: important || false,
      attachments: attachments || [],
      authorId: req.user?.uid || null,
      isActive: true,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    const docRef = await getDb().collection('notices').add(noticeData);

    if (sendNotification) {
      await sendNotificationToAll({
        type: 'notice',
        title: `공지사항: ${title}`,
        content: content.substring(0, 100),
        relatedId: docRef.id,
      });
    }

    res.status(201).json({
      success: true,
      data: {
        id: docRef.id,
        ...noticeData,
      },
      message: 'Notice created successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create notice',
    });
  }
}

export async function updateNotice(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const updates = req.body;

    const doc = await getDb().collection('notices').doc(id).get();

    if (!doc.exists) {
      res.status(404).json({
        success: false,
        error: 'Notice not found',
      });
      return;
    }

    const allowedFields = ['title', 'content', 'important', 'attachments', 'isActive'];
    const updateData: any = {};

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        updateData[field] = updates[field];
      }
    }

    updateData.updatedAt = FieldValue.serverTimestamp();

    await getDb().collection('notices').doc(id).update(updateData);

    const updatedDoc = await getDb().collection('notices').doc(id).get();

    res.json({
      success: true,
      data: {
        id: updatedDoc.id,
        ...updatedDoc.data(),
      },
      message: 'Notice updated successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update notice',
    });
  }
}

export async function deleteNotice(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const doc = await getDb().collection('notices').doc(id).get();

    if (!doc.exists) {
      res.status(404).json({
        success: false,
        error: 'Notice not found',
      });
      return;
    }

    await getDb().collection('notices').doc(id).update({
      isActive: false,
      updatedAt: FieldValue.serverTimestamp(),
    });

    res.json({
      success: true,
      message: 'Notice deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete notice',
    });
  }
}

// ========================================
// 알림
// ========================================

export async function getNotifications(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { userId, isRead } = req.query;

    let query: any = getDb().collection('notifications');

    if (userId) {
      query = query.where('userId', '==', userId);
    }

    if (isRead !== undefined) {
      query = query.where('isRead', '==', isRead === 'true');
    }

    const snapshot = await query.orderBy('createdAt', 'desc').limit(50).get();

    const notifications = snapshot.docs.map((doc: FirebaseFirestore.QueryDocumentSnapshot) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({
      success: true,
      data: notifications,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch notifications',
    });
  }
}

export async function markAsRead(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const doc = await getDb().collection('notifications').doc(id).get();

    if (!doc.exists) {
      res.status(404).json({
        success: false,
        error: 'Notification not found',
      });
      return;
    }

    await getDb().collection('notifications').doc(id).update({
      isRead: true,
    });

    res.json({
      success: true,
      message: 'Notification marked as read',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to mark notification as read',
    });
  }
}

export async function deleteNotification(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const doc = await getDb().collection('notifications').doc(id).get();

    if (!doc.exists) {
      res.status(404).json({
        success: false,
        error: 'Notification not found',
      });
      return;
    }

    await getDb().collection('notifications').doc(id).delete();

    res.json({
      success: true,
      message: 'Notification deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete notification',
    });
  }
}






