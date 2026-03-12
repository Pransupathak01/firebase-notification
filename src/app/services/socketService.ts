import io, { Socket } from 'socket.io-client';
import EncryptedStorage from 'react-native-encrypted-storage';
import { AppConfig } from '../config/api';

let socket: Socket | null = null;

export const connectSocket = async (): Promise<Socket> => {
    // Retrieve token from encrypted storage (stored as part of user_session)
    const sessionRaw = await EncryptedStorage.getItem('user_session');
    let token: string | null = null;
    if (sessionRaw) {
        try {
            const session = JSON.parse(sessionRaw);
            token = session.token || null;
        } catch {
            token = null;
        }
    }

    if (!token) throw new Error('No auth token found');

    // Disconnect existing connection if any
    if (socket?.connected) {
        socket.disconnect();
    }

    socket = io(AppConfig.SOCKET_URL, {
        auth: { token },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 2000,
    });

    socket.on('connect', () => {
        console.log('✅ Socket connected:', socket?.id);
    });

    // Centralized logging for outgoing events
    const originalEmit = socket.emit.bind(socket);
    socket.emit = (event: string, ...args: any[]) => {
        console.log(`📤 [Socket Emit] ${event}:`, JSON.stringify(args[0], null, 2));
        return originalEmit(event, ...args);
    };

    socket.on('connect_error', (err) => {
        console.error('❌ Socket connection error:', err.message);
    });

    socket.on('disconnect', (reason) => {
        console.log('🔌 Socket disconnected:', reason);
    });

    return socket;
};

export const getSocket = (): Socket | null => socket;

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};
