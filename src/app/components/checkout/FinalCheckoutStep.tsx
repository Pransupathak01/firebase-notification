import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { CartItem } from '../../services/cartService';
import { Address } from '../../services/addressService';
import { Coupon } from '../../services/couponService';
import CartItemCard from './CartItemCard';
import PriceSummary from './PriceSummary';
import CheckoutStepIndicator from './CheckoutStepIndicator';

interface FinalCheckoutStepProps {
    currentStep: number;
    cartItems: CartItem[];
    totalItems: number;
    selectedAddress: Address | null;
    coupons: Coupon[];
    selectedCoupon: Coupon | null;
    isProcessing: boolean;
    totalMrp: number;
    totalSavings: number;
    totalPrice: number;
    totalEarnings: number;
    onPrev: () => void;
    onChangeAddress: () => void;
    onToggleCoupon: (coupon: Coupon) => void;
    referralCode: string;
    appliedReferral: string;
    onReferralCodeChange: (code: string) => void;
    onApplyReferral: () => void;
    onRemoveReferral: () => void;
    onPlaceOrder: () => void;
    calculateFinalTotal: () => number;
}

const FinalCheckoutStep: React.FC<FinalCheckoutStepProps> = ({
    currentStep,
    cartItems,
    totalItems,
    selectedAddress,
    coupons,
    selectedCoupon,
    isProcessing,
    totalMrp,
    totalSavings,
    totalPrice,
    totalEarnings,
    onPrev,
    onChangeAddress,
    onToggleCoupon,
    referralCode,
    appliedReferral,
    onReferralCodeChange,
    onApplyReferral,
    onRemoveReferral,
    onPlaceOrder,
    calculateFinalTotal
}) => {
    return (
        <ScrollView contentContainerStyle={styles.scrollContent}>
            <CheckoutStepIndicator currentStep={currentStep} />

            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Order Review</Text>
                <Text style={styles.itemCountText}>{totalItems} Items</Text>
            </View>

            <View style={styles.reviewItemsContainer}>
                {cartItems.map((item) => (
                    <View key={item._id} style={{ marginBottom: 10 }}>
                        <CartItemCard item={item} currentStep={3} />
                    </View>
                ))}
            </View>

            <View style={styles.dividerLarge} />

            <View style={styles.sectionContainer}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Deliver to</Text>
                    <TouchableOpacity onPress={onChangeAddress}>
                        <Text style={styles.editText}>Change</Text>
                    </TouchableOpacity>
                </View>
                {selectedAddress && (
                    <View style={styles.addressSummary}>
                        <Text style={styles.addressName}>{selectedAddress.name}</Text>
                        <Text style={styles.addressTextSmall}>{selectedAddress.street}, {selectedAddress.city}</Text>
                    </View>
                )}
            </View>

            <View style={styles.dividerLarge} />

            <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Available Coupons</Text>
                <View style={styles.couponList}>
                    {coupons.map((coupon) => (
                        <TouchableOpacity
                            key={coupon.id}
                            style={[
                                styles.couponCard,
                                selectedCoupon?.id === coupon.id && styles.couponCardSelected
                            ]}
                            onPress={() => onToggleCoupon(coupon)}
                        >
                            <View style={styles.couponInfo}>
                                <Text style={styles.couponCode}>{coupon.code}</Text>
                                <Text style={styles.couponDesc}>{coupon.description}</Text>
                            </View>
                            <View style={styles.couponAction}>
                                <Text style={[
                                    styles.applyText,
                                    selectedCoupon?.id === coupon.id && styles.appliedText
                                ]}>
                                    {selectedCoupon?.id === coupon.id ? 'Applied' : 'Apply'}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View style={styles.dividerLarge} />

            {/* Referral Code Section */}
            <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Referral Code (Optional)</Text>
                <View style={styles.referralInputContainer}>
                    <Ionicons name="people-outline" size={20} color="#6B7280" style={styles.referralIcon} />
                    <TextInput
                        style={styles.referralInput}
                        placeholder="Enter Referral Code"
                        placeholderTextColor="#9CA3AF"
                        value={referralCode}
                        onChangeText={onReferralCodeChange}
                        autoCapitalize="characters"
                    />
                    <TouchableOpacity
                        style={[
                            styles.applyButton,
                            (appliedReferral !== '' && referralCode === appliedReferral) && styles.applyButtonDisabled
                        ]}
                        onPress={onApplyReferral}
                        disabled={appliedReferral !== '' && referralCode === appliedReferral}
                    >
                        <Text style={styles.applyButtonText}>
                            {(appliedReferral !== '' && referralCode === appliedReferral) ? 'Applied' : 'Apply'}
                        </Text>
                    </TouchableOpacity>
                    {(appliedReferral !== '' && referralCode === appliedReferral) && (
                        <TouchableOpacity
                            style={styles.removeButton}
                            onPress={onRemoveReferral}
                        >
                            <Ionicons name="close-circle" size={20} color="#FF3B30" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <View style={styles.dividerLarge} />

            <PriceSummary
                totalMrp={totalMrp}
                totalSavings={totalSavings}
                totalPrice={totalPrice}
                totalEarnings={totalEarnings}
                selectedCoupon={selectedCoupon}
                referralCode={appliedReferral}
                calculateFinalTotal={calculateFinalTotal}
            />

            <TouchableOpacity
                style={[styles.paymentButton, isProcessing && { opacity: 0.7 }]}
                onPress={onPlaceOrder}
                disabled={isProcessing}
            >
                <View style={styles.paymentButtonLeft}>
                    {isProcessing ? (
                        <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                        <>
                            <Text style={styles.paymentButtonPrice}>₹{calculateFinalTotal().toLocaleString()}</Text>
                            <Text style={styles.paymentButtonLabel}>Total payable</Text>
                        </>
                    )}
                </View>
                <View style={styles.paymentButtonRight}>
                    <Text style={styles.paymentButtonText}>{isProcessing ? 'Processing...' : 'Pay Now'}</Text>
                    {!isProcessing && <Ionicons name="chevron-forward" size={18} color="#FFF" />}
                </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.backToCartButton} onPress={onPrev}>
                <Text style={styles.backToCartText}>Back to Address</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scrollContent: {
        padding: 16,
        paddingBottom: 40,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginBottom: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 12,
    },
    itemCountText: {
        fontSize: 14,
        color: '#6B7280',
    },
    reviewItemsContainer: {
        marginBottom: 16,
    },
    dividerLarge: {
        height: 8,
        backgroundColor: '#F3F4F6',
        marginHorizontal: -16,
        marginBottom: 20,
    },
    sectionContainer: {
        marginBottom: 20,
    },
    editText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#007AFF',
    },
    addressSummary: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 12,
    },
    addressName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1A1A1A',
    },
    addressTextSmall: {
        fontSize: 13,
        color: '#6B7280',
        marginTop: 2,
    },
    couponList: {
        marginTop: 8,
    },
    couponCard: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        alignItems: 'center',
    },
    couponCardSelected: {
        borderColor: '#10B981',
        backgroundColor: '#F0FDF4',
    },
    couponInfo: {
        flex: 1,
    },
    couponCode: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginBottom: 2,
    },
    couponDesc: {
        fontSize: 11,
        color: '#6B7280',
    },
    couponAction: {
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    applyText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#007AFF',
    },
    appliedText: {
        color: '#10B981',
    },
    paymentButton: {
        backgroundColor: '#1A1A1A',
        borderRadius: 16,
        flexDirection: 'row',
        padding: 4,
        marginTop: 10,
    },
    paymentButtonLeft: {
        flex: 1,
        paddingLeft: 16,
        justifyContent: 'center',
    },
    paymentButtonPrice: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    paymentButtonLabel: {
        color: '#9CA3AF',
        fontSize: 10,
    },
    paymentButtonRight: {
        backgroundColor: '#007AFF',
        borderRadius: 12,
        paddingHorizontal: 20,
        paddingVertical: 14,
        flexDirection: 'row',
        alignItems: 'center',
    },
    paymentButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
        marginRight: 4,
    },
    backToCartButton: {
        alignItems: 'center',
        paddingVertical: 16,
        marginTop: 10,
    },
    backToCartText: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '600',
    },
    referralInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        paddingHorizontal: 12,
    },
    referralIcon: {
        marginRight: 10,
    },
    referralInput: {
        flex: 1,
        height: 50,
        fontSize: 15,
        color: '#1A1A1A',
        fontWeight: '600',
    },
    applyButton: {
        backgroundColor: '#6C63FF',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    applyButtonDisabled: {
        backgroundColor: '#10B981',
    },
    applyButtonText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
    removeButton: {
        padding: 4,
        marginLeft: 8,
    },
});

export default FinalCheckoutStep;
