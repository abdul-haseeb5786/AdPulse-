import apiClient from './apiClient';
import type { User } from '../context/AuthContext';

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: User;
}

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const data = await apiClient.post<any, AuthResponse>('/auth/login', { email, password });
  localStorage.setItem('adpulse-token', data.token);
  localStorage.setItem('adpulse-refresh-token', data.refreshToken);
  localStorage.setItem('adpulse-user', JSON.stringify(data.user));
  return data;
};

export const logout = () => {
  localStorage.removeItem('adpulse-token');
  localStorage.removeItem('adpulse-refresh-token');
  localStorage.removeItem('adpulse-user');
  window.location.href = '/login';
};

export const getCurrentUser = () => {
  const user = localStorage.getItem('adpulse-user');
  return user ? JSON.parse(user) : null;
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('adpulse-token');
};
