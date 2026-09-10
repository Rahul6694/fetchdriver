import {
  AppState,
  LogBox,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import MainNavigation from './src/Navigation/MainNavigation';
import { persistor, store } from './src/Redux/store';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/lib/integration/react';
import SplashScreen from 'react-native-splash-screen';

import localization from './src/Constants/localization';
import { fcmService } from './src/pushNotifacation/FMCService';
import { notificationBadgeService } from './src/pushNotifacation/NotificationBadgeService';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import { SafeAreaProvider } from 'react-native-safe-area-context';

LogBox.ignoreLogs(['new NativeEventEmitter']);
LogBox.ignoreAllLogs();

const App = () => {
  const [langCode, setLangCode] = useState(null);

  useEffect(() => {
    const loadLanguage = async () => {
      // App is English-only; ignore any previously stored language preference.
      setLangCode('en');
      localization.setLanguage('en');

      const timer = setTimeout(() => {
        SplashScreen?.hide();
      }, 1000);

      return () => clearTimeout(timer);
    };

    loadLanguage();
  }, []);


  useEffect(() => {
    requestNotificationPermissions();
    fcmService.register();
  }, []);

  useEffect(() => {
    const syncBadge = async () => {
      await notificationBadgeService.hydrateFromStorage();
      await notificationBadgeService.syncFromServer();
    };
    syncBadge();
    const subscription = AppState.addEventListener('change', nextState => {
      if (nextState === 'active') {
        notificationBadgeService.syncFromServer({ delayMs: 300 });
      }
    });
    return () => subscription.remove();
  }, []);



  const requestNotificationPermissions = async () => {
    if (Platform.OS === 'ios') {
      PushNotificationIOS.requestPermissions();
    } else {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        console.warn('Notification permission denied');
      }
    }
  };

  if (langCode === null) {
    return null;
  }
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <PersistGate persistor={persistor}>
          <MainNavigation />
        </PersistGate>
      </Provider>
    </SafeAreaProvider>
  );
};

export default App;
const styles = StyleSheet.create({});

