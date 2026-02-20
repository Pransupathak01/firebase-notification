import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableWithoutFeedback, Keyboard, ScrollView, Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomInput from './CustomInput';
import CustomButton from './CustomButton';

interface AddCustomerModalProps {
    visible: boolean;
    onClose: () => void;
    onAdd: (name: string, phone: string) => void;
}

const AddCustomerModal: React.FC<AddCustomerModalProps> = ({ visible, onClose, onAdd }) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');

    const handleAdd = () => {
        if (!name || !phone) {
            Alert.alert('Error', 'Please enter both name and phone number');
            return;
        }

        // Simple validation
        if (phone.length < 10) {
            Alert.alert('Error', 'Please enter a valid phone number');
            return;
        }

        onAdd(name, phone);
        setName('');
        setPhone('');
        onClose();
    };

    return (
        <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.modalOverlay}>
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View style={styles.modalContent}>
                            <View style={styles.headerRow}>
                                <Text style={styles.header}>Add New Customer</Text>
                                <Ionicons name="close" size={24} color="#333" onPress={onClose} />
                            </View>

                            <View style={styles.formContainer}>
                                <View style={styles.iconContainer}>
                                    <Ionicons name="person-add" size={40} color="#32C766" />
                                </View>

                                <CustomInput
                                    label="Customer Name"
                                    placeholder="Enter full name"
                                    value={name}
                                    onChangeText={setName}
                                />

                                <CustomInput
                                    label="Phone Number"
                                    placeholder="Enter mobile number"
                                    value={phone}
                                    onChangeText={setPhone}
                                    keyboardType="phone-pad"
                                />

                                <CustomButton
                                    title="Add Customer"
                                    onPress={handleAdd}
                                    style={[styles.addButton, { backgroundColor: '#32C766' }]}
                                />
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 20,
        maxHeight: '80%',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    header: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1A1A1A',
    },
    formContainer: {
        padding: 24,
    },
    iconContainer: {
        alignSelf: 'center',
        marginBottom: 20,
        padding: 16,
        backgroundColor: '#E6F9EE',
        borderRadius: 50,
    },
    addButton: {
        marginTop: 16,
    }
});

export default AddCustomerModal;
