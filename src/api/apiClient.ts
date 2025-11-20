import axios from 'axios';
import { API } from './api';

const apiClient = axios.create({
  baseURL: API.BASEURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only log out on 401 (Unauthorized) - means token is invalid/expired
    // 403 (Forbidden) means user is authenticated but lacks permission - don't logout
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    // For 403 errors, just reject the promise and let the component handle it
    return Promise.reject(error);
  }
);

export default apiClient;

