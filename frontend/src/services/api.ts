// src/services/api.ts
import axios, { AxiosResponse } from 'axios';

/* ----------------- API INSTANCE ----------------- */
const API_URL = process.env.REACT_APP_API_URL + '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

/* ----------------- REQUEST INTERCEPTOR ----------------- */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    if (!config.headers) {
      config.headers = {} as unknown as import('axios').AxiosRequestHeaders;
    }

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* ----------------- RESPONSE INTERCEPTOR ----------------- */
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout. Check your connection.');
    } else if ([401, 403].includes(error.response?.status)) {
      console.error('Auth error:', error.response.status);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/* ----------------- TYPES ----------------- */
export interface SignupPayload {
  name: string;
  email: string;
  password: string;
  phone: string;
}

export interface LoginPayload {
  email: string;
  password?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data?: {
    token?: string;
    accessToken?: string;
    user?: any;
    requiresOtp?: boolean;
    isNewUser?: boolean;
    email?: string;
    [key: string]: any;
  };
  requiresOtp?: boolean;
  isNewUser?: boolean;
  email?: string;
}

/* ----------------- AUTH API ----------------- */
export const authAPI = {
  signup: (data: SignupPayload) => api.post<AuthResponse>('/auth/signup', data),
  login: (data: LoginPayload) => api.post<AuthResponse>('/auth/login', data),
  verifyOtp: (email: string, otp: string) => api.post<AuthResponse>('/auth/verify-otp', { email, otp }),
  resendOtp: (email: string) => api.post<AuthResponse>('/auth/resend-otp', { email }),
};

/* ----------------- PRODUCT API ----------------- */
export const productAPI = {
  getAll: (params?: any) => api.get('/products', { params }),
  getFeatured: () => api.get('/products/featured'),
  getById: (id: number) => api.get(`/products/${id}`),
  getByCategory: (categoryId: number, params?: any) =>
    api.get(`/products/category/${categoryId}`, { params }),
  search: (query: string, params?: any) =>
    api.get('/products/search', { params: { query, ...params } }),
  filter: (filters: any) => api.get('/products/filter', { params: filters }),
  create: (data: any) => api.post('/products', data),
  update: (id: number, data: any) => api.put(`/products/${id}`, data),
  delete: (id: number) => api.delete(`/products/${id}`),
};

/* ----------------- CATEGORY API ----------------- */
export const categoryAPI = {
  getAll: () => api.get('/categories'),
  getRoot: () => api.get('/categories/root'),
  getSubcategories: (id: number) => api.get(`/categories/${id}/subcategories`),
  getById: (id: number) => api.get(`/categories/${id}`),
  create: (data: any) => api.post('/categories', data),
  update: (id: number, data: any) => api.put(`/categories/${id}`, data),
  delete: (id: number) => api.delete(`/categories/${id}`),
};

/* ----------------- CART API ----------------- */
export const cartAPI = {
  get: () => api.get('/cart'),
  add: (productId: number, quantity: number = 1) =>
    api.post(`/cart/add?productId=${productId}&quantity=${quantity}`),
  update: (productId: number, quantity: number) =>
    api.put(`/cart/update?productId=${productId}&quantity=${quantity}`),
  remove: (productId: number) => api.delete(`/cart/remove?productId=${productId}`),
  clear: () => api.delete('/cart/clear'),
};

/* ----------------- WISHLIST API ----------------- */
export const wishlistAPI = {
  get: () => api.get('/wishlist'),
  add: (productId: number) => api.post(`/wishlist/add?productId=${productId}`),
  remove: (productId: number) => api.delete(`/wishlist/remove?productId=${productId}`),
  check: (productId: number) => api.get(`/wishlist/check?productId=${productId}`),
};

/* ----------------- ORDER API ----------------- */
export const orderAPI = {
  getAll: () => api.get('/orders'),
  getPaged: (params?: any) => api.get('/orders/paged', { params }),
  getById: (id: number) => api.get(`/orders/${id}`),
  track: (orderNumber: string) => api.get(`/orders/track/${orderNumber}`),
  create: (data: any) => api.post('/orders', data),
  cancel: (orderId: number) => api.put(`/orders/${orderId}/cancel`),
};

/* ----------------- REVIEW API ----------------- */
export const reviewAPI = {
  getByProduct: (productId: number) => api.get(`/reviews/product/${productId}`),
  add: (productId: number, data: any) => api.post(`/reviews/product/${productId}`, data),
  check: (productId: number) => api.get(`/reviews/check/${productId}`),
};

/* ----------------- ADMIN API ----------------- */
export const adminAPI = {
  getOrders: (params?: any) => api.get('/admin/orders', { params }),
  updateOrderStatus: (orderId: number, status: string) =>
    api.put(`/admin/orders/${orderId}/status?status=${status}`),
};

export default api;