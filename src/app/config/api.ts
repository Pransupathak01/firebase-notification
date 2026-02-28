import { Platform } from 'react-native';
import { API_URL, SOCKET_URL, RAZORPAY_KEY_ID } from '@env';

// Fallback logic in case .env doesn't load for some reason (e.g. clean build needed)
const DEFAULT_ANDROID_HOST = 'http://192.168.2.222:5000';
const DEFAULT_IOS_HOST = 'http://192.168.2.222:5000';
const DEFAULT_HOST = Platform.OS === 'android' ? DEFAULT_ANDROID_HOST : DEFAULT_IOS_HOST;

console.log('AppConfig Loaded:', {
    API_URL: API_URL || `${DEFAULT_HOST}/api`,
    SOCKET_URL: SOCKET_URL || DEFAULT_HOST,
});

export const AppConfig = {
    // Use env var if available, otherwise fallback
    API_URL: API_URL || `${DEFAULT_HOST}/api`,
    SOCKET_URL: SOCKET_URL || DEFAULT_HOST,
    RAZORPAY_KEY: RAZORPAY_KEY_ID || 'rzp_test_XXXXXXXXXXXX',
};

export default AppConfig;
