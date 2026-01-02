/**
 * 출석 관리 컨트롤러
 */

import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { FieldValue } from 'firebase-admin/firestore';
import { getDb } from '../config/firebase';

export async function getAttendances(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { matchId, status, memberId } = req.query;

    if (!matchId) {
      res.status(400).json({
        success: false,
        error: 'matchId is required',
      });
      return;
    }

    let query: any = getDb().collection('attendances').where('matchId', '==', matchId);

    if (status) {
      query = query.where('status', '==', status);
    }

    if (memberId) {
      query = query.where('memberId', '==', memberId);
    }

    const snapshot = await query.get();

    const attendances = [];
    for (const doc of snapshot.docs) {
      const data = doc.data();
      
      // 회원 정보 조회
      const memberDoc = await getDb().collection('members').doc(data.memberId).get();
      const member = memberDoc.data();

      attendances.push({
        id: doc.id,
        ...data,
        memberName: member?.name,
        memberPosition: member?.position,
      });
    }

    res.json({
      success: true,
      data: attendances,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch attendances',
    });
  }
}

export async function bulkUpdateAttendances(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { matchId, attendances } = req.body;

    const batch = getDb().batch();

    for (const attendance of attendances) {
      const { memberId, status } = attendance;

      // 기존 출석 레코드 찾기
      const existingSnapshot = await getDb()
        .collection('attendances')
        .where('matchId', '==', matchId)
        .where('memberId', '==', memberId)
        .get();

      if (existingSnapshot.empty) {
        // 새로 생성
        const docRef = getDb().collection('attendances').doc();
        batch.set(docRef, {
          matchId,
          memberId,
          status,
          checkedAt: status === 'present' ? FieldValue.serverTimestamp() : null,
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });
      } else {
        // 업데이트
        const docRef = existingSnapshot.docs[0].ref;
        batch.update(docRef, {
          status,
          checkedAt: status === 'present' ? FieldValue.serverTimestamp() : null,
          updatedAt: FieldValue.serverTimestamp(),
        });
      }
    }

    await batch.commit();

    res.json({
      success: true,
      message: 'Attendances updated successfully',
      count: attendances.length,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update attendances',
    });
  }
}

export async function updateAttendance(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const doc = await getDb().collection('attendances').doc(id).get();

    if (!doc.exists) {
      res.status(404).json({
        success: false,
        error: 'Attendance not found',
      });
      return;
    }

    await getDb().collection('attendances').doc(id).update({
      status,
      checkedAt: status === 'present' ? FieldValue.serverTimestamp() : null,
      updatedAt: FieldValue.serverTimestamp(),
    });

    const updatedDoc = await getDb().collection('attendances').doc(id).get();

    res.json({
      success: true,
      data: {
        id: updatedDoc.id,
        ...updatedDoc.data(),
      },
      message: 'Attendance updated successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update attendance',
    });
  }
}
