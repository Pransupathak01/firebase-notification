import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

interface PincodeDisplayProps {
    pincode: string | null;
    address: string | null;
    loading?: boolean;
}

const PincodeDisplay = ({ pincode, address, loading }: PincodeDisplayProps) => {
    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="small" color="#007AFF" />
                <Text style={styles.loadingText}>Fetching address...</Text>
            </View>
        );
    }

    if (!pincode && !address) return null;

    return (
        <View style={styles.container}>
            {pincode && (
                <Text style={styles.pincodeLabel}>
                    Pincode: <Text style={styles.pincodeValue}>{pincode}</Text>
                </Text>
            )}
            {address && (
                <Text style={styles.addressText} numberOfLines={1}>
                    {address}
                </Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 10,
        backgroundColor: '#f8f9fa',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        alignItems: 'center',
        minHeight: 50,
        justifyContent: 'center',
    },
    pincodeLabel: {
        fontSize: 16,
        color: '#555',
    },
    pincodeValue: {
        fontWeight: 'bold',
        color: '#007AFF',
        fontSize: 18,
    },
    addressText: {
        fontSize: 12,
        color: '#888',
        marginTop: 4,
    },
    loadingText: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    }
});

export default PincodeDisplay;
