import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

export interface BackendNotification {
    _id: string;
    title: string;
    message?: string;
    body?: string;
    type?: string;
    isRead: boolean;
    createdAt: string;
}

interface Props {
    item: BackendNotification;
    onMarkAsRead: (id: string) => void;
    onDelete: (id: string) => void;
}

const getIconForType = (type?: string) => {
    switch (type) {
        case 'ORDER_PLACED':
        case 'ORDER_STATUS_UPDATE':
        case 'order':
            return { name: 'cube', color: '#6C63FF' };
        case 'AREA_ORDER_RECEIVED':
            return { name: 'storefront', color: '#FF9500' };
        case 'REFERRAL_EARNING':
        case 'referral':
            return { name: 'people', color: '#FF6584' };
        case 'chat':
            return { name: 'chatbubble', color: '#32C766' };
        case 'TEST':
        case 'GENERAL':
        default:
            return { name: 'notifications', color: '#007AFF' };
    }
};

const NotificationCard = ({ item, onMarkAsRead, onDelete }: Props) => {
    const icon = getIconForType(item.type);

    return (
        <TouchableOpacity
            style={[styles.card, !item.isRead ? styles.unreadCard : styles.readCard]}
            onPress={() => onMarkAsRead(item._id)}
            activeOpacity={0.8}
        >
            {/* Icon + NEW badge */}
            <View style={[styles.iconWrapper, item.isRead && { opacity: 0.75 }]}>
                <View style={[styles.iconContainer, { backgroundColor: icon.color + '18' }]}>
                    <Ionicons name={icon.name} size={18} color={icon.color} />
                </View>
                {!item.isRead && (
                    <View style={styles.newBadge}>
                        <Text style={styles.newBadgeText}>NEW</Text>
                    </View>
                )}
            </View>

            {/* Text content */}
            <View style={styles.content}>
                {/* Title row with date top-right */}
                <View style={styles.titleRow}>
                    <Text
                        style={[styles.title, !item.isRead ? styles.unreadTitle : styles.readTitle]}
                        numberOfLines={1}
                    >
                        {item.title}
                    </Text>
                    <Text style={styles.time}>
                        {new Date(item.createdAt).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </Text>
                </View>

                {/* Body */}
                <Text style={styles.body}>
                    {item.body ?? item.message ?? 'No description'}
                </Text>
            </View>

            {/* Delete button */}
            <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => onDelete(item._id)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
                <Ionicons name="trash-outline" size={16} color="#FF3B30" />
            </TouchableOpacity>
        </TouchableOpacity>
    );
};

export default NotificationCard;

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        padding: 12,
        borderRadius: 12,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.09,
        shadowRadius: 4,
        elevation: 1,
    },
    unreadCard: {
        backgroundColor: '#FAFBFF',
        borderLeftWidth: 3,
        borderLeftColor: '#6C63FF',
    },
    readCard: {
        backgroundColor: '#F7F7F8',
        borderLeftWidth: 3,
        borderLeftColor: '#E0E0E0',
        opacity: 0.97,
    },

    iconWrapper: {
        position: 'relative',
        marginRight: 10,
    },
    iconContainer: {
        width: 38,
        height: 38,
        borderRadius: 19,
        justifyContent: 'center',
        alignItems: 'center',
    },
    newBadge: {
        position: 'absolute',
        top: -4,
        right: -6,
        backgroundColor: '#FF3B30',
        borderRadius: 8,
        paddingHorizontal: 5,
        paddingVertical: 2,
        borderWidth: 1.5,
        borderColor: '#FFF',
    },
    newBadgeText: {
        color: '#FFF',
        fontSize: 8,
        fontWeight: '800',
        letterSpacing: 0.5,
    },

    content: { flex: 1 },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 2,
    },
    title: {
        fontSize: 14,
        fontWeight: '600',
        color: '#555',
        flex: 1,
        marginRight: 8,
    },
    unreadTitle: { color: '#1A1A1A', fontWeight: '700' },
    readTitle: { color: '#AAAAAA', fontWeight: '400' },
    body: { fontSize: 12, color: '#999', lineHeight: 18, paddingTop: 2 },
    time: { fontSize: 10, color: '#999', flexShrink: 0 },

    deleteBtn: { padding: 4, marginLeft: 6 },
});
