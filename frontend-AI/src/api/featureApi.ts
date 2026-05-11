import axiosClient from './axiosClient';
import type {
  ApiResponse,
  PaginatedResponse,
  GetHealthResponse,
} from '@/types/api.types';
import type { FaceFeatures } from '@/types/feature.types';

/** GET /sessions/:id/features — Lịch sử features theo phiên */
export const getFeatureHistory = async (
  sessionId: string,
  params?: {
    page?: number;
    pageSize?: number;
    fromTs?: number;
    toTs?: number;
  }
): Promise<ApiResponse<PaginatedResponse<FaceFeatures>>> => {
  const response = await axiosClient.get(
    `/sessions/${sessionId}/features`,
    { params }
  );
  return response.data;
};

/** GET /health — Kiểm tra trạng thái backend + các service AI */
export const getHealthCheck = async (): Promise<GetHealthResponse> => {
  const response = await axiosClient.get<GetHealthResponse>('/health');
  return response.data;
};
