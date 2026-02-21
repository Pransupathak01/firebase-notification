import { Platform } from 'react-native';
import axios from 'axios';
import EncryptedStorage from 'react-native-encrypted-storage';
import { AppConfig } from '../config/api';

// Create axios instance
const api = axios.create({
    baseURL: AppConfig.API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add interceptor to attach token to requests
api.interceptors.request.use(
    async (config) => {
        try {
            const session = await getUserSession();
            if (session && session.token) {
                config.headers.Authorization = `Bearer ${session.token}`;
            }
        } catch (error) {
            console.error('Error in auth interceptor:', error);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Auth functions
export const registerUser = async (userData: any) => {
    try {
        const response = await api.post('/auth/register', userData);
        return response.data;
    } catch (error: any) {
        throw error.response?.data || { message: 'Network error or server unreachable' };
    }
};

export const loginUser = async (userData: any) => {
    try {
        const response = await api.post('/auth/login', userData);
        return response.data;
    } catch (error: any) {
        throw error.response?.data || { message: 'Network error or server unreachable' };
    }
};

export const logoutUser = async (userId: string) => {
    try {
        const response = await api.post('/auth/logout', { userId });
        return response.data;
    } catch (error: any) {
        throw error.response?.data || { message: 'Network error or server unreachable' };
    }
};

export const getUserProfile = async () => {
    try {
        const response = await api.get('/users/profile');
        return response.data;
    } catch (error: any) {
        throw error.response?.data || { message: 'Network error or server unreachable' };
    }
};

// Storage functions
export const storeUserSession = async (sessionData: { token: string; user: any }) => {
    try {
        await EncryptedStorage.setItem(
            'user_session',
            JSON.stringify(sessionData)
        );
    } catch (error) {
        console.error('Error storing user session:', error);
    }
};

export const getUserSession = async () => {
    try {
        const session = await EncryptedStorage.getItem('user_session');
        return session ? JSON.parse(session) : null;
    } catch (error) {
        console.error('Error retrieving user session:', error);
        return null;
    }
};

export const removeUserSession = async () => {
    try {
        await EncryptedStorage.clear();
    } catch (error) {
        console.error('Error removing user session:', error);
    }
};

export default api;
