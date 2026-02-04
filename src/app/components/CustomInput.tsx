import React from 'react';
import { TextInput, Text, View, StyleSheet, TextInputProps } from 'react-native';

interface CustomInputProps extends TextInputProps {
    label: string;
}

const CustomInput: React.FC<CustomInputProps> = ({ label, style, ...props }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
                style={[styles.input, style]}
                placeholderTextColor="#999"
                {...props}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4A5568',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#F7FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 10,
        padding: 12,
        fontSize: 16,
        color: '#2D3748',
    },
});

export default CustomInput;
