import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    SafeAreaView,
    Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { loginUser } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import ScreenHeader from '../components/ScreenHeader';

const LoginScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation<any>();
    const { login } = useAuth();
    const { fcmToken, updateFCMTokenBackend } = useNotifications();

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            const response = await loginUser({ email, password });

            if (response.token) {
                // Store session and update context
                await login(response, response.token);

                // Update FCM token on backend after login
                if (fcmToken) {
                    await updateFCMTokenBackend(fcmToken);
                }
            } else {
                Alert.alert('Login Failed', 'No token received');
            }
        } catch (error: any) {
            console.error(error);
            Alert.alert('Login Failed', error.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const canGoBack = navigation.canGoBack();

    return (
        <SafeAreaView style={styles.safeArea}>

            <View style={styles.container}>
                <Text style={styles.title}>Welcome Back!</Text>

                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        placeholderTextColor="#888"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Password"
                        placeholderTextColor="#888"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />
                </View>

                <TouchableOpacity
                    style={styles.button}
                    onPress={handleLogin}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Login</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                    <Text style={styles.linkText}>Don't have an account? Sign Up</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 40,
        color: '#333',
        textAlign: 'center',
    },
    inputContainer: {
        marginBottom: 20,
    },
    input: {
        backgroundColor: '#f5f5f5',
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#eee',
        color: '#000',
    },
    button: {
        backgroundColor: '#007AFF',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 20,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    linkText: {
        color: '#007AFF',
        textAlign: 'center',
        fontSize: 16,
    },
});

export default LoginScreen;
