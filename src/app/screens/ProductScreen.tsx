import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, RefreshControl, Modal } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigations/AppNavigator';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Import Hooks and Components
import ProductCard from '../components/ProductCard';
import { useCart } from '../context/CartContext';
import ScreenHeader from '../components/ScreenHeader';
import { useCategories, useInfiniteProducts, Product } from '../hooks/useProducts';

const COLUMN_COUNT = 2;
const SPACING = 12;
const HALF_SPACING = SPACING / 2;

const SORT_OPTIONS = [
    { label: 'Popular', value: 'popular' },
    { label: 'Price: Low to High', value: 'price_low' },
    { label: 'Price: High to Low', value: 'price_high' },
    { label: 'Biggest Discount', value: 'discount' },
    { label: 'Highest Earning', value: 'commission' },
];

const ProductScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { totalItems } = useCart();

    // Filters State
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSort, setSelectedSort] = useState('popular');
    const [showSortModal, setShowSortModal] = useState(false);

    // React Query Hooks
    const { data: catData } = useCategories();
    const categories = useMemo(() => {
        if (catData && catData.success && catData.data) {
            return ['All', ...catData.data];
        }
        return ['All'];
    }, [catData]);

    const productParams = useMemo(() => ({
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        search: searchQuery || undefined,
        sort: selectedSort,
        limit: 20,
    }), [selectedCategory, searchQuery, selectedSort]);

    const {
        data,
        isLoading,
        isFetchingNextPage,
        hasNextPage,
        fetchNextPage,
        refetch,
        isFetching
    } = useInfiniteProducts(productParams);

    const products = useMemo(() => {
        return data?.pages.flatMap((page) => page.data?.products || []) || [];
    }, [data]);

    const onRefresh = () => {
        refetch();
    };

    const onEndReached = () => {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    };

    const getSortLabel = () => {
        return SORT_OPTIONS.find(s => s.value === selectedSort)?.label || 'Sort';
    };

    const renderFooter = () => {
        if (isFetchingNextPage) {
            return (
                <View style={styles.footerLoader}>
                    <ActivityIndicator size="small" color="#007AFF" />
                    <Text style={styles.footerText}>Loading more...</Text>
                </View>
            );
        }
        if (!hasNextPage && products.length > 0) {
            return (
                <View style={styles.footerLoader}>
                    <Text style={styles.footerText}>No more products</Text>
                </View>
            );
        }
        return null;
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <ScreenHeader
                title="Products"
                rightElement={
                    <TouchableOpacity style={styles.cartButton} onPress={() => navigation.navigate('Cart')}>
                        <Ionicons name="cart" size={26} color="#1A1A1A" />
                        {totalItems > 0 && (
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>{totalItems > 99 ? '99+' : totalItems}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                }
            />

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search products..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor="#999"
                    returnKeyType="search"
                />
                {searchQuery ? (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <Ionicons name="close-circle" size={20} color="#888" />
                    </TouchableOpacity>
                ) : null}
            </View>

            {/* Category Filter Chips */}
            {categories.length > 1 && (
                <View style={styles.filterWrapper}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContainer}>
                        {categories.map((cat) => (
                            <TouchableOpacity
                                key={cat}
                                style={[styles.filterChip, selectedCategory === cat && styles.filterChipActive]}
                                onPress={() => setSelectedCategory(cat)}
                            >
                                <Text style={[styles.filterText, selectedCategory === cat && styles.filterTextActive]}>
                                    {cat}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}

            {/* Sort Button */}
            <View style={styles.sortRow}>
                <Text style={styles.resultCount}>{products.length} products</Text>
                <TouchableOpacity style={styles.sortButton} onPress={() => setShowSortModal(true)}>
                    <Ionicons name="swap-vertical" size={18} color="#007AFF" />
                    <Text style={styles.sortButtonText}>{getSortLabel()}</Text>
                </TouchableOpacity>
            </View>

            {/* Product List */}
            {isLoading && !isFetching ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#007AFF" />
                </View>
            ) : (
                <FlashList
                    data={products}
                    renderItem={({ item }: { item: Product }) => (
                        <ProductCard item={item} />
                    )}
                    numColumns={COLUMN_COUNT}
                    // estimatedItemSize={250}
                    keyExtractor={(item) => item._id || item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    onEndReached={onEndReached}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={renderFooter}
                    refreshControl={
                        <RefreshControl refreshing={isFetching} onRefresh={onRefresh} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="cube-outline" size={64} color="#CCC" />
                            <Text style={styles.emptyText}>No products found</Text>
                        </View>
                    }
                />
            )}

            {/* Sort Modal */}
            <Modal visible={showSortModal} transparent animationType="slide">
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowSortModal(false)}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Sort By</Text>
                        {SORT_OPTIONS.map((option) => (
                            <TouchableOpacity
                                key={option.value}
                                style={[styles.sortOption, selectedSort === option.value && styles.sortOptionActive]}
                                onPress={() => {
                                    setSelectedSort(option.value);
                                    setShowSortModal(false);
                                }}
                            >
                                <Text style={[styles.sortOptionText, selectedSort === option.value && styles.sortOptionTextActive]}>
                                    {option.label}
                                </Text>
                                {selectedSort === option.value && (
                                    <Ionicons name="checkmark" size={20} color="#007AFF" />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    cartButton: {
        padding: 5,
        position: 'relative',
    },
    badge: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: '#FF3B30',
        borderRadius: 10,
        minWidth: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#FFFFFF',
    },
    badgeText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: 'bold',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        marginHorizontal: 16,
        marginTop: 12,
        marginBottom: 8,
        paddingHorizontal: 16,
        borderRadius: 12,
        height: 46,
        borderWidth: 1,
        borderColor: '#EEE',
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: '#333',
    },
    filterWrapper: {
        marginBottom: 4,
    },
    filterContainer: {
        paddingHorizontal: 16,
        paddingVertical: 8,
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
    sortRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    resultCount: {
        fontSize: 13,
        color: '#888',
        fontWeight: '500',
    },
    sortButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#E8F0FE',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    sortButtonText: {
        fontSize: 13,
        color: '#007AFF',
        fontWeight: '600',
    },
    listContent: {
        paddingHorizontal: HALF_SPACING,
        paddingTop: SPACING / 2,
        paddingBottom: SPACING,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
    footerLoader: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 16,
        gap: 8,
    },
    footerText: {
        fontSize: 13,
        color: '#888',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 24,
        paddingBottom: 40,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginBottom: 16,
    },
    sortOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    sortOptionActive: {
        backgroundColor: '#F0F7FF',
        marginHorizontal: -24,
        paddingHorizontal: 24,
    },
    sortOptionText: {
        fontSize: 16,
        color: '#333',
    },
    sortOptionTextActive: {
        color: '#007AFF',
        fontWeight: '600',
    },
});

export default ProductScreen;
