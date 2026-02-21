import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { connectSocket, disconnectSocket } from '../services/socketService';

/**
 * SocketManager — a headless component placed inside AuthProvider.
 * Automatically connects the socket when the user is authenticated
 * and disconnects it on logout.
 */
export const SocketManager = () => {
    const { token } = useAuth();

    useEffect(() => {
        if (token) {
            connectSocket()
                .then(() => console.log('🔗 Socket auto-connected on login'))
                .catch((err) => console.error('Socket auto-connect failed:', err));
        } else {
            disconnectSocket();
        }

        return () => {
            disconnectSocket();
        };
    }, [token]);

    return null; // This component renders nothing
};
