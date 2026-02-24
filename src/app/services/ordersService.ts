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

export const getOrders = async (filter: string = 'All') => {
    try {
        // Map UI filter strings to API expected query params if needed.
        // The user prompted: "http://localhost:5000/api/orders?filter=this_week"
        // So I'll convert "This Week" -> "this_week"
        let filterParam = 'today';
        switch (filter) {
            case 'Today': filterParam = 'today'; break;
            case 'This Week': filterParam = 'this_week'; break;
            case 'Last Week': filterParam = 'last_week'; break;
            case 'This Month': filterParam = 'this_month'; break;
            case 'Last Month': filterParam = 'last_month'; break;
            default: filterParam = filter.toLowerCase().replace(' ', '_');
        }

        const response = await api.get('/orders', {
            params: { filter: filterParam }
        });
        return response.data;
    } catch (error: any) {
        throw error.response?.data || { message: 'Failed to fetch orders' };
    }
};

export const createOrder = async (orderData: {
    addressId: string;
    couponCode?: string;
    referralCode?: string;
    paymentMethod: string;
}) => {
    try {
        const response = await api.post('/orders', orderData);
        return response.data;
    } catch (error: any) {
        throw error.response?.data || { message: 'Failed to place order' };
    }
};

export const validateCheckoutAPI = async (referralCode?: string, couponCode?: string) => {
    try {
        const response = await api.post('/orders/validate-checkout', { referralCode, couponCode });
        return response.data;
    } catch (error: any) {
        throw error.response?.data || { message: 'Validation failed' };
    }
};

export default api;
