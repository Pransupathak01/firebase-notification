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

interface GetProductsParams {
    category?: string;
    search?: string;
    sort?: string;
    page?: number;
    limit?: number;
}

export const getProducts = async (params: GetProductsParams = {}) => {
    try {
        const queryParams: any = {};
        if (params.category && params.category !== 'All') queryParams.category = params.category;
        if (params.search) queryParams.search = params.search;
        if (params.sort) queryParams.sort = params.sort;
        if (params.page) queryParams.page = params.page;
        queryParams.limit = params.limit || 20;

        console.log('[ProductsService] Fetching products with params:', JSON.stringify(queryParams));
        const response = await api.get('/products', { params: queryParams });
        console.log('[ProductsService] API Response:', JSON.stringify(response.data, null, 2));
        return response.data;
    } catch (error: any) {
        console.error('[ProductsService] Error fetching products:', error?.response?.data || error.message);
        throw error.response?.data || { message: 'Failed to fetch products' };
    }
};

export const getProductById = async (id: string) => {
    try {
        console.log('[ProductsService] Fetching product detail for:', id);
        const response = await api.get(`/products/${id}`);
        console.log('[ProductsService] Product detail response:', JSON.stringify(response.data, null, 2));
        return response.data;
    } catch (error: any) {
        console.error('[ProductsService] Error fetching product detail:', error?.response?.data || error.message);
        throw error.response?.data || { message: 'Failed to fetch product details' };
    }
};

export const getCategories = async () => {
    try {
        console.log('[ProductsService] Fetching categories...');
        const response = await api.get('/products/categories');
        console.log('[ProductsService] Categories response:', JSON.stringify(response.data, null, 2));
        return response.data;
    } catch (error: any) {
        console.error('[ProductsService] Error fetching categories:', error?.response?.data || error.message);
        throw error.response?.data || { message: 'Failed to fetch categories' };
    }
};

export default api;
