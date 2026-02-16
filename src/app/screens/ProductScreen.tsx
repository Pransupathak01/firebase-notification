import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigations/AppNavigator';
import Ionicons from 'react-native-vector-icons/Ionicons';
import productsData from '../../data/products.json';

// Import Reusable Component
import ProductCard from '../components/ProductCard';

const COLUMN_COUNT = 2;
const SPACING = 12;
const HALF_SPACING = SPACING / 2;

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
                renderItem={({ item }) => <ProductCard item={item} />}
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
        paddingTop: 10,
        paddingBottom: 16,
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
        paddingBottom: SPACING,
    },
});

export default ProductScreen;
