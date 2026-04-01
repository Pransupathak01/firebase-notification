import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Share } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Updated interface to match API response
export interface Product {
    id: string;
    name: string;
    brand?: string;
    mrp?: number;
    price: number | string;
    discount?: number;
    savings?: number;
    youEarn?: number;
    rating?: number;
    imageUrl?: string;
    images?: string[];
    stock?: number;
}

interface ProductCardProps {
    item: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ item }) => {
    const [imageError, setImageError] = useState(false);
    const navigation = useNavigation<any>();
    const { t } = useTranslation();

    // Get display image: prefer imageUrl from API, fallback to images array
    const displayImage = item.imageUrl || (item.images && item.images.length > 0 ? item.images[0] : null);

    // Format price for display
    const formatPrice = (val: number | string) => {
        if (typeof val === 'string') return val;
        return `₹${val.toLocaleString()}`;
    };

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Check out ${item.name} for only ${formatPrice(item.price)}! Buy here: https://mystore.com/ref/RAJESH2024/p/${item.id}`,
            });
        } catch (error: any) {
            console.log(error.message);
        }
    };

    return (
        <View style={styles.itemWrapper}>
            <TouchableOpacity
                style={styles.card}
                activeOpacity={0.9}
                onPress={() => navigation.navigate('ProductDetails', { product: item })}
            >
                <View style={[styles.imageContainer, imageError && styles.errorImageContainer]}>
                    <Image
                        source={imageError || !displayImage ? { uri: 'https://via.placeholder.com/150' } : { uri: displayImage }}
                        style={styles.image}
                        resizeMode="cover"
                        onError={() => setImageError(true)}
                    />
                    {item.discount && item.discount > 0 ? (
                        <View style={styles.discountBadge}>
                            <Text style={styles.discountText}>{item.discount}% {t('off')}</Text>
                        </View>
                    ) : null}
                    <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
                        <Ionicons name="share-social" size={20} color="#FFF" />
                    </TouchableOpacity>
                </View>
                <View style={styles.details}>
                    <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
                    <View style={styles.priceRow}>
                        <View style={styles.priceContainer}>
                            <Text style={styles.price}>{formatPrice(item.price)}</Text>
                            {item.mrp && item.mrp > Number(item.price) ? (
                                <Text style={styles.mrp}>₹{item.mrp.toLocaleString()}</Text>
                            ) : null}
                        </View>
                        <Text style={styles.earnings}>
                            {t('earn')} {formatPrice(item.youEarn || 0)}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    itemWrapper: {
        flex: 1,
        padding: 6,
        maxWidth: '100%',
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        height: 270,
    },
    imageContainer: {
        height: 150,
        backgroundColor: '#F0F0F0',
        position: 'relative',
    },
    errorImageContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#E5E7EB',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    discountBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        backgroundColor: '#FF3B30',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    discountText: {
        color: '#FFF',
        fontSize: 11,
        fontWeight: 'bold',
    },
    shareButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(0,0,0,0.5)',
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    details: {
        padding: 12,
        flex: 1,
        justifyContent: 'space-between',
    },
    name: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 4,
        lineHeight: 20,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    price: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1A1A1A',
    },
    mrp: {
        fontSize: 12,
        color: '#999',
        textDecorationLine: 'line-through',
    },
    earnings: {
        fontSize: 11,
        color: '#32C766',
        fontWeight: 'bold',
        backgroundColor: '#E6F9EC',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
});

export default ProductCard;

