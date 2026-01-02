/**
 * 통계 관련 핸들러
 */

import { callBackendAPI } from '../services/apiService';

export async function getMyStats(kakaoUserId: string) {
  try {
    // TODO: 카카오 유저 ID를 회원 ID로 매핑
    // 현재는 연동 안내 메시지 반환
    return {
      version: '2.0',
      template: {
        outputs: [
          {
            simpleText: {
              text: 
                '⚠️ 통계 조회를 위해 앱에서 카카오톡 연동이 필요합니다.\n\n' +
                '앱 > 설정 > 카카오톡 연동 메뉴에서 연동해주세요.',
            },
          },
        ],
        quickReplies: [
          {
            action: 'webLink',
            label: '앱에서 연동하기',
            webLinkUrl: process.env.APP_URL || 'https://your-app.com',
          },
        ],
      },
    };
  } catch (error) {
    console.error('Error fetching stats:', error);
    return {
      version: '2.0',
      template: {
        outputs: [
          {
            simpleText: {
              text: '통계 정보를 불러오는데 실패했습니다.',
            },
          },
        ],
      },
    };
  }
}

export async function getLeaderboard(category: string = 'goals') {
  try {
    const data = await callBackendAPI(
      `/api/statistics/leaderboard?category=${category}&limit=5`
    );

    if (!data || !data.leaderboard || data.leaderboard.length === 0) {
      return {
        version: '2.0',
        template: {
          outputs: [
            {
              simpleText: {
                text: '아직 기록된 통계가 없습니다.',
              },
            },
          ],
        },
      };
    }

    const categoryNames: { [key: string]: string } = {
      goals: '⚽ 득점왕',
      assists: '🎯 도움왕',
      attendance: '✅ 출석왕',
      winRate: '🔥 승률왕',
    };

    const categoryName = categoryNames[category] || '순위';
    let text = `${categoryName}\n\n`;

    data.leaderboard.forEach((player: any, index: number) => {
      const medal = ['🥇', '🥈', '🥉'][index] || `${index + 1}.`;
      const value = category === 'attendance' || category === 'winRate'
        ? `${player.value.toFixed(1)}%`
        : player.value;
      
      text += `${medal} ${player.memberName} - ${value}\n`;
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
            label: '득점왕',
            messageText: '득점왕',
          },
          {
            action: 'message',
            label: '도움왕',
            messageText: '도움왕',
          },
          {
            action: 'message',
            label: '출석왕',
            messageText: '출석왕',
          },
        ],
      },
    };
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return {
      version: '2.0',
      template: {
        outputs: [
          {
            simpleText: {
              text: '순위 정보를 불러오는데 실패했습니다.',
            },
          },
        ],
      },
    };
  }
}








