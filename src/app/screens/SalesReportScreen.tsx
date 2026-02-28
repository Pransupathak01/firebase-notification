import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, SafeAreaView, RefreshControl, ScrollView, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ScreenHeader from '../components/ScreenHeader';
import { getDashboardData } from '../services/dashboardService';

const SalesReportScreen = () => {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [salesData, setSalesData] = useState<any>(null);

    const fetchSales = async () => {
        try {
            const response = await getDashboardData();
            if (response.success && response.data?.performance_metrics) {
                setSalesData(response.data.performance_metrics);
            }
        } catch (error) {
            console.error('Failed to fetch sales report:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchSales();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchSales();
    };

    const renderOrderItem = ({ item }: any) => (
        <View style={styles.orderItem}>
            <View style={styles.orderHeader}>
                <Text style={styles.orderId}>Order #{item.id}</Text>
                <Text style={styles.orderDate}>{item.date}</Text>
            </View>
            <View style={styles.orderFooter}>
                <View style={styles.customerBox}>
                    <Text style={styles.customerLabel}>Customer</Text>
                    <Text style={styles.customerName}>{item.customer}</Text>
                </View>
                <View style={styles.amountBox}>
                    <Text style={styles.amountLabel}>Amount</Text>
                    <Text style={styles.amountValue}>₹{item.amount}</Text>
                </View>
            </View>
        </View>
    );

    // Delete dummy orders

    if (loading && !refreshing) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6C63FF" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScreenHeader title="Sales Reports" showBackButton={true} />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#6C63FF"]} />
                }
            >
                {/* Stats Summary */}
                <View style={styles.statsGrid}>
                    <View style={[styles.statItem, { backgroundColor: '#E6F2FF' }]}>
                        <Ionicons name="cart-outline" size={24} color="#007AFF" />
                        <Text style={styles.statValue}>{salesData?.totalOrders || '156'}</Text>
                        <Text style={styles.statLabel}>Total Orders</Text>
                    </View>
                    <View style={[styles.statItem, { backgroundColor: '#E6F9EF' }]}>
                        <Ionicons name="cash-outline" size={24} color="#32C766" />
                        <Text style={styles.statValue}>₹{salesData?.totalSales ? Number(salesData.totalSales).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}</Text>
                        <Text style={styles.statLabel}>Total Sales</Text>
                    </View>
                    <View style={[styles.statItem, { backgroundColor: '#FFF4E6' }]}>
                        <Ionicons name="trending-up-outline" size={24} color="#FF9500" />
                        <Text style={styles.statValue}>₹{salesData?.avgOrderValue ? Number(salesData.avgOrderValue).toFixed(2) : '0.00'}</Text>
                        <Text style={styles.statLabel}>Avg Value</Text>
                    </View>
                    <View style={[styles.statItem, { backgroundColor: '#F2EBFF' }]}>
                        <Ionicons name="people-outline" size={24} color="#6C63FF" />
                        <Text style={styles.statValue}>{salesData?.customers || '89'}</Text>
                        <Text style={styles.statLabel}>Customers</Text>
                    </View>
                </View>

                {/* Filter / Date Row */}
                <View style={styles.filterRow}>
                    <Text style={styles.sectionTitle}>Recent Orders History</Text>
                    <TouchableOpacity style={styles.filterBtn}>
                        <Text style={styles.filterBtnText}>This Month</Text>
                        <Ionicons name="chevron-down" size={16} color="#6C63FF" />
                    </TouchableOpacity>
                </View>

                {/* List of Orders */}
                {(salesData?.recentOrders || []).map((order: any) => (
                    <View key={order.id || order._id} style={styles.orderItem}>
                        <View style={styles.orderHeader}>
                            <View style={styles.orderIdGroup}>
                                <View style={styles.orderIcon}>
                                    <Ionicons name="cube-outline" size={18} color="#666" />
                                </View>
                                <Text style={styles.orderId}>Order #{order.orderId || order.id}</Text>
                            </View>
                            <Text style={styles.orderDate}>
                                {order.date ? new Date(order.date).toLocaleDateString() : 'N/A'}
                            </Text>
                        </View>
                        <View style={styles.orderContent}>
                            <View>
                                <Text style={styles.customerName}>{order.customer}</Text>
                                <Text style={styles.orderTime}>
                                    {order.date ? new Date(order.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                </Text>
                            </View>
                            <View style={styles.amountBox}>
                                <Text style={styles.amountValue}>₹{order.amount ? Number(order.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}</Text>
                                <View style={[styles.statusBadge, { backgroundColor: order.status === 'Delivered' ? 'rgba(50, 199, 102, 0.1)' : 'rgba(255, 149, 0, 0.1)' }]}>
                                    <Text style={[styles.statusText, { color: order.status === 'Delivered' ? '#32C766' : '#FF9500' }]}>
                                        {order.status}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                ))}

                <TouchableOpacity style={styles.viewMoreBtn}>
                    <Text style={styles.viewMoreText}>View Full History</Text>
                    <Ionicons name="arrow-forward" size={18} color="#6C63FF" />
                </TouchableOpacity>
            </ScrollView>
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
    scrollContent: {
        padding: 16,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    statItem: {
        width: '48%',
        padding: 16,
        borderRadius: 20,
        marginBottom: 16,
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginTop: 12,
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },
    filterRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1A1A1A',
    },
    filterBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(108, 99, 255, 0.05)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    filterBtnText: {
        color: '#6C63FF',
        fontSize: 14,
        fontWeight: '600',
        marginRight: 4,
    },
    orderItem: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
        marginBottom: 12,
    },
    orderIdGroup: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    orderIcon: {
        width: 30,
        height: 30,
        borderRadius: 8,
        backgroundColor: '#F0F0F0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    orderId: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1A1A1A',
    },
    orderFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    customerBox: {
        flex: 1,
    },
    customerLabel: {
        fontSize: 11,
        color: '#888',
        textTransform: 'uppercase',
    },
    amountLabel: {
        fontSize: 11,
        color: '#888',
        textTransform: 'uppercase',
        textAlign: 'right',
    },
    orderDate: {
        fontSize: 12,
        color: '#888',
    },
    orderContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    customerName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    orderTime: {
        fontSize: 12,
        color: '#AAA',
        marginTop: 2,
    },
    amountBox: {
        alignItems: 'flex-end',
    },
    amountValue: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1A1A1A',
    },
    statusBadge: {
        backgroundColor: 'rgba(50, 199, 102, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        marginTop: 4,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#32C766',
        textTransform: 'uppercase',
    },
    viewMoreBtn: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        marginTop: 8,
        marginBottom: 20,
    },
    viewMoreText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#6C63FF',
        marginRight: 8,
    },
});

export default SalesReportScreen;
