import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import SendNotificationForm from '../components/SendNotificationForm';
import { useNotifications } from '../context/NotificationContext';

// Import Reusable Components
import DashboardCard from '../components/DashboardCard';
import QuickAction from '../components/QuickAction';

const HomeScreen = () => {
    const [isFormVisible, setIsFormVisible] = useState(false);
    const navigation = useNavigation<any>();
    const { notifications } = useNotifications();

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Namaste,</Text>
                    <Text style={styles.username}>Rajesh Store</Text>
                    <Text style={styles.userRole}>Virtual Dukandar</Text>
                </View>
                <TouchableOpacity style={styles.profileButton} onPress={() => navigation.navigate('Profile')}>
                    <Ionicons name="person" size={24} color="#007AFF" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Earnings Overview */}
                <View style={styles.earningsCard}>
                    <View>
                        <Text style={styles.earningsLabel}>Total Earnings</Text>
                        <Text style={styles.earningsValue}>₹ 45,250</Text>
                    </View>
                    <View style={styles.walletIcon}>
                        <Ionicons name="wallet" size={32} color="#FFF" />
                    </View>
                    <View style={styles.withdrawBtn}>
                        <Text style={styles.withdrawText}>Withdraw</Text>
                        <Ionicons name="chevron-forward" size={16} color="#FFF" />
                    </View>
                </View>

                <Text style={styles.sectionTitle}>Business Insights</Text>
                <View style={styles.grid}>
                    <DashboardCard
                        title="Active Orders"
                        value="12"
                        icon="cube"
                        color="#6C63FF"
                        onPress={() => navigation.navigate('Orders')}
                        subtext="+2 today"
                    />
                    <DashboardCard
                        title="Total Referrals"
                        value="145"
                        icon="people"
                        color="#FF6584"
                        onPress={() => console.log('Users')}
                        badge="New"
                        subtext="8 pending"
                    />
                    <DashboardCard
                        title="Pending Payout"
                        value="₹ 2,400"
                        icon="cash"
                        color="#32C766"
                        onPress={() => console.log('Payouts')}
                    />
                    <DashboardCard
                        title="Messages"
                        value="5"
                        icon="chatbubble-ellipses"
                        color="#FFA500"
                        onPress={() => navigation.navigate('Notifications')}
                        badge={notifications.length > 0 ? notifications.length.toString() : undefined}
                        subtext="Customer queries"
                    />
                </View>

                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <View style={styles.actionsGrid}>
                    <QuickAction
                        title="Share Catalog"
                        icon="share-social"
                        color="#007AFF"
                        onPress={() => navigation.navigate('Product')}
                    />
                    <QuickAction
                        title="Add Customer"
                        icon="person-add"
                        color="#32C766"
                        onPress={() => console.log('Add Customer')}
                    />
                    <QuickAction
                        title="My Code"
                        icon="qr-code"
                        color="#6C63FF"
                        onPress={() => console.log('My Code')}
                    />
                    <QuickAction
                        title="Broadcast"
                        icon="megaphone"
                        color="#FF9500"
                        onPress={() => setIsFormVisible(true)}
                    />
                </View>

                <View style={styles.banner}>
                    <View style={styles.bannerContent}>
                        <Text style={styles.bannerTitle}>Boost Your Sales!</Text>
                        <Text style={styles.bannerText}>Share 5 more products to unlock Platinum Seller badge.</Text>
                    </View>
                    <Ionicons name="trophy" size={40} color="#FFD700" />
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
        backgroundColor: '#F5F7FA',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 10,
        paddingBottom: 20,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    greeting: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    username: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1A1A1A',
    },
    userRole: {
        fontSize: 12,
        color: '#007AFF',
        fontWeight: '600',
        backgroundColor: '#E6F2FF',
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        marginTop: 4,
    },
    profileButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F0F0F0',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFF',
        overflow: 'hidden',
        elevation: 2,
    },
    scrollContent: {
        padding: 24,
        paddingBottom: 100,
    },
    earningsCard: {
        backgroundColor: '#1A1A1A',
        borderRadius: 20,
        padding: 24,
        marginBottom: 24,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 8,
        position: 'relative',
        overflow: 'hidden',
    },
    earningsLabel: {
        color: '#BBB',
        fontSize: 14,
        marginBottom: 8,
    },
    earningsValue: {
        color: '#FFF',
        fontSize: 32,
        fontWeight: 'bold',
    },
    walletIcon: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        padding: 12,
        borderRadius: 16,
    },
    withdrawBtn: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#32C766',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderTopLeftRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
    },
    withdrawText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 12,
        marginRight: 4,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 16,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    actionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    banner: {
        flexDirection: 'row',
        backgroundColor: '#2D3436',
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 30,
    },
    bannerContent: {
        flex: 1,
        paddingRight: 16,
    },
    bannerTitle: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    bannerText: {
        color: '#AAA',
        fontSize: 14,
        lineHeight: 20,
    },
});

export default HomeScreen;
