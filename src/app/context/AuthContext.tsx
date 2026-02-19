import React, { createContext, useState, useEffect, useContext } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { storeUserSession, getUserSession, removeUserSession, logoutUser } from '../services/authService';

interface AuthContextType {
    user: any;
    token: string | null;
    loading: boolean;
    login: (userData: any, token: string) => Promise<void>;
    logout: () => Promise<void>;
    register: (userData: any, token: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    token: null,
    loading: true,
    login: async () => { },
    logout: async () => { },
    register: async () => { },
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<any>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for stored session on mount
        const checkSession = async () => {
            try {
                const session = await getUserSession();
                if (session) {
                    setUser(session.user);
                    setToken(session.token);
                }
            } catch (e) {
                console.error('Failed to load session');
            } finally {
                setLoading(false);
            }
        };

        checkSession();
    }, []);

    const login = async (userData: any, authToken: string) => {
        setUser(userData);
        setToken(authToken);
        await storeUserSession({ user: userData, token: authToken });
    };

    const register = async (userData: any, authToken: string) => {
        setUser(userData);
        setToken(authToken);
        await storeUserSession({ user: userData, token: authToken });
    };

    const logout = async () => {
        try {
            if (user) {
                const userId = user._id || user.id || user.userId || (user.user && (user.user._id || user.user.id || user.user.userId));
                if (userId) {
                    await logoutUser(userId);
                }
            }
        } catch (error) {
            console.error("Logout API failed:", error);
        }

        setUser(null);
        setToken(null);
        await removeUserSession();
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, logout, register }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
