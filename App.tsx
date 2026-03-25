import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import AppNavigator from './src/app/navigations/AppNavigator';

import { NotificationProvider } from './src/app/context/NotificationContext';
import { CartProvider } from './src/app/context/CartContext';
import { AuthProvider } from './src/app/context/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { SocketManager } from './src/app/components/SocketManager';

const queryClient = new QueryClient();

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <StatusBar
            barStyle={isDarkMode ? 'light-content' : 'dark-content'}
            backgroundColor={isDarkMode ? '#000000' : '#ffffff'}
          />
          <AuthProvider>
            <SocketManager />
            <NotificationProvider>
              <CartProvider>
                <SafeAreaView style={{ flex: 1 }}>
                  <NavigationContainer>
                    <AppNavigator />
                  </NavigationContainer>
                </SafeAreaView>
              </CartProvider>
            </NotificationProvider>
          </AuthProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}

export default App;

