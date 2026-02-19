import { Platform } from 'react-native';
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

export const getDashboardData = async () => {
    try {
        const response = await api.get('/dashboard/summary');
        return response.data;
    } catch (error: any) {
        throw error.response?.data || { message: 'Failed to fetch dashboard data' };
    }
};

export default api;
