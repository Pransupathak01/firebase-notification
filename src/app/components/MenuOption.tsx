import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface MenuOptionProps {
    icon: string;
    title: string;
    subtitle?: string;
    onPress: () => void;
    showChevron?: boolean;
    color?: string;
}

const MenuOption: React.FC<MenuOptionProps> = ({ icon, title, subtitle, onPress, showChevron = true, color = '#666' }) => (
    <TouchableOpacity style={styles.menuOption} onPress={onPress} activeOpacity={0.7}>
        <View style={[styles.menuIconContainer, { backgroundColor: `${color}15` }]}>
            <Ionicons name={icon} size={22} color={color} />
        </View>
        <View style={styles.menuTextContainer}>
            <Text style={styles.menuTitle}>{title}</Text>
            {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
        </View>
        {showChevron && <Ionicons name="chevron-forward" size={20} color="#CCC" />}
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    menuOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
    },
    menuIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    menuTextContainer: {
        flex: 1,
    },
    menuTitle: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    menuSubtitle: {
        fontSize: 12,
        color: '#999',
        marginTop: 2,
    },
});

export default MenuOption;
