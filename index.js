import { AppRegistry, Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import App from './App';
import { name as appName } from './app.json';
import { localNotificationService } from './src/pushNotifacation/LocalNotificationService';
import { notificationBadgeService } from './src/pushNotifacation/NotificationBadgeService';

messaging().setBackgroundMessageHandler(async remoteMessage => {
  if (!remoteMessage) {
    return;
  }
  // Android already posts to the tray when the payload includes `notification`;
  // showing a local notification too duplicates it.
  if (Platform.OS === 'android' && remoteMessage.notification) {
    await notificationBadgeService.onPushReceived(remoteMessage);
    return;
  }
  await localNotificationService.showlocalNotification(remoteMessage);
});

AppRegistry.registerComponent(appName, () => App);


