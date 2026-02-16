import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48 - 16) / 2; // 48 padding, 16 gap

interface DashboardCardProps {
    title: string;
    value?: string;
    icon: string;
    color: string;
    onPress: () => void;
    badge?: string;
    subtext?: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, icon, color, onPress, badge, subtext }) => {
    return (
        <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
            <View style={styles.cardHeader}>
                <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
                    <Ionicons name={icon} size={24} color={color} />
                </View>
                {badge && (
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{badge}</Text>
                    </View>
                )}
            </View>
            {value && <Text style={styles.cardValue}>{value}</Text>}
            <Text style={styles.cardTitle}>{title}</Text>
            {subtext && <Text style={styles.cardSubtext}>{subtext}</Text>}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        width: CARD_WIDTH,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badge: {
        backgroundColor: '#FF3B30',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    badgeText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: 'bold',
    },
    cardValue: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginBottom: 4,
    },
    cardTitle: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    cardSubtext: {
        fontSize: 12,
        color: '#888',
        marginTop: 4,
    },
});

export default DashboardCard;
