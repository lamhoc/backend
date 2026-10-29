import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// Lưu JWT token an toàn trong bộ nhớ (In-memory storage)
let inMemoryToken: string | null = null;

export const setToken = (token: string | null): void => {
  inMemoryToken = token;
};

export const getToken = (): string | null => {
  return inMemoryToken;
};

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Gắn header Bearer Token tự động nếu có token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (inMemoryToken && config.headers) {
      config.headers.Authorization = `Bearer ${inMemoryToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Bắt lỗi 401 (hết hạn/chưa đăng nhập) và 403 (không đủ quyền)
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || 'Lỗi hệ thống';

      if (status === 401) {
        console.warn('Lỗi 401 Unauthorized:', message);
      } else if (status === 403) {
        console.warn('Lỗi 403 Forbidden:', message);
      }
    }
    return Promise.reject(error);
  }
);

