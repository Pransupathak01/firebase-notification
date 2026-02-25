import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import { Alert, Platform, PermissionsAndroid } from 'react-native';

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
    newNotificationTick: number; // increments on every new FCM message
    requestUserPermission: () => Promise<void>;
    addManualNotification: (title: string, body: string) => void;
    updateFCMTokenBackend: (token: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};

import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
import { updateFCMToken } from '../services/notificationService';

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [fcmToken, setFcmToken] = useState<string | null>(null);
    const [newNotificationTick, setNewNotificationTick] = useState(0);

    const requestUserPermission = async () => {
        // Android 13+ requires explicit runtime permission for notifications
        if (Platform.OS === 'android' && Platform.Version >= 33) {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
            );
            if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                console.warn('POST_NOTIFICATIONS permission denied — notifications will not appear');
            }
        }

        const authStatus = await messaging().requestPermission();
        const enabled =
            authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
            authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (enabled) {
            console.log('Authorization status:', authStatus);
            getFcmToken();
        }
        // Always ensure channel exists (even on re-launches)
        await createNotificationChannel();
    };

    const createNotificationChannel = async () => {
        // Create a channel
        await notifee.createChannel({
            id: 'sound_channel_final',
            name: 'Sound Channel Final',
            sound: 'custom_sound', // The file name without extension
            importance: AndroidImportance.HIGH,
        });
        console.log('Notification channel created: sound_channel_final');
    };

    const updateFCMTokenBackend = async (token: string) => {
        try {
            console.log('Updating FCM Token on backend...', token);
            await updateFCMToken(token);
            console.log('FCM Token updated successfully on backend');
        } catch (error) {
            console.warn('Silent failure: Failed to update FCM token on backend.', error);
        }
    };

    const getFcmToken = async () => {
        try {
            const token = await messaging().getToken();
            if (token) {
                console.log('FCM Token:', token);
                setFcmToken(token);
                // Automatically update backend if token is found
                await updateFCMTokenBackend(token);
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

    const addManualNotification = (title: string, body: string) => {
        const newNotification: Notification = {
            id: Date.now().toString(),
            title: title || 'No Title',
            body: body || 'No Body',
            receivedAt: Date.now(),
            data: {},
        };
        setNotifications((prev) => [newNotification, ...prev]);
    };

    useEffect(() => {
        requestUserPermission();

        // Handle Foreground Messages
        const unsubscribe = messaging().onMessage(async (remoteMessage) => {
            console.log('A new FCM message arrived!', remoteMessage);

            // Ensure channel exists before displaying
            await notifee.createChannel({
                id: 'sound_channel_final',
                name: 'Sound Channel Final',
                sound: 'custom_sound',
                importance: AndroidImportance.HIGH,
            });

            // Display heads-up notification using Notifee
            const title = remoteMessage.notification?.title ||
                (remoteMessage.data?.title ? String(remoteMessage.data.title) : undefined) ||
                'New Notification';
            const body = remoteMessage.notification?.body ||
                (remoteMessage.data?.body ? String(remoteMessage.data.body) : undefined) ||
                'You have a new update';

            await notifee.displayNotification({
                title,
                body,
                android: {
                    channelId: 'sound_channel_final',
                    smallIcon: 'ic_notification',  // must be white-on-transparent in drawable/
                    color: '#db6809',               // 6-digit hex only
                    sound: 'custom_sound',
                    importance: AndroidImportance.HIGH,
                    showTimestamp: true,
                    pressAction: {
                        id: 'default',
                    },
                },
            });

            addNotification(remoteMessage);
            // Bump the tick so screens can react and re-fetch from backend
            setNewNotificationTick(prev => prev + 1);
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
        <NotificationContext.Provider value={{
            notifications,
            fcmToken,
            newNotificationTick,
            requestUserPermission,
            addManualNotification,
            updateFCMTokenBackend
        }}>
            {children}
        </NotificationContext.Provider>
    );
};
