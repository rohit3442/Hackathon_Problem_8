import { apiClient } from './client';
import { SDGGoal } from '../types';

export interface SDGMappingPayload {
  esgActivity: string;
  sdgNumber: number;
  reason: string;
  reportingPeriod?: string;
}

export const sdgApi = {
  getSDGs: async (): Promise<{ goals: SDGGoal[]; mappings: any[] }> => {
    const res = await apiClient.get<{ goals: SDGGoal[]; mappings: any[] }>('/sdgs');
    return res.data;
  },

  createMapping: async (payload: SDGMappingPayload) => {
    const res = await apiClient.post('/sdgs/map', payload);
    return res.data;
  }
};
