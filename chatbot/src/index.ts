/**
 * 카카오톡 챗봇 서버
 */

import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { handleKakaoWebhook } from './webhook';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 8081;

// 미들웨어
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 요청 로깅
app.use((req: Request, res: Response, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Health Check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Chatbot server is running',
    timestamp: new Date().toISOString(),
  });
});

// 카카오 웹훅 엔드포인트
app.post('/webhook', handleKakaoWebhook);

// 404 핸들러
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Not found',
  });
});

// 에러 핸들러
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`🤖 Chatbot server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;






