import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, Keyboard, TouchableWithoutFeedback, Modal, ScrollView } from 'react-native';
import notifee, { AndroidImportance } from '@notifee/react-native';
import { useNotifications } from '../context/NotificationContext';
import CustomInput from './CustomInput';
import CustomButton from './CustomButton';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface SendNotificationFormProps {
    visible: boolean;
    onClose: () => void;
}

const SendNotificationForm: React.FC<SendNotificationFormProps> = ({ visible, onClose }) => {
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const { fcmToken, addManualNotification } = useNotifications();

    const handleSendNotification = async () => {
        if (!title || !body) {
            Alert.alert('Error', 'Please enter both title and body');
            return;
        }

        try {
            await notifee.requestPermission();
            const channelId = await notifee.createChannel({
                id: 'sound_channel_final',
                name: 'Sound Channel Final',
                sound: 'custom_sound',
                importance: AndroidImportance.HIGH,
            });

            await notifee.displayNotification({
                title: title,
                body: body,
                android: {
                    channelId,
                    pressAction: { id: 'default' },
                },
            });

            addManualNotification(title, body);

            Alert.alert('Success', 'Notification Sent Locally!');
            // Optional: Don't clear fields so user can send multiple similar ones, or clear them.
            // setTitle('');
            // setBody('');
            Keyboard.dismiss();
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to send notification');
        }
    };

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.container}>
                    <View style={styles.headerRow}>
                        <Text style={styles.header}>Send Notification</Text>
                        <Ionicons name="close" size={28} color="#333" onPress={onClose} />
                    </View>

                    <ScrollView contentContainerStyle={styles.scrollContent}>
                        <View style={styles.card}>
                            <View style={styles.iconContainer}>
                                <Ionicons name="notifications-outline" size={40} color="#007AFF" />
                            </View>
                            <Text style={styles.cardTitle}>Local Test</Text>
                            <Text style={styles.cardSubtitle}>Trigger a notification on this device immediately.</Text>

                            <CustomInput
                                label="Title"
                                placeholder="Notification title"
                                value={title}
                                onChangeText={setTitle}
                            />
                            <CustomInput
                                label="Body"
                                placeholder="Notification message"
                                value={body}
                                onChangeText={setBody}
                                multiline
                            />
                            <CustomButton
                                title="Send Now"
                                onPress={handleSendNotification}
                                style={styles.buttonSpacing}
                            />
                        </View>

                        <View style={styles.infoContainer}>
                            <Text style={styles.infoText}>
                                Uses 'sound_channel_final' with 'custom_sound.mp3'.
                            </Text>
                            {fcmToken && (
                                <Text style={styles.tokenText}>FCM Token Active</Text>
                            )}
                        </View>
                    </ScrollView>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#FFF',
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1A1A1A',
    },
    scrollContent: {
        padding: 24,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
        marginBottom: 20,
    },
    iconContainer: {
        alignSelf: 'center',
        marginBottom: 16,
        padding: 16,
        backgroundColor: '#F0F9FF',
        borderRadius: 50,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 8,
    },
    cardSubtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 24,
    },
    buttonSpacing: {
        marginTop: 16,
    },
    infoContainer: {
        marginBottom: 30,
    },
    infoText: {
        fontSize: 13,
        color: '#718096',
        textAlign: 'center',
        marginBottom: 8,
    },
    tokenText: {
        fontSize: 12,
        color: '#38A169',
        textAlign: 'center',
        fontWeight: '600',
    }
});

export default SendNotificationForm;
