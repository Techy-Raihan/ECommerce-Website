import api from './axiosInstance';
import { AuthResponse, Cart, Order, Product, Category, DashboardStats, PageResponse } from '../types';

// Auth
export const authApi = {
    register: (data: { name: string; email: string; password: string }) =>
        api.post<AuthResponse>('/auth/register', data),
    login: (data: { email: string; password: string }) =>
        api.post<AuthResponse>('/auth/login', data),
    logout: () => api.post('/auth/logout'),
    refresh: (refreshToken: string) =>
        api.post<AuthResponse>('/auth/refresh', { refreshToken }),
};

// Products
export const productApi = {
    getAll: (params?: { keyword?: string; categoryId?: number; brand?: string; page?: number; size?: number }) =>
        api.get<PageResponse<Product>>('/products', { params }),
    getById: (id: number) => api.get<Product>(`/products/${id}`),
    create: (data: Partial<Product>) => api.post<Product>('/products', data),
    update: (id: number, data: Partial<Product>) => api.put<Product>(`/products/${id}`, data),
    delete: (id: number) => api.delete(`/products/${id}`),
    getCategories: () => api.get<Category[]>('/categories'),
    createCategory: (data: { name: string; description?: string }) => api.post<Category>('/categories', data),
};

// Cart
export const cartApi = {
    getCart: () => api.get<Cart>('/cart'),
    addItem: (data: { productId: number; productName: string; price: number; quantity: number; imageUrl?: string }) =>
        api.post<Cart>('/cart/add', data),
    removeItem: (itemId: number) => api.delete<Cart>(`/cart/item/${itemId}`),
    clearCart: () => api.delete('/cart/clear'),
};

// Orders
export const orderApi = {
    createOrder: (data: { shippingAddress: string; items: any[] }) =>
        api.post<Order>('/orders', data),
    getOrders: () => api.get<Order[]>('/orders'),
    getOrder: (id: string) => api.get<Order>(`/orders/${id}`),
    updateStatus: (id: string, status: string) =>
        api.put<Order>(`/orders/${id}/status`, { status }),
};

// Payments
export const paymentApi = {
    initiate: (data: { orderId: string; amount: number; paymentMethod?: string }) =>
        api.post('/payments/initiate', data),
    simulateSuccess: (orderId: string) =>
        api.post('/payments/webhook', { orderId }),
    getByOrderId: (orderId: string) => api.get(`/payments/${orderId}`),
};

// Admin
export const adminApi = {
    getDashboard: () => api.get<DashboardStats>('/admin/dashboard'),
};
