/**
 * Axios API Service Instance
 * Base Axios client with interceptors for auth tokens and error handling.
 */
import axios from 'axios';
import { API_URL } from '@constants/api';

const apiService = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach JWT access token
apiService.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('gtm_access_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401 / global errors
apiService.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('gtm_access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error);
  }
);

export default apiService;
