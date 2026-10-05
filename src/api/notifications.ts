import { apiClient } from './client';
import { NotificationItem } from '../types';

export const notificationsApi = {
  getNotifications: async (userId?: string): Promise<NotificationItem[]> => {
    const res = await apiClient.get<NotificationItem[]>('/notifications', {
      params: userId ? { userId } : undefined
    });
    return Array.isArray(res.data) ? res.data : [];
  },

  markAsRead: async (id: string): Promise<NotificationItem> => {
    const res = await apiClient.put<NotificationItem>(`/notifications/${id}/read`);
    return res.data;
  },

  markAllAsRead: async (): Promise<{ success: boolean; count: number }> => {
    const res = await apiClient.put<{ success: boolean; count: number }>('/notifications/read-all');
    return res.data;
  },

  createNotification: async (data: Partial<NotificationItem>): Promise<NotificationItem> => {
    const res = await apiClient.post<NotificationItem>('/notifications', data);
    return res.data;
  }
};
