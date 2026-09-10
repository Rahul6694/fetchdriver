import React from 'react';
import {PermissionsAndroid, Platform} from 'react-native';
import {PERMISSIONS, checkMultiple, request} from 'react-native-permissions';

const REQUIRED_PERMISSIONS = [
  PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
  PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
  PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
  PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
];

export const checkPermissions = async () => {
  if (Platform.OS !== 'android') {
    console.warn('Permission handling is only required for Android.');
    return true;
  }

  try {
    const granted = await Promise.all(
      REQUIRED_PERMISSIONS.map(permission =>
        PermissionsAndroid.check(permission),
      ),
    );

    const allPermissionsGranted = granted.every(result => result);
    console.log(
      allPermissionsGranted
        ? 'All permissions are already granted.'
        : 'Some permissions are not granted.',
    );

    return allPermissionsGranted;
  } catch (err) {
    console.error('Error checking permissions:', err);
    return false;
  }
};

export const requestPermission = async permission => {
  try {
    const result = await PermissionsAndroid.request(permission);
    if (result === PermissionsAndroid.RESULTS.GRANTED) {
      console.log(`${permission} granted.`);
      return true;
    } else {
      console.warn(`${permission} not granted.`);
      return false;
    }
  } catch (err) {
    console.error(`Error requesting ${permission}:`, err);
    return false;
  }
};

export const requestPermissions = async () => {
  if (Platform.OS !== 'android') {
    console.warn('Permission handling is only required for Android.');
    return true;
  }

  try {
    const granted = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      // PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    ]);

    // Convert granted object values into an array and check if all are 'granted'
    const allPermissionsGranted = Object.values(granted).every(
      result => result === PermissionsAndroid.RESULTS.GRANTED,
    );

    if (allPermissionsGranted) {
      console.log('All permissions granted.');
    } else {
      console.warn(
        'Some permissions are missing. Please enable them in settings.',
      );
    }

    return allPermissionsGranted;
  } catch (err) {
    console.log('Error requesting permissions:', err);
    return false;
  }
};

// Function to check specific permission
export const checkSpecificPermission = async (
  permission,
  setIsPermissionChecked,
) => {
  try {
    const status = await PermissionsAndroid.check(permission);
    setIsPermissionChecked?.(status);
    console.log(`${permission} is ${status ? 'granted' : 'not granted'}.`);
    return status;
  } catch (err) {
    console.error(`Error checking ${permission}:`, err);
    setIsPermissionChecked?.(false);
    return false;
  }
};

// Unified function to ensure permissions
export const ensurePermissions = async () => {
  const permissionsGranted = await checkPermissions();
  if (!permissionsGranted) {
    await requestPermissions();
  }
};

export const requestPermissionsHere = async () => {
  try {
    const granted = await request(
      Platform.OS === 'ios'
        ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
        : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
      {
        title: 'Geolocation Permission',
        message: 'Can we access your location?',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
    );

    // console.log(granted, 'granted========>');

    // Handling permission results
    if (granted === 'granted') {
      // console.log('Location permission granted');
      return true;
    } else if (granted === 'blocked') {
      console.log('Location permission blocked');
    } else if (granted === 'denied') {
      console.log('Location permission denied');
    } else {
      console.log('Permission status unknown');
    }
  } catch (err) {
    console.error('Error requesting location permission', err);
    return false;
  }
};
