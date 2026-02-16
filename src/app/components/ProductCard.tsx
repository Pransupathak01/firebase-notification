import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Share } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// You might want to move this to a types file
export interface Product {
    id: string;
    name: string;
    price: string;
    images: string[];
}

interface ProductCardProps {
    item: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ item }) => {
    const [imageError, setImageError] = useState(false);
    const navigation = useNavigation<any>();

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Check out this amazing product: ${item.name} for only ${item.price}! Buy here: https://mystore.com/ref/RAJESH2024/p/${item.id}`,
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
                        source={imageError ? { uri: 'https://via.placeholder.com/150' } : { uri: item.images[0] }}
                        style={styles.image}
                        resizeMode="cover"
                        onError={() => setImageError(true)}
                    />
                    <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
                        <Ionicons name="share-social" size={20} color="#FFF" />
                    </TouchableOpacity>
                </View>
                <View style={styles.details}>
                    <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
                    <View style={styles.priceRow}>
                        <Text style={styles.price}>{item.price}</Text>
                        <Text style={styles.earnings}>Earn ₹50</Text>
                    </View>
                </View>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    itemWrapper: {
        flex: 1,
        padding: 6, // HALF_SPACING (12/2)
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
        height: 250,
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
    price: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1A1A1A',
    },
    earnings: {
        fontSize: 12,
        color: '#32C766',
        fontWeight: 'bold',
        backgroundColor: '#E6F9EC',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
});

export default ProductCard;
