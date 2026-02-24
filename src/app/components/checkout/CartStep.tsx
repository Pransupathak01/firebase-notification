import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { CartItem } from '../../services/cartService';
import CartItemCard from './CartItemCard';
import PriceSummary from './PriceSummary';
import CheckoutStepIndicator from './CheckoutStepIndicator';
import { Coupon } from '../../services/couponService';

interface CartStepProps {
    currentStep: number;
    cartItems: CartItem[];
    loading: boolean;
    totalMrp: number;
    totalSavings: number;
    totalPrice: number;
    totalEarnings: number;
    onRefresh: () => void;
    onIncrement: (productId: string, size: string) => void;
    onDecrement: (productId: string, size: string) => void;
    onRemove: (productId: string) => void;
    onNext: () => void;
    onShopNow: () => void;
    calculateFinalTotal: () => number;
    selectedCoupon: Coupon | null;
    referralCode?: string;
}

const CartStep: React.FC<CartStepProps> = ({
    currentStep,
    cartItems,
    loading,
    totalMrp,
    totalSavings,
    totalPrice,
    totalEarnings,
    onRefresh,
    onIncrement,
    onDecrement,
    onRemove,
    onNext,
    onShopNow,
    calculateFinalTotal,
    selectedCoupon,
    referralCode
}) => {
    return (
        <FlatList
            data={cartItems}
            renderItem={({ item }) => (
                <CartItemCard
                    item={item}
                    currentStep={1}
                    loading={loading}
                    onIncrement={onIncrement}
                    onDecrement={onDecrement}
                    onRemove={onRemove}
                />
            )}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listContent}
            onRefresh={onRefresh}
            refreshing={loading}
            ListHeaderComponent={<CheckoutStepIndicator currentStep={currentStep} />}
            ListFooterComponent={() => (
                cartItems.length > 0 ? (
                    <View style={styles.footerInner}>
                        <PriceSummary
                            totalMrp={totalMrp}
                            totalSavings={totalSavings}
                            totalPrice={totalPrice}
                            totalEarnings={totalEarnings}
                            selectedCoupon={selectedCoupon}
                            referralCode={referralCode}
                            calculateFinalTotal={calculateFinalTotal}
                        />
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={onNext}
                        >
                            <Text style={styles.actionButtonText}>Proceed to Address</Text>
                            <Ionicons name="arrow-forward" size={20} color="#FFF" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.shopMoreButton}
                            onPress={onShopNow}
                        >
                            <Ionicons name="add" size={20} color="#007AFF" />
                            <Text style={styles.shopMoreText}>Shop More</Text>
                        </TouchableOpacity>
                    </View>
                ) : null
            )}
            ListEmptyComponent={
                !loading ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="cart-outline" size={64} color="#CCC" />
                        <Text style={styles.emptyText}>Your cart is empty</Text>
                        <TouchableOpacity
                            style={styles.shopNowButton}
                            onPress={onShopNow}
                        >
                            <Text style={styles.shopNowText}>Shop Now</Text>
                        </TouchableOpacity>
                    </View>
                ) : null
            }
        />
    );
};

const styles = StyleSheet.create({
    listContent: {
        padding: 16,
        paddingBottom: 24,
    },
    footerInner: {
        marginTop: 10,
    },
    actionButton: {
        backgroundColor: '#007AFF',
        borderRadius: 16,
        paddingVertical: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
        marginRight: 8,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
    },
    emptyText: {
        fontSize: 18,
        color: '#9CA3AF',
        marginTop: 16,
        marginBottom: 24,
    },
    shopNowButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 32,
        paddingVertical: 14,
        borderRadius: 12,
    },
    shopNowText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    shopMoreButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        marginTop: 8,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#007AFF',
        borderStyle: 'dashed',
    },
    shopMoreText: {
        color: '#007AFF',
        fontSize: 16,
        fontWeight: '700',
        marginLeft: 4,
    },
});

export default CartStep;
