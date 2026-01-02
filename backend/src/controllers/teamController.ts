/**
 * 팀 관리 컨트롤러
 */

import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { FieldValue } from 'firebase-admin/firestore';
import { getDb } from '../config/firebase';

export async function getAllTeams(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { isActive } = req.query;

    let query: any = getDb().collection('teams');

    if (isActive !== undefined) {
      query = query.where('isActive', '==', isActive === 'true');
    }

    const snapshot = await query.orderBy('name', 'asc').get();

    const teams = snapshot.docs.map((doc: FirebaseFirestore.QueryDocumentSnapshot) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({
      success: true,
      data: teams,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch teams',
    });
  }
}

export async function getTeamById(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const doc = await getDb().collection('teams').doc(id).get();

    if (!doc.exists) {
      res.status(404).json({
        success: false,
        error: 'Team not found',
      });
      return;
    }

    // 팀 멤버 조회
    const membersSnapshot = await getDb().collection('members').where('teamId', '==', id).get();
    const members = membersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({
      success: true,
      data: {
        id: doc.id,
        ...doc.data(),
        members,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch team',
    });
  }
}

export async function createTeam(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { name, color, description, captainId } = req.body;

    const teamData = {
      name,
      color: color || null,
      description: description || null,
      captainId: captainId || null,
      isActive: true,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    const docRef = await getDb().collection('teams').add(teamData);

    res.status(201).json({
      success: true,
      data: {
        id: docRef.id,
        ...teamData,
      },
      message: 'Team created successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create team',
    });
  }
}

export async function updateTeam(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const updates = req.body;

    const doc = await getDb().collection('teams').doc(id).get();

    if (!doc.exists) {
      res.status(404).json({
        success: false,
        error: 'Team not found',
      });
      return;
    }

    const allowedFields = ['name', 'color', 'description', 'captainId'];
    const updateData: any = {};

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        updateData[field] = updates[field];
      }
    }

    updateData.updatedAt = FieldValue.serverTimestamp();

    await getDb().collection('teams').doc(id).update(updateData);

    const updatedDoc = await getDb().collection('teams').doc(id).get();

    res.json({
      success: true,
      data: {
        id: updatedDoc.id,
        ...updatedDoc.data(),
      },
      message: 'Team updated successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update team',
    });
  }
}

export async function deleteTeam(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const doc = await getDb().collection('teams').doc(id).get();

    if (!doc.exists) {
      res.status(404).json({
        success: false,
        error: 'Team not found',
      });
      return;
    }

    await getDb().collection('teams').doc(id).update({
      isActive: false,
      updatedAt: FieldValue.serverTimestamp(),
    });

    res.json({
      success: true,
      message: 'Team deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete team',
    });
  }
}
