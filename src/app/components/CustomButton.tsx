import React from 'react';
import { TouchableOpacity, Text, StyleSheet, TouchableOpacityProps, ActivityIndicator } from 'react-native';

interface CustomButtonProps extends TouchableOpacityProps {
    title: string;
    loading?: boolean;
}

const CustomButton: React.FC<CustomButtonProps> = ({ title, loading, style, disabled, ...props }) => {
    return (
        <TouchableOpacity
            style={[styles.button, disabled && styles.disabled, style]}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <ActivityIndicator color="#FFFFFF" />
            ) : (
                <Text style={styles.buttonText}>{title}</Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        backgroundColor: '#007AFF',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    disabled: {
        backgroundColor: '#A0AEC0',
        shadowOpacity: 0.1,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
});

export default CustomButton;
