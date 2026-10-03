import { apiClient } from './client';
import { BRSRPrinciple, BRSRIndicator } from '../types';

export const brsrApi = {
  getSections: async () => {
    const res = await apiClient.get('/brsr/sections');
    return res.data;
  },

  getPrinciples: async (): Promise<BRSRPrinciple[]> => {
    const res = await apiClient.get<BRSRPrinciple[]>('/brsr/principles');
    return res.data;
  },

  getIndicators: async (): Promise<BRSRIndicator[]> => {
    const res = await apiClient.get<BRSRIndicator[]>('/brsr/indicators');
    return res.data;
  },

  getResponses: async () => {
    const res = await apiClient.get('/brsr/responses');
    return res.data;
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
