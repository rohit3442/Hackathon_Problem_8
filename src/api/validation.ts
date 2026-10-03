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
    const res = await apiClient.get<ValidationAlert[]>('/validation');
    return res.data;
  },

  getAlertById: async (id: string): Promise<ValidationAlert> => {
    const res = await apiClient.get<ValidationAlert>(`/validation/${id}`);
    return res.data;
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
