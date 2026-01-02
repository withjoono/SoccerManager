import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import initializeFirebase from './config/firebase';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// Routes
import memberRoutes from './routes/memberRoutes';
import matchRoutes from './routes/matchRoutes';
import attendanceRoutes from './routes/attendanceRoutes';
import teamRoutes from './routes/teamRoutes';
import teamAssignmentRoutes from './routes/teamAssignmentRoutes';
import matchEventRoutes from './routes/matchEventRoutes';
import noticeRoutes from './routes/noticeRoutes';
import statisticsRoutes from './routes/statisticsRoutes';

// 환경변수 로드
dotenv.config();

// Firebase 초기화
initializeFirebase();

const app: Application = express();
const PORT = process.env.PORT || 8080;

// 미들웨어
app.use(helmet()); // 보안 헤더 설정
app.use(compression()); // 응답 압축
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 요청 로깅 (개발 환경)
if (process.env.NODE_ENV === 'development') {
  app.use((req: Request, _res: Response, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// 헬스 체크
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// API 라우트
app.use('/api/members', memberRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/attendances', attendanceRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/team-assignments', teamAssignmentRoutes);
app.use('/api/match-events', matchEventRoutes);
app.use('/api', noticeRoutes); // /api/notices, /api/notifications
app.use('/api/statistics', statisticsRoutes);

// 404 핸들러
app.use(notFoundHandler);

// 에러 핸들러
app.use(errorHandler);

// 서버 시작
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;

