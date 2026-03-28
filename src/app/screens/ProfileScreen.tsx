import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, Switch, Alert, TouchableOpacity, ActivityIndicator, RefreshControl, Modal, Share, Pressable } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

// Import Reusable Components
import MenuOption from '../components/MenuOption';
import SectionHeader from '../components/SectionHeader';
import ScreenHeader from '../components/ScreenHeader';
import { useAuth } from '../context/AuthContext';
import { getUserProfile } from '../services/authService';
import { useAnalytics, useTrackScreen } from '../hooks/useAnalytics';

const ProfileScreen = () => {
    const navigation = useNavigation<any>();
    const { user: authUser, logout } = useAuth();
    const { logout: logLogout } = useAnalytics();
    const [profileData, setProfileData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isOnline, setIsOnline] = useState(true);
    const [showReferralModal, setShowReferralModal] = useState(false);

    // Track Screen
    useTrackScreen('Profile', 'ProfileScreen');

    const fetchProfile = async () => {
        try {
            const data = await getUserProfile();
            if (data && (data._id || data.username)) {
                setProfileData(data);
                setIsOnline(data.status === 'online');
            } else if (data.success && data.data) {
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
                        // Track Engagement
                        logLogout();
                        await logout();
                    },
                    style: "destructive"
                }
            ]
        );
    };

    const shareReferral = async (code: string) => {
        try {
            const result = await Share.share({
                message: `Hey! Join me on this amazing app using my referral code: ${code}. Download here: https://example.com/download`,
            });
        } catch (error: any) {
            Alert.alert(error.message);
        }
    };

    if (loading && !refreshing) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6C63FF" />
            </View>
        );
    }

    const userData = profileData || authUser;

    const stats = {
        rating: userData?.rating || '4.8',
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
                    <Text style={styles.profileName}>{userData?.storeName || userData?.name || userData?.username || 'Shop Owner'}</Text>
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
                        subtitle={`${userData?.currency || '₹'} ${business.total_earnings ? Number(business.total_earnings).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'} Total Earned`}
                        color="#32C766"
                        onPress={() => navigation.navigate('Earnings')}
                    />
                    <MenuOption
                        icon="card"
                        title="Bank A/C Details"
                        subtitle={business.bank_name || "For Payouts"}
                        color="#6C63FF"
                        onPress={() => navigation.navigate('BankDetails')}
                    />
                    <MenuOption
                        icon="stats-chart"
                        title="Sales Reports"
                        color="#FF9500"
                        onPress={() => navigation.navigate('SalesReport')}
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
                        onPress={() => setShowReferralModal(true)}
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

            <Modal
                animationType="fade"
                transparent={true}
                visible={showReferralModal}
                onRequestClose={() => setShowReferralModal(false)}
            >
                <Pressable
                    style={styles.modalOverlay}
                    onPress={() => setShowReferralModal(false)}
                >
                    <Pressable style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Your Referral Code</Text>
                            <TouchableOpacity onPress={() => setShowReferralModal(false)}>
                                <Ionicons name="close" size={24} color="#666" />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.codeContainer}>
                            <Text style={styles.codeText}>{userData?.referralCode || "GET_CODE"}</Text>
                        </View>
                        <Text style={styles.modalSubtitle}>
                            Share this code with your friends and earn rewards when they join!
                        </Text>
                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={styles.viewContactsBtn}
                                onPress={() => {
                                    setShowReferralModal(false);
                                    navigation.navigate('ReferralContacts');
                                }}
                            >
                                <Ionicons name="people" size={20} color="#007AFF" />
                                <Text style={styles.viewContactsText}>My Network</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.shareBtn}
                                onPress={() => shareReferral(userData?.referralCode || "GET_CODE")}
                            >
                                <Ionicons name="share-social" size={20} color="#FFF" />
                                <Text style={styles.shareBtnText}>Share Code</Text>
                            </TouchableOpacity>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F7FA' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F7FA' },
    scrollContent: { paddingBottom: 40 },
    profileHeader: { backgroundColor: '#FFFFFF', alignItems: 'center', paddingVertical: 30, marginBottom: 16 },
    profileImageContainer: { position: 'relative', marginBottom: 16 },
    profileImage: { width: 100, height: 100, borderRadius: 50, borderWidth: 4, borderColor: '#F5F7FA' },
    editBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#007AFF', width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#FFFFFF' },
    profileName: { fontSize: 22, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 4 },
    profilePhone: { fontSize: 14, color: '#666', marginBottom: 16 },
    statusContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E6F2FF', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
    statusText: { color: '#007AFF', fontWeight: '600', marginRight: 10, fontSize: 12 },
    statsRow: { flexDirection: 'row', backgroundColor: '#FFFFFF', paddingVertical: 16, marginBottom: 16, justifyContent: 'space-evenly', alignItems: 'center', marginHorizontal: 16, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
    statItem: { alignItems: 'center' },
    statValue: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A' },
    statLabel: { fontSize: 12, color: '#888', marginTop: 4 },
    statDivider: { width: 1, height: 30, backgroundColor: '#EEE' },
    menuContainer: { backgroundColor: '#FFFFFF', marginHorizontal: 16, borderRadius: 16, marginBottom: 24, overflow: 'hidden' },
    appVersion: { textAlign: 'center', color: '#CCC', fontSize: 12, marginBottom: 30 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 },
    modalContent: { backgroundColor: '#FFFFFF', borderRadius: 24, width: '100%', padding: 24, alignItems: 'center' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: 20 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#1A1A1A' },
    codeContainer: { backgroundColor: '#F5F7FA', paddingVertical: 20, paddingHorizontal: 40, borderRadius: 16, borderWidth: 2, borderStyle: 'dashed', borderColor: '#007AFF', marginBottom: 16 },
    codeText: { fontSize: 28, fontWeight: 'bold', color: '#007AFF', letterSpacing: 2 },
    modalSubtitle: { fontSize: 14, color: '#666', textAlign: 'center', lineHeight: 20, marginBottom: 30 },
    modalFooter: { flexDirection: 'row', width: '100%', justifyContent: 'space-between' },
    viewContactsBtn: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 14, marginRight: 10, borderRadius: 12, borderWidth: 1, borderColor: '#007AFF' },
    viewContactsText: { color: '#007AFF', fontSize: 15, fontWeight: 'bold', marginLeft: 8 },
    shareBtn: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 14, backgroundColor: '#007AFF', borderRadius: 12 },
    shareBtnText: { color: '#FFF', fontSize: 15, fontWeight: 'bold', marginLeft: 8 },
});

export default ProfileScreen;
