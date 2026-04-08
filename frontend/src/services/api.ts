import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL + '/api';

/*const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000, // Increased to 30 seconds for email operations
});*/
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL + "/api",
  timeout: 30000, // 10 seconds
  headers: {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    (config.headers as any)['Authorization'] = `Bearer ${token}`;
  }
  
  // Add cache-busting to prevent stale data
  if (config.method === 'get') {
    config.params = config.params || {};
    config.params['_t'] = Date.now(); // Add timestamp to bypass cache
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

export interface SignupPayload { 
  name: string; 
  email: string; 
  password: string; 
  phone: string 
}

export interface LoginPayload { 
  email: string; 
  password?: string;  // Optional for OTP-based login
}

export interface OtpPayload {
  email: string;
  otp: string;
}

/*export const authAPI = {
  signup: (data: SignupPayload) => api.post('/auth/signup', data),
  login: (data: LoginPayload) => api.post('/auth/login', data),
  verifyOtp: (email: string, otp: string) => api.post('/auth/verify-otp', { email, otp }),
  resendOtp: (email: string) => api.post('/auth/resend-otp', { email }),
};*/
export const authAPI = {
  login: (data: any) => api.post("/auth/login", data),
  signup: (data: any) => api.post("/auth/signup", data),
  verifyOtp: (email: string, otp: string) =>
    api.post("/auth/verify-otp", { email, otp }),
  resendOtp: (email: string) =>
    api.post("/auth/resend-otp", { email }),
  forgotPassword: (email: string) =>
    api.post("/auth/forgot-password", { email }),
  resetPassword: (email: string, otp: string, newPassword: string) =>
    api.post("/auth/reset-password", { email, otp, newPassword }),
};

 
// Product API
export  const productAPI = {
  getAll: (page = 0, size = 10) => api.get(`/products?page=${page}&size=${size}`),
  getById: (id: number) => api.get(`/products/${id}`),
  getFeatured: () => api.get('/products/featured'),
  filter: (params: { page?: number; size?: number; categoryId?: number; minPrice?: number; maxPrice?: number; search?: string; sortBy?: string; sortDir?: string }) => {
    const queryParams = new URLSearchParams();
    if (params.page !== undefined) queryParams.append('page', String(params.page));
    if (params.size !== undefined) queryParams.append('size', String(params.size));
    if (params.categoryId !== undefined) queryParams.append('categoryId', String(params.categoryId));
    if (params.minPrice !== undefined) queryParams.append('minPrice', String(params.minPrice));
    if (params.maxPrice !== undefined) queryParams.append('maxPrice', String(params.maxPrice));
    if (params.search !== undefined) queryParams.append('search', params.search);
    if (params.sortBy !== undefined) queryParams.append('sortBy', params.sortBy);
    if (params.sortDir !== undefined) queryParams.append('sortDir', params.sortDir);
    return api.get(`/products/filter?${queryParams.toString()}`);
  },
  search: (keyword: string) => api.get(`/products/search?keyword=${keyword}`),
  getByCategory: (categoryId: number, page = 0, size = 10) => 
    api.get(`/products/category/${categoryId}?page=${page}&size=${size}`),
};

// Category API
export const categoryAPI = {
  getAll: () => api.get('/categories'),
  getById: (id: number) => api.get(`/categories/${id}`),
  getRoot: () => api.get('/categories/root'),
};

// Wishlist API
export const wishlistAPI = {
  get: () => api.get('/wishlist'),
  check: (productId: number) => api.get(`/wishlist/check/${productId}`),
  add: (productId: number) => api.post(`/wishlist/add?productId=${productId}`),
  remove: (productId: number) => api.delete(`/wishlist/remove?productId=${productId}`),
};

export const cartAPI = {
  get: () => api.get('/cart'),
  add: (productId: number, quantity: number = 1) =>
    api.post(`/cart/add?productId=${productId}&quantity=${quantity}`),
  update: (productId: number, quantity: number) =>
    api.put(`/cart/update?productId=${productId}&quantity=${quantity}`),
  remove: (productId: number) =>
    api.delete(`/cart/remove?productId=${productId}`),
  clear: () => api.delete('/cart/clear'),
};

// Order API
export const orderAPI = {
  create: (data: any) => api.post('/orders', data),
  getAll: () => api.get('/orders'),
  getById: (id: number) => api.get(`/orders/${id}`),
  track: (orderNumber: string | number) => api.get(`/orders/track/${orderNumber}`),
  cancel: (orderId: number) => api.put(`/orders/${orderId}/cancel`),
};

// Review API
export const reviewAPI = {
  create: (productId: number, data: any) => api.post(`/reviews/product/${productId}`, data),
  check: (productId: number) => api.get(`/reviews/check/${productId}`),
  getByProduct: (productId: number) => api.get(`/reviews/product/${productId}`),
  update: (reviewId: number, data: any) => api.put(`/reviews/${reviewId}`, data),
  delete: (reviewId: number) => api.delete(`/reviews/${reviewId}`),
};

// Admin API
export const adminAPI = {
  getDashboardStats: () => api.get('/admin/dashboard'),
  getAllOrders: () => api.get('/admin/orders'),
  updateOrderStatus: (orderId: number, status: string) => 
    api.put(`/admin/orders/${orderId}/status`, { status }),
  getAllUsers: () => api.get('/admin/users'),
  getAllProducts: () => api.get('/admin/products'),
  addProduct: (data: any) => api.post('/admin/products', data),
  updateProduct: (productId: number, data: any) => api.put(`/admin/products/${productId}`, data),
  deleteProduct: (productId: number) => api.delete(`/admin/products/${productId}`),
};

export default api;
