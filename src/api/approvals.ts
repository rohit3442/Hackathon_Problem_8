import { apiClient } from './client';
import { ApprovalRecord } from '../types';

export const approvalsApi = {
  getApprovals: async (): Promise<ApprovalRecord[]> => {
    const res = await apiClient.get<ApprovalRecord[]>('/approvals');
    return res.data;
  },

  getApprovalById: async (id: string): Promise<ApprovalRecord> => {
    const res = await apiClient.get<ApprovalRecord>(`/approvals/${id}`);
    return res.data;
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
