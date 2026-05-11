import axiosClient from './axiosClient';
import type { GetReportResponse } from '@/types/api.types';

// ===== GET /sessions/:id/report — Báo cáo chi tiết phiên =====
export const getSessionReport = async (
  sessionId: string
): Promise<GetReportResponse> => {
  const response = await axiosClient.get<GetReportResponse>(
    `/sessions/${sessionId}/report`
  );
  return response.data;
};

// ===== GET /sessions/:id/report/export — Xuất báo cáo =====
export const exportSessionReport = async (
  sessionId: string,
  format: 'pdf' | 'csv' = 'pdf'
): Promise<Blob> => {
  const response = await axiosClient.get(
    `/sessions/${sessionId}/report/export`,
    {
      params: { format },
      responseType: 'blob',
    }
  );
  return response.data;
};
