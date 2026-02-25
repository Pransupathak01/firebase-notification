import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ScreenHeader from '../components/ScreenHeader';
import NotificationCard, { BackendNotification } from '../components/NotificationCard';
import {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
} from '../services/notificationService';

const NotificationsScreen = () => {
    const [notifications, setNotifications] = useState<BackendNotification[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    // ─── Fetch ────────────────────────────────────────────────────────────────
    const fetchNotifications = useCallback(async (pageNum = 1, refresh = false) => {
        try {
            if (refresh) setRefreshing(true);
            else if (pageNum === 1) setLoading(true);
            else setLoadingMore(true);

            const data = await getNotifications(pageNum, 20);

            // Handle nested `{ data: { notifications: [], totalPages } }` or flat shapes
            const raw =
                data?.data?.notifications ??
                data?.notifications ??
                (Array.isArray(data?.data) ? data.data : null) ??
                (Array.isArray(data) ? data : null) ??
                [];
            const list: BackendNotification[] = Array.isArray(raw) ? raw : [];
            const totalPages = data?.data?.totalPages ?? data?.totalPages ?? 1;

            setNotifications(prev => (pageNum === 1 || refresh ? list : [...prev, ...list]));
            setHasMore(pageNum < totalPages);
            setPage(pageNum);
        } catch (error: any) {
            console.error('[NotificationsScreen]', error);
            Alert.alert('Error', 'Failed to load notifications');
        } finally {
            setLoading(false);
            setRefreshing(false);
            setLoadingMore(false);
        }
    }, []);

    useEffect(() => { fetchNotifications(1); }, []);

    // ─── Actions ──────────────────────────────────────────────────────────────
    const handleMarkAsRead = async (id: string) => {
        try {
            await markAsRead(id);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
        } catch (e) {
            console.error('Mark as read failed:', e);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch {
            Alert.alert('Error', 'Failed to mark all as read');
        }
    };

    const handleDelete = (id: string) => {
        Alert.alert('Delete', 'Remove this notification?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await deleteNotification(id);
                        setNotifications(prev => prev.filter(n => n._id !== id));
                    } catch {
                        Alert.alert('Error', 'Failed to delete notification');
                    }
                },
            },
        ]);
    };

    // ─── Derived ──────────────────────────────────────────────────────────────
    const unreadCount = notifications.filter(n => !n.isRead).length;

    // ─── Loading state ────────────────────────────────────────────────────────
    if (loading) {
        return (
            <View style={styles.container}>
                <ScreenHeader title="Notifications" />
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color="#6C63FF" />
                </View>
            </View>
        );
    }

    // ─── Render ───────────────────────────────────────────────────────────────
    return (
        <View style={styles.container}>
            <ScreenHeader
                title="Notifications"
                rightElement={
                    unreadCount > 0 ? (
                        <TouchableOpacity onPress={handleMarkAllAsRead} style={styles.markAllBtn}>
                            <Text style={styles.markAllText}>Mark all read</Text>
                        </TouchableOpacity>
                    ) : undefined
                }
            />

            {unreadCount > 0 && (
                <View style={styles.unreadBanner}>
                    <Text style={styles.unreadBannerText}>
                        {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
                    </Text>
                </View>
            )}

            <FlatList
                data={notifications}
                keyExtractor={item => item._id}
                renderItem={({ item }) => (
                    <NotificationCard
                        item={item}
                        onMarkAsRead={handleMarkAsRead}
                        onDelete={handleDelete}
                    />
                )}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => fetchNotifications(1, true)}
                        colors={['#6C63FF']}
                        tintColor="#6C63FF"
                    />
                }
                onEndReached={() => { if (!loadingMore && hasMore) fetchNotifications(page + 1); }}
                onEndReachedThreshold={0.5}
                ListFooterComponent={
                    loadingMore
                        ? <ActivityIndicator style={{ margin: 16 }} color="#6C63FF" />
                        : null
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="notifications-off-outline" size={64} color="#CCC" />
                        <Text style={styles.emptyText}>No notifications yet</Text>
                        <Text style={styles.emptySubText}>We'll notify you when something arrives</Text>
                    </View>
                }
            />
        </View>
    );
};

export default NotificationsScreen;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F7FA' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listContent: { padding: 16, paddingBottom: 40 },

    unreadBanner: {
        backgroundColor: '#EEF2FF',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E7FF',
    },
    unreadBannerText: { color: '#6C63FF', fontSize: 13, fontWeight: '600' },

    markAllBtn: { paddingHorizontal: 4 },
    markAllText: { color: '#6C63FF', fontSize: 13, fontWeight: '600' },

    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 80,
    },
    emptyText: { fontSize: 18, fontWeight: '600', color: '#999', marginTop: 16 },
    emptySubText: { fontSize: 13, color: '#BBB', marginTop: 6 },
});
