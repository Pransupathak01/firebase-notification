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
    (error) => {
        return Promise.reject(error);
    }
);

export const createRazorpayOrder = async (amount: number) => {
    try {
        const response = await api.post('/payments/create-order', { amount });
        return response.data;
    } catch (error: any) {
        throw error.response?.data || { message: 'Failed to create payment order' };
    }
};

export const verifyPaymentAndPlaceOrder = async (orderData: {
    addressId: string;
    couponCode?: string;
    referralCode?: string;
    paymentMethod: string;
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
}) => {
    try {
        const response = await api.post('/orders', orderData);
        return response.data;
    } catch (error: any) {
        throw error.response?.data || { message: 'Payment verification failed' };
    }
};
