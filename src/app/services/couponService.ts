import axios from 'axios';
import { AppConfig } from '../config/api';
import { getUserSession } from './authService';

const api = axios.create({
    baseURL: AppConfig.API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    async (config) => {
        const session = await getUserSession();
        if (session && session.token) {
            config.headers.Authorization = `Bearer ${session.token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export interface Coupon {
    id: string;
    code: string;
    description: string;
    discount: number;
    type: 'percentage' | 'fixed';
}

export const fetchCoupons = async (): Promise<{ success: boolean; data: Coupon[] }> => {
    try {
        const response = await api.get('/coupons');
        return response.data;
    } catch (error: any) {
        throw error.response?.data || { message: 'Failed to fetch coupons' };
    }
};

export default api;
