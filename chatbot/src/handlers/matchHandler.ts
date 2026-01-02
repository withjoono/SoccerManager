/**
 * 경기 관련 핸들러
 */

import { callBackendAPI } from '../services/apiService';
import { formatDate } from '../utils/formatter';

export async function getNextMatch() {
  try {
    const matches = await callBackendAPI('/api/matches?status=scheduled');

    if (!matches || matches.length === 0) {
      return {
        version: '2.0',
        template: {
          outputs: [
            {
              simpleText: {
                text: '현재 예정된 경기가 없습니다.',
              },
            },
          ],
        },
      };
    }

    const nextMatch = matches[0];
    const matchDate = new Date(nextMatch.date._seconds * 1000 || nextMatch.date);

    return {
      version: '2.0',
      template: {
        outputs: [
          {
            basicCard: {
              title: `⚽ ${nextMatch.title || '다음 경기'}`,
              description: 
                `📅 ${formatDate(matchDate)}\n` +
                `📍 ${nextMatch.location || '미정'}\n\n` +
                `출석 체크는 앱에서 해주세요!`,
              buttons: [
                {
                  action: 'webLink',
                  label: '앱에서 보기',
                  webLinkUrl: process.env.APP_URL || 'https://your-app.com',
                },
              ],
            },
          },
        ],
      },
    };
  } catch (error) {
    console.error('Error fetching next match:', error);
    return {
      version: '2.0',
      template: {
        outputs: [
          {
            simpleText: {
              text: '경기 정보를 불러오는데 실패했습니다.',
            },
          },
        ],
      },
    };
  }
}

export async function getRecentMatches() {
  try {
    const matches = await callBackendAPI('/api/matches?status=completed');

    if (!matches || matches.length === 0) {
      return {
        version: '2.0',
        template: {
          outputs: [
            {
              simpleText: {
                text: '최근 경기 기록이 없습니다.',
              },
            },
          ],
        },
      };
    }

    // 최근 3개만
    const recentMatches = matches.slice(0, 3);

    let text = '🏆 최근 경기 결과\n\n';

    recentMatches.forEach((match: any, index: number) => {
      const matchDate = new Date(match.date._seconds * 1000 || match.date);
      text += `${index + 1}. ${formatDate(matchDate)}\n`;
      text += `   A팀 ${match.scoreA} : ${match.scoreB} B팀\n`;
      if (match.location) {
        text += `   📍 ${match.location}\n`;
      }
      text += '\n';
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
            action: 'message',
            label: '내 통계',
            messageText: '내 통계',
          },
          {
            action: 'message',
            label: '순위',
            messageText: '순위',
          },
        ],
      },
    };
  } catch (error) {
    console.error('Error fetching recent matches:', error);
    return {
      version: '2.0',
      template: {
        outputs: [
          {
            simpleText: {
              text: '경기 정보를 불러오는데 실패했습니다.',
            },
          },
        ],
      },
    };
  }
}








