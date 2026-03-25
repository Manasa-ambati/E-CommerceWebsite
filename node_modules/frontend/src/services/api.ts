import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL + '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    (config.headers as any)['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.code === 'ECONNABORTED') console.error('Request timeout.');
    else if ([401, 403].includes(err.response?.status)) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export interface SignupPayload { name: string; email: string; password?: string; phone: string }
export interface LoginPayload { email: string }

export const authAPI = {
  signup: (data: SignupPayload) => api.post('/auth/signup', data),
  login: (data: LoginPayload) => api.post('/auth/login', data),
  verifyOtp: (email: string, otp: string) => api.post('/auth/verify-otp', { email, otp }),
  resendOtp: (email: string) => api.post('/auth/resend-otp', { email }),
};

export default api;