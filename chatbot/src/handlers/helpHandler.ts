/**
 * 도움말 핸들러
 */

export function getHelp() {
  return {
    version: '2.0',
    template: {
      outputs: [
        {
          simpleText: {
            text: 
              '⚽ 축구팀 매니저 봇 사용법\n\n' +
              '다음 명령어를 사용할 수 있습니다:\n\n' +
              '• 다음 경기\n' +
              '  → 예정된 경기 일정 확인\n\n' +
              '• 최근 경기\n' +
              '  → 최근 경기 결과 확인\n\n' +
              '• 내 통계\n' +
              '  → 개인 통계 조회 (연동 필요)\n\n' +
              '• 순위 / 득점왕 / 도움왕\n' +
              '  → 팀 순위 확인\n\n' +
              '• 공지사항\n' +
              '  → 최근 공지사항 확인',
          },
        },
      ],
      quickReplies: [
        {
          action: 'message',
          label: '다음 경기',
          messageText: '다음 경기',
        },
        {
          action: 'message',
          label: '최근 경기',
          messageText: '최근 경기',
        },
        {
          action: 'message',
          label: '순위',
          messageText: '순위',
        },
      ],
    },
  };
}








