import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions, TouchableOpacity } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigations/AppNavigator';
import Ionicons from 'react-native-vector-icons/Ionicons';
import productsData from '../../data/products.json';

const COLUMN_COUNT = 2;
const SPACING = 12;
const HALF_SPACING = SPACING / 2;

// Define the Product interface matching the JSON data
interface Product {
    id: string;
    name: string;
    price: string;
    image: string;
}

const ProductItem = ({ item }: { item: Product }) => {
    const [imageError, setImageError] = React.useState(false);

    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    return (
        <View style={styles.itemWrapper}>
            <TouchableOpacity
                style={styles.card}
                activeOpacity={0.9}
                onPress={() => navigation.navigate('ProductDetails', { product: item })}
            >
                <View style={[styles.imageContainer, imageError && styles.errorImageContainer]}>
                    <Image
                        source={imageError ? { uri: 'https://via.placeholder.com/150' } : { uri: item.image }}
                        style={styles.image}
                        resizeMode="cover"
                        onError={() => setImageError(true)}
                    />
                </View>
                <View style={styles.details}>
                    <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
                    <Text style={styles.price}>{item.price}</Text>
                </View>
            </TouchableOpacity>
        </View>
    );
};

const ProductScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Products</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Cart')}>
                    <Ionicons name="cart-outline" size={28} color="#1A1A1A" />
                </TouchableOpacity>
            </View>
            <FlashList
                data={productsData}
                renderItem={({ item }) => <ProductItem item={item} />}
                estimatedItemSize={240}
                numColumns={COLUMN_COUNT}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 60, // approximate for status bar
        paddingBottom: 24,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1A1A1A',
    },
    listContent: {
        paddingHorizontal: HALF_SPACING,
        paddingTop: SPACING,
        paddingBottom: SPACING, // Add bottom padding for better scroll feel
    },
    itemWrapper: {
        flex: 1,
        padding: HALF_SPACING, // Creates the gap between items
        maxWidth: '100%', // Ensure it doesn't overflow
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        height: 250,
    },
    imageContainer: {
        height: 150,
        backgroundColor: '#F0F0F0',
    },
    image: {
        width: '100%',
        height: '100%',
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
    price: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#007AFF', // Brand color
    },
    errorImageContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#E5E7EB',
    },
});

export default ProductScreen;
