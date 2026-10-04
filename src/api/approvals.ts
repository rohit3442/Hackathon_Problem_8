import { apiClient } from './client';
import { ApprovalRecord } from '../types';

export const approvalsApi = {
  getApprovals: async (): Promise<ApprovalRecord[]> => {
    try {
      const res = await apiClient.get<ApprovalRecord[]>('/approvals');
      if (Array.isArray(res.data)) return res.data;
      if (res.data && typeof res.data === 'object' && Array.isArray((res.data as any).approvals)) {
        return (res.data as any).approvals;
      }
      return [];
    } catch (err) {
      console.error('Error fetching approvals:', err);
      return [];
    }
  },

  getApprovalById: async (id: string): Promise<ApprovalRecord | null> => {
    try {
      const res = await apiClient.get<ApprovalRecord>(`/approvals/${id}`);
      return res.data;
    } catch (err) {
      console.error(`Error fetching approval ${id}:`, err);
      return null;
    }
  },

  actionApproval: async (
    id: string,
    action: 'approve' | 'reject' | 'request_correction',
    comments?: string,
    userName?: string,
    userRole?: string
  ): Promise<ApprovalRecord> => {
    const res = await apiClient.post<ApprovalRecord>(`/approvals/${id}/action`, {
      action,
      comments,
      userName,
      userRole,
    });
    return res.data;
  }
};
