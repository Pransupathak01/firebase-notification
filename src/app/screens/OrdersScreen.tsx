import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ScreenHeader from '../components/ScreenHeader';
import { useOrders } from '../hooks/useOrders';

const FILTER_OPTIONS = ['Today', 'This Week', 'Last Week', 'This Month', 'Last Month'];

const OrdersScreen = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('This Week');

    // React Query Hook
    const { data: response, isLoading, isFetching, refetch } = useOrders(selectedFilter);

    // Filter and Process Data
    const { allOrders, summary } = useMemo(() => {
        if (response && response.success && response.data) {
            const orders = response.data.orders || [];
            let summaryData = response.data.summary;

            if (!summaryData) {
                const total = orders.reduce((sum: number, item: any) => sum + (item.earnings || 0), 0);
                summaryData = {
                    total_orders: orders.length,
                    total_earnings: total
                };
            }
            return { allOrders: orders, summary: summaryData };
        }
        return { allOrders: [], summary: { total_orders: 0, total_earnings: 0 } };
    }, [response]);

    const filteredOrders = useMemo(() => {
        if (!searchQuery) return allOrders;
        const query = searchQuery.toUpperCase();
        return allOrders.filter((item: any) => {
            const itemData = (item.id + (item.customerName || '')).toUpperCase();
            return itemData.indexOf(query) > -1;
        });
    }, [searchQuery, allOrders]);

    const onRefresh = () => {
        refetch();
    };

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'delivered': return '#32C766';
            case 'processing': return '#FFA500';
            case 'shipped': return '#007AFF';
            case 'cancelled': return '#FF3B30';
            default: return '#888';
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-GB', {
                day: '2-digit', month: 'short', year: 'numeric'
            });
        } catch (e) {
            return dateString;
        }
    };

    const formatCurrency = (amount: any) => {
        if (amount === undefined || amount === null) return '₹0';
        if (typeof amount === 'string' && amount.includes('₹')) return amount;
        return `₹${Number(amount).toLocaleString()}`;
    };

    const renderOrderItem = ({ item }: { item: any }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.userInfo}>
                    <Image source={{ uri: item.imageUrl }} style={styles.avatar} />
                    <View>
                        <Text style={styles.customerName}>{item.customerName}</Text>
                        <Text style={styles.orderId}>ID: {item.id}</Text>
                    </View>
                </View>
                <View style={styles.statusBadgeWrapper}>
                    <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}20` }]}>
                        <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.cardBody}>
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Items:</Text>
                    <Text style={styles.detailValue} numberOfLines={1}>
                        {Array.isArray(item.items) ? item.items.join(', ') : item.items}
                    </Text>
                </View>
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Date:</Text>
                    <Text style={styles.detailValue}>{formatDate(item.date)}</Text>
                </View>
                <View style={[styles.detailRow, { marginTop: 8 }]}>
                    <Text style={styles.totalLabel}>Total Amount</Text>
                    <Text style={styles.totalValue}>{formatCurrency(item.amount)}</Text>
                </View>
                {item.referralCode && (
                    <View style={styles.detailRow}>
                        <Text style={styles.referralAppliedLabel}>Referral ({item.referralCode}):</Text>
                        <Text style={styles.referralAppliedValue}>- {formatCurrency(item.referralDiscount)}</Text>
                    </View>
                )}
                <View style={[styles.detailRow, styles.earningsRow]}>
                    <Text style={styles.earningsLabel}>My Earnings</Text>
                    <Text style={styles.earningsValue}>{formatCurrency(item.earnings)}</Text>
                </View>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <ScreenHeader title="My Orders" />

            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search by Order ID or Name"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor="#999"
                />
            </View>

            <View style={styles.filterWrapper}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContainer}>
                    {FILTER_OPTIONS.map((filter) => (
                        <TouchableOpacity
                            key={filter}
                            style={[styles.filterChip, selectedFilter === filter && styles.filterChipActive]}
                            onPress={() => setSelectedFilter(filter)}
                        >
                            <Text style={[styles.filterText, selectedFilter === filter && styles.filterTextActive]}>
                                {filter}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <View style={styles.summaryContainer}>
                <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Orders</Text>
                    <Text style={styles.summaryValue}>{summary.total_orders}</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Total Earnings</Text>
                    <Text style={styles.summaryValueTotal}>{formatCurrency(summary.total_earnings)}</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Referral Savings</Text>
                    <Text style={styles.summaryValueReferral}>{formatCurrency(summary.total_referral_discount || 0)}</Text>
                </View>
            </View>

            {isLoading && !isFetching ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#007AFF" />
                </View>
            ) : (
                <FlatList
                    data={filteredOrders}
                    renderItem={renderOrderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={isFetching} onRefresh={onRefresh} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="documents-outline" size={64} color="#CCC" />
                            <Text style={styles.emptyText}>No orders found for {selectedFilter}</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        margin: 16,
        marginBottom: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        height: 50,
        borderWidth: 1,
        borderColor: '#EEE',
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
    filterWrapper: {
        marginBottom: 8,
    },
    filterContainer: {
        paddingHorizontal: 16,
        paddingBottom: 8,
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    filterChipActive: {
        backgroundColor: '#007AFF',
        borderColor: '#007AFF',
    },
    filterText: {
        color: '#666',
        fontSize: 14,
        fontWeight: '500',
    },
    filterTextActive: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    summaryContainer: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        marginHorizontal: 16,
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        justifyContent: 'space-around',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    summaryItem: {
        alignItems: 'center',
    },
    summaryLabel: {
        fontSize: 12,
        color: '#888',
        marginBottom: 4,
        textTransform: 'uppercase',
        fontWeight: '600',
    },
    summaryValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    summaryValueTotal: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#32C766',
    },
    summaryDivider: {
        width: 1,
        height: 40,
        backgroundColor: '#EEE',
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    card: {
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
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
        backgroundColor: '#F0F0F0',
    },
    customerName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1A1A1A',
    },
    orderId: {
        fontSize: 12,
        color: '#888',
        marginTop: 2,
    },
    statusBadgeWrapper: {
        // Wrapper for badge
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    divider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginVertical: 12,
    },
    cardBody: {
        gap: 8,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    detailLabel: {
        fontSize: 14,
        color: '#666',
    },
    detailValue: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
        flex: 1,
        textAlign: 'right',
        maxWidth: '70%',
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1A1A1A',
    },
    totalValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#007AFF',
    },
    earningsRow: {
        marginTop: 8,
        backgroundColor: '#E6F9EC',
        padding: 8,
        borderRadius: 8,
    },
    earningsLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1A1A1A',
    },
    earningsValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#32C766',
    },
    summaryValueReferral: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#6C63FF',
    },
    referralAppliedLabel: {
        fontSize: 12,
        color: '#6C63FF',
        fontWeight: '600',
    },
    referralAppliedValue: {
        fontSize: 12,
        color: '#6C63FF',
        fontWeight: '700',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 100,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
        color: '#999',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
});

export default OrdersScreen;
