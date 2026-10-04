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
    try {
      const res = await apiClient.get<{ goals: SDGGoal[]; mappings: any[] }>('/sdgs');
      if (res.data && Array.isArray(res.data.goals)) return res.data;
      return { goals: [], mappings: [] };
    } catch (err) {
      console.error('Error fetching SDGs:', err);
      return { goals: [], mappings: [] };
    }
  },

  createMapping: async (payload: SDGMappingPayload) => {
    const res = await apiClient.post('/sdgs/map', payload);
    return res.data;
  }
};
