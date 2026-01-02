import { Request, Response } from 'express';
import { getDb } from '../config/firebase';
import { MemberStats, ApiResponse } from '../types';
import { asyncHandler } from '../middleware/errorHandler';

// 회원 통계 조회
export const getMemberStats = asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
  const { memberId } = req.params;

  // 출석 기록 조회
  const attendanceSnapshot = await getDb().collection('attendance')
    .where('memberId', '==', memberId)
    .get();

  const totalMatches = attendanceSnapshot.size;
  const presentCount = attendanceSnapshot.docs.filter(doc => doc.data().status === 'present').length;
  const attendanceRate = totalMatches > 0 ? (presentCount / totalMatches) * 100 : 0;

  // 골 기록 조회
  const goalsSnapshot = await getDb().collection('matchEvents')
    .where('memberId', '==', memberId)
    .where('type', '==', 'goal')
    .get();

  const goals = goalsSnapshot.size;

  // 어시스트 기록 조회
  const assistsSnapshot = await getDb().collection('matchEvents')
    .where('memberId', '==', memberId)
    .where('type', '==', 'assist')
    .get();

  const assists = assistsSnapshot.size;

  // 경기 참여 및 승률 계산 (참여한 경기에서 팀 구성 및 결과 확인)
  let wins = 0;
  let losses = 0;
  let draws = 0;

  // 참여한 경기 ID 목록
  const matchIds = new Set<string>();
  attendanceSnapshot.docs.forEach(doc => {
    if (doc.data().status === 'present') {
      matchIds.add(doc.data().matchId);
    }
  });

  // 각 경기의 결과 확인
  for (const matchId of Array.from(matchIds)) {
    const matchDoc = await getDb().collection('matches').doc(matchId).get();
    if (!matchDoc.exists || matchDoc.data()?.status !== 'completed') continue;

    const teamAssignmentSnapshot = await getDb().collection('teamAssignments')
      .where('matchId', '==', matchId)
      .limit(1)
      .get();

    if (teamAssignmentSnapshot.empty) continue;

    const teamAssignment = teamAssignmentSnapshot.docs[0].data();
    const isTeamA = teamAssignment.teamA?.includes(memberId);
    const isTeamB = teamAssignment.teamB?.includes(memberId);

    if (!isTeamA && !isTeamB) continue;

    const match = matchDoc.data();
    const scoreA = match?.scoreA || 0;
    const scoreB = match?.scoreB || 0;

    if (scoreA === scoreB) {
      draws++;
    } else if ((isTeamA && scoreA > scoreB) || (isTeamB && scoreB > scoreA)) {
      wins++;
    } else {
      losses++;
    }
  }

  const totalCompletedMatches = wins + losses + draws;
  const winRate = totalCompletedMatches > 0 ? (wins / totalCompletedMatches) * 100 : 0;

  const stats: MemberStats = {
    memberId,
    totalMatches: presentCount,
    attendanceRate: Math.round(attendanceRate * 10) / 10,
    goals,
    assists,
    wins,
    losses,
    draws,
    winRate: Math.round(winRate * 10) / 10,
  };

  res.json({
    success: true,
    data: stats,
  });
});

// 전체 회원 통계 순위
export const getAllMembersStats = asyncHandler(async (_req: Request, res: Response<ApiResponse>) => {
  const membersSnapshot = await getDb().collection('members')
    .where('isActive', '==', true)
    .get();

  const statsPromises = membersSnapshot.docs.map(async (memberDoc) => {
    const memberId = memberDoc.id;

    // 출석 기록 조회
    const attendanceSnapshot = await getDb().collection('attendance')
      .where('memberId', '==', memberId)
      .get();

    const totalMatches = attendanceSnapshot.size;
    const presentCount = attendanceSnapshot.docs.filter(doc => doc.data().status === 'present').length;
    const attendanceRate = totalMatches > 0 ? (presentCount / totalMatches) * 100 : 0;

    // 골 기록 조회
    const goalsSnapshot = await getDb().collection('matchEvents')
      .where('memberId', '==', memberId)
      .where('type', '==', 'goal')
      .get();

    const goals = goalsSnapshot.size;

    // 어시스트 기록 조회
    const assistsSnapshot = await getDb().collection('matchEvents')
      .where('memberId', '==', memberId)
      .where('type', '==', 'assist')
      .get();

    const assists = assistsSnapshot.size;

    // 승률 계산 생략 (성능을 위해)
    const stats: MemberStats = {
      memberId,
      totalMatches: presentCount,
      attendanceRate: Math.round(attendanceRate * 10) / 10,
      goals,
      assists,
      wins: 0,
      losses: 0,
      draws: 0,
      winRate: 0,
    };

    return stats;
  });

  const allStats = await Promise.all(statsPromises);

  // 골 수로 정렬
  allStats.sort((a, b) => b.goals - a.goals);

  res.json({
    success: true,
    data: allStats,
  });
});






