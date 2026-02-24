import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    SafeAreaView,
    Image,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { getReferralContacts } from '../services/chatService';
import { useAuth } from '../context/AuthContext';
import ScreenHeader from '../components/ScreenHeader';

const ReferralContactsScreen = ({ navigation }: any) => {
    const { user } = useAuth();
    const currentUserId = user?._id || user?.id;
    const [contacts, setContacts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchContacts = async () => {
        try {
            const data = await getReferralContacts();
            if (data.success) {
                setContacts(data.contacts || []);
            }
        } catch (err) {
            console.error('Error fetching referral contacts:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContacts();
    }, []);

    const renderContact = ({ item }: any) => {
        const contactUser = item.user;
        const room = item.room;
        const initial = (contactUser.username || '?')[0].toUpperCase();

        return (
            <TouchableOpacity
                style={styles.contactItem}
                onPress={() =>
                    navigation.navigate('ChatScreen', {
                        roomId: room._id,
                        currentUserId,
                        roomName: contactUser.username || 'Chat',
                    })
                }
            >
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{initial}</Text>
                    {contactUser.status === 'online' && <View style={styles.onlineDot} />}
                </View>
                <View style={styles.contactInfo}>
                    <Text style={styles.contactName}>{contactUser.username}</Text>
                    <Text style={styles.contactRole}>Referral</Text>
                </View>
                <Ionicons name="chatbubble-outline" size={24} color="#6C63FF" />
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
            <ScreenHeader
                title="My Referrals"
                showBackButton={true}
            />

            <FlatList
                data={contacts}
                keyExtractor={(item) => item.user._id}
                renderItem={renderContact}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="people-outline" size={64} color="#CCC" />
                        <Text style={styles.emptyText}>No referrals yet</Text>
                        <Text style={styles.emptySubText}>Invite people to grow your network!</Text>
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
    listContent: {
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    contactItem: {
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
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#FF6584', // Matches the referral icon color on Home
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    avatarText: { color: '#FFF', fontSize: 20, fontWeight: '700' },
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
    contactInfo: { flex: 1 },
    contactName: { fontSize: 16, fontWeight: '600', color: '#1A1A1A' },
    contactRole: { fontSize: 13, color: '#999', marginTop: 2 },
    emptyContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 100,
    },
    emptyText: { fontSize: 18, fontWeight: '600', color: '#999', marginTop: 12 },
    emptySubText: { fontSize: 14, color: '#BBB', marginTop: 4 },
});

export default ReferralContactsScreen;
