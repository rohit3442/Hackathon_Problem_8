import { apiClient } from './client';
import { AuditLog } from '../types';

export const auditApi = {
  getLogs: async (): Promise<AuditLog[]> => {
    try {
      const res = await apiClient.get<AuditLog[]>('/audit');
      if (Array.isArray(res.data)) return res.data;
      return [];
    } catch (err) {
      console.error('Error fetching audit logs:', err);
      return [];
    }
  }
};
