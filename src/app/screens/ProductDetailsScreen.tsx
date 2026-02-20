import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Dimensions, SafeAreaView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';

import { useCart } from '../context/CartContext';
import analytics from '@react-native-firebase/analytics';
import ZoomGallery from '../components/ZoomGallery';

const { width } = Dimensions.get('window');

const ProductDetailsScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { addToCart } = useCart();
    const { product } = route.params as { product: any } || {};

    const handleAddToCart = async () => {
        const trackButtonPress = async () => {
            await analytics().logEvent('add_to_cart', {
                id: product?.id,
                item: product?.name,
                product_name: product?.name,
                size: 'large',
                timestamp: new Date().toISOString(),
            });
        };
        await trackButtonPress();
        if (product) {
            addToCart(product);
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
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.imageContainer}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                    </TouchableOpacity>
                    <ZoomGallery images={product.images || (product.imageUrl ? [product.imageUrl] : [])} />
                </View>

                <View style={styles.content}>
                    <View style={styles.headerRow}>
                        <Text style={styles.title}>{product.name}</Text>
                        <Text style={styles.price}>
                            {typeof product.price === 'number' ? `₹${product.price.toLocaleString()}` : product.price}
                        </Text>
                    </View>

                    <View style={styles.ratingContainer}>
                        <Ionicons name="star" size={16} color="#FFD700" />
                        <Text style={styles.ratingText}>{product.rating || 4.8} ({product.reviews || '120'} reviews)</Text>
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
                <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
                    <Ionicons name="cart" size={20} color="#FFF" style={styles.cartIcon} />
                    <Text style={styles.addToCartText}>Add to Cart</Text>
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
        position: 'relative',
        paddingTop: 80, // Space for back button
        paddingBottom: 20,
        alignItems: 'center',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    backButton: {
        position: 'absolute',
        top: 40, // Adjust for status bar
        left: 20,
        zIndex: 10,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
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
});

export default ProductDetailsScreen;
