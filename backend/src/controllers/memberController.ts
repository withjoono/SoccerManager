/**
 * 회원 관리 컨트롤러
 */

import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { FieldValue } from 'firebase-admin/firestore';
import { getDb } from '../config/firebase';

/**
 * 전체 회원 조회
 */
export async function getAllMembers(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { teamId, isActive } = req.query;

    let query: any = getDb().collection('members');

    if (teamId) {
      query = query.where('teamId', '==', teamId);
    }

    if (isActive !== undefined) {
      query = query.where('isActive', '==', isActive === 'true');
    }

    const snapshot = await query.orderBy('name', 'asc').get();

    const members = snapshot.docs.map((doc: FirebaseFirestore.QueryDocumentSnapshot) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({
      success: true,
      data: members,
      count: members.length,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch members',
    });
  }
}

/**
 * 특정 회원 조회
 */
export async function getMemberById(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const doc = await getDb().collection('members').doc(id).get();

    if (!doc.exists) {
      res.status(404).json({
        success: false,
        error: 'Member not found',
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
      error: error.message || 'Failed to fetch member',
    });
  }
}

/**
 * 회원 생성
 */
export async function createMember(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { name, phone, email, teamId, position, jerseyNumber, photoURL } = req.body;

    const memberData = {
      name,
      phone: phone || null,
      email: email || null,
      teamId: teamId || null,
      position: position || null,
      jerseyNumber: jerseyNumber || null,
      photoURL: photoURL || null,
      isActive: true,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    const docRef = await getDb().collection('members').add(memberData);

    res.status(201).json({
      success: true,
      data: {
        id: docRef.id,
        ...memberData,
      },
      message: 'Member created successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create member',
    });
  }
}

/**
 * 회원 정보 수정
 */
export async function updateMember(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const updates = req.body;

    const doc = await getDb().collection('members').doc(id).get();

    if (!doc.exists) {
      res.status(404).json({
        success: false,
        error: 'Member not found',
      });
      return;
    }

    // 업데이트할 필드만 추출
    const allowedFields = ['name', 'phone', 'email', 'teamId', 'position', 'jerseyNumber', 'photoURL'];
    const updateData: any = {};

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        updateData[field] = updates[field];
      }
    }

    updateData.updatedAt = FieldValue.serverTimestamp();

    await getDb().collection('members').doc(id).update(updateData);

    const updatedDoc = await getDb().collection('members').doc(id).get();

    res.json({
      success: true,
      data: {
        id: updatedDoc.id,
        ...updatedDoc.data(),
      },
      message: 'Member updated successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update member',
    });
  }
}

/**
 * 회원 삭제 (Soft Delete)
 */
export async function deleteMember(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const doc = await getDb().collection('members').doc(id).get();

    if (!doc.exists) {
      res.status(404).json({
        success: false,
        error: 'Member not found',
      });
      return;
    }

    // Soft delete: isActive = false
    await getDb().collection('members').doc(id).update({
      isActive: false,
      updatedAt: FieldValue.serverTimestamp(),
    });

    res.json({
      success: true,
      message: 'Member deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete member',
    });
  }
}

/**
 * 회원 완전 삭제 (Hard Delete) - Admin만
 */
export async function hardDeleteMember(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const doc = await getDb().collection('members').doc(id).get();

    if (!doc.exists) {
      res.status(404).json({
        success: false,
        error: 'Member not found',
      });
      return;
    }

    await getDb().collection('members').doc(id).delete();

    res.json({
      success: true,
      message: 'Member permanently deleted',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete member',
    });
  }
}
