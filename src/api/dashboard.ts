import { apiClient } from './client';

export interface DashboardMetrics {
  esgCompletion: number;
  brsrCompletion: number;
  pendingReviews: number;
  validationAlerts: number;
  projectsReporting: number;
  approvedRecords: number;
  dataQualityScore: number;
  metricsSummary: {
    totalScope1Tco2e: number;
    totalScope2Tco2e: number;
    totalScope3Tco2e: number;
    totalEnergyGj: number;
    avgRenewableEnergyPct: number;
  };
  emissionsTrend: Array<{
    year: string;
    scope1: number;
    scope2: number;
    scope3: number;
  }>;
}

export const dashboardApi = {
  getDashboardData: async (): Promise<DashboardMetrics> => {
    const res = await apiClient.get<DashboardMetrics>('/dashboard');
    return res.data;
  },
};
