import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface QuickActionProps {
    title: string;
    icon: string;
    color: string;
    onPress: () => void;
}

const QuickAction: React.FC<QuickActionProps> = ({ title, icon, color, onPress }) => (
    <TouchableOpacity style={styles.actionButton} onPress={onPress}>
        <View style={[styles.actionIcon, { backgroundColor: `${color}15` }]}>
            <Ionicons name={icon} size={24} color={color} />
        </View>
        <Text style={styles.actionText}>{title}</Text>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    actionButton: {
        width: '23%',
        alignItems: 'center',
    },
    actionIcon: {
        width: 56,
        height: 56,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    actionText: {
        fontSize: 12,
        color: '#333',
        textAlign: 'center',
        fontWeight: '500',
    },
});

export default QuickAction;
