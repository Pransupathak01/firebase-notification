import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import SendNotificationForm from '../components/SendNotificationForm';
import { useNotifications } from '../context/NotificationContext';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48 - 16) / 2; // 48 padding, 16 gap

const HomeScreen = () => {
    const [isFormVisible, setIsFormVisible] = useState(false);
    const navigation = useNavigation<any>();
    const { notifications } = useNotifications();

    const DashboardCard = ({ title, icon, color, onPress, badge }: any) => (
        <TouchableOpacity style={styles.card} onPress={onPress}>
            <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
                <Ionicons name={icon} size={28} color={color} />
            </View>
            <Text style={styles.cardTitle}>{title}</Text>
            {badge && (
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{badge}</Text>
                </View>
            )}
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Welcome Back,</Text>
                    <Text style={styles.username}>User</Text>
                </View>
                <TouchableOpacity style={styles.profileButton}>
                    <Ionicons name="person" size={20} color="#FFF" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.sectionTitle}>Dashboard</Text>

                <View style={styles.grid}>
                    <DashboardCard
                        title="Analytics"
                        icon="bar-chart"
                        color="#6C63FF"
                        onPress={() => console.log('Analytics')}
                    />
                    <DashboardCard
                        title="Users"
                        icon="people"
                        color="#FF6584"
                        onPress={() => console.log('Users')}
                        badge="12 New"
                    />
                    <DashboardCard
                        title="Orders"
                        icon="cart"
                        color="#32C766"
                        onPress={() => console.log('Orders')}
                    />
                    <DashboardCard
                        title="Messages"
                        icon="chatbubble-ellipses"
                        color="#FFA500"
                        onPress={() => navigation.navigate('Notifications')}
                        badge={notifications.length > 0 ? notifications.length.toString() : undefined}
                    />
                </View>

                <Text style={styles.sectionTitle}>Tools</Text>
                <View style={styles.grid}>
                    <DashboardCard
                        title="Send Notification"
                        icon="paper-plane"
                        color="#007AFF"
                        onPress={() => setIsFormVisible(true)}
                    />
                    <DashboardCard
                        title="Settings"
                        icon="settings"
                        color="#808080"
                        onPress={() => console.log('Settings')}
                    />
                </View>

                <View style={styles.banner}>
                    <View style={styles.bannerContent}>
                        <Text style={styles.bannerTitle}>Pro Features</Text>
                        <Text style={styles.bannerText}>Upgrade to unlock premium tools.</Text>
                    </View>
                    <Ionicons name="star" size={40} color="#FFD700" />
                </View>

            </ScrollView>

            <SendNotificationForm
                visible={isFormVisible}
                onClose={() => setIsFormVisible(false)}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FB',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 24,
        paddingTop: 60, // approximate for status bar
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    greeting: {
        fontSize: 14,
        color: '#666',
    },
    username: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1A1A1A',
    },
    profileButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        padding: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 16,
        marginTop: 8,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    card: {
        width: CARD_WIDTH,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    badge: {
        position: 'absolute',
        top: 12,
        right: 12,
        backgroundColor: '#FF3B30',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: 'bold',
    },
    banner: {
        flexDirection: 'row',
        backgroundColor: '#1A1A1A',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 8,
        marginBottom: 30,
    },
    bannerContent: {
        flex: 1,
    },
    bannerTitle: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    bannerText: {
        color: '#BBB',
        fontSize: 14,
    },
});

export default HomeScreen;
