import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import {Platform} from 'react-native';
import {setFcmToken} from '../Constants/AsyncStorage';
import {localNotificationService} from './LocalNotificationService';
import {notificationBadgeService} from './NotificationBadgeService';
import {notificationOpen} from './notificationAction';

class FCMService {
  /** Avoid stacking duplicate listeners (e.g. React Strict Mode double-mount). */
  listenersAttached = false;

  register = () => {
    const setup = async () => {
      // iOS must register for APNs before getToken / foreground listeners reliably receive messages.
      if (Platform.OS === 'ios') {
        try {
          await messaging().registerDeviceForRemoteMessages();
          await messaging().setAutoInitEnabled(true);
        } catch (e) {
          console.log('[FCMService] registerDeviceForRemoteMessages failed', e);
        }
      }
      this.checkPermission();
      if (!this.listenersAttached) {
        this.listenersAttached = true;
        this.createNotificationListeners();
        localNotificationService.configure();
      }
    };
    setup();
  };
  checkPermission = () => {
    messaging()
      .hasPermission()
      .then(enabled => {
        if (enabled) {
          this.getFcmToken();
        } else {
          this.requestPermission();
        }
      })
      .catch(error => {});
  };
  getFcmToken = () => {
    return new Promise(res => {
      messaging()
        .getToken()
        .then(fcmToken => {
          if (fcmToken) {
            AsyncStorage.setItem('fcm_token',fcmToken);
            console.log('[FCM TOKEN] => ', fcmToken);
            res(fcmToken);
          } else {
            console.log('[FCMService] User Does not have a device token');
          }
        })
        .catch(error => {
          console.log('[FCMService] getToken rejected', error);
        });
    });
  };
  requestPermission = () => {
    messaging()
      .requestPermission()
      .then(() => {
        this.getFcmToken();
      })
      .catch(error => {
        console.log('[FCMService] Request Permission rejected', error);
      });
  };

  deleteToken = () => {
    messaging()
      .deleteToken()
      .catch(error => {
        console.log('[FCMService] Delete Token error', error);
      });
  };

  createNotificationListeners = () => {
    //when the application is running but in background
    messaging().onNotificationOpenedApp(remoteMessage => {
      if (remoteMessage) {
        notificationOpen(remoteMessage);
        notificationBadgeService.syncFromServer();
      }
    });

    //when the application is opened from a quit state.
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          notificationOpen(remoteMessage);
          notificationBadgeService.syncFromServer();
        }
      });

    //forgrounnd state messages
    this.messageListener = messaging().onMessage(async remoteMessage => {
      if (remoteMessage) {
        await localNotificationService.showlocalNotification(remoteMessage);
      }
    });

    //Triggerd When have new token
    messaging().onTokenRefresh(fcmToken => {
      console.log('[FCMService] new token refresh', fcmToken);
    });
  };
  unRegister = () => {
    if (this.messageListener) {
      this.messageListener();
    }
  };
}

export const fcmService = new FCMService();
