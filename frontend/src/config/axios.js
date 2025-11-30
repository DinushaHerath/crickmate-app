import axios from 'axios';
import { API_BASE_URL } from './api';

// Create axios instance with custom configuration
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method.toUpperCase()} request to: ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    console.log(`Response from ${response.config.url}:`, response.status);
    return response;
  },
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout');
    } else if (error.message === 'Network Error') {
      console.error('Network Error - Cannot connect to:', error.config?.url);
      console.error('Please check:');
      console.error('1. Backend server is running');
      console.error('2. API_BASE_URL is correct:', API_BASE_URL);
      console.error('3. Device is on same network');
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
