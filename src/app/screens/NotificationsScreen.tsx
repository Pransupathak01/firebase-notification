import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Clipboard } from 'react-native';
import { useNotifications, Notification } from '../context/NotificationContext';
import Ionicons from 'react-native-vector-icons/Ionicons';

const NotificationsScreen = () => {
    const { notifications, fcmToken } = useNotifications();

    const copyToken = () => {
        if (fcmToken) {
            Clipboard.setString(fcmToken);
            Alert.alert('FCM Token Copied', 'You can now use this token to send test notifications.');
        } else {
            Alert.alert('No Token', 'FCM Token is not available yet.');
        }
    };

    const renderItem = ({ item }: { item: Notification }) => (
        <View style={styles.notificationCard}>
            <View style={styles.iconContainer}>
                <Ionicons name="notifications" size={24} color="#007AFF" />
            </View>
            <View style={styles.contentContainer}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.body}>{item.body}</Text>
                <Text style={styles.time}>{new Date(item.receivedAt).toLocaleTimeString()}</Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Notifications</Text>
                <TouchableOpacity onPress={copyToken}>
                    <Ionicons name="copy-outline" size={24} color="#007AFF" />
                </TouchableOpacity>
            </View>

            {notifications.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No notifications yet</Text>
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#FFF',
        elevation: 2,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    tokenText: {
        padding: 10,
        fontSize: 12,
        color: 'gray',
        textAlign: 'center',
    },
    listContent: {
        padding: 16,
    },
    notificationCard: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    iconContainer: {
        marginRight: 16,
        justifyContent: 'center',
    },
    contentContainer: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    body: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    time: {
        fontSize: 12,
        color: '#999',
        alignSelf: 'flex-end',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50,
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
    },
});

export default NotificationsScreen;
