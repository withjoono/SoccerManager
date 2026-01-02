/**
 * 경기 이벤트 컨트롤러 (골, 어시스트, 경고 등)
 */

import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { FieldValue } from 'firebase-admin/firestore';
import { updateStatisticsForMatch as _updateStatisticsForMatch } from '../services/statisticsService';
import { getDb } from '../config/firebase';

export async function getMatchEvents(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { matchId, type } = req.query;

    if (!matchId) {
      res.status(400).json({
        success: false,
        error: 'matchId is required',
      });
      return;
    }

    let query: any = getDb().collection('matchEvents').where('matchId', '==', matchId);

    if (type) {
      query = query.where('type', '==', type);
    }

    const snapshot = await query.orderBy('createdAt', 'asc').get();

    const events = [];
    for (const doc of snapshot.docs) {
      const data = doc.data();
      
      // 회원 정보 조회
      let memberName = 'Unknown';
      if (data.memberId === 'unknown') {
        memberName = '모름';
      } else if (data.memberId === 'own-goal') {
        memberName = '자책골';
      } else {
        const memberDoc = await getDb().collection('members').doc(data.memberId).get();
        memberName = memberDoc.data()?.name || 'Unknown';
      }

      let assisterName = null;
      if (data.assisterId && data.assisterId !== 'none' && data.assisterId !== 'unknown') {
        const assisterDoc = await getDb().collection('members').doc(data.assisterId).get();
        assisterName = assisterDoc.data()?.name || 'Unknown';
      } else if (data.assisterId === 'unknown') {
        assisterName = '모름';
      }

      events.push({
        id: doc.id,
        ...data,
        memberName,
        assisterName,
      });
    }

    res.json({
      success: true,
      data: events,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch match events',
    });
  }
}

export async function createMatchEvent(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { matchId, memberId, assisterId, team, type, minute, notes } = req.body;

    const eventData: any = {
      matchId,
      memberId,
      team,
      type,
      minute: minute || null,
      notes: notes || null,
      createdAt: FieldValue.serverTimestamp(),
    };

    // 골인 경우 어시스트 추가
    if (type === 'goal' && assisterId) {
      eventData.assisterId = assisterId;
    }

    const docRef = await getDb().collection('matchEvents').add(eventData);

    // 경기 스코어 업데이트 (골인 경우)
    if (type === 'goal' || type === 'ownGoal') {
      const matchDoc = await getDb().collection('matches').doc(matchId).get();
      const match = matchDoc.data();

      if (match) {
        const updates: any = {};

        if (type === 'ownGoal') {
          // 자책골은 상대팀 득점
          if (team === 'A') {
            updates.scoreB = (match.scoreB || 0) + 1;
          } else if (team === 'B') {
            updates.scoreA = (match.scoreA || 0) + 1;
          }
        } else {
          // 일반 골
          if (team === 'A') {
            updates.scoreA = (match.scoreA || 0) + 1;
          } else if (team === 'B') {
            updates.scoreB = (match.scoreB || 0) + 1;
          }
        }

        updates.updatedAt = FieldValue.serverTimestamp();
        await getDb().collection('matches').doc(matchId).update(updates);
      }
    }

    res.status(201).json({
      success: true,
      data: {
        id: docRef.id,
        ...eventData,
      },
      message: 'Match event created successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create match event',
    });
  }
}

export async function deleteMatchEvent(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const doc = await getDb().collection('matchEvents').doc(id).get();

    if (!doc.exists) {
      res.status(404).json({
        success: false,
        error: 'Match event not found',
      });
      return;
    }

    const event = doc.data();

    // 경기 스코어 감소 (골인 경우)
    if (event && (event.type === 'goal' || event.type === 'ownGoal')) {
      const matchDoc = await getDb().collection('matches').doc(event.matchId).get();
      const match = matchDoc.data();

      if (match) {
        const updates: any = {};

        if (event.type === 'ownGoal') {
          if (event.team === 'A') {
            updates.scoreB = Math.max((match.scoreB || 0) - 1, 0);
          } else if (event.team === 'B') {
            updates.scoreA = Math.max((match.scoreA || 0) - 1, 0);
          }
        } else {
          if (event.team === 'A') {
            updates.scoreA = Math.max((match.scoreA || 0) - 1, 0);
          } else if (event.team === 'B') {
            updates.scoreB = Math.max((match.scoreB || 0) - 1, 0);
          }
        }

        updates.updatedAt = FieldValue.serverTimestamp();
        await getDb().collection('matches').doc(event.matchId).update(updates);
      }
    }

    await getDb().collection('matchEvents').doc(id).delete();

    res.json({
      success: true,
      message: 'Match event deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete match event',
    });
  }
}








