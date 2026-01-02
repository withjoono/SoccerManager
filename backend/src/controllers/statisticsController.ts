/**
 * 통계 컨트롤러
 */

import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import {
  getStatistics,
  calculateMemberStatistics,
  recalculateAllStatistics,
} from '../services/statisticsService';
import { getDb } from '../config/firebase';

/**
 * 전체 통계 조회
 */
export async function getAllStatistics(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { sortBy, period: _period, limit, offset } = req.query;

    const statistics = await getStatistics({
      sortBy: sortBy as any,
      limit: limit ? parseInt(limit as string) : 50,
      offset: offset ? parseInt(offset as string) : 0,
    });

    res.json({
      success: true,
      data: statistics,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch statistics',
    });
  }
}

/**
 * 특정 회원 통계 조회
 */
export async function getMemberStatistics(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { memberId } = req.params;

    const doc = await getDb().collection('statistics').doc(memberId).get();

    if (!doc.exists) {
      // 통계가 없으면 계산
      await calculateMemberStatistics(memberId);
      const newDoc = await getDb().collection('statistics').doc(memberId).get();

      res.json({
        success: true,
        data: {
          id: newDoc.id,
          ...newDoc.data(),
        },
      });
      return;
    }

    // 회원 정보 조회
    const memberDoc = await getDb().collection('members').doc(memberId).get();
    const member = memberDoc.data();

    res.json({
      success: true,
      data: {
        id: doc.id,
        ...doc.data(),
        memberName: member?.name,
        position: member?.position,
        jerseyNumber: member?.jerseyNumber,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch member statistics',
    });
  }
}

/**
 * 전체 통계 재계산 (Admin만)
 */
export async function recalculateStatistics(_req: AuthRequest, res: Response): Promise<void> {
  try {
    const count = await recalculateAllStatistics();

    res.json({
      success: true,
      message: `Statistics recalculated for ${count} members`,
      count,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to recalculate statistics',
    });
  }
}

/**
 * 특정 회원 통계 재계산
 */
export async function recalculateMemberStatistics(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { memberId } = req.params;

    await calculateMemberStatistics(memberId);

    const doc = await getDb().collection('statistics').doc(memberId).get();

    res.json({
      success: true,
      data: {
        id: doc.id,
        ...doc.data(),
      },
      message: 'Member statistics recalculated successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to recalculate member statistics',
    });
  }
}

/**
 * 리더보드 (순위별)
 */
export async function getLeaderboard(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { category = 'goals', limit = 10 } = req.query;

    const fieldMap: { [key: string]: string } = {
      goals: 'totalGoals',
      assists: 'totalAssists',
      attendance: 'attendanceRate',
      winRate: 'winRate',
    };

    const sortField = fieldMap[category as string] || 'totalGoals';

    const snapshot = await getDb()
      .collection('statistics')
      .orderBy(sortField, 'desc')
      .limit(parseInt(limit as string))
      .get();

    const leaderboard = [];
    let rank = 1;

    for (const doc of snapshot.docs) {
      const stat = doc.data();
      const memberDoc = await getDb().collection('members').doc(stat.memberId).get();
      const member = memberDoc.data();

      leaderboard.push({
        rank,
        memberId: stat.memberId,
        memberName: member?.name || 'Unknown',
        position: member?.position,
        jerseyNumber: member?.jerseyNumber,
        value: stat[sortField],
        ...stat,
      });

      rank++;
    }

    res.json({
      success: true,
      data: {
        category,
        leaderboard,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch leaderboard',
    });
  }
}








