/**
 * 팀 구성 컨트롤러
 */

import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { FieldValue } from 'firebase-admin/firestore';
import { sendTeamAssignmentNotification } from '../services/notificationService';
import { getDb } from '../config/firebase';

export async function getTeamAssignment(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { matchId } = req.query;

    if (!matchId) {
      res.status(400).json({
        success: false,
        error: 'matchId is required',
      });
      return;
    }

    const snapshot = await getDb()
      .collection('teamAssignments')
      .where('matchId', '==', matchId)
      .get();

    if (snapshot.empty) {
      res.status(404).json({
        success: false,
        error: 'Team assignment not found',
      });
      return;
    }

    const assignment = snapshot.docs[0];
    const data = assignment.data();

    // 각 팀의 회원 정보 조회
    const teamAMembers = await getMembers(data.teamA || []);
    const teamBMembers = await getMembers(data.teamB || []);
    const teamCMembers = data.teamC ? await getMembers(data.teamC) : [];
    const teamDMembers = data.teamD ? await getMembers(data.teamD) : [];

    res.json({
      success: true,
      data: {
        id: assignment.id,
        matchId: data.matchId,
        teamA: teamAMembers,
        teamB: teamBMembers,
        teamC: teamCMembers,
        teamD: teamDMembers,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch team assignment',
    });
  }
}

async function getMembers(memberIds: string[]): Promise<any[]> {
  const members = [];
  for (const memberId of memberIds) {
    const doc = await getDb().collection('members').doc(memberId).get();
    if (doc.exists) {
      members.push({
        id: doc.id,
        ...doc.data(),
      });
    }
  }
  return members;
}

export async function createTeamAssignment(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { matchId, teamA, teamB, teamC, teamD, sendNotification } = req.body;

    // 기존 팀 구성 확인
    const existingSnapshot = await getDb()
      .collection('teamAssignments')
      .where('matchId', '==', matchId)
      .get();

    if (!existingSnapshot.empty) {
      // 기존 것 업데이트
      const docRef = existingSnapshot.docs[0].ref;
      await docRef.update({
        teamA,
        teamB,
        teamC: teamC || [],
        teamD: teamD || [],
        updatedAt: FieldValue.serverTimestamp(),
      });

      const updatedDoc = await docRef.get();

      if (sendNotification) {
        const allMembers = [...teamA, ...teamB, ...(teamC || []), ...(teamD || [])];
        await sendTeamAssignmentNotification(matchId, allMembers);
      }

      res.json({
        success: true,
        data: {
          id: updatedDoc.id,
          ...updatedDoc.data(),
        },
        message: 'Team assignment updated successfully',
      });
      return;
    }

    // 새로 생성
    const assignmentData = {
      matchId,
      teamA,
      teamB,
      teamC: teamC || [],
      teamD: teamD || [],
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    const docRef = await getDb().collection('teamAssignments').add(assignmentData);

    if (sendNotification) {
      const allMembers = [...teamA, ...teamB, ...(teamC || []), ...(teamD || [])];
      await sendTeamAssignmentNotification(matchId, allMembers);
    }

    res.status(201).json({
      success: true,
      data: {
        id: docRef.id,
        ...assignmentData,
      },
      message: 'Team assignment created successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create team assignment',
    });
  }
}

export async function updateTeamAssignment(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { teamA, teamB, teamC, teamD } = req.body;

    const doc = await getDb().collection('teamAssignments').doc(id).get();

    if (!doc.exists) {
      res.status(404).json({
        success: false,
        error: 'Team assignment not found',
      });
      return;
    }

    const updateData: any = {
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (teamA !== undefined) updateData.teamA = teamA;
    if (teamB !== undefined) updateData.teamB = teamB;
    if (teamC !== undefined) updateData.teamC = teamC;
    if (teamD !== undefined) updateData.teamD = teamD;

    await getDb().collection('teamAssignments').doc(id).update(updateData);

    const updatedDoc = await getDb().collection('teamAssignments').doc(id).get();

    res.json({
      success: true,
      data: {
        id: updatedDoc.id,
        ...updatedDoc.data(),
      },
      message: 'Team assignment updated successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update team assignment',
    });
  }
}

export async function deleteTeamAssignment(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const doc = await getDb().collection('teamAssignments').doc(id).get();

    if (!doc.exists) {
      res.status(404).json({
        success: false,
        error: 'Team assignment not found',
      });
      return;
    }

    await getDb().collection('teamAssignments').doc(id).delete();

    res.json({
      success: true,
      message: 'Team assignment deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete team assignment',
    });
  }
}






