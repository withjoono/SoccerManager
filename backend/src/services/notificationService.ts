/**
 * 알림 발송 서비스
 * Firebase Cloud Messaging (FCM) 사용
 */

import admin from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { getDb } from '../config/firebase';

export interface NotificationData {
  userId?: string | null; // null이면 전체 발송
  type: 'match' | 'team' | 'notice' | 'general';
  title: string;
  content: string;
  relatedId?: string;
}

/**
 * 알림 생성 및 저장
 */
export async function createNotification(data: NotificationData): Promise<string> {
  try {
    const notificationRef = await getDb().collection('notifications').add({
      ...data,
      isRead: false,
      createdAt: FieldValue.serverTimestamp(),
    });

    console.log(`✅ Notification created: ${notificationRef.id}`);
    return notificationRef.id;
  } catch (error) {
    console.error('❌ Failed to create notification:', error);
    throw error;
  }
}

/**
 * 전체 회원에게 알림 발송
 */
export async function sendNotificationToAll(data: NotificationData): Promise<number> {
  try {
    const membersSnapshot = await getDb().collection('members').where('isActive', '==', true).get();

    const batch = getDb().batch();
    let count = 0;

    for (const memberDoc of membersSnapshot.docs) {
      const notificationRef = getDb().collection('notifications').doc();
      batch.set(notificationRef, {
        userId: memberDoc.id,
        type: data.type,
        title: data.title,
        content: data.content,
        relatedId: data.relatedId || null,
        isRead: false,
        createdAt: FieldValue.serverTimestamp(),
      });
      count++;
    }

    await batch.commit();
    console.log(`✅ Notifications sent to ${count} members`);

    // FCM 푸시 알림 발송 (구현 필요)
    await sendPushNotifications(membersSnapshot.docs.map((doc) => doc.id), data);

    return count;
  } catch (error) {
    console.error('❌ Failed to send notifications to all:', error);
    throw error;
  }
}

/**
 * 특정 회원에게 알림 발송
 */
export async function sendNotificationToUser(
  userId: string,
  data: Omit<NotificationData, 'userId'>
): Promise<string> {
  try {
    const notificationRef = await getDb().collection('notifications').add({
      userId,
      type: data.type,
      title: data.title,
      content: data.content,
      relatedId: data.relatedId || null,
      isRead: false,
      createdAt: FieldValue.serverTimestamp(),
    });

    console.log(`✅ Notification sent to user ${userId}`);

    // FCM 푸시 알림 발송 (구현 필요)
    await sendPushNotifications([userId], data);

    return notificationRef.id;
  } catch (error) {
    console.error(`❌ Failed to send notification to user ${userId}:`, error);
    throw error;
  }
}

/**
 * FCM 푸시 알림 발송
 */
async function sendPushNotifications(
  userIds: string[],
  data: Omit<NotificationData, 'userId'>
): Promise<void> {
  try {
    // 사용자의 FCM 토큰 조회 (구현 필요: users 컬렉션 또는 별도 tokens 컬렉션)
    const tokens = await getFCMTokens(userIds);

    if (tokens.length === 0) {
      console.warn('No FCM tokens found for users');
      return;
    }

    // FCM 메시지 전송
    const message: admin.messaging.MulticastMessage = {
      tokens,
      notification: {
        title: data.title,
        body: data.content,
      },
      data: {
        type: data.type,
        relatedId: data.relatedId || '',
      },
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channelId: 'soccer_notifications',
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
          },
        },
      },
    };

    const response = await admin.messaging().sendMulticast(message);
    console.log(
      `✅ FCM sent: ${response.successCount} success, ${response.failureCount} failed`
    );

    // 실패한 토큰 처리
    if (response.failureCount > 0) {
      const failedTokens: string[] = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          failedTokens.push(tokens[idx]);
          console.error(`Failed to send to token ${tokens[idx]}:`, resp.error);
        }
      });

      // 유효하지 않은 토큰 삭제 (구현 필요)
      await removeInvalidTokens(failedTokens);
    }
  } catch (error) {
    console.error('❌ Failed to send push notifications:', error);
    // 푸시 알림 실패해도 DB 저장은 성공했으므로 에러를 throw하지 않음
  }
}

/**
 * 사용자의 FCM 토큰 조회
 * TODO: 실제 구현 필요 (users 컬렉션에 fcmTokens 필드 추가)
 */
async function getFCMTokens(_userIds: string[]): Promise<string[]> {
  try {
    const tokens: string[] = [];

    // 예시: users 컬렉션에서 토큰 조회
    // for (const userId of userIds) {
    //   const userDoc = await getDb().collection('users').doc(userId).get();
    //   const userData = userDoc.data();
    //   if (userData?.fcmToken) {
    //     tokens.push(userData.fcmToken);
    //   }
    // }

    return tokens;
  } catch (error) {
    console.error('❌ Failed to get FCM tokens:', error);
    return [];
  }
}

/**
 * 유효하지 않은 FCM 토큰 삭제
 * TODO: 실제 구현 필요
 */
async function removeInvalidTokens(tokens: string[]): Promise<void> {
  try {
    // 예시: users 컬렉션에서 토큰 삭제
    // for (const token of tokens) {
    //   await db
    //     .collection('users')
    //     .where('fcmToken', '==', token)
    //     .get()
    //     .then((snapshot) => {
    //       snapshot.forEach((doc) => {
    //         doc.ref.update({ fcmToken: FieldValue.delete() });
    //       });
    //     });
    // }

    console.log(`Removed ${tokens.length} invalid FCM tokens`);
  } catch (error) {
    console.error('❌ Failed to remove invalid tokens:', error);
  }
}

/**
 * 경기 등록 알림 발송
 */
export async function sendMatchRegistrationNotification(match: any): Promise<void> {
  await sendNotificationToAll({
    type: 'match',
    title: '새 경기 등록',
    content: `${match.title || '경기'}가 등록되었습니다.`,
    relatedId: match.id,
  });
}

/**
 * 팀 구성 완료 알림 발송
 */
export async function sendTeamAssignmentNotification(
  matchId: string,
  memberIds: string[]
): Promise<void> {
  const matchDoc = await getDb().collection('matches').doc(matchId).get();
  const match = matchDoc.data();

  for (const memberId of memberIds) {
    await sendNotificationToUser(memberId, {
      type: 'team',
      title: '팀 구성 완료',
      content: `${match?.title || '경기'} 팀이 구성되었습니다.`,
      relatedId: matchId,
    });
  }
}






