import { apiClient } from './client';
import { BRSRPrinciple, BRSRIndicator } from '../types';

export const brsrApi = {
  getSections: async () => {
    const res = await apiClient.get('/brsr/sections');
    return res.data;
  },

  getPrinciples: async (): Promise<BRSRPrinciple[]> => {
    try {
      const res = await apiClient.get<BRSRPrinciple[]>('/brsr/principles');
      if (Array.isArray(res.data)) return res.data;
      return [];
    } catch (err) {
      console.error('Error fetching BRSR principles:', err);
      return [];
    }
  },

  getIndicators: async (): Promise<BRSRIndicator[]> => {
    try {
      const res = await apiClient.get<BRSRIndicator[]>('/brsr/indicators');
      if (Array.isArray(res.data)) return res.data;
      return [];
    } catch (err) {
      console.error('Error fetching BRSR indicators:', err);
      return [];
    }
  },

  getResponses: async () => {
    try {
      const res = await apiClient.get('/brsr/responses');
      return res.data || [];
    } catch (err) {
      console.error('Error fetching BRSR responses:', err);
      return [];
    }
  },

  saveResponse: async (payload: {
    indicatorCode: string;
    reportingPeriod?: string;
    calculatedValue: string;
    status?: string;
    evidenceFile?: string;
    auditorNotes?: string;
  }) => {
    const res = await apiClient.post('/brsr/responses', payload);
    return res.data;
  }
};
