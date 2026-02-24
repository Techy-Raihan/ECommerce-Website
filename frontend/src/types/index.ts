export interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    brand: string;
    stockQuantity: number;
    categoryId: number;
    categoryName: string;
    imageUrls: string[];
}

export interface Category {
    id: number;
    name: string;
    description: string;
}

export interface CartItem {
    id: number;
    productId: number;
    productName: string;
    price: number;
    quantity: number;
    imageUrl: string;
    subtotal: number;
}

export interface Cart {
    cartId: number;
    userId: string;
    items: CartItem[];
    totalPrice: number;
}

export interface OrderItem {
    productId: number;
    productName: string;
    quantity: number;
    price: number;
    imageUrl?: string;
}

export interface Order {
    id: string;
    userId: string;
    totalPrice: number;
    status: string;
    paymentId?: string;
    shippingAddress: string;
    items: OrderItem[];
    createdAt: string;
}

export interface User {
    userId: string;
    name: string;
    email: string;
    role: string;
}

export interface AuthResponse {
    accessToken: string;
    tokenType: string;
    userId: string;
    name: string;
    email: string;
    role: string;
}

export interface DashboardStats {
    totalUsers: number;
    totalProducts: number;
    totalOrders: number;
    totalRevenue: number;
    pendingOrders: number;
}

export interface PageResponse<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    number: number;
    size: number;
}
