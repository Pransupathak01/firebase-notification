import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import { Alert, Platform } from 'react-native';

export interface Notification {
    id: string;
    title?: string;
    body?: string;
    receivedAt: number;
    data?: { [key: string]: string };
}

interface NotificationContextType {
    notifications: Notification[];
    fcmToken: string | null;
    requestUserPermission: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [fcmToken, setFcmToken] = useState<string | null>(null);

    const requestUserPermission = async () => {
        const authStatus = await messaging().requestPermission();
        const enabled =
            authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
            authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (enabled) {
            console.log('Authorization status:', authStatus);
            getFcmToken();
        }
    };

    const getFcmToken = async () => {
        try {
            const token = await messaging().getToken();
            if (token) {
                console.log('FCM Token:', token);
                setFcmToken(token);
            }
        } catch (error) {
            console.error('Failed to get FCM token:', error);
        }
    };

    const addNotification = (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
        const newNotification: Notification = {
            id: remoteMessage.messageId || Date.now().toString(),
            title: remoteMessage.notification?.title || 'No Title',
            body: remoteMessage.notification?.body || 'No Body',
            receivedAt: Date.now(),
            data: remoteMessage.data as { [key: string]: string } | undefined,
        };

        setNotifications((prev) => [newNotification, ...prev]);
    };

    useEffect(() => {
        requestUserPermission();

        // Handle Foreground Messages
        const unsubscribe = messaging().onMessage(async (remoteMessage) => {
            console.log('A new FCM message arrived!', remoteMessage);
            Alert.alert('New Notification', remoteMessage.notification?.title);
            addNotification(remoteMessage);
        });

        // Handle Notification Caused App to Open from Background State
        messaging().onNotificationOpenedApp((remoteMessage) => {
            console.log('Notification caused app to open from background state:', remoteMessage.notification);
            addNotification(remoteMessage);
        });

        // Handle Notification Caused App to Open from Quit State
        messaging()
            .getInitialNotification()
            .then((remoteMessage) => {
                if (remoteMessage) {
                    console.log('Notification caused app to open from quit state:', remoteMessage.notification);
                    addNotification(remoteMessage);
                }
            });

        return unsubscribe;
    }, []);

    return (
        <NotificationContext.Provider value={{ notifications, fcmToken, requestUserPermission }}>
            {children}
        </NotificationContext.Provider>
    );
};
