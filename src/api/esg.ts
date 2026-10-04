import { apiClient } from './client';

export interface EnvironmentalDataPayload {
  projectId: string;
  reportingPeriod?: string;
  electricityKwh: number;
  fuelLitres: number;
  renewableEnergyPct?: number;
  waterWithdrawalKl?: number;
  waterConsumptionKl?: number;
  waterRecycledKl?: number;
  waterRecycledPct?: number;
  hazardousWasteMt?: number;
  nonHazardousWasteMt?: number;
  wasteRecycledPct?: number;
  scope1GhgTco2e?: number;
  scope2GhgTco2e?: number;
  scope3GhgTco2e?: number;
  status?: 'draft' | 'submitted';
  evidenceAttached?: string;
  remarks?: string;
  userName?: string;
}

export interface SocialDataPayload {
  projectId: string;
  reportingPeriod?: string;
  permanentEmployees?: number;
  femaleEmployees?: number;
  femaleEmployeesPct?: number;
  differentlyAbled?: number;
  contractWorkers?: number;
  avgTrainingHoursPerPerson?: number;
  ltifr?: number;
  recordableInjuries?: number;
  fatalities?: number;
  turnoverPct?: number;
  csrSpentCr?: number;
  status?: 'draft' | 'submitted';
  userName?: string;
}

export interface GovernanceDataPayload {
  projectId: string;
  reportingPeriod?: string;
  antiCorruptionPolicyActive?: boolean;
  operationsCoveredPct?: number;
  whistleblowerCasesReceived?: number;
  whistleblowerCasesResolved?: number;
  status?: 'draft' | 'submitted';
  userName?: string;
}

export const esgApi = {
  getAllESG: async () => {
    const res = await apiClient.get('/esg');
    return res.data;
  },

  getEnvironmental: async () => {
    const res = await apiClient.get('/esg/environmental');
    return res.data;
  },

  saveEnvironmental: async (payload: EnvironmentalDataPayload) => {
    const res = await apiClient.post('/esg/environmental', payload);
    return res.data;
  },

  saveSocial: async (payload: SocialDataPayload) => {
    const res = await apiClient.post('/esg/social', payload);
    return res.data;
  },

  saveGovernance: async (payload: GovernanceDataPayload) => {
    const res = await apiClient.post('/esg/governance', payload);
    return res.data;
  },

  getESGMetrics: async (category?: string, projectCode?: string): Promise<any[]> => {
    try {
      const params: any = {};
      if (category) params.category = category;
      if (projectCode) params.projectCode = projectCode;
      const res = await apiClient.get<any[]>('/esg/metrics', { params });
      if (Array.isArray(res.data) && res.data.length > 0) return res.data;
      const { MOCK_ESG_METRICS } = await import('../services/mockData');
      return category ? MOCK_ESG_METRICS.filter(m => m.category === category) : MOCK_ESG_METRICS;
    } catch (err) {
      console.error('Error fetching ESG metrics:', err);
      const { MOCK_ESG_METRICS } = await import('../services/mockData');
      return category ? MOCK_ESG_METRICS.filter(m => m.category === category) : MOCK_ESG_METRICS;
    }
  },

  updateESGMetric: async (id: string, updates: any) => {
    try {
      const res = await apiClient.put(`/esg/metrics/${id}`, updates);
      return res.data;
    } catch (err) {
      console.error(`Error updating ESG metric ${id}:`, err);
      return null;
    }
  }
};
