import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Dimensions, SafeAreaView, ActivityIndicator } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';

import { useCart } from '../context/CartContext';
import analytics from '@react-native-firebase/analytics';
import ZoomGallery from '../components/ZoomGallery';
import ScreenHeader from '../components/ScreenHeader';

const { width } = Dimensions.get('window');

const AVAILABLE_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

const ProductDetailsScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { addToCart, loading: cartLoading } = useCart();
    const { product } = route.params as { product: any } || {};

    const [selectedSize, setSelectedSize] = useState<string>('');
    const [addingToCart, setAddingToCart] = useState(false);

    const handleAddToCart = async () => {
        if (!product) return;
        const productId = product._id || product.id;

        // Track analytics
        try {
            await analytics().logEvent('add_to_cart', {
                id: productId,
                item: product.name,
                product_name: product.name,
                size: selectedSize || '',
                timestamp: new Date().toISOString(),
            });
        } catch (e) {
            console.warn('Analytics event failed', e);
        }

        setAddingToCart(true);
        const success = await addToCart(productId, 1, selectedSize);
        setAddingToCart(false);

        if (success) {
            navigation.navigate('Cart' as never);
        }
    };

    if (!product) {
        return (
            <View style={styles.errorContainer}>
                <Text>Product not found</Text>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backLink}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScreenHeader
                title={product.name}
                showBackButton={true}
            />
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.imageContainer}>
                    <ZoomGallery images={product.images || (product.imageUrl ? [product.imageUrl] : [])} />
                </View>

                <View style={styles.content}>
                    {/* Brand */}
                    {product.brand && (
                        <Text style={styles.brandText}>{product.brand}</Text>
                    )}

                    <View style={styles.headerRow}>
                        <Text style={styles.title}>{product.name}</Text>
                        <View style={styles.priceBlock}>
                            <Text style={styles.price}>
                                ₹{(typeof product.price === 'number' ? product.price : parseFloat(product.price) || 0).toLocaleString()}
                            </Text>
                            {product.mrp && product.mrp > product.price && (
                                <Text style={styles.mrpPrice}>₹{product.mrp.toLocaleString()}</Text>
                            )}
                            {product.discount > 0 && (
                                <Text style={styles.discountLabel}>{product.discount}% OFF</Text>
                            )}
                        </View>
                    </View>

                    <View style={styles.ratingContainer}>
                        <Ionicons name="star" size={16} color="#FFD700" />
                        <Text style={styles.ratingText}>{product.rating || 4.8} ({product.reviews || '120'} reviews)</Text>
                    </View>

                    {/* You Earn Badge */}
                    {product.youEarn > 0 && (
                        <View style={styles.youEarnBadge}>
                            <Ionicons name="wallet-outline" size={14} color="#34C759" />
                            <Text style={styles.youEarnText}>You earn ₹{product.youEarn} on this purchase</Text>
                        </View>
                    )}

                    {/* Size Selector */}
                    <Text style={styles.sectionTitle}>Select Size</Text>
                    <View style={styles.sizeContainer}>
                        {AVAILABLE_SIZES.map((size) => (
                            <TouchableOpacity
                                key={size}
                                style={[
                                    styles.sizeChip,
                                    selectedSize === size && styles.sizeChipSelected,
                                ]}
                                onPress={() => setSelectedSize(selectedSize === size ? '' : size)}
                            >
                                <Text
                                    style={[
                                        styles.sizeChipText,
                                        selectedSize === size && styles.sizeChipTextSelected,
                                    ]}
                                >
                                    {size}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={styles.sectionTitle}>Description</Text>
                    <Text style={styles.description}>
                        Experience premium quality with this outstanding product. Designed for comfort and durability, it features state-of-the-art materials and a sleek modern design that fits perfectly into your lifestyle.
                    </Text>

                    <Text style={styles.sectionTitle}>Features</Text>
                    <View style={styles.features}>
                        {['Premium Material', 'Modern Design', 'Durable', 'Lightweight'].map((feature, index) => (
                            <View key={index} style={styles.featureChip}>
                                <Text style={styles.featureText}>{feature}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.addToCartButton, addingToCart && styles.addToCartDisabled]}
                    onPress={handleAddToCart}
                    disabled={addingToCart}
                >
                    {addingToCart ? (
                        <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                        <>
                            <Ionicons name="cart" size={20} color="#FFF" style={styles.cartIcon} />
                            <Text style={styles.addToCartText}>Add to Cart</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backLink: {
        marginTop: 10,
        color: '#007AFF',
    },
    scrollContent: {
        paddingBottom: 100,
    },
    imageContainer: {
        width: width,
        backgroundColor: '#F0F0F0',
        paddingVertical: 20,
        alignItems: 'center',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    content: {
        padding: 24,
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 30, // Rounded corners for modern look
        borderTopRightRadius: 30,
        marginTop: -30,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1A1A1A',
        flex: 1,
        marginRight: 16,
    },
    price: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#007AFF',
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    ratingText: {
        marginLeft: 6,
        fontSize: 14,
        color: '#666',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1A1A1A',
        marginBottom: 12,
        marginTop: 12,
    },
    description: {
        fontSize: 16,
        color: '#666',
        lineHeight: 24,
    },
    features: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    featureChip: {
        backgroundColor: '#F5F7FA',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
        marginBottom: 8,
    },
    featureText: {
        fontSize: 14,
        color: '#4B5563',
        fontWeight: '500',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        padding: 24,
        paddingBottom: 34,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 10,
    },
    addToCartButton: {
        backgroundColor: '#007AFF',
        borderRadius: 16,
        paddingVertical: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cartIcon: {
        marginRight: 8,
    },
    addToCartText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    addToCartDisabled: {
        opacity: 0.7,
    },
    brandText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#999',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    priceBlock: {
        alignItems: 'flex-end',
    },
    mrpPrice: {
        fontSize: 14,
        color: '#999',
        textDecorationLine: 'line-through',
        marginTop: 2,
    },
    discountLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: '#FF3B30',
        marginTop: 2,
    },
    youEarnBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#34C75910',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
        marginBottom: 16,
    },
    youEarnText: {
        fontSize: 13,
        color: '#34C759',
        fontWeight: '600',
        marginLeft: 6,
    },
    sizeContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 8,
    },
    sizeChip: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#F5F7FA',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        marginBottom: 8,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    sizeChipSelected: {
        borderColor: '#007AFF',
        backgroundColor: '#007AFF10',
    },
    sizeChipText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4B5563',
    },
    sizeChipTextSelected: {
        color: '#007AFF',
    },
});

export default ProductDetailsScreen;
