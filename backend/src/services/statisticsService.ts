/**
 * 통계 계산 서비스
 */

import { FieldValue } from 'firebase-admin/firestore';
import { getDb } from '../config/firebase';

/**
 * 특정 회원의 통계 재계산
 */
export async function calculateMemberStatistics(memberId: string): Promise<void> {
  try {
    // 1. 출석 통계
    const attendancesSnapshot = await getDb()
      .collection('attendances')
      .where('memberId', '==', memberId)
      .get();

    const totalMatches = attendancesSnapshot.size;
    const totalAttendance = attendancesSnapshot.docs.filter(
      (doc) => doc.data().status === 'present'
    ).length;
    const attendanceRate = totalMatches > 0 ? (totalAttendance / totalMatches) * 100 : 0;

    // 2. 골 통계
    const goalsSnapshot = await getDb()
      .collection('matchEvents')
      .where('memberId', '==', memberId)
      .where('type', '==', 'goal')
      .get();
    const totalGoals = goalsSnapshot.size;

    // 3. 어시스트 통계
    const assistsSnapshot = await getDb()
      .collection('matchEvents')
      .where('assisterId', '==', memberId)
      .get();
    const totalAssists = assistsSnapshot.size;

    // 4. 승패 통계
    const teamAssignmentsSnapshot = await getDb().collection('teamAssignments').get();
    let wins = 0;
    let losses = 0;
    let draws = 0;

    for (const assignmentDoc of teamAssignmentsSnapshot.docs) {
      const assignment = assignmentDoc.data();
      const matchDoc = await getDb().collection('matches').doc(assignment.matchId).get();
      const match = matchDoc.data();

      if (!match || match.status !== 'completed') continue;

      // 회원이 속한 팀 찾기
      let memberTeam: string | null = null;
      if (assignment.teamA?.includes(memberId)) memberTeam = 'A';
      else if (assignment.teamB?.includes(memberId)) memberTeam = 'B';
      else if (assignment.teamC?.includes(memberId)) memberTeam = 'C';
      else if (assignment.teamD?.includes(memberId)) memberTeam = 'D';

      if (!memberTeam) continue;

      // 스코어 비교
      const scores: { [key: string]: number } = {
        A: match.scoreA || 0,
        B: match.scoreB || 0,
        C: match.scoreC || 0,
        D: match.scoreD || 0,
      };

      const memberScore = scores[memberTeam];
      const otherScores = Object.entries(scores)
        .filter(([team]) => team !== memberTeam)
        .map(([, score]) => score);

      const maxOtherScore = Math.max(...otherScores);

      if (memberScore > maxOtherScore) {
        wins++;
      } else if (memberScore < maxOtherScore) {
        losses++;
      } else {
        draws++;
      }
    }

    const totalCompletedMatches = wins + losses + draws;
    const winRate = totalCompletedMatches > 0 ? (wins / totalCompletedMatches) * 100 : 0;

    // 5. 통계 저장
    await getDb()
      .collection('statistics')
      .doc(memberId)
      .set(
        {
          memberId,
          totalMatches,
          totalAttendance,
          attendanceRate: Math.round(attendanceRate * 10) / 10,
          totalGoals,
          totalAssists,
          totalWins: wins,
          totalLosses: losses,
          totalDraws: draws,
          winRate: Math.round(winRate * 10) / 10,
          lastUpdated: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

    console.log(`✅ Statistics updated for member ${memberId}`);
  } catch (error) {
    console.error(`❌ Failed to calculate statistics for member ${memberId}:`, error);
    throw error;
  }
}

/**
 * 모든 회원의 통계 재계산
 */
export async function recalculateAllStatistics(): Promise<number> {
  try {
    const membersSnapshot = await getDb().collection('members').where('isActive', '==', true).get();

    let count = 0;
    for (const memberDoc of membersSnapshot.docs) {
      await calculateMemberStatistics(memberDoc.id);
      count++;
    }

    console.log(`✅ Statistics recalculated for ${count} members`);
    return count;
  } catch (error) {
    console.error('❌ Failed to recalculate all statistics:', error);
    throw error;
  }
}

/**
 * 경기 완료 시 관련 회원 통계 업데이트
 */
export async function updateStatisticsForMatch(matchId: string): Promise<void> {
  try {
    // 팀 구성 조회
    const assignmentSnapshot = await getDb()
      .collection('teamAssignments')
      .where('matchId', '==', matchId)
      .get();

    if (assignmentSnapshot.empty) {
      console.warn(`No team assignment found for match ${matchId}`);
      return;
    }

    const assignment = assignmentSnapshot.docs[0].data();
    const memberIds = [
      ...(assignment.teamA || []),
      ...(assignment.teamB || []),
      ...(assignment.teamC || []),
      ...(assignment.teamD || []),
    ];

    // 각 회원의 통계 업데이트
    for (const memberId of memberIds) {
      await calculateMemberStatistics(memberId);
    }

    console.log(`✅ Statistics updated for match ${matchId} (${memberIds.length} members)`);
  } catch (error) {
    console.error(`❌ Failed to update statistics for match ${matchId}:`, error);
    throw error;
  }
}

/**
 * 통계 조회 (정렬 및 필터링 지원)
 */
export async function getStatistics(options: {
  sortBy?: 'goals' | 'assists' | 'attendanceRate' | 'winRate';
  limit?: number;
  offset?: number;
}): Promise<any[]> {
  try {
    const { sortBy = 'goals', limit = 50, offset = 0 } = options;

    const fieldMap: { [key: string]: string } = {
      goals: 'totalGoals',
      assists: 'totalAssists',
      attendanceRate: 'attendanceRate',
      winRate: 'winRate',
    };

    const sortField = fieldMap[sortBy] || 'totalGoals';

    const snapshot = await getDb()
      .collection('statistics')
      .orderBy(sortField, 'desc')
      .limit(limit)
      .offset(offset)
      .get();

    const statistics = [];
    for (const doc of snapshot.docs) {
      const stat = doc.data();
      
      // 회원 정보 조회
      const memberDoc = await getDb().collection('members').doc(stat.memberId).get();
      const member = memberDoc.data();

      statistics.push({
        ...stat,
        memberName: member?.name || 'Unknown',
        position: member?.position,
        jerseyNumber: member?.jerseyNumber,
      });
    }

    return statistics;
  } catch (error) {
    console.error('❌ Failed to get statistics:', error);
    throw error;
  }
}






