import { apiClient } from './client';

export interface ReportItem {
  id: string;
  title: string;
  type: string;
  format: string;
  generatedAt: string;
  fileSize: string;
  status: string;
  reportingBoundary: string;
}

export const reportsApi = {
  getReports: async (): Promise<ReportItem[]> => {
    try {
      const res = await apiClient.get<ReportItem[]>('/reports');
      if (Array.isArray(res.data)) return res.data;
      return [];
    } catch (err) {
      console.error('Error fetching reports:', err);
      return [];
    }
  },

  generateReport: async (payload: { title?: string; type?: string }): Promise<ReportItem> => {
    const res = await apiClient.post<ReportItem>('/reports/generate', payload);
    return res.data;
  }
};
