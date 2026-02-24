import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Coupon } from '../../services/couponService';

interface PriceSummaryProps {
    totalMrp: number;
    totalSavings: number;
    totalPrice: number;
    totalEarnings: number;
    selectedCoupon: Coupon | null;
    referralCode?: string;
    calculateFinalTotal: () => number;
}

const PriceSummary: React.FC<PriceSummaryProps> = ({
    totalMrp,
    totalSavings,
    totalPrice,
    totalEarnings,
    selectedCoupon,
    referralCode,
    calculateFinalTotal
}) => {
    const getReferralDiscountPercentage = () => {
        if (!referralCode) return 0;
        if (totalPrice < 1000) return 5;
        if (totalPrice < 2000) return 7;
        if (totalPrice < 5000) return 8;
        return 10;
    };

    const referralDiscountAmount = (totalPrice * getReferralDiscountPercentage()) / 100;

    return (
        <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal (MRP)</Text>
                <Text style={styles.summaryValue}>₹{totalMrp.toLocaleString()}</Text>
            </View>
            <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, styles.savingsLabel]}>Savings</Text>
                <Text style={styles.savingsValue}>-₹{totalSavings.toLocaleString()}</Text>
            </View>
            {selectedCoupon && (
                <View style={styles.summaryRow}>
                    <Text style={[styles.summaryLabel, styles.savingsLabel]}>Coupon ({selectedCoupon.code})</Text>
                    <Text style={styles.savingsValue}>
                        -₹{selectedCoupon.type === 'percentage'
                            ? (totalPrice * selectedCoupon.discount / 100).toLocaleString()
                            : selectedCoupon.discount.toLocaleString()}
                    </Text>
                </View>
            )}
            {referralCode && referralCode !== '' && (
                <View style={styles.summaryRow}>
                    <Text style={[styles.summaryLabel, styles.referralLabel]}>
                        Referral ({referralCode}) ({getReferralDiscountPercentage()}%)
                    </Text>
                    <Text style={styles.referralValue}>
                        -₹{referralDiscountAmount.toLocaleString()}
                    </Text>
                </View>
            )}
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
                <Text style={styles.totalPrice}>₹{calculateFinalTotal().toLocaleString()}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    summaryContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    summaryLabel: {
        fontSize: 14,
        color: '#6B7280',
    },
    summaryValue: {
        fontSize: 14,
        color: '#1A1A1A',
    },
    savingsLabel: {
        color: '#10B981',
        fontWeight: '600',
    },
    savingsValue: {
        fontSize: 14,
        fontWeight: '700',
        color: '#10B981',
    },
    totalEarnBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FEF3C7',
        borderRadius: 10,
        padding: 12,
        marginVertical: 10,
    },
    totalEarnLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    totalEarnIconCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#D97706',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    totalEarnLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: '#92400E',
    },
    totalEarnAmount: {
        fontSize: 15,
        fontWeight: '800',
        color: '#92400E',
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginVertical: 12,
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
    referralLabel: {
        color: '#6C63FF',
        fontWeight: '600',
    },
    referralValue: {
        fontSize: 14,
        fontWeight: '700',
        color: '#6C63FF',
    },
});

export default PriceSummary;
