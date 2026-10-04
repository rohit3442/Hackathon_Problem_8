import { apiClient } from './client';
import { User } from '../types';

export const usersApi = {
  getUsers: async (): Promise<User[]> => {
    try {
      const res = await apiClient.get<User[]>('/users');
      if (Array.isArray(res.data)) return res.data;
      return [];
    } catch (err) {
      console.error('Error fetching users:', err);
      return [];
    }
  },

  createUser: async (user: Partial<User>): Promise<User> => {
    const res = await apiClient.post<User>('/users', user);
    return res.data;
  }
};
