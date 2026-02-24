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

export interface Address {
    id: string;
    name: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    type: 'Home' | 'Work' | 'Other';
}

export const fetchAddresses = async (): Promise<{ success: boolean; data: Address[] }> => {
    try {
        const response = await api.get('/addresses');
        return response.data;
    } catch (error: any) {
        throw error.response?.data || { message: 'Failed to fetch addresses' };
    }
};

export const saveAddress = async (addressData: Omit<Address, 'id'>): Promise<{ success: boolean; data: Address }> => {
    try {
        const response = await api.post('/addresses', addressData);
        return response.data;
    } catch (error: any) {
        throw error.response?.data || { message: 'Failed to save address' };
    }
};

export default api;
