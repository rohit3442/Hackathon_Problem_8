import { apiClient } from './client';
import { ValidationAlert } from '../types';

export interface AnomalyCheckResult {
  isAnomaly: boolean;
  score: number;
  severity: 'low' | 'medium' | 'high';
  explanation: string;
  expectedBaseline: number;
  deviationPct: number;
  zScore: number;
}

export const validationApi = {
  getAlerts: async (): Promise<ValidationAlert[]> => {
    try {
      const res = await apiClient.get<ValidationAlert[]>('/validation');
      if (Array.isArray(res.data)) return res.data;
      return [];
    } catch (err) {
      console.error('Error fetching validation alerts:', err);
      return [];
    }
  },

  getAlertById: async (id: string): Promise<ValidationAlert | null> => {
    try {
      const res = await apiClient.get<ValidationAlert>(`/validation/${id}`);
      return res.data;
    } catch (err) {
      console.error(`Error fetching validation alert ${id}:`, err);
      return null;
    }
  },

  runValidationScan: async () => {
    const res = await apiClient.post('/validation/run');
    return res.data;
  },

  updateAlert: async (id: string, updates: Partial<ValidationAlert>) => {
    const res = await apiClient.put(`/validation/${id}`, updates);
    return res.data;
  },

  checkAnomaly: async (metric: string, value: number, historical: number[] = []): Promise<AnomalyCheckResult> => {
    const res = await apiClient.post<AnomalyCheckResult>('/validation/anomalies/check', {
      metric,
      value,
      historical,
    });
    return res.data;
  },

  getAnomalies: async (): Promise<ValidationAlert[]> => {
    const res = await apiClient.get<ValidationAlert[]>('/validation/anomalies');
    return res.data;
  }
};
