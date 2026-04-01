import apiClient from './apiClient';

export const login = async (email: string, password: string) => {
  const data: any = await apiClient.post('/auth/login', { email, password });
  localStorage.setItem('adpulse-token', data.token);
  localStorage.setItem('adpulse-user', JSON.stringify(data.user));
  return data;
};

export const logout = () => {
  localStorage.removeItem('adpulse-token');
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
