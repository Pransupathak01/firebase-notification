import api from './authService';

export const updateFCMToken = async (fcmToken: string) => {
    try {
        const response = await api.put('/notifications/fcm-token', { fcmToken });
        return response.data;
    } catch (error: any) {
        throw error.response?.data || { message: 'Network error or server unreachable' };
    }
};
