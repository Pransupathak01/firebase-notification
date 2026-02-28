import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, SafeAreaView, RefreshControl } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ScreenHeader from '../components/ScreenHeader';
import { getUserProfile, getEarningsHistory } from '../services/authService';

const EarningsScreen = () => {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [earningsData, setEarningsData] = useState<any>(null);
    const [transactions, setTransactions] = useState<any[]>([]);

    const fetchEarnings = async () => {
        try {
            const [profileData, historyData] = await Promise.all([
                getUserProfile(),
                getEarningsHistory()
            ]);

            setEarningsData(profileData.objEarnings || {});
            setTransactions(historyData.data || []);
        } catch (error) {
            console.error('Failed to fetch earnings:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchEarnings();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchEarnings();
    };

    const renderEarningsItem = ({ item }: any) => (
        <View style={styles.transactionItem}>
            <View style={styles.iconContainer}>
                <Ionicons name="trending-up-outline" size={24} color="#32C766" />
            </View>
            <View style={styles.transactionInfo}>
                <Text style={styles.transactionDate}>
                    {item.date ? new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                </Text>
                <Text style={styles.transactionDesc}>{item.description}</Text>
            </View>
            <View style={styles.amountContainer}>
                <Text style={styles.amountText}>+₹{item.amount ? Number(item.amount).toFixed(2) : '0.00'}</Text>
                <Text style={[styles.statusText, { color: item.status === 'Completed' ? '#32C766' : '#FF9500' }]}>
                    {item.status}
                </Text>
            </View>
        </View>
    );

    // Delete dummy transactions

    if (loading && !refreshing) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6C63FF" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScreenHeader title="My Earnings" showBackButton={true} />

            <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>Total Balance</Text>
                <Text style={styles.summaryValue}>₹{earningsData?.total ? Number(earningsData.total).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}</Text>
                <View style={styles.statsRow}>
                    <View style={styles.statBox}>
                        <Text style={styles.statLabel}>Pending</Text>
                        <Text style={styles.statValueCompact}>₹{earningsData?.pendingPayouts ? Number(earningsData.pendingPayouts).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statBox}>
                        <Text style={styles.statLabel}>Withdrawn</Text>
                        <Text style={styles.statValueCompact}>₹{(earningsData?.total - (earningsData?.pendingPayouts || 0)) ? Number(earningsData.total - (earningsData?.pendingPayouts || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent Transactions</Text>
            </View>

            <FlatList
                data={transactions}
                renderItem={renderEarningsItem}
                keyExtractor={(item) => item.id || item._id}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#6C63FF"]} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="wallet-outline" size={64} color="#CCC" />
                        <Text style={styles.emptyText}>No transactions yet</Text>
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
    summaryCard: {
        backgroundColor: '#6C63FF',
        margin: 16,
        padding: 24,
        borderRadius: 24,
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#6C63FF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    summaryLabel: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 16,
        fontWeight: '500',
    },
    summaryValue: {
        color: '#FFFFFF',
        fontSize: 36,
        fontWeight: 'bold',
        marginVertical: 12,
    },
    statsRow: {
        flexDirection: 'row',
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.2)',
        width: '100%',
    },
    statBox: {
        flex: 1,
        alignItems: 'center',
    },
    statLabel: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 12,
    },
    statValueCompact: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
        marginTop: 4,
    },
    statDivider: {
        width: 1,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    sectionHeader: {
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1A1A1A',
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    transactionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: 'rgba(50, 199, 102, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    transactionInfo: {
        flex: 1,
    },
    transactionDate: {
        fontSize: 12,
        color: '#888',
        marginBottom: 2,
    },
    transactionDesc: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    amountContainer: {
        alignItems: 'flex-end',
    },
    amountText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#32C766',
    },
    statusText: {
        fontSize: 11,
        fontWeight: '500',
        marginTop: 2,
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 60,
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
        marginTop: 12,
    },
});

export default EarningsScreen;
