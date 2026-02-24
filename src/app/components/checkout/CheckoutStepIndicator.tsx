import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface CheckoutStepIndicatorProps {
    currentStep: number;
}

const CheckoutStepIndicator: React.FC<CheckoutStepIndicatorProps> = ({ currentStep }) => {
    return (
        <View style={styles.stepIndicator}>
            <View style={styles.stepItem}>
                <View style={[styles.stepCircle, currentStep >= 1 && styles.stepCircleActive]}>
                    <Text style={[styles.stepNumber, currentStep >= 1 && styles.stepNumberActive]}>1</Text>
                </View>
                <Text style={[styles.stepLabel, currentStep >= 1 && styles.stepLabelActive]}>Cart</Text>
            </View>
            <View style={[styles.stepLine, currentStep >= 2 && styles.stepLineActive]} />
            <View style={styles.stepItem}>
                <View style={[styles.stepCircle, currentStep >= 2 && styles.stepCircleActive]}>
                    <Text style={[styles.stepNumber, currentStep >= 2 && styles.stepNumberActive]}>2</Text>
                </View>
                <Text style={[styles.stepLabel, currentStep >= 2 && styles.stepLabelActive]}>Address</Text>
            </View>
            <View style={[styles.stepLine, currentStep >= 3 && styles.stepLineActive]} />
            <View style={styles.stepItem}>
                <View style={[styles.stepCircle, currentStep >= 3 && styles.stepCircleActive]}>
                    <Text style={[styles.stepNumber, currentStep >= 3 && styles.stepNumberActive]}>3</Text>
                </View>
                <Text style={[styles.stepLabel, currentStep >= 3 && styles.stepLabelActive]}>Checkout</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    stepIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
        paddingHorizontal: 10,
    },
    stepItem: {
        alignItems: 'center',
    },
    stepCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#E5E7EB',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
    },
    stepCircleActive: {
        backgroundColor: '#007AFF',
    },
    stepNumber: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#6B7280',
    },
    stepNumberActive: {
        color: '#FFFFFF',
    },
    stepLabel: {
        fontSize: 10,
        color: '#6B7280',
        fontWeight: '600',
    },
    stepLabelActive: {
        color: '#007AFF',
    },
    stepLine: {
        flex: 1,
        height: 2,
        backgroundColor: '#E5E7EB',
        marginHorizontal: 8,
        marginTop: -12,
    },
    stepLineActive: {
        backgroundColor: '#007AFF',
    },
});

export default CheckoutStepIndicator;
