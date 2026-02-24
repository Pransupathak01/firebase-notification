import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, Switch, Alert, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

// Import Reusable Components
import MenuOption from '../components/MenuOption';
import SectionHeader from '../components/SectionHeader';
import ScreenHeader from '../components/ScreenHeader';
import { useAuth } from '../context/AuthContext';
import { getUserProfile } from '../services/authService';

const ProfileScreen = () => {
    const navigation = useNavigation<any>();
    const { user: authUser, logout } = useAuth();
    const [profileData, setProfileData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isOnline, setIsOnline] = useState(true);

    const fetchProfile = async () => {
        try {
            console.log('[ProfileScreen] Fetching profile...');
            const data = await getUserProfile();
            console.log('[ProfileScreen] Profile API Response:', JSON.stringify(data, null, 2));

            // The API returns the user object directly based on logs
            if (data && (data._id || data.username)) {
                setProfileData(data);
                setIsOnline(data.status === 'online');
            } else if (data.success && data.data) {
                // Fallback for success/data wrapper
                setProfileData(data.data);
                setIsOnline(data.data.status === 'online');
            }
        } catch (error) {
            console.error('Failed to fetch profile:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchProfile();
    };

    const handleLogout = () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to logout? All your data will be cleared.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Logout",
                    onPress: async () => {
                        await logout();
                    },
                    style: "destructive"
                }
            ]
        );
    };

    if (loading && !refreshing) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6C63FF" />
            </View>
        );
    }

    const userData = profileData || authUser;

    // Map data based on the API response structure provided
    const stats = {
        rating: userData?.rating || '4.8', // Placeholder if not in API
        total_referrals: userData?.referralCount || '0',
        active_orders: userData?.objEarnings?.activeOrders || '0'
    };

    const business = {
        total_earnings: userData?.objEarnings?.total || 0,
        pending_payouts: userData?.objEarnings?.pendingPayouts || 0,
        bank_name: userData?.bankName || "For Payouts"
    };

    return (
        <View style={styles.container}>
            <ScreenHeader
                title="My Profile"
                showBackButton={true}
            />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#6C63FF"]} tintColor="#6C63FF" />
                }
            >
                {/* Profile Header */}
                <View style={styles.profileHeader}>
                    <View style={styles.profileImageContainer}>
                        <Image
                            source={{ uri: userData?.avatar || 'https://ui-avatars.com/api/?name=' + (userData?.username || 'User') + '&background=6C63FF&color=fff' }}
                            style={styles.profileImage}
                        />
                        <View style={styles.editBadge}>
                            <Ionicons name="camera" size={14} color="#FFF" />
                        </View>
                    </View>
                    <Text style={styles.profileName}>{userData?.name || userData?.username || 'Shop Owner'}</Text>
                    <Text style={styles.profilePhone}>{userData?.phone || userData?.email || 'No contact info'}</Text>
                    <View style={styles.statusContainer}>
                        <Text style={styles.statusText}>{isOnline ? 'Online for Business' : 'Offline'}</Text>
                        <Switch
                            value={isOnline}
                            onValueChange={setIsOnline}
                            trackColor={{ false: "#767577", true: "#32C766" }}
                            thumbColor={isOnline ? "#FFF" : "#f4f3f4"}
                        />
                    </View>
                </View>

                {/* Dashboard Stats */}
                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{stats.active_orders || '0'}</Text>
                        <Text style={styles.statLabel}>Orders</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{stats.total_referrals || '0'}</Text>
                        <Text style={styles.statLabel}>Referrals</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>
                            {userData?.createdAt ? new Date().getFullYear() - new Date(userData.createdAt).getFullYear() : 0} yrs
                        </Text>
                        <Text style={styles.statLabel}>Since</Text>
                    </View>
                </View>

                {/* Earnings & Business */}
                <SectionHeader title="Business & Earnings" />
                <View style={styles.menuContainer}>
                    <MenuOption
                        icon="wallet"
                        title="My Earnings"
                        subtitle={`${userData?.currency || '₹'} ${business.total_earnings?.toLocaleString() || '0'} Total Earned`}
                        color="#32C766"
                        onPress={() => console.log('Earnings')}
                    />
                    <MenuOption
                        icon="card"
                        title="Bank A/C Details"
                        subtitle={business.bank_name || "For Payouts"}
                        color="#6C63FF"
                        onPress={() => console.log('Bank Details')}
                    />
                    <MenuOption
                        icon="stats-chart"
                        title="Sales Reports"
                        color="#FF9500"
                        onPress={() => console.log('Reports')}
                    />
                </View>

                {/* Referral Tools */}
                <SectionHeader title="Growth Tools" />
                <View style={styles.menuContainer}>
                    <MenuOption
                        icon="qr-code"
                        title="My Referral Code"
                        subtitle={userData?.referralCode || "GET_CODE"}
                        color="#007AFF"
                        onPress={() => console.log('Referral Code')}
                    />
                    <MenuOption
                        icon="images"
                        title="Marketing Assets"
                        subtitle="Banners, Posters, etc."
                        color="#FF6584"
                        onPress={() => console.log('Marketing')}
                    />
                </View>

                {/* Settings & Support */}
                <SectionHeader title="Settings" />
                <View style={styles.menuContainer}>
                    <MenuOption
                        icon="help-circle"
                        title="Help & Support"
                        color="#666"
                        onPress={() => console.log('Help')}
                    />
                    <MenuOption
                        icon="language"
                        title="Change Language"
                        subtitle="English"
                        color="#666"
                        onPress={() => console.log('Language')}
                    />
                    <MenuOption
                        icon="log-out"
                        title="Logout"
                        color="#FF3B30"
                        showChevron={false}
                        onPress={handleLogout}
                    />
                </View>

                <Text style={styles.appVersion}>Version 1.0.5 • Build 2024</Text>

            </ScrollView>
        </View>
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
        backgroundColor: '#F5F7FA',
    },
    scrollContent: {
        paddingBottom: 40,
    },
    profileHeader: {
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        paddingVertical: 30,
        marginBottom: 16,
    },
    profileImageContainer: {
        position: 'relative',
        marginBottom: 16,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 4,
        borderColor: '#F5F7FA',
    },
    editBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#007AFF',
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#FFFFFF',
    },
    profileName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginBottom: 4,
    },
    profilePhone: {
        fontSize: 14,
        color: '#666',
        marginBottom: 16,
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E6F2FF',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    statusText: {
        color: '#007AFF',
        fontWeight: '600',
        marginRight: 10,
        fontSize: 12,
    },
    statsRow: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        paddingVertical: 16,
        marginBottom: 16,
        justifyContent: 'space-evenly',
        alignItems: 'center',
        marginHorizontal: 16,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1A1A1A',
    },
    statLabel: {
        fontSize: 12,
        color: '#888',
        marginTop: 4,
    },
    statDivider: {
        width: 1,
        height: 30,
        backgroundColor: '#EEE',
    },
    menuContainer: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 16,
        borderRadius: 16,
        marginBottom: 24,
        overflow: 'hidden',
    },
    appVersion: {
        textAlign: 'center',
        color: '#CCC',
        fontSize: 12,
        marginBottom: 30,
    }
});

export default ProfileScreen;
