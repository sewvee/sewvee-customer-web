import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { BASE_URL } from './env';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ─── Request Interceptor — inject Bearer token ────────────────────────────────
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      let raw = localStorage.getItem('sewvee_customer_token');
      
      // Fallback: Read directly from Zustand state if standalone token is missing
      if (!raw) {
        try {
          const authStorage = localStorage.getItem('sewvee_customer_user');
          if (authStorage) {
            const parsed = JSON.parse(authStorage);
            if (parsed?.state?.token) {
              raw = parsed.state.token;
              // Restore the standalone token to keep them in sync
              localStorage.setItem('sewvee_customer_token', raw as string);
            }
          }
        } catch (e) {
          // ignore parsing errors
        }
      }

      if (raw) {
        const token = raw.startsWith('Bearer ') ? raw : `Bearer ${raw}`;
        config.headers.Authorization = token;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ─── Response Interceptor — handle 401 ────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Do not force redirect if the 401 came from the login endpoint itself
      const isLoginRequest = error.config?.url?.includes('login');
      if (!isLoginRequest && typeof window !== 'undefined') {
        localStorage.removeItem('sewvee_customer_token');
        localStorage.removeItem('sewvee_customer_user');
        window.location.href = '/signup';
      }
    }
    return Promise.reject(error);
  },
);

export default api;
