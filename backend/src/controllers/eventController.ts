import { Request, Response } from 'express';
import { getDb } from '../config/firebase';
import { MatchEvent, ApiResponse } from '../types';
import { AppError, asyncHandler } from '../middleware/errorHandler';

const eventsCollection = 'matchEvents';

// 특정 경기의 이벤트 조회
export const getEventsByMatch = asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
  const { matchId } = req.params;

  const snapshot = await getDb().collection(eventsCollection)
    .where('matchId', '==', matchId)
    .orderBy('createdAt', 'asc')
    .get();

  const events: MatchEvent[] = [];
  snapshot.forEach(doc => {
    events.push({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
    } as MatchEvent);
  });

  res.json({
    success: true,
    data: events,
  });
});

// 이벤트 생성
export const createEvent = asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
  const { matchId, memberId, team, type, minute, notes } = req.body;

  const eventData = {
    matchId,
    memberId,
    team,
    type,
    minute: minute || null,
    notes: notes || null,
    createdAt: new Date(),
  };

  const docRef = await getDb().collection(eventsCollection).add(eventData);

  const event: MatchEvent = {
    id: docRef.id,
    ...eventData,
  };

  res.status(201).json({
    success: true,
    data: event,
    message: 'Event created successfully',
  });
});

// 이벤트 삭제
export const deleteEvent = asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
  const { id } = req.params;

  const docRef = getDb().collection(eventsCollection).doc(id);
  const doc = await docRef.get();

  if (!doc.exists) {
    throw new AppError('Event not found', 404);
  }

  await docRef.delete();

  res.json({
    success: true,
    message: 'Event deleted successfully',
  });
});






