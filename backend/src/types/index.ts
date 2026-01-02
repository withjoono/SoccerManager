// 회원 (Member) 타입
export interface Member {
  id: string;
  name: string;
  phone?: string;
  position?: string; // 포지션 (FW, MF, DF, GK 등)
  jerseyNumber?: number;
  profileImage?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// 출석 (Attendance) 타입
export interface Attendance {
  id: string;
  matchId: string;
  memberId: string;
  status: 'present' | 'absent' | 'pending';
  createdAt: Date;
  updatedAt: Date;
}

// 팀 구성 (Team Assignment) 타입
export interface TeamAssignment {
  id: string;
  matchId: string;
  teamA: string[]; // Member IDs
  teamB: string[]; // Member IDs
  createdAt: Date;
  updatedAt: Date;
}

// 경기 (Match) 타입
export interface Match {
  id: string;
  title?: string;
  date: Date;
  matchNumber: number; // 하루에 여러 경기를 구분하기 위한 번호 (1, 2, 3...)
  location?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  scoreA: number;
  scoreB: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// 경기 이벤트 (골, 어시스트 등)
export interface MatchEvent {
  id: string;
  matchId: string;
  memberId: string | 'unknown' | 'own-goal'; // 'unknown'=모름, 'own-goal'=자책골
  team: 'A' | 'B';
  type: 'goal' | 'assist' | 'yellowCard' | 'redCard';
  minute?: number;
  notes?: string;
  createdAt: Date;
}

// 통계 (Statistics) 타입
export interface MemberStats {
  memberId: string;
  totalMatches: number;
  attendanceRate: number;
  goals: number;
  assists: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
}

// API 응답 타입
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

