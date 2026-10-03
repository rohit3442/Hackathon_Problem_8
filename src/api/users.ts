import { apiClient } from './client';
import { User } from '../types';

export const usersApi = {
  getUsers: async (): Promise<User[]> => {
    const res = await apiClient.get<User[]>('/users');
    return res.data;
  },

  createUser: async (user: Partial<User>): Promise<User> => {
    const res = await apiClient.post<User>('/users', user);
    return res.data;
  }
};
