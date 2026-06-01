import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Products
export const getProducts = (search = '') => api.get(`/products/${search ? `?search=${search}` : ''}`);
export const getProduct = (id) => api.get(`/products/${id}`);
export const createProduct = (data) => api.post('/products/', data);
export const updateProduct = (id, data) => api.put(`/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/products/${id}`);

// Customers
export const getCustomers = (search = '') => api.get(`/customers/${search ? `?search=${search}` : ''}`);
export const getCustomer = (id) => api.get(`/customers/${id}`);
export const createCustomer = (data) => api.post('/customers/', data);
export const deleteCustomer = (id) => api.delete(`/customers/${id}`);

// Auth
export const login = (data) => api.post('/auth/login', data, {
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
});
export const register = (data) => api.post('/auth/register', data);
export const getMe = () => api.get('/auth/me');
export const updateMe = (data) => api.put('/auth/me', data);

// Orders
export const getOrders = () => api.get('/orders/');
export const getOrder = (id) => api.get(`/orders/${id}`);
export const createOrder = (data) => api.post('/orders/', data);
export const deleteOrder = (id) => api.delete(`/orders/${id}`);

// Dashboard
export const getDashboardSummary = () => api.get('/dashboard/summary');

export default api;
