import axios from 'axios';
import EncryptedStorage from 'react-native-encrypted-storage';
import { AppConfig } from '../config/api';

const api = axios.create({ baseURL: `${AppConfig.SOCKET_URL}/api/chat` });

// Attach token to every request
api.interceptors.request.use(async (config) => {
    const sessionRaw = await EncryptedStorage.getItem('user_session');
    if (sessionRaw) {
        try {
            const session = JSON.parse(sessionRaw);
            if (session.token) {
                config.headers.Authorization = `Bearer ${session.token}`;
            }
        } catch {
            // ignore parse error
        }
    }
    return config;
});

// Get all chat rooms
export const getRooms = async () => {
    const { data } = await api.get('/rooms');
    return data;
};

// Create a room (direct or group)
export const createRoom = async (payload: {
    participantId?: string;
    participantIds?: string[];
    name?: string;
    type?: 'direct' | 'group';
}) => {
    const { data } = await api.post('/rooms', payload);
    return data;
};

// Get room details
export const getRoomDetails = async (roomId: string) => {
    const { data } = await api.get(`/rooms/${roomId}`);
    return data;
};

// Get messages (REST fallback — paginated)
export const getMessages = async (roomId: string, page = 1) => {
    const { data } = await api.get(`/rooms/${roomId}/messages?page=${page}`);
    return data;
};

// Get contacts for referrals (pre-calculated rooms)
export const getReferralContacts = async () => {
    const { data } = await api.get('/referral-contacts');
    return data;
};

// Search users to start a chat
export const searchChatUsers = async (search: string) => {
    const { data } = await api.get(`/users?search=${search}`);
    return data;
};
