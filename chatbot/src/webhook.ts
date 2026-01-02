/**
 * 카카오 웹훅 핸들러
 */

import { Request, Response } from 'express';
import { getNextMatch, getRecentMatches } from './handlers/matchHandler';
import { getMyStats, getLeaderboard } from './handlers/statsHandler';
import { getNotices } from './handlers/noticeHandler';
import { getHelp } from './handlers/helpHandler';

export async function handleKakaoWebhook(req: Request, res: Response) {
  try {
    const { action, userRequest } = req.body;

    if (!action || !userRequest) {
      return res.status(400).json({
        version: '2.0',
        template: {
          outputs: [
            {
              simpleText: {
                text: '잘못된 요청입니다.',
              },
            },
          ],
        },
      });
    }

    const actionName = action.name || action.id;
    const userId = userRequest.user?.id;
    const params = action.params || {};

    console.log(`Action: ${actionName}, User: ${userId}`);

    let response;

    // 액션별 처리
    switch (actionName) {
      case '다음경기조회':
      case 'next_match':
        response = await getNextMatch();
        break;

      case '최근경기조회':
      case 'recent_matches':
        response = await getRecentMatches();
        break;

      case '내통계조회':
      case 'my_stats':
        response = await getMyStats(userId);
        break;

      case '순위조회':
      case 'leaderboard':
        const category = params.category || 'goals';
        response = await getLeaderboard(category);
        break;

      case '공지사항조회':
      case 'notices':
        response = await getNotices();
        break;

      case '도움말':
      case 'help':
        response = getHelp();
        break;

      default:
        response = {
          version: '2.0',
          template: {
            outputs: [
              {
                simpleText: {
                  text: '죄송합니다. 이해하지 못했습니다.\n\n사용 가능한 명령어:\n• 다음 경기\n• 최근 경기\n• 내 통계\n• 순위\n• 공지사항\n• 도움말',
                },
              },
            ],
          },
        };
    }

    res.json(response);
  } catch (error: any) {
    console.error('Webhook error:', error);
    res.json({
      version: '2.0',
      template: {
        outputs: [
          {
            simpleText: {
              text: '죄송합니다. 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.',
            },
          },
        ],
      },
    });
  }
}








