import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Address } from '../../services/addressService';
import CheckoutStepIndicator from './CheckoutStepIndicator';

interface AddressSelectionStepProps {
    currentStep: number;
    addresses: Address[];
    selectedAddress: Address | null;
    showAddressForm: boolean;
    newAddress: any;
    onSelectAddress: (address: Address) => void;
    onShowForm: (show: boolean) => void;
    onUpdateNewAddress: (updated: any) => void;
    onSaveAddress: () => void;
    onNext: () => void;
}

const AddressSelectionStep: React.FC<AddressSelectionStepProps> = ({
    currentStep,
    addresses,
    selectedAddress,
    showAddressForm,
    newAddress,
    onSelectAddress,
    onShowForm,
    onUpdateNewAddress,
    onSaveAddress,
    onNext
}) => {
    return (
        <ScrollView contentContainerStyle={styles.scrollContent}>
            <CheckoutStepIndicator currentStep={currentStep} />
            {showAddressForm ? (
                <View style={styles.formContainer}>
                    <View style={styles.formHeader}>
                        <Text style={styles.sectionTitle}>Add New Address</Text>
                        <TouchableOpacity onPress={() => onShowForm(false)}>
                            <Ionicons name="close" size={24} color="#1A1A1A" />
                        </TouchableOpacity>
                    </View>

                    <TextInput
                        style={styles.input}
                        placeholder="Full Name"
                        value={newAddress.name}
                        onChangeText={(text) => onUpdateNewAddress({ ...newAddress, name: text })}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Phone Number"
                        keyboardType="phone-pad"
                        value={newAddress.phone}
                        onChangeText={(text) => onUpdateNewAddress({ ...newAddress, phone: text })}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Street / Apartment / House No."
                        value={newAddress.street}
                        onChangeText={(text) => onUpdateNewAddress({ ...newAddress, street: text })}
                    />
                    <View style={styles.inputRow}>
                        <TextInput
                            style={[styles.input, { flex: 1, marginRight: 8 }]}
                            placeholder="City"
                            value={newAddress.city}
                            onChangeText={(text) => onUpdateNewAddress({ ...newAddress, city: text })}
                        />
                        <TextInput
                            style={[styles.input, { flex: 1 }]}
                            placeholder="Pincode"
                            keyboardType="number-pad"
                            value={newAddress.zipCode}
                            onChangeText={(text) => onUpdateNewAddress({ ...newAddress, zipCode: text })}
                        />
                    </View>
                    <TextInput
                        style={styles.input}
                        placeholder="State"
                        value={newAddress.state}
                        onChangeText={(text) => onUpdateNewAddress({ ...newAddress, state: text })}
                    />

                    <Text style={[styles.summaryLabel, { marginBottom: 8, marginTop: 4 }]}>Address Type</Text>
                    <View style={styles.typeContainer}>
                        {(['Home', 'Work', 'Other'] as const).map((type) => (
                            <TouchableOpacity
                                key={type}
                                style={[
                                    styles.typeButton,
                                    newAddress.type === type && styles.typeButtonActive
                                ]}
                                onPress={() => onUpdateNewAddress({ ...newAddress, type })}
                            >
                                <Text style={[
                                    styles.typeButtonText,
                                    newAddress.type === type && styles.typeButtonTextActive
                                ]}>{type}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <TouchableOpacity style={styles.saveButton} onPress={onSaveAddress}>
                        <Text style={styles.saveButtonText}>Save Address</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <>
                    <Text style={styles.sectionTitle}>Select Delivery Address</Text>
                    {addresses.map((addr) => (
                        <TouchableOpacity
                            key={addr.id}
                            style={[
                                styles.addressCard,
                                selectedAddress?.id === addr.id && styles.addressCardSelected
                            ]}
                            onPress={() => onSelectAddress(addr)}
                        >
                            <View style={styles.addressHeader}>
                                <Text style={styles.addressName}>{addr.name}</Text>
                                <View style={styles.addressTypeBadge}>
                                    <Text style={styles.addressTypeText}>{addr.type}</Text>
                                </View>
                            </View>
                            <Text style={styles.addressText}>{addr.street}</Text>
                            <Text style={styles.addressText}>{addr.city}, {addr.state} - {addr.zipCode}</Text>
                            <Text style={styles.addressPhone}>Phone: {addr.phone}</Text>

                            <View style={styles.radioContainer}>
                                <View style={[styles.radioOuter, selectedAddress?.id === addr.id && styles.radioOuterActive]}>
                                    {selectedAddress?.id === addr.id && <View style={styles.radioInner} />}
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}

                    <TouchableOpacity style={styles.addAddressButton} onPress={() => onShowForm(true)}>
                        <Ionicons name="add" size={20} color="#007AFF" />
                        <Text style={styles.addAddressText}>Add New Address</Text>
                    </TouchableOpacity>

                    <View style={styles.stepActions}>
                        <TouchableOpacity style={styles.nextStepButton} onPress={onNext}>
                            <Text style={styles.nextStepText}>Continue</Text>
                        </TouchableOpacity>
                    </View>
                </>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scrollContent: {
        padding: 16,
        paddingBottom: 40,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginBottom: 16,
    },
    formContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
    },
    formHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    input: {
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        padding: 14,
        marginBottom: 12,
        fontSize: 15,
        color: '#1A1A1A',
    },
    inputRow: {
        flexDirection: 'row',
        marginBottom: 0,
    },
    summaryLabel: {
        fontSize: 14,
        color: '#6B7280',
    },
    typeContainer: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    typeButton: {
        flex: 1,
        paddingVertical: 10,
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        marginRight: 8,
        alignItems: 'center',
    },
    typeButtonActive: {
        backgroundColor: '#007AFF',
    },
    typeButtonText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#6B7280',
    },
    typeButtonTextActive: {
        color: '#FFFFFF',
    },
    saveButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    addressCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 2,
        borderColor: 'transparent',
        position: 'relative',
    },
    addressCardSelected: {
        borderColor: '#007AFF',
        backgroundColor: '#F0F7FF',
    },
    addressHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        paddingRight: 32,
    },
    addressName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1A1A1A',
    },
    addressTypeBadge: {
        backgroundColor: '#E5E7EB',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        marginLeft: 8,
    },
    addressTypeText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#4B5563',
    },
    addressText: {
        fontSize: 14,
        color: '#4B5563',
        marginBottom: 2,
    },
    addressPhone: {
        fontSize: 14,
        color: '#4B5563',
        marginTop: 6,
        fontWeight: '500',
    },
    radioContainer: {
        position: 'absolute',
        top: 16,
        right: 16,
    },
    radioOuter: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#D1D5DB',
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioOuterActive: {
        borderColor: '#007AFF',
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#007AFF',
    },
    addAddressButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderWidth: 1,
        borderColor: '#007AFF',
        borderStyle: 'dashed',
        borderRadius: 16,
        marginTop: 8,
        marginBottom: 24,
    },
    addAddressText: {
        marginLeft: 8,
        fontSize: 15,
        fontWeight: '600',
        color: '#007AFF',
    },
    stepActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    nextStepButton: {
        paddingVertical: 16,
        borderRadius: 16,
        backgroundColor: '#007AFF',
        alignItems: 'center',
        width: '100%',
    },
    nextStepText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
});

export default AddressSelectionStep;
