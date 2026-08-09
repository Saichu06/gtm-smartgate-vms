/**
 * Axios API Service Instance
 * Base Axios client with request interceptors for Authorization Bearer tokens
 * and automatic 401 response refresh token retry interceptor.
 */
import axios from 'axios';
import { API_URL } from '@constants/api';

const apiService = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach access token or kiosk token
apiService.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('gtm_access_token') || localStorage.getItem('gtm_kiosk_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response interceptor — handle 401 token refresh retry flow
apiService.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiService(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('gtm_refresh_token');
      if (!refreshToken) {
        isRefreshing = false;
        localStorage.removeItem('gtm_access_token');
        localStorage.removeItem('gtm_refresh_token');
        localStorage.removeItem('gtm_user');
        return Promise.reject(error.response?.data || error);
      }

      try {
        const res = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
        if (res.data?.success && res.data?.data?.accessToken) {
          const { accessToken, refreshToken: newRefreshToken } = res.data.data;
          localStorage.setItem('gtm_access_token', accessToken);
          if (newRefreshToken) {
            localStorage.setItem('gtm_refresh_token', newRefreshToken);
          }
          apiService.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          processQueue(null, accessToken);
          isRefreshing = false;
          return apiService(originalRequest);
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        isRefreshing = false;
        localStorage.removeItem('gtm_access_token');
        localStorage.removeItem('gtm_refresh_token');
        localStorage.removeItem('gtm_user');
        window.location.href = '/login';
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error.response?.data || error);
  }
);

export default apiService;
