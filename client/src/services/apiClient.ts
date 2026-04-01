import axios from 'axios';
import { API_URL } from '../config/api';

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('adpulse-token');
  if (token) {
    config.headers.Authorization = 'Bearer ' + token;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

apiClient.interceptors.response.use((response) => {
  return response.data;
}, async (error) => {
  const originalRequest = error.config;

  // If 401 and not already retrying
  if (error.response && error.response.status === 401 && !originalRequest._retry) {
    originalRequest._retry = true;
    const refreshToken = localStorage.getItem('adpulse-refresh-token');

    if (refreshToken) {
      try {
        const response = await axios.post<{ token: string }>(`${API_URL}/auth/refresh`, { refreshToken });
        const { token } = response.data;
        
        localStorage.setItem('adpulse-token', token);
        originalRequest.headers.Authorization = 'Bearer ' + token;
        
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout
        processLogout();
      }
    } else {
      processLogout();
    }
  }
  
  const message = error.response?.data?.error 
    || error.response?.data?.message
    || error.message
    || 'Something went wrong';
  
  return Promise.reject(new Error(message));
});

function processLogout() {
  localStorage.removeItem('adpulse-token');
  localStorage.removeItem('adpulse-refresh-token');
  localStorage.removeItem('adpulse-user');
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
}

export default apiClient;
