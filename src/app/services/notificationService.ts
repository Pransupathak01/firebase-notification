import api from './authService';
import EncryptedStorage from 'react-native-encrypted-storage';
import { AppConfig } from '../config/api';

// Keep using axios `api` for FCM token updates (already has auth interceptor)
export const updateFCMToken = async (fcmToken: string) => {
    try {
        const response = await api.put('/notifications/fcm-token', { fcmToken });
        return response.data;
    } catch (error: any) {
        throw error.response?.data || { message: 'Network error or server unreachable' };
    }
};

// Helper to get auth token
const getToken = async (): Promise<string | null> => {
    const session = await EncryptedStorage.getItem('user_session');
    const parsed = JSON.parse(session || '{}');
    return parsed.token || null;
};

const BASE_URL = `${AppConfig.API_URL}/notifications`;

// Get all notifications (paginated)
export const getNotifications = async (page = 1, limit = 20) => {
    const token = await getToken();
    const res = await fetch(`${BASE_URL}?page=${page}&limit=${limit}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`Failed to fetch notifications: ${res.status}`);
    return res.json();
};

// Mark a single notification as read
export const markAsRead = async (id: string) => {
    const token = await getToken();
    const res = await fetch(`${BASE_URL}/${id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`Failed to mark as read: ${res.status}`);
    return res.json();
};

// Mark ALL notifications as read
export const markAllAsRead = async () => {
    const token = await getToken();
    const res = await fetch(`${BASE_URL}/read-all`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`Failed to mark all as read: ${res.status}`);
    return res.json();
};

// Delete a single notification
export const deleteNotification = async (id: string) => {
    const token = await getToken();
    const res = await fetch(`${BASE_URL}/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`Failed to delete notification: ${res.status}`);
    return res.json();
};
