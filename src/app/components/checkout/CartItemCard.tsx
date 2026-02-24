import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { CartItem } from '../../services/cartService';

interface CartItemCardProps {
    item: CartItem;
    currentStep: number;
    loading?: boolean;
    onIncrement?: (productId: string, size: string) => void;
    onDecrement?: (productId: string, size: string) => void;
    onRemove?: (productId: string) => void;
}

const CartItemCard: React.FC<CartItemCardProps> = ({
    item,
    currentStep,
    loading,
    onIncrement,
    onDecrement,
    onRemove
}) => {
    return (
        <View style={styles.cartItem}>
            <View style={styles.leftColumn}>
                <Image
                    source={{ uri: item.product.imageUrl || (item.product.images && item.product.images[0]) }}
                    style={styles.itemImage}
                />
                {currentStep === 1 && (
                    <View style={styles.quantityContainer}>
                        <TouchableOpacity
                            style={styles.qtyButton}
                            onPress={() => onDecrement?.(item.product._id, item.size)}
                            disabled={loading}
                        >
                            <Ionicons name="remove" size={14} color="#007AFF" />
                        </TouchableOpacity>
                        <Text style={styles.quantityText}>{item.quantity}</Text>
                        <TouchableOpacity
                            style={styles.qtyButton}
                            onPress={() => onIncrement?.(item.product._id, item.size)}
                            disabled={loading}
                        >
                            <Ionicons name="add" size={14} color="#007AFF" />
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            <View style={styles.itemDetails}>
                <View style={styles.detailsTopRow}>
                    <View style={styles.itemInfo}>
                        <Text style={styles.brandText}>{item.product.brand}</Text>
                        <Text style={styles.itemName} numberOfLines={2}>{item.product.name}</Text>
                    </View>
                    {currentStep === 1 && (
                        <TouchableOpacity
                            style={styles.removeButton}
                            onPress={() => onRemove?.(item.product._id)}
                            disabled={loading}
                        >
                            <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                        </TouchableOpacity>
                    )}
                </View>

                {item.size ? (
                    <View style={styles.sizeBadge}>
                        <Text style={styles.sizeText}>Size: {item.size} {currentStep === 3 && `| Qty: ${item.quantity}`}</Text>
                    </View>
                ) : (
                    currentStep === 3 && (
                        <View style={styles.sizeBadge}>
                            <Text style={styles.sizeText}>Qty: {item.quantity}</Text>
                        </View>
                    )
                )}

                <View style={styles.priceRow}>
                    <Text style={styles.itemPrice}>₹{item.itemTotal.toLocaleString()}</Text>
                    {item.itemMrp > item.itemTotal && (
                        <Text style={styles.itemMrp}>₹{item.itemMrp.toLocaleString()}</Text>
                    )}
                </View>

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
};

const styles = StyleSheet.create({
    cartItem: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
        elevation: 3,
    },
    leftColumn: {
        alignItems: 'center',
        marginRight: 14,
    },
    itemImage: {
        width: 80,
        height: 80,
        borderRadius: 12,
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
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    quantityText: {
        marginHorizontal: 10,
        fontSize: 14,
        fontWeight: '700',
        color: '#1A1A1A',
    },
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
        fontSize: 10,
        fontWeight: '600',
        color: '#9CA3AF',
        textTransform: 'uppercase',
        letterSpacing: 0.6,
        marginBottom: 2,
    },
    itemName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1A1A1A',
        lineHeight: 18,
        marginBottom: 4,
    },
    removeButton: {
        padding: 2,
    },
    sizeBadge: {
        alignSelf: 'flex-start',
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
        marginBottom: 6,
    },
    sizeText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#6B7280',
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    itemPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginRight: 8,
    },
    itemMrp: {
        fontSize: 12,
        color: '#9CA3AF',
        textDecorationLine: 'line-through',
    },
    earnBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF9EB',
        borderRadius: 6,
        paddingHorizontal: 6,
        paddingVertical: 4,
        marginTop: 4,
    },
    earnIconCircle: {
        marginRight: 4,
    },
    earnCompactText: {
        fontSize: 10,
        fontWeight: '500',
        color: '#92700C',
    },
    earnCompactAmount: {
        fontWeight: '800',
    },
});

export default CartItemCard;
