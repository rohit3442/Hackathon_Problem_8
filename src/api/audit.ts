import { apiClient } from './client';
import { AuditLog } from '../types';

export const auditApi = {
  getLogs: async (): Promise<AuditLog[]> => {
    const res = await apiClient.get<AuditLog[]>('/audit');
    return res.data;
  }
};
