import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  Animated,
  Dimensions,
} from 'react-native';
import { Colors } from '../../Constants/Colors';

const BottomSheet = ({
  isVisible,
  onClose,
  height,
  backgroundColor = Colors.white,
  children,
  bottomSheetCss
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const screenHeight = Dimensions.get('window').height;
  const calculatedHeight =
    typeof height === 'string' && height.includes('%')
      ? (parseFloat(height) / 100) * screenHeight
      : height;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: isVisible ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isVisible]);

  const translateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [calculatedHeight, 0],
  });

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <Animated.View
      style={[styles.overlay, { opacity, display: isVisible ? 'flex' : 'none' }]}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={StyleSheet.absoluteFill} />
      </TouchableWithoutFeedback>
      <Animated.View
        style={[
          styles.bottomSheet,
          {
            height: calculatedHeight,
            backgroundColor,
            transform: [{ translateY }],
          }, bottomSheetCss,

        ]}>
        {children}
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    // backgroundColor: '#cfc',
    position: 'absolute',

    left: 0,
    right: 0,
    bottom: 0,
    height: 100,

  },
  bottomSheet: {
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    // backgroundColor:"red",
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
    position: 'relative', // Changed from 'absolute'
  },
});

export default BottomSheet;
