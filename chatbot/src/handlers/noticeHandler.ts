/**
 * 공지사항 핸들러
 */

import { callBackendAPI } from '../services/apiService';
import { formatDate } from '../utils/formatter';

export async function getNotices() {
  try {
    const notices = await callBackendAPI('/api/notices?isActive=true');

    if (!notices || notices.length === 0) {
      return {
        version: '2.0',
        template: {
          outputs: [
            {
              simpleText: {
                text: '등록된 공지사항이 없습니다.',
              },
            },
          ],
        },
      };
    }

    // 최근 3개만
    const recentNotices = notices.slice(0, 3);

    let text = '📢 공지사항\n\n';

    recentNotices.forEach((notice: any, index: number) => {
      const noticeDate = new Date(notice.createdAt._seconds * 1000 || notice.createdAt);
      text += `${index + 1}. ${notice.important ? '⭐ ' : ''}${notice.title}\n`;
      text += `   ${formatDate(noticeDate)}\n`;
      text += `   ${notice.content.substring(0, 50)}${notice.content.length > 50 ? '...' : ''}\n\n`;
    });

    return {
      version: '2.0',
      template: {
        outputs: [
          {
            simpleText: {
              text,
            },
          },
        ],
        quickReplies: [
          {
            action: 'webLink',
            label: '전체 공지사항',
            webLinkUrl: process.env.APP_URL || 'https://your-app.com',
          },
        ],
      },
    };
  } catch (error) {
    console.error('Error fetching notices:', error);
    return {
      version: '2.0',
      template: {
        outputs: [
          {
            simpleText: {
              text: '공지사항을 불러오는데 실패했습니다.',
            },
          },
        ],
      },
    };
  }
}








