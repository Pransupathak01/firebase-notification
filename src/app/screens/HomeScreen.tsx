import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import SendNotificationForm from '../components/SendNotificationForm';
import { useNotifications } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { getDashboardData } from '../services/dashboardService';
import { RefreshControl } from 'react-native';

// Import Reusable Components
import DashboardCard from '../components/DashboardCard';
import QuickAction from '../components/QuickAction';
import AddCustomerModal from '../components/AddCustomerModal';
import { Share, Alert } from 'react-native';

const HomeScreen = () => {
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [isAddCustomerVisible, setIsAddCustomerVisible] = useState(false);
    const navigation = useNavigation<any>();
    const { notifications } = useNotifications();
    const { user } = useAuth();
    const [dashboardData, setDashboardData] = useState<any>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchDashboardData = async () => {
        try {
            const data = await getDashboardData();
            console.log("Dashboard API Response:", JSON.stringify(data, null, 2));
            if (data && data.success) {
                setDashboardData(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    React.useEffect(() => {
        fetchDashboardData();
    }, []);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        fetchDashboardData();
    }, []);

    const stats = dashboardData?.quick_stats || {};
    const userProfile = dashboardData?.user_profile || {};
    const earnings = dashboardData?.earnings || {};
    const banner = dashboardData?.banner || {};

    console.log("Parsed Earnings:", JSON.stringify(earnings, null, 2));

    const onShareCatalog = async () => {
        try {
            const result = await Share.share({
                message: `Check out my store on SyncTalk! https://synctalk.in/shop/${user?.username || 'user'}`,
            });
            if (result.action === Share.sharedAction) {
                if (result.activityType) {
                    // shared with activity type of result.activityType
                } else {
                    // shared
                }
            } else if (result.action === Share.dismissedAction) {
                // dismissed
            }
        } catch (error: any) {
            Alert.alert(error.message);
        }
    };

    const onShareCode = async () => {
        try {
            await Share.share({
                message: `Use my referral code ${userProfile.referral_code || 'CODE123'} to get amazing discounts!`,
            });
        } catch (error: any) {
            Alert.alert(error.message);
        }
    };

    const handleAddCustomer = (name: string, phone: string) => {
        // Logic to add customer (e.g. API call)
        console.log(`Adding customer: ${name}, ${phone}`);
        Alert.alert("Success", "Customer added successfully!");
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Namaste,</Text>
                    <Text style={styles.username}>{userProfile.greeting_name || user?.name || user?.username || 'Shop Owner'}</Text>
                    <Text style={styles.userRole}>{userProfile.role || user?.role || 'Virtual Dukandar'}</Text>
                </View>
                <TouchableOpacity style={styles.profileButton} onPress={() => navigation.navigate('Profile')}>
                    <Ionicons name="person" size={24} color="#007AFF" />
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >

                {/* Earnings Overview */}
                <View style={styles.earningsCard}>
                    <View>
                        <Text style={styles.earningsLabel}>Total Earnings</Text>
                        <Text style={styles.earningsValue}>
                            {earnings.currency || '₹'} {earnings.total_earnings?.toLocaleString() || '0'}
                        </Text>
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
                        value={stats.active_orders?.count?.toString() || "0"}
                        icon="cube"
                        color="#6C63FF"
                        onPress={() => navigation.navigate('Orders')}
                        subtext={stats.active_orders?.trend_text}
                    />
                    <DashboardCard
                        title="Total Referrals"
                        value={stats.referrals?.total_count?.toString() || "0"}
                        icon="people"
                        color="#FF6584"
                        onPress={() => navigation.navigate('ReferralContacts')}
                        badge={stats.referrals?.is_new ? "New" : undefined}
                        subtext={stats.referrals?.pending_count ? `${stats.referrals.pending_count} pending` : undefined}
                    />
                    <DashboardCard
                        title="Pending Payout"
                        value={`${earnings.currency || '₹'} ${stats.payouts?.pending_amount?.toLocaleString() || '0'}`}
                        icon="cash"
                        color="#32C766"
                        onPress={() => console.log('Payouts')}
                    />
                    <DashboardCard
                        title="Messages"
                        value={stats.messages?.unread_count?.toString() || "0"}
                        icon="chatbubble-ellipses"
                        color="#FFA500"
                        onPress={() => navigation.navigate('Notifications')}
                        badge={stats.messages?.unread_count > 0 ? stats.messages.unread_count.toString() : undefined}
                        subtext={stats.messages?.subtext}
                    />
                </View>

                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <View style={styles.actionsGrid}>
                    <QuickAction
                        title="Share Catalog"
                        icon="share-social"
                        color="#007AFF"
                        onPress={onShareCatalog}
                    />
                    <QuickAction
                        title="Add Customer"
                        icon="person-add"
                        color="#32C766"
                        onPress={() => setIsAddCustomerVisible(true)}
                    />
                    <QuickAction
                        title="My Code"
                        icon="qr-code"
                        color="#6C63FF"
                        onPress={onShareCode}
                    />
                    <QuickAction
                        title="Broadcast"
                        icon="megaphone"
                        color="#FF9500"
                        onPress={() => setIsFormVisible(true)}
                    />
                </View>

                {banner.title && (
                    <View style={styles.banner}>
                        <View style={styles.bannerContent}>
                            <Text style={styles.bannerTitle}>{banner.title}</Text>
                            <Text style={styles.bannerText}>{banner.message}</Text>
                        </View>
                        <Ionicons name={banner.icon || "trophy"} size={40} color="#FFD700" />
                    </View>
                )}

            </ScrollView>

            <SendNotificationForm
                visible={isFormVisible}
                onClose={() => setIsFormVisible(false)}
            />

            <AddCustomerModal
                visible={isAddCustomerVisible}
                onClose={() => setIsAddCustomerVisible(false)}
                onAdd={handleAddCustomer}
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
