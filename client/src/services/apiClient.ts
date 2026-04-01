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
}, (error) => {
  if (error.response && error.response.status === 401) {
    localStorage.removeItem('adpulse-token');
    localStorage.removeItem('adpulse-user');
    window.location.href = '/login';
  }
  
  const message = error.response?.data?.error 
    || error.response?.data?.message
    || error.message
    || 'Something went wrong';
  
  return Promise.reject(new Error(message));
});

export default apiClient;
