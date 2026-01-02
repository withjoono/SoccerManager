/**
 * 경기 관리 컨트롤러
 */

import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { sendNotificationToAll } from '../services/notificationService';
import { getDb } from '../config/firebase';

export async function getAllMatches(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { status, startDate, endDate, month } = req.query;

    let query: any = getDb().collection('matches');

    if (status) {
      query = query.where('status', '==', status);
    }

    if (month) {
      const monthNum = parseInt(month as string);
      const year = new Date().getFullYear();
      const start = new Date(year, monthNum - 1, 1);
      const end = new Date(year, monthNum, 0, 23, 59, 59);

      query = query
        .where('date', '>=', Timestamp.fromDate(start))
        .where('date', '<=', Timestamp.fromDate(end));
    } else {
      if (startDate) {
        query = query.where('date', '>=', Timestamp.fromDate(new Date(startDate as string)));
      }
      if (endDate) {
        query = query.where('date', '<=', Timestamp.fromDate(new Date(endDate as string)));
      }
    }

    const snapshot = await query.orderBy('date', 'desc').get();

    const matches = snapshot.docs.map((doc: FirebaseFirestore.QueryDocumentSnapshot) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({
      success: true,
      data: matches,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch matches',
    });
  }
}

export async function getMatchById(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const doc = await getDb().collection('matches').doc(id).get();

    if (!doc.exists) {
      res.status(404).json({
        success: false,
        error: 'Match not found',
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
      error: error.message || 'Failed to fetch match',
    });
  }
}

export async function createMatch(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { title, date, location, notes, daysOfWeek, startDate, endDate, startTime, endTime, sendNotification } = req.body;

    // 반복 경기 생성
    if (daysOfWeek && startDate && endDate) {
      const matches = await createRecurringMatches({
        title,
        daysOfWeek,
        startDate,
        endDate,
        startTime,
        endTime,
        location,
      });

      if (sendNotification) {
        await sendNotificationToAll({
          type: 'match',
          title: '새 경기 등록',
          content: `${matches.length}개의 경기가 등록되었습니다.`,
        });
      }

      res.status(201).json({
        success: true,
        data: {
          created: matches.length,
          matches,
        },
        message: `${matches.length}개의 경기가 생성되었습니다.`,
      });
      return;
    }

    // 단일 경기 생성
    const matchDate = new Date(date);

    // 같은 날짜의 경기 개수 확인
    const sameDaySnapshot = await getDb()
      .collection('matches')
      .where('date', '>=', Timestamp.fromDate(new Date(matchDate.setHours(0, 0, 0, 0))))
      .where('date', '<=', Timestamp.fromDate(new Date(matchDate.setHours(23, 59, 59, 999))))
      .get();

    const matchNumber = sameDaySnapshot.size + 1;

    const matchData = {
      title: title || null,
      date: Timestamp.fromDate(new Date(date)),
      matchNumber,
      location: location || null,
      notes: notes || null,
      status: 'scheduled',
      scoreA: 0,
      scoreB: 0,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    const docRef = await getDb().collection('matches').add(matchData);

    // 모든 회원에 대해 출석 레코드 생성
    const membersSnapshot = await getDb().collection('members').where('isActive', '==', true).get();
    const batch = getDb().batch();

    for (const memberDoc of membersSnapshot.docs) {
      const attendanceRef = getDb().collection('attendances').doc();
      batch.set(attendanceRef, {
        matchId: docRef.id,
        memberId: memberDoc.id,
        status: 'pending',
        checkedAt: null,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
    }

    await batch.commit();

    if (sendNotification) {
      await sendNotificationToAll({
        type: 'match',
        title: '새 경기 등록',
        content: `${title || '경기'}가 등록되었습니다.`,
        relatedId: docRef.id,
      });
    }

    res.status(201).json({
      success: true,
      data: {
        id: docRef.id,
        ...matchData,
      },
      message: 'Match created successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create match',
    });
  }
}

async function createRecurringMatches(params: {
  title?: string;
  daysOfWeek: number[];
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
  location?: string;
}): Promise<any[]> {
  const { title, daysOfWeek, startDate, endDate, startTime, endTime, location } = params;

  const matches: any[] = [];
  let currentDate = new Date(startDate);
  const end = new Date(endDate);

  const [startHour = 15, startMinute = 0] = (startTime || '15:00').split(':').map(Number);

  while (currentDate <= end) {
    if (daysOfWeek.includes(currentDate.getDay())) {
      const matchDateTime = new Date(currentDate);
      matchDateTime.setHours(startHour, startMinute, 0, 0);

      // 같은 날짜의 경기 개수 확인
      const sameDaySnapshot = await getDb()
        .collection('matches')
        .where('date', '>=', Timestamp.fromDate(new Date(currentDate.setHours(0, 0, 0, 0))))
        .where('date', '<=', Timestamp.fromDate(new Date(currentDate.setHours(23, 59, 59, 999))))
        .get();

      const matchNumber = sameDaySnapshot.size + 1;

      const notes = startTime && endTime ? `${startTime} ~ ${endTime}` : null;

      const matchData = {
        title: title || null,
        date: Timestamp.fromDate(matchDateTime),
        matchNumber,
        location: location || null,
        notes,
        status: 'scheduled',
        scoreA: 0,
        scoreB: 0,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      };

      const docRef = await getDb().collection('matches').add(matchData);

      // 출석 레코드 생성
      const membersSnapshot = await getDb().collection('members').where('isActive', '==', true).get();
      const batch = getDb().batch();

      for (const memberDoc of membersSnapshot.docs) {
        const attendanceRef = getDb().collection('attendances').doc();
        batch.set(attendanceRef, {
          matchId: docRef.id,
          memberId: memberDoc.id,
          status: 'pending',
          checkedAt: null,
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });
      }

      await batch.commit();

      matches.push({
        id: docRef.id,
        ...matchData,
      });
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return matches;
}

export async function updateMatch(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const updates = req.body;

    const doc = await getDb().collection('matches').doc(id).get();

    if (!doc.exists) {
      res.status(404).json({
        success: false,
        error: 'Match not found',
      });
      return;
    }

    const allowedFields = ['title', 'date', 'location', 'notes', 'status', 'scoreA', 'scoreB'];
    const updateData: any = {};

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        if (field === 'date') {
          updateData[field] = Timestamp.fromDate(new Date(updates[field]));
        } else {
          updateData[field] = updates[field];
        }
      }
    }

    updateData.updatedAt = FieldValue.serverTimestamp();

    await getDb().collection('matches').doc(id).update(updateData);

    const updatedDoc = await getDb().collection('matches').doc(id).get();

    res.json({
      success: true,
      data: {
        id: updatedDoc.id,
        ...updatedDoc.data(),
      },
      message: 'Match updated successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update match',
    });
  }
}

export async function deleteMatch(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const doc = await getDb().collection('matches').doc(id).get();

    if (!doc.exists) {
      res.status(404).json({
        success: false,
        error: 'Match not found',
      });
      return;
    }

    await getDb().collection('matches').doc(id).update({
      status: 'cancelled',
      updatedAt: FieldValue.serverTimestamp(),
    });

    res.json({
      success: true,
      message: 'Match cancelled successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to cancel match',
    });
  }
}
