import { apiClient } from './client';
import { User } from '../types';

export interface LoginCredentials {
  email?: string;
  role?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>('/auth/login', credentials);
    if (res.data.token) {
      localStorage.setItem('eco_metrics_token', res.data.token);
    }
    return res.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const res = await apiClient.get<User>('/auth/me');
    return res.data;
  },

  logout: () => {
    localStorage.removeItem('eco_metrics_token');
  }
};
