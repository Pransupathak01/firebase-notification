import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ActivityIndicator,
    Alert,
    TouchableOpacity,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigations/AppNavigator';

import { useCart } from '../context/CartContext';
import { fetchAddresses, saveAddress, Address } from '../services/addressService';
import { fetchCoupons, Coupon } from '../services/couponService';
import { validateCheckoutAPI } from '../services/ordersService';
import { createRazorpayOrder, verifyPaymentAndPlaceOrder } from '../services/paymentService';
import { getUserSession } from '../services/authService';
import RazorpayCheckout from 'react-native-razorpay';
import { AppConfig } from '../config/api';

// Child Components
import CartStep from '../components/checkout/CartStep';
import AddressSelectionStep from '../components/checkout/AddressSelectionStep';
import FinalCheckoutStep from '../components/checkout/FinalCheckoutStep';
import ScreenHeader from '../components/ScreenHeader';
import { useAnalytics, useTrackScreen } from '../hooks/useAnalytics';

type CheckoutStep = 1 | 2 | 3;

const CartScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
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

    const { beginCheckout, purchase, couponApplied, custom: logEvent } = useAnalytics();

    const [currentStep, setCurrentStep] = useState<CheckoutStep>(1);
    const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
    const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [referralCode, setReferralCode] = useState('');
    const [appliedReferral, setAppliedReferral] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    // Track Screens per Step
    const getScreenName = () => {
        switch (currentStep) {
            case 1: return 'Cart';
            case 2: return 'Checkout - Address';
            case 3: return 'Checkout - Payment';
            default: return 'Cart';
        }
    };
    useTrackScreen(getScreenName(), 'CartScreen');

    // Data Fetching
    useEffect(() => {
        const loadCheckoutData = async () => {
            try {
                const [addrRes, couponRes] = await Promise.all([
                    fetchAddresses(),
                    fetchCoupons()
                ]);
                if (addrRes.success) setAddresses(addrRes.data);
                if (couponRes.success) setCoupons(couponRes.data);
            } catch (err) { console.error('Failed to load checkout data:', err); }
        };
        loadCheckoutData();
    }, []);

    // Track "Begin Checkout"
    useEffect(() => {
        if (currentStep === 2 && cartItems.length > 0) {
            beginCheckout(totalPrice, cartItems);
        }
    }, [currentStep]);

    const handleSaveAddress = async () => {
        const { name, phone, street, city, state, zipCode } = newAddress;
        if (!name || !phone || !street || !city || !state || !zipCode) {
            Alert.alert('Missing Fields', 'Please fill all address details.');
            return;
        }

        try {
            setIsProcessing(true);
            const res = await saveAddress(newAddress);
            if (res.success) {
                setAddresses([...addresses, res.data]);
                setSelectedAddress(res.data);
                setShowAddressForm(false);
                setNewAddress({ name: '', phone: '', street: '', city: '', state: '', zipCode: '', type: 'Home' });
                logEvent('address_saved', { success: true });
            }
        } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to save address');
        } finally {
            setIsProcessing(false);
        }
    };

    const handlePlaceOrder = async () => {
        if (isProcessing || !selectedAddress) return;

        logEvent('pay_now_clicked', {
            total_price: calculateFinalTotal(),
            items_count: cartItems.length,
            coupon: selectedCoupon?.code || 'none'
        });

        try {
            setIsProcessing(true);
            const session = await getUserSession();
            if (!session) {
                Alert.alert('Error', 'User session not found.');
                setIsProcessing(false);
                return;
            }

            const finalTotal = calculateFinalTotal();
            const orderRes = await createRazorpayOrder(finalTotal);

            if (!orderRes || !orderRes.id) throw new Error(orderRes?.message || 'Failed to initialize payment');

            const options = {
                description: 'Order from SyncTalk',
                image: 'https://synctalk.in/logo.png',
                currency: orderRes.currency || 'INR',
                key: AppConfig.RAZORPAY_KEY,
                amount: orderRes.amount,
                name: 'SyncTalk',
                order_id: orderRes.id,
                prefill: { email: session.user.email, contact: session.user.phone || '', name: session.user.name },
                theme: { color: '#007AFF' }
            };

            const paymentData = await RazorpayCheckout.open(options);

            const res = await verifyPaymentAndPlaceOrder({
                addressId: selectedAddress.id,
                couponCode: selectedCoupon?.code,
                referralCode: appliedReferral || undefined,
                paymentMethod: 'UPI',
                razorpay_order_id: paymentData.razorpay_order_id,
                razorpay_payment_id: paymentData.razorpay_payment_id,
                razorpay_signature: paymentData.razorpay_signature,
            });

            if (res.success) {
                purchase(paymentData.razorpay_payment_id, finalTotal, cartItems);

                Alert.alert('Success', 'Order placed successfully!', [
                    {
                        text: 'OK', onPress: () => {
                            clearCart();
                            setSelectedAddress(null);
                            setSelectedCoupon(null);
                            setReferralCode('');
                            setAppliedReferral('');
                            setCurrentStep(1);
                            setIsProcessing(false);
                            navigation.navigate('MainTabs', { screen: 'Orders' });
                        }
                    }
                ]);
            } else {
                setIsProcessing(false);
                Alert.alert('Error', res.message || 'Payment verification failed');
            }
        } catch (err: any) {
            setIsProcessing(false);
            console.error('Payment Error:', err);
            logEvent('payment_failed', { error: err.message || 'Unknown' });
            if (err.code) Alert.alert('Payment Cancelled', 'Payment process was interrupted.');
            else Alert.alert('Checkout Error', err.message || 'An error occurred during payment.');
        }
    };

    const handleApplyReferral = async () => {
        const code = referralCode.trim();
        if (!code) return Alert.alert('Error', 'Please enter a referral code');
        try {
            setIsProcessing(true);
            const res = await validateCheckoutAPI(code, selectedCoupon?.code);
            if (res.success) {
                setAppliedReferral(code);
                logEvent('referral_applied', { code });
                Alert.alert('Success', 'Referral code applied successfully!');
            }
        } catch (err: any) {
            Alert.alert('Invalid Code', err.message || 'Invalid code.');
            setAppliedReferral('');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleRemoveReferral = () => {
        setAppliedReferral('');
        setReferralCode('');
        Alert.alert('Removed', 'Referral code removed.');
    };

    const calculateFinalTotal = () => {
        let total = totalPrice;
        if (selectedCoupon) {
            if (selectedCoupon.type === 'percentage') total = total - (total * selectedCoupon.discount / 100);
            else total = Math.max(0, total - selectedCoupon.discount);
        }
        if (appliedReferral !== '') {
            let referralPercentage = totalPrice < 1000 ? 5 : totalPrice < 2000 ? 7 : totalPrice < 5000 ? 8 : 10;
            const referralDiscount = (totalPrice * referralPercentage) / 100;
            total = Math.max(0, total - referralDiscount);
        }
        return total;
    };

    const handleClearCart = () => {
        Alert.alert('Clear Cart', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Clear', style: 'destructive', onPress: () => { clearCart(); logEvent('cart_cleared'); }},
        ]);
    };

    const [showAddressForm, setShowAddressForm] = useState(false);
    const [newAddress, setNewAddress] = useState({ name: '', phone: '', street: '', city: '', state: '', zipCode: '', type: 'Home' as any });

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <ScreenHeader
                    title={currentStep === 1 ? 'My Cart' : currentStep === 2 ? 'Delivery Address' : 'Final Checkout'}
                    showBackButton={true}
                    onBackPress={() => currentStep > 1 ? setCurrentStep((currentStep - 1) as CheckoutStep) : navigation.goBack()}
                    rightElement={currentStep === 1 && cartItems.length > 0 ? (
                        <TouchableOpacity onPress={handleClearCart} style={styles.clearButton}>
                            <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                        </TouchableOpacity>
                    ) : null}
                />
                {!loading || cartItems.length > 0 ? (
                    <>
                        {currentStep === 1 && (
                            <CartStep
                                currentStep={1}
                                cartItems={cartItems}
                                loading={loading}
                                totalMrp={totalMrp}
                                totalSavings={totalSavings}
                                totalPrice={totalPrice}
                                totalEarnings={totalEarnings}
                                onRefresh={refreshCart}
                                onIncrement={incrementItem}
                                onDecrement={decrementItem}
                                onRemove={removeFromCart}
                                onNext={() => {
                                    logEvent('checkout_button_clicked');
                                    setCurrentStep(2);
                                }}
                                onShopNow={() => navigation.goBack()}
                                calculateFinalTotal={calculateFinalTotal}
                                selectedCoupon={selectedCoupon}
                                referralCode={appliedReferral}
                            />
                        )}
                        {currentStep === 2 && (
                            <AddressSelectionStep
                                currentStep={2}
                                addresses={addresses}
                                selectedAddress={selectedAddress}
                                showAddressForm={showAddressForm}
                                newAddress={newAddress}
                                onSelectAddress={setSelectedAddress}
                                onShowForm={setShowAddressForm}
                                onUpdateNewAddress={setNewAddress}
                                onSaveAddress={handleSaveAddress}
                                onNext={() => {
                                    if (selectedAddress) {
                                        logEvent('address_selected_clicked');
                                        setCurrentStep(3);
                                    } else {
                                        Alert.alert('Selection Required', 'Please select an address');
                                    }
                                }}
                            />
                        )}
                        {currentStep === 3 && (
                            <FinalCheckoutStep
                                currentStep={3}
                                cartItems={cartItems}
                                totalItems={totalItems}
                                selectedAddress={selectedAddress}
                                coupons={coupons}
                                selectedCoupon={selectedCoupon}
                                isProcessing={isProcessing}
                                totalMrp={totalMrp}
                                totalSavings={totalSavings}
                                totalPrice={totalPrice}
                                totalEarnings={totalEarnings}
                                onPrev={() => setCurrentStep(2)}
                                onChangeAddress={() => setCurrentStep(2)}
                                onToggleCoupon={(c) => {
                                    const isNew = selectedCoupon?.id !== c.id;
                                    setSelectedCoupon(isNew ? c : null);
                                    if (isNew) {
                                        // TRACK COUPON ENGAGEMENT
                                        couponApplied(c.code, c.discount);
                                    }
                                }}
                                referralCode={referralCode}
                                appliedReferral={appliedReferral}
                                onReferralCodeChange={setReferralCode}
                                onApplyReferral={handleApplyReferral}
                                onRemoveReferral={handleRemoveReferral}
                                onPlaceOrder={handlePlaceOrder}
                                calculateFinalTotal={calculateFinalTotal}
                            />
                        )}
                    </>
                ) : (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#007AFF" />
                        <Text style={styles.loadingText}>Loading...</Text>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
    container: { flex: 1, backgroundColor: '#F8F9FB' },
    clearButton: { padding: 8 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 12, fontSize: 14, color: '#999' },
});

export default CartScreen;
