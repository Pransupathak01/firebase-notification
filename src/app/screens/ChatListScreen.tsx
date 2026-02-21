import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    SafeAreaView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { getReferralContacts } from '../services/chatService';
import { getSocket, connectSocket } from '../services/socketService';
import { useAuth } from '../context/AuthContext';

const ChatRoomsScreen = ({ navigation }: any) => {
    const { user } = useAuth();
    const currentUserId = user?._id || user?.id;
    const [rooms, setRooms] = useState<any[]>([]); // We'll store 'contacts' here
    const [loading, setLoading] = useState(true);

    const fetchRooms = async () => {
        try {
            console.log("Fetching referral contacts...");
            const data = await getReferralContacts();
            console.log("Referral Contacts API Response:", JSON.stringify(data, null, 2));
            if (data.success) {
                setRooms(data.contacts || []);
                console.log("Rooms state updated with:", (data.contacts || []).length, "contacts");
            } else {
                console.warn("API returned success: false", data);
            }
        } catch (err) {
            console.error('Error fetching chat contacts:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRooms();

        // Listen for new rooms in real-time
        const initSocket = async () => {
            let socket = getSocket();
            if (!socket?.connected) socket = await connectSocket();
            socket.on('room_created', () => fetchRooms());
        };

        initSocket().catch(console.error);

        // Refresh when screen comes back into focus
        const unsubscribe = navigation.addListener('focus', fetchRooms);
        return () => unsubscribe();
    }, []);

    const renderRoom = ({ item }: any) => {
        const otherUser = item.user;
        const room = item.room;
        const initial = (otherUser.username || '?')[0].toUpperCase();

        return (
            <TouchableOpacity
                style={styles.roomItem}
                onPress={() =>
                    navigation.navigate('ChatScreen', {
                        roomId: room._id,
                        currentUserId,
                        roomName: otherUser.username || 'Chat',
                    })
                }
            >
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{initial}</Text>
                    {otherUser.status === 'online' && <View style={styles.onlineDot} />}
                </View>
                <View style={styles.roomInfo}>
                    <View style={styles.roomHeader}>
                        <Text style={styles.roomName}>{otherUser.username || 'Group Chat'}</Text>
                        {room.lastMessage?.createdAt && (
                            <Text style={styles.roomTime}>
                                {new Date(room.lastMessage.createdAt).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </Text>
                        )}
                    </View>
                    <View style={styles.roomBottom}>
                        <Text style={styles.lastMessage} numberOfLines={1}>
                            {room.lastMessage?.text || 'No messages yet'}
                        </Text>
                        {item.unreadCount > 0 && (
                            <View style={styles.unreadBadge}>
                                <Text style={styles.unreadText}>{item.unreadCount}</Text>
                            </View>
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6C63FF" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Discussions</Text>
                <TouchableOpacity style={styles.headerIcon}>
                    <Ionicons name="create-outline" size={24} color="#6C63FF" />
                </TouchableOpacity>
            </View>
            <View style={styles.subHeader}>
                <Text style={styles.subHeaderText}>Referrals & People</Text>
            </View>

            <FlatList
                data={rooms}
                keyExtractor={(item) => item._id}
                renderItem={renderRoom}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="chatbubbles-outline" size={64} color="#CCC" />
                        <Text style={styles.emptyText}>No chats yet</Text>
                        <Text style={styles.emptySubText}>Start a conversation!</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Header
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1A1A1A',
    },
    headerIcon: {
        padding: 5,
    },
    subHeader: {
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    subHeaderText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },

    // List
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 20,
    },

    // Room item
    roomItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#6C63FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
    onlineDot: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#4CAF50',
        borderWidth: 2,
        borderColor: '#FFF',
    },
    roomInfo: { flex: 1 },
    roomHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    roomName: { fontSize: 16, fontWeight: '600', color: '#1A1A1A' },
    roomTime: { fontSize: 12, color: '#999' },
    roomBottom: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    lastMessage: { fontSize: 13, color: '#999', flex: 1, marginRight: 8 },
    unreadBadge: {
        backgroundColor: '#6C63FF',
        borderRadius: 12,
        minWidth: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 6,
    },
    unreadText: { color: '#FFF', fontSize: 12, fontWeight: '700' },

    // Empty state
    emptyContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 100,
    },
    emptyText: { fontSize: 18, fontWeight: '600', color: '#999', marginTop: 12 },
    emptySubText: { fontSize: 14, color: '#BBB', marginTop: 4 },
});

export default ChatRoomsScreen;
