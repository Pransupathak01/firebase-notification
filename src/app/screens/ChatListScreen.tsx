import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const ChatListScreen = ({ navigation }: any) => {
    // Dummy data for referrals/people
    const discussions = [
        {
            id: '1',
            name: 'Rahul Sharma',
            message: 'Hey, I interested in your new catalog items.',
            time: '10:30 AM',
            avatar: 'https://ui-avatars.com/api/?name=Rahul+Sharma&background=0D8ABC&color=fff',
            unread: 2,
        },
        {
            id: '2',
            name: 'Priya Patel',
            message: 'Is the bulk discount still available?',
            time: 'Yesterday',
            avatar: 'https://ui-avatars.com/api/?name=Priya+Patel&background=FF6584&color=fff',
            unread: 0,
        },
        {
            id: '3',
            name: 'Amit Kumar',
            message: 'Thanks for the quick delivery!',
            time: 'Yesterday',
            avatar: 'https://ui-avatars.com/api/?name=Amit+Kumar&background=32C766&color=fff',
            unread: 0,
        },
        {
            id: '4',
            name: 'Sneha Gupta',
            message: 'Can you send me the price list?',
            time: 'Tue',
            avatar: 'https://ui-avatars.com/api/?name=Sneha+Gupta&background=FFA500&color=fff',
            unread: 1,
        },
        {
            id: '5',
            name: 'Vikram Singh',
            message: 'Payment sent via UPI.',
            time: 'Mon',
            avatar: 'https://ui-avatars.com/api/?name=Vikram+Singh&background=6C63FF&color=fff',
            unread: 0,
        },
    ];

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity style={styles.chatItem} onPress={() => console.log('Open chat with', item.name)}>
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
            <View style={styles.chatContent}>
                <View style={styles.chatHeader}>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.time}>{item.time}</Text>
                </View>
                <View style={styles.messageContainer}>
                    <Text style={styles.message} numberOfLines={1}>
                        {item.message}
                    </Text>
                    {item.unread > 0 && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{item.unread}</Text>
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Discussions</Text>
                <TouchableOpacity style={styles.headerIcon}>
                    <Ionicons name="create-outline" size={24} color="#007AFF" />
                </TouchableOpacity>
            </View>
            <View style={styles.subHeader}>
                <Text style={styles.subHeaderText}>Referrals & People</Text>
            </View>
            <FlatList
                data={discussions}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
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
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    chatItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 16,
    },
    chatContent: {
        flex: 1,
    },
    chatHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    time: {
        fontSize: 12,
        color: '#999',
    },
    messageContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    message: {
        fontSize: 14,
        color: '#666',
        flex: 1,
        marginRight: 8,
    },
    badge: {
        backgroundColor: '#007AFF',
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 6,
    },
    badgeText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: 'bold',
    },
});

export default ChatListScreen;
