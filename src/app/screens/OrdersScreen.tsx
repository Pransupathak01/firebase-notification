import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ordersData from '../data/orders.json';

const FILTER_OPTIONS = ['All', 'This Week', 'This Month', 'Last Month', 'This Year'];

const OrdersScreen = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('This Month');
    const [filteredOrders, setFilteredOrders] = useState(ordersData);

    useEffect(() => {
        applyFilters();
    }, [searchQuery, selectedFilter]);

    const parseDate = (dateString: string) => {
        // Expected format: "15 Feb 2026"
        return new Date(dateString);
    };

    const isDateInFilter = (dateStr: string, filter: string) => {
        const orderDate = parseDate(dateStr);
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        switch (filter) {
            case 'All':
                return true;
            case 'This Week':
                const firstDayOfWeek = new Date(startOfToday);
                firstDayOfWeek.setDate(startOfToday.getDate() - startOfToday.getDay()); // Sunday as start
                return orderDate >= firstDayOfWeek;
            case 'This Month':
                return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
            case 'Last Month':
                const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                return orderDate.getMonth() === lastMonth.getMonth() && orderDate.getFullYear() === lastMonth.getFullYear();
            case 'This Year':
                return orderDate.getFullYear() === now.getFullYear();
            default:
                return true;
        }
    };

    const applyFilters = () => {
        let result = ordersData;

        // Apply Search
        if (searchQuery) {
            const query = searchQuery.toUpperCase();
            result = result.filter(item => {
                const itemData = item.id.toUpperCase() + item.customerName.toUpperCase();
                return itemData.indexOf(query) > -1;
            });
        }

        // Apply Date Filter
        result = result.filter(item => isDateInFilter(item.date, selectedFilter));

        setFilteredOrders(result);
    };

    const calculateTotalEarnings = () => {
        return filteredOrders.reduce((total, item) => {
            // Remove '₹' and ',' then parse
            const earningValue = parseFloat(item.earnings.replace(/[₹,]/g, '')) || 0;
            // Only count earnings for non-cancelled/returned orders if needed, but assuming data is correct
            return total + earningValue;
        }, 0);
    };

    const totalEarnings = calculateTotalEarnings();

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'delivered': return '#32C766';
            case 'processing': return '#FFA500';
            case 'shipped': return '#007AFF';
            case 'cancelled': return '#FF3B30';
            default: return '#888';
        }
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
                <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}20` }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
                </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.cardBody}>
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Items:</Text>
                    <Text style={styles.detailValue} numberOfLines={1}>{item.items.join(', ')}</Text>
                </View>
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Date:</Text>
                    <Text style={styles.detailValue}>{item.date}</Text>
                </View>
                <View style={[styles.detailRow, { marginTop: 8 }]}>
                    <Text style={styles.totalLabel}>Total Amount</Text>
                    <Text style={styles.totalValue}>{item.amount}</Text>
                </View>
                <View style={[styles.detailRow, styles.earningsRow]}>
                    <Text style={styles.earningsLabel}>My Earnings</Text>
                    <Text style={styles.earningsValue}>{item.earnings}</Text>
                </View>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>My Orders</Text>
            </View>

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
                    <Text style={styles.summaryValue}>{filteredOrders.length}</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Total Earnings</Text>
                    <Text style={styles.summaryValueTotal}>₹{totalEarnings.toLocaleString()}</Text>
                </View>
            </View>

            <FlatList
                data={filteredOrders}
                renderItem={renderOrderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="documents-outline" size={64} color="#CCC" />
                        <Text style={styles.emptyText}>No orders found for {selectedFilter}</Text>
                    </View>
                }
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
        height: 60,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1A1A1A',
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
});

export default OrdersScreen;
