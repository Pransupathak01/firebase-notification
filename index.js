/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';

// Register background handler
// Register background handler
messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('Message handled in the background!', remoteMessage);

    // Ensure channel exists
    await notifee.createChannel({
        id: 'sound_channel_final',
        name: 'Sound Channel Final',
        sound: 'custom_sound',
        importance: AndroidImportance.HIGH,
    });

    // Display notification for background data messages
    await notifee.displayNotification({
        title: remoteMessage.notification?.title || remoteMessage.data?.title || 'New Notification',
        body: remoteMessage.notification?.body || remoteMessage.data?.body || 'You have a new message',
        android: {
            channelId: 'sound_channel_final',
            smallIcon: 'ic_notification',  // white-on-transparent drawable, NOT ic_launcher
            color: '#7a33ccff',              // 6-digit hex only
            sound: 'custom_sound',
            importance: AndroidImportance.HIGH,
            showTimestamp: true,
            pressAction: {
                id: 'default',
            },
        },
    });
});

AppRegistry.registerComponent(appName, () => App);
