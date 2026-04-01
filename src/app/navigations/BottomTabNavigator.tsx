import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import ProductScreen from '../screens/ProductScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import MapScreen from '../screens/MapScreen';
import OrdersScreen from '../screens/OrdersScreen';
import ChatRoomsScreen from '../screens/ChatListScreen';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
    const { t } = useTranslation();
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName = 'help-circle';

                    if (route.name === 'Home') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'Product') {
                        iconName = focused ? 'cube' : 'cube-outline';
                    } else if (route.name === 'Notifications') {
                        iconName = focused ? 'notifications' : 'notifications-outline';
                    } else if (route.name === 'Map') {
                        iconName = focused ? 'map' : 'map-outline';
                    } else if (route.name === 'Orders') {
                        iconName = focused ? 'list' : 'list-outline';
                    } else if (route.name === 'Chat') {
                        iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#6C63FF',
                tabBarInactiveTintColor: 'gray',
                headerShown: false,
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: t('home') }} />
            {/* <Tab.Screen name="Map" component={MapScreen} options={{ tabBarLabel: t('map') }} /> */}
            <Tab.Screen name="Orders" component={OrdersScreen} options={{ tabBarLabel: t('orders') }} />
            <Tab.Screen name="Product" component={ProductScreen} options={{ tabBarLabel: t('product') }} />
            <Tab.Screen name="Notifications" component={NotificationsScreen} options={{ tabBarLabel: t('notifications') }} />
            <Tab.Screen name="Chat" component={ChatRoomsScreen} options={{ tabBarLabel: t('chat') }} />
        </Tab.Navigator>
    );
};

export default BottomTabNavigator;
