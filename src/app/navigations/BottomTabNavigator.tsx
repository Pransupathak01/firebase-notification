import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import ProductScreen from '../screens/ProductScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import MapScreen from '../screens/MapScreen';
import OrdersScreen from '../screens/OrdersScreen';
import ChatRoomsScreen from '../screens/ChatListScreen';
import Ionicons from 'react-native-vector-icons/Ionicons';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
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
            <Tab.Screen name="Home" component={HomeScreen} />
            {/* <Tab.Screen name="Map" component={MapScreen} /> */}
            <Tab.Screen name="Orders" component={OrdersScreen} />
            <Tab.Screen name="Product" component={ProductScreen} />
            <Tab.Screen name="Notifications" component={NotificationsScreen} />
            <Tab.Screen name="Chat" component={ChatRoomsScreen} />
        </Tab.Navigator>
    );
};

export default BottomTabNavigator;
