import { apiClient } from './client';
import { ReviewRequest } from '../types';

export const reviewsApi = {
  getReviews: async (params?: {
    projectId?: string;
    submissionId?: string;
    status?: string;
    isDraft?: boolean;
    section?: string;
  }): Promise<ReviewRequest[]> => {
    const res = await apiClient.get<ReviewRequest[]>('/reviews', { params });
    return Array.isArray(res.data) ? res.data : [];
  },

  getReviewById: async (id: string): Promise<ReviewRequest> => {
    const res = await apiClient.get<ReviewRequest>(`/reviews/${id}`);
    return res.data;
  },

  createReview: async (data: Partial<ReviewRequest>): Promise<ReviewRequest> => {
    const res = await apiClient.post<ReviewRequest>('/reviews', data);
    return res.data;
  },

  updateReview: async (id: string, data: Partial<ReviewRequest>): Promise<ReviewRequest> => {
    const res = await apiClient.put<ReviewRequest>(`/reviews/${id}`, data);
    return res.data;
  },

  sendReviewRequest: async (id: string): Promise<ReviewRequest> => {
    const res = await apiClient.post<ReviewRequest>(`/reviews/${id}/send`);
    return res.data;
  },

  sendBulkReviewDraft: async (submissionId: string, projectId?: string, reviewerName?: string): Promise<{ success: boolean; sentCount: number }> => {
    const res = await apiClient.post<{ success: boolean; sentCount: number }>('/reviews/bulk-send', {
      submissionId,
      projectId,
      reviewerName
    });
    return res.data;
  },

  respondReview: async (id: string, data: {
    response: string;
    correctedValue?: any;
    evidenceName?: string;
    responderName?: string;
  }): Promise<ReviewRequest> => {
    const res = await apiClient.post<ReviewRequest>(`/reviews/${id}/respond`, data);
    return res.data;
  },

  resolveReview: async (id: string, data: {
    resolutionComment?: string;
    reviewerName?: string;
    status?: 'RESOLVED' | 'APPROVED';
  }): Promise<ReviewRequest> => {
    const res = await apiClient.post<ReviewRequest>(`/reviews/${id}/resolve`, data);
    return res.data;
  },

  deleteReview: async (id: string): Promise<{ success: boolean }> => {
    const res = await apiClient.delete<{ success: boolean }>(`/reviews/${id}`);
    return res.data;
  }
};
