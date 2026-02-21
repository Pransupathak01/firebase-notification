import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    SafeAreaView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

import { useCart } from '../context/CartContext';
import { CartItem } from '../services/cartService';

const CartScreen = () => {
    const navigation = useNavigation();
    const {
        cartItems,
        loading,
        totalPrice,
        totalMrp,
        totalSavings,
        totalEarnings,
        totalItems,
        incrementItem,
        decrementItem,
        removeFromCart,
        clearCart,
        refreshCart,
    } = useCart();

    const handleClearCart = () => {
        Alert.alert(
            'Clear Cart',
            'Are you sure you want to remove all items?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Clear', style: 'destructive', onPress: () => clearCart() },
            ]
        );
    };

    const renderItem = ({ item }: { item: CartItem }) => (
        <View style={styles.cartItem}>
            {/* ── Left Column: Image + Quantity Controls ── */}
            <View style={styles.leftColumn}>
                <Image
                    source={{ uri: item.product.imageUrl || (item.product.images && item.product.images[0]) }}
                    style={styles.itemImage}
                />
                {/* Quantity controls below image */}
                <View style={styles.quantityContainer}>
                    <TouchableOpacity
                        style={styles.qtyButton}
                        onPress={() => decrementItem(item.product._id, item.size)}
                        disabled={loading}
                    >
                        <Ionicons name="remove" size={14} color="#007AFF" />
                    </TouchableOpacity>
                    <Text style={styles.quantityText}>{item.quantity}</Text>
                    <TouchableOpacity
                        style={styles.qtyButton}
                        onPress={() => incrementItem(item.product._id, item.size)}
                        disabled={loading}
                    >
                        <Ionicons name="add" size={14} color="#007AFF" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* ── Right Column: Details ── */}
            <View style={styles.itemDetails}>
                {/* Top row: info + remove button */}
                <View style={styles.detailsTopRow}>
                    <View style={styles.itemInfo}>
                        <Text style={styles.brandText}>{item.product.brand}</Text>
                        <Text style={styles.itemName} numberOfLines={2}>{item.product.name}</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => removeFromCart(item.product._id)}
                        disabled={loading}
                    >
                        <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                    </TouchableOpacity>
                </View>

                {/* Size badge */}
                {item.size ? (
                    <View style={styles.sizeBadge}>
                        <Text style={styles.sizeText}>Size: {item.size}</Text>
                    </View>
                ) : null}

                {/* Price row */}
                <View style={styles.priceRow}>
                    <Text style={styles.itemPrice}>₹{item.itemTotal.toLocaleString()}</Text>
                    {item.itemMrp > item.itemTotal && (
                        <Text style={styles.itemMrp}>₹{item.itemMrp.toLocaleString()}</Text>
                    )}
                    {item.product.discount > 0 && (
                        <View style={styles.discountBadge}>
                            <Text style={styles.discountText}>{item.product.discount}% OFF</Text>
                        </View>
                    )}
                </View>

                {/* ── You Earn Banner ── */}
                {item.itemEarnings > 0 && (
                    <View style={styles.earnBanner}>
                        <View style={styles.earnIconCircle}>
                            <Ionicons name="gift" size={12} color="#D4A017" />
                        </View>
                        <Text style={styles.earnCompactText}>You earn <Text style={styles.earnCompactAmount}>₹{item.itemEarnings}</Text></Text>
                    </View>
                )}
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>My Cart ({totalItems})</Text>
                    {cartItems.length > 0 ? (
                        <TouchableOpacity onPress={handleClearCart} style={styles.clearButton}>
                            <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.placeholder} />
                    )}
                </View>

                {/* Loading overlay */}
                {loading && cartItems.length === 0 && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#007AFF" />
                        <Text style={styles.loadingText}>Loading cart...</Text>
                    </View>
                )}

                {/* Cart items list */}
                <FlatList
                    data={cartItems}
                    renderItem={renderItem}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.listContent}
                    onRefresh={refreshCart}
                    refreshing={loading}
                    ListEmptyComponent={
                        !loading ? (
                            <View style={styles.emptyContainer}>
                                <Ionicons name="cart-outline" size={64} color="#CCC" />
                                <Text style={styles.emptyText}>Your cart is empty</Text>
                                <TouchableOpacity
                                    style={styles.shopNowButton}
                                    onPress={() => navigation.goBack()}
                                >
                                    <Text style={styles.shopNowText}>Shop Now</Text>
                                </TouchableOpacity>
                            </View>
                        ) : null
                    }
                />

                {/* Footer with order summary */}
                {cartItems.length > 0 && (
                    <View style={styles.footer}>
                        {/* Order Summary */}
                        <View style={styles.summaryContainer}>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Subtotal (MRP)</Text>
                                <Text style={styles.summaryValue}>₹{totalMrp.toLocaleString()}</Text>
                            </View>
                            <View style={styles.summaryRow}>
                                <Text style={[styles.summaryLabel, styles.savingsLabel]}>Savings</Text>
                                <Text style={styles.savingsValue}>-₹{totalSavings.toLocaleString()}</Text>
                            </View>
                            {/* ── Total Earnings Banner ── */}
                            {totalEarnings > 0 && (
                                <View style={styles.totalEarnBanner}>
                                    <View style={styles.totalEarnLeft}>
                                        <View style={styles.totalEarnIconCircle}>
                                            <Ionicons name="gift" size={14} color="#FFFFFF" />
                                        </View>
                                        <Text style={styles.totalEarnLabel}>Total Earnings</Text>
                                    </View>
                                    <Text style={styles.totalEarnAmount}>+₹{totalEarnings.toLocaleString()}</Text>
                                </View>
                            )}
                            <View style={styles.divider} />
                            <View style={styles.summaryRow}>
                                <Text style={styles.totalLabel}>Total</Text>
                                <Text style={styles.totalPrice}>₹{totalPrice.toLocaleString()}</Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[styles.checkoutButton, loading && styles.checkoutDisabled]}
                            onPress={() => {/* Checkout logic */ }}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color="#FFF" />
                            ) : (
                                <>
                                    <Text style={styles.checkoutText}>Checkout</Text>
                                    <Ionicons name="arrow-forward" size={20} color="#FFF" />
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    container: {
        flex: 1,
        backgroundColor: '#F8F9FB',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1A1A1A',
    },
    clearButton: {
        padding: 8,
    },
    placeholder: {
        width: 40,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: '#999',
    },
    listContent: {
        padding: 16,
        paddingBottom: 8,
    },

    // ─── Cart Item Card ────────────────────────────────────────
    cartItem: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 12,
        marginBottom: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
        elevation: 3,
    },

    // ── Left Column: Image + Qty ──
    leftColumn: {
        alignItems: 'center',
        marginRight: 14,
    },
    itemImage: {
        width: 96,
        height: 96,
        borderRadius: 14,
        backgroundColor: '#F5F5F5',
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0F4FF',
        borderRadius: 20,
        marginTop: 10,
        paddingHorizontal: 4,
        paddingVertical: 2,
    },
    qtyButton: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    },
    quantityText: {
        marginHorizontal: 12,
        fontSize: 15,
        fontWeight: '700',
        color: '#1A1A1A',
    },

    // ── Right Column: Details ──
    itemDetails: {
        flex: 1,
    },
    detailsTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    itemInfo: {
        flex: 1,
        marginRight: 8,
    },
    brandText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#9CA3AF',
        textTransform: 'uppercase',
        letterSpacing: 0.6,
        marginBottom: 2,
    },
    itemName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1A1A1A',
        lineHeight: 20,
        marginBottom: 6,
    },
    removeButton: {
        padding: 2,
    },
    sizeBadge: {
        alignSelf: 'flex-start',
        backgroundColor: '#F0F0F0',
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 6,
        marginBottom: 6,
    },
    sizeText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#666',
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    itemPrice: {
        fontSize: 17,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginRight: 8,
    },
    itemMrp: {
        fontSize: 13,
        color: '#9CA3AF',
        textDecorationLine: 'line-through',
        marginRight: 8,
    },
    discountBadge: {
        backgroundColor: '#FEE2E2',
        paddingHorizontal: 7,
        paddingVertical: 2,
        borderRadius: 4,
    },
    discountText: {
        fontSize: 10,
        fontWeight: '800',
        color: '#EF4444',
    },

    // ── You Earn Banner (per item) ──
    earnBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF9EB',
        borderWidth: 1,
        borderColor: '#F5DFA0',
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 6,
        marginTop: 2,
    },
    earnIconCircle: {
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 6,
    },
    earnCompactText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#92700C',
    },
    earnCompactAmount: {
        fontWeight: '800',
        color: '#92700C',
    },

    // ─── Footer ────────────────────────────────────────────────
    footer: {
        backgroundColor: '#FFFFFF',
        padding: 20,
        paddingBottom: 34,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 10,
    },
    summaryContainer: {
        marginBottom: 16,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    summaryLabel: {
        fontSize: 14,
        color: '#666',
    },
    summaryValue: {
        fontSize: 14,
        color: '#666',
    },
    savingsLabel: {
        color: '#34C759',
    },
    savingsValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#34C759',
    },

    // ── Total Earnings Banner (footer) ──
    totalEarnBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFF9EB',
        borderWidth: 1,
        borderColor: '#F5DFA0',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginBottom: 8,
    },
    totalEarnLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    totalEarnIconCircle: {
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: '#D4A017',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    totalEarnLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#92700C',
    },
    totalEarnAmount: {
        fontSize: 16,
        fontWeight: '800',
        color: '#92700C',
    },

    divider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginVertical: 8,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1A1A1A',
    },
    totalPrice: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1A1A1A',
    },
    checkoutButton: {
        backgroundColor: '#007AFF',
        borderRadius: 16,
        paddingVertical: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkoutDisabled: {
        opacity: 0.7,
    },
    checkoutText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
        marginRight: 8,
    },

    // ─── Empty state ───────────────────────────────────────────
    emptyContainer: {
        alignItems: 'center',
        marginTop: 64,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
        color: '#999',
    },
    shopNowButton: {
        marginTop: 20,
        backgroundColor: '#007AFF',
        paddingHorizontal: 32,
        paddingVertical: 12,
        borderRadius: 12,
    },
    shopNowText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '600',
    },
});

export default CartScreen;
