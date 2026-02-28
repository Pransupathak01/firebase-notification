import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert, TextInput, ScrollView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ScreenHeader from '../components/ScreenHeader';
import { getUserProfile, updateBankDetails, getBankDetails } from '../services/authService';

const DetailItem = ({ label, value, icon, field, editing, formData, setFormData, error }: any) => (
    <View style={styles.detailItemContainer}>
        <View style={styles.detailItem}>
            <View style={styles.iconContainer}>
                <Ionicons name={icon} size={20} color="#6C63FF" />
            </View>
            <View style={styles.textContainer}>
                <Text style={styles.label}>{label}</Text>
                {editing ? (
                    <TextInput
                        style={[styles.input, error && styles.inputError]}
                        value={formData[field]}
                        onChangeText={(text) => setFormData({ ...formData, [field]: text })}
                        placeholder={`Enter ${label}`}
                        placeholderTextColor="#AAA"
                        autoCapitalize={field === 'ifscCode' ? 'characters' : 'words'}
                    />
                ) : (
                    <Text style={styles.value}>{value || 'Not provided'}</Text>
                )}
            </View>
        </View>
        {editing && error && <Text style={styles.errorText}>{error}</Text>}
    </View>
);

const BankDetailsScreen = () => {
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [profile, setProfile] = useState<any>(null);
    const [formData, setFormData] = useState<any>({
        bankName: '',
        accountNumber: '',
        ifscCode: '',
        accountHolderName: '',
    });
    const [errors, setErrors] = useState<any>({});

    useEffect(() => {
        fetchBankDetails();
    }, []);

    const fetchBankDetails = async () => {
        try {
            const response = await getBankDetails();
            const data = response.data || {};
            setProfile(data); // keeping setProfile for context if needed
            setFormData({
                bankName: data.bankName || '',
                accountNumber: data.accountNumber || '',
                ifscCode: data.ifscCode || '',
                accountHolderName: data.accountHolderName || '',
            });
        } catch (error) {
            console.error('Failed to fetch bank details:', error);
        } finally {
            setLoading(false);
        }
    };

    const validate = () => {
        let newErrors: any = {};

        if (!formData.accountHolderName || formData.accountHolderName.trim().length < 3) {
            newErrors.accountHolderName = "Name must be at least 3 characters";
        }

        if (!formData.bankName || formData.bankName.trim() === "") {
            newErrors.bankName = "Bank name is required";
        }

        if (!formData.accountNumber || !/^\d{9,18}$/.test(formData.accountNumber)) {
            newErrors.accountNumber = "Enter a valid 9-18 digit account number";
        }

        if (!formData.ifscCode || !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifscCode.toUpperCase())) {
            newErrors.ifscCode = "Invalid IFSC format (e.g. HDFC0001234)";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) return;

        setLoading(true);
        try {
            const response = await updateBankDetails(formData);
            if (response.success) {
                setEditing(false);
                Alert.alert("Success", "Bank details updated successfully!");
            }
        } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to update bank details");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6C63FF" />
            </View>
        );
    }


    return (
        <SafeAreaView style={styles.container}>
            <ScreenHeader title="Bank A/C Details" showBackButton={true} />
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="business-outline" size={28} color="#6C63FF" />
                        <Text style={styles.cardTitle}>Payout Account Info</Text>
                    </View>
                    <Text style={styles.cardSubtitle}>
                        Your earnings will be credited to this bank account upon withdrawal request.
                    </Text>

                    <View style={styles.divider} />

                    <DetailItem label="Account Holder Name" value={formData.accountHolderName} icon="person-outline" field="accountHolderName" editing={editing} formData={formData} setFormData={setFormData} error={errors.accountHolderName} />
                    <DetailItem label="Bank Name" value={formData.bankName} icon="business-outline" field="bankName" editing={editing} formData={formData} setFormData={setFormData} error={errors.bankName} />
                    <DetailItem label="Account Number" value={formData.accountNumber} icon="card-outline" field="accountNumber" editing={editing} formData={formData} setFormData={setFormData} error={errors.accountNumber} />
                    <DetailItem label="IFSC Code" value={formData.ifscCode} icon="barcode-outline" field="ifscCode" editing={editing} formData={formData} setFormData={setFormData} error={errors.ifscCode} />

                    <TouchableOpacity
                        style={[styles.btn, editing ? styles.saveBtn : styles.editBtn]}
                        onPress={editing ? handleSave : () => setEditing(true)}
                    >
                        <Ionicons name={editing ? "checkmark" : "create-outline"} size={20} color="#FFF" />
                        <Text style={styles.btnText}>{editing ? "Save Details" : "Edit Details"}</Text>
                    </TouchableOpacity>

                    {editing && (
                        <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditing(false)}>
                            <Text style={styles.cancelBtnText}>Cancel</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Info Card */}
                <View style={[styles.card, styles.infoCard]}>
                    <Ionicons name="shield-checkmark-outline" size={24} color="#32C766" />
                    <Text style={styles.infoText}>
                        Your bank information is encrypted and securely stored. We never share your banking details.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        padding: 16,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 24,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        marginBottom: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginLeft: 12,
    },
    cardSubtitle: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        marginBottom: 20,
    },
    divider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginBottom: 20,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: 'rgba(108, 99, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    textContainer: {
        flex: 1,
    },
    label: {
        fontSize: 12,
        color: '#888',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    value: {
        fontSize: 16,
        color: '#1A1A1A',
        fontWeight: '600',
        marginTop: 4,
    },
    input: {
        fontSize: 16,
        color: '#1A1A1A',
        fontWeight: '600',
        marginTop: 4,
        padding: 4,
        borderBottomWidth: 1,
        borderBottomColor: '#6C63FF',
    },
    inputError: {
        borderBottomColor: '#FF3B30',
    },
    errorText: {
        color: '#FF3B30',
        fontSize: 10,
        marginLeft: 60,
        marginTop: -16,
        marginBottom: 8,
    },
    detailItemContainer: {
        marginBottom: 16,
    },
    editBtn: {
        backgroundColor: '#6C63FF',
    },
    saveBtn: {
        backgroundColor: '#32C766',
    },
    btn: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 14,
        borderRadius: 16,
        marginTop: 10,
    },
    btnText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    cancelBtn: {
        alignItems: 'center',
        marginTop: 16,
    },
    cancelBtnText: {
        color: '#FF3B30',
        fontSize: 14,
        fontWeight: '600',
    },
    infoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: 'rgba(50, 199, 102, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(50, 199, 102, 0.1)',
        elevation: 0,
        shadowOpacity: 0,
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        color: '#444',
        marginLeft: 12,
        lineHeight: 18,
    },
});

export default BankDetailsScreen;
