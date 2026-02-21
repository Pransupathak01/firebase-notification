import axios from 'axios';
import { AppConfig } from '../config/api';
import { getUserSession } from './authService';

const api = axios.create({
    baseURL: AppConfig.API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor to add token to requests
api.interceptors.request.use(
    async (config) => {
        const session = await getUserSession();
        if (session && session.token) {
            config.headers.Authorization = `Bearer ${session.token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// ── Types ──────────────────────────────────────────────────────

export interface CartProduct {
    _id: string;
    name: string;
    brand: string;
    imageUrl: string;
    images: string[];
    price: number;
    mrp: number;
    discount: number;
    stock: number;
    rating: number;
    category: string;
    youEarn: number;
}

export interface CartItem {
    _id: string;
    product: CartProduct;
    quantity: number;
    size: string;
    itemTotal: number;
    itemMrp: number;
    itemSavings: number;
    itemEarnings: number;
}

export interface CartData {
    items: CartItem[];
    totalItems: number;
    totalPrice: number;
    totalMrp: number;
    totalSavings: number;
    totalEarnings: number;
}

export interface CartResponse {
    success: boolean;
    data: CartData;
}

export interface AddToCartResponse {
    success: boolean;
    message: string;
    data: {
        addedItem: {
            product: { _id: string; name: string; price: number; youEarn: number };
            quantity: number;
            size: string;
        };
        totalItems: number;
        totalPrice: number;
    };
}

export type CartUpdateAction = 'increment' | 'decrement' | 'remove' | 'set' | 'size' | 'add';

// ── API Functions ──────────────────────────────────────────────

/**
 * GET /api/cart — Fetch the user's full cart
 */
export const fetchCart = async (): Promise<CartResponse> => {
    try {
        console.log('[CartService] Fetching cart...');
        const response = await api.get('/cart');
        console.log('[CartService] Cart response:', JSON.stringify(response.data, null, 2));
        return response.data;
    } catch (error: any) {
        console.error('[CartService] Error fetching cart:', error?.response?.data || error.message);
        throw error.response?.data || { message: 'Failed to fetch cart' };
    }
};

/**
 * POST /api/cart/add — Add a product to cart (from Product Details)
 */
export const addToCartAPI = async (
    productId: string,
    quantity: number = 1,
    size: string = ''
): Promise<AddToCartResponse> => {
    try {
        console.log('[CartService] Adding to cart:', { productId, quantity, size });
        const body: any = { productId };
        if (quantity !== 1) body.quantity = quantity;
        if (size) body.size = size;

        const response = await api.post('/cart/add', body);
        console.log('[CartService] Add response:', JSON.stringify(response.data, null, 2));
        return response.data;
    } catch (error: any) {
        console.error('[CartService] Error adding to cart:', error?.response?.data || error.message);
        throw error.response?.data || { message: 'Failed to add to cart' };
    }
};

/**
 * POST /api/cart/update — Update cart item (increment, decrement, remove, set, size, add)
 */
export const updateCartAPI = async (
    productId: string,
    action: CartUpdateAction,
    payload?: { quantity?: number; size?: string }
): Promise<CartResponse> => {
    try {
        console.log('[CartService] Updating cart:', { productId, action, payload });
        const body: any = { productId, action };
        if (payload?.quantity !== undefined) body.quantity = payload.quantity;
        if (payload?.size !== undefined) body.size = payload.size;

        const response = await api.post('/cart/update', body);
        console.log('[CartService] Update response:', JSON.stringify(response.data, null, 2));
        return response.data;
    } catch (error: any) {
        console.error('[CartService] Error updating cart:', error?.response?.data || error.message);
        throw error.response?.data || { message: 'Failed to update cart' };
    }
};

/**
 * DELETE /api/cart — Clear entire cart
 */
export const clearCartAPI = async (): Promise<{ success: boolean; message?: string }> => {
    try {
        console.log('[CartService] Clearing cart...');
        const response = await api.delete('/cart');
        console.log('[CartService] Clear response:', JSON.stringify(response.data, null, 2));
        return response.data;
    } catch (error: any) {
        console.error('[CartService] Error clearing cart:', error?.response?.data || error.message);
        throw error.response?.data || { message: 'Failed to clear cart' };
    }
};

export default api;
