import axiosClient from './axiosClient';
import type { ApiResponse, PaginatedResponse } from '@/types/api.types';
import type { EmotionSnapshot } from '@/types/emotion.types';
import type { EmotionLabel } from '@/types/emotion.types';

/** GET /sessions/:id/emotions — Lịch sử cảm xúc theo phiên */
export const getEmotionHistory = async (
  sessionId: string,
  params?: { page?: number; pageSize?: number }
): Promise<ApiResponse<PaginatedResponse<EmotionSnapshot>>> => {
  const response = await axiosClient.get(
    `/sessions/${sessionId}/emotions`,
    { params }
  );
  return response.data;
};

/** GET /sessions/:id/emotions/distribution — Phân bố cảm xúc (%) */
export const getEmotionDistribution = async (
  sessionId: string
): Promise<ApiResponse<Record<EmotionLabel, number>>> => {
  const response = await axiosClient.get(
    `/sessions/${sessionId}/emotions/distribution`
  );
  return response.data;
};
