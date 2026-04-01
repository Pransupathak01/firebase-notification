import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import ScreenHeader from '../components/ScreenHeader';

const OTP_LENGTH = 6;

const DeveloperScreen = () => {
    const [step, setStep] = useState<'phone' | 'otp'>('phone');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
    const [loading, setLoading] = useState(false);
    const [verificationId, setVerificationId] = useState<string | null>(null);
    const [resendToken, setResendToken] = useState<number | undefined>(undefined);

    const otpInputs = useRef<(TextInput | null)[]>([]);

    const handleSendOtp = async () => {
        if (phone.length < 10) {
            Alert.alert('Error', 'Please enter a valid 10-digit mobile number');
            return;
        }

        setLoading(true);
        const fullPhone = `+91${phone}`;

        try {
            auth().verifyPhoneNumber(fullPhone, resendToken as any)
                .on('state_changed', (snapshot) => {
                    if (snapshot.state === auth.PhoneAuthState.CODE_SENT) {
                        setVerificationId(snapshot.verificationId);
                        setResendToken((snapshot as any).forceResendingToken);
                        setStep('otp');
                        setLoading(false);
                    } else if (snapshot.state === auth.PhoneAuthState.AUTO_VERIFIED) {
                        // AUTO FILL Logic
                        if (snapshot.code) {
                            const codeArray = snapshot.code.split('');
                            setOtp(codeArray);
                            // Auto verify if possible
                            handleVerifyOtp(snapshot.code, snapshot.verificationId);
                        }
                    } else if (snapshot.state === auth.PhoneAuthState.ERROR) {
                        setLoading(false);
                        Alert.alert('Error', snapshot.error?.message || 'Verification failed');
                    }
                });
        } catch (error: any) {
            setLoading(false);
            Alert.alert('Error', error.message);
        }
    };

    const handleVerifyOtp = async (manualCode?: string, vId?: string | null) => {
        const code = manualCode || otp.join('');
        const id = vId || verificationId;

        if (code.length < OTP_LENGTH) {
            Alert.alert('Error', 'Please enter a 6-digit OTP');
            return;
        }

        if (!id) {
            Alert.alert('Error', 'Session expired. Please request a new OTP.');
            return;
        }

        setLoading(true);
        try {
            const credential = auth.PhoneAuthProvider.credential(id, code);
            await auth().signInWithCredential(credential);
            Alert.alert('Success', 'Phone number verified!');
            setLoading(false);
        } catch (error: any) {
            setLoading(false);
            Alert.alert('Error', 'Invalid OTP. Please try again.');
        }
    };

    const onOtpChange = (value: string, index: number) => {
        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);

        if (value && index < OTP_LENGTH - 1) {
            otpInputs.current[index + 1]?.focus();
        }
    };

    const onOtpKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
            otpInputs.current[index - 1]?.focus();
        }
    };

    return (
        <View style={styles.container}>
            <ScreenHeader title="OTP Verification" showBackButton />

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                    {step === 'phone' ? (
                        <View style={styles.section}>
                            <Text style={styles.label}>Enter Mobile Number</Text>
                            <View style={styles.phoneInputContainer}>
                                <Text style={styles.countryCode}>🇮🇳 +91</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="88888 88888"
                                    placeholderTextColor="#666"
                                    keyboardType="phone-pad"
                                    maxLength={10}
                                    value={phone}
                                    onChangeText={setPhone}
                                    autoFocus
                                />
                            </View>

                            <TouchableOpacity
                                style={[styles.button, (!phone || loading) && styles.disabledButton]}
                                onPress={handleSendOtp}
                                disabled={!phone || loading}
                            >
                                {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Send OTP</Text>}
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.section}>
                            <Text style={styles.label}>Enter 6-Digit OTP</Text>
                            <Text style={styles.subLabel}>Sent to +91 {phone}</Text>

                            <View style={styles.otpContainer}>
                                {otp.map((digit, i) => (
                                    <TextInput
                                        key={i}
                                        ref={(ref) => {
                                            otpInputs.current[i] = ref;
                                            return undefined;
                                        }}
                                        style={[styles.otpInput, digit !== '' && styles.otpInputActive]}
                                        keyboardType="number-pad"
                                        maxLength={1}
                                        value={digit}
                                        onChangeText={(v) => onOtpChange(v, i)}
                                        onKeyPress={(e) => onOtpKeyPress(e, i)}
                                    />
                                ))}
                            </View>

                            <TouchableOpacity
                                style={[styles.button, (otp.includes('') || loading) && styles.disabledButton]}
                                onPress={() => handleVerifyOtp()}
                                disabled={otp.includes('') || loading}
                            >
                                {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Verify & Continue</Text>}
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.resendButton} onPress={handleSendOtp}>
                                <Text style={styles.resendText}>Resend OTP</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F0F14',
    },
    content: {
        padding: 24,
        flexGrow: 1,
        justifyContent: 'center',
    },
    section: {
        backgroundColor: '#1A1A24',
        padding: 24,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#2A2A3A',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    label: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 8,
    },
    subLabel: {
        color: '#888',
        fontSize: 14,
        marginBottom: 24,
    },
    phoneInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#12121A',
        borderRadius: 12,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: '#2A2A3A',
        marginBottom: 24,
    },
    countryCode: {
        color: '#FFF',
        fontWeight: '600',
        marginRight: 10,
    },
    input: {
        flex: 1,
        height: 56,
        color: '#FFF',
        fontSize: 18,
        fontWeight: '600',
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    otpInput: {
        width: 45,
        height: 56,
        backgroundColor: '#12121A',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#2A2A3A',
        color: '#FFF',
        fontSize: 24,
        fontWeight: '700',
        textAlign: 'center',
    },
    otpInputActive: {
        borderColor: '#8B5CF6',
        backgroundColor: '#8B5CF610',
    },
    button: {
        backgroundColor: '#8B5CF6',
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#8B5CF6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    disabledButton: {
        backgroundColor: '#8B5CF640',
    },
    buttonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },
    resendButton: {
        marginTop: 20,
        alignItems: 'center',
    },
    resendText: {
        color: '#8B5CF6',
        fontWeight: '600',
    },
});

export default DeveloperScreen;





