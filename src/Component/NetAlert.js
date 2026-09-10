import React, {useEffect, useState} from 'react';
import {Animated, StyleSheet, Text} from 'react-native';
import {useNetInfo} from '@react-native-community/netinfo';

import {Easing} from 'react-native-reanimated';
import {Colors} from '../Constants/Colors';
import {Fonts} from '../Constants/Fonts';

const NetAlert = () => {
  const height = new Animated.Value(0);
  const netInfo = useNetInfo();
  const [message, setMessage] = useState('No Internet');
  const [visible, setVisible] = useState(false);
  const {isConnected, isInternetReachable} = netInfo;

  useEffect(() => {
    if ((isConnected && isInternetReachable) || isConnected == null) {
      setMessage('Back Online');
      hideAlert();
      setVisible(false);
    } else {
      setMessage('No Internet');
      showAlert();
      setVisible(true);
    }
  }, [isConnected, isInternetReachable, message]);

  const showAlert = () => {
    Animated.timing(height, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: false,
      easing: Easing.bounce,
    }).start();
  };

  const hideAlert = () => {
    Animated.timing(height, {
      toValue: 0,
      duration: 1000,
      useNativeDriver: false,
      easing: Easing.bounce,
    }).start();
  };

  return (
    <Animated.View style={styles.container(height)}>
      <Text style={styles.internetText}>
        Internet not connected ,Please connect
      </Text>
    </Animated.View>
  );
};

export default NetAlert;

const styles = StyleSheet.create({
  container: ht => {
    return {
      height: ht,
      backgroundColor: Colors.red,
      justifyContent: 'center',
      zIndex: 1000,
    };
  },
  internetText: {
    fontSize: 14,
    fontFamily: Fonts.Inter_Regular,
    color: Colors.red,
    textAlign: 'center',
    zIndex: 999,
  },
});
//Error
