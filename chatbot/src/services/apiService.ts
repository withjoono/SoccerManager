/**
 * 백엔드 API 호출 서비스
 */

import axios from 'axios';

const BACKEND_URL = process.env.BACKEND_API_URL || 'http://localhost:8080';
const API_TOKEN = process.env.BACKEND_API_TOKEN;

export async function callBackendAPI(endpoint: string): Promise<any> {
  try {
    const url = `${BACKEND_URL}${endpoint}`;
    console.log(`Calling backend API: ${url}`);

    const response = await axios.get(url, {
      headers: {
        ...(API_TOKEN && { Authorization: `Bearer ${API_TOKEN}` }),
      },
      timeout: 5000,
    });

    if (response.data && response.data.success) {
      return response.data.data;
    }

    throw new Error('Invalid response from backend');
  } catch (error: any) {
    console.error('Backend API call failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw new Error('Failed to fetch data from backend');
  }
}






