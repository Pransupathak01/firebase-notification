import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import BottomTabNavigator from './src/app/navigations/BottomTabNavigator';

import { NotificationProvider } from './src/app/context/NotificationContext';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <NotificationProvider>
        <NavigationContainer>
          <BottomTabNavigator />
        </NavigationContainer>
      </NotificationProvider>
    </SafeAreaProvider>
  );
}

export default App;
