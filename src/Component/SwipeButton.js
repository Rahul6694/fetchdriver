import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
  Platform,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Colors } from '../Constants/Colors';
import { GlobalShadow } from '';
// import { Icon } from '';
import { Fonts } from '../Constants/Fonts';
import { Images } from '../Constants/Images';
// import Press from '../HOC/Press';
// import localization from ';

import { FULL_HEIGHT, FULL_WIDTH } from '../Constants/Layout';
import localization from '../Constants/localization';
import Typography from './UI/Typography';

const TRACK_WIDTH = FULL_WIDTH - 80;
const BUTTON_WIDTH = 60;
const MAX_TRANSLATE_X = TRACK_WIDTH - BUTTON_WIDTH - 10;

const SwipeButton = ({
  LockHours = '',
  onSwipeComplete,
  title = 'Start',
  backgroundColor = Colors.Black,
  disableColor = 'white',
  titleSize = 18,
  titleFont = Fonts?.AnekLatinSemiBold,
  titleColor = 'white',
  borderColor = Colors.Black,
  icon,
  Icons = false,
  disabled = false,
  loading = false,
}) => {
  const [swipeX] = useState(new Animated.Value(0));
  const [isSwiped, setIsSwiped] = useState(false);
  const buttonDisable = disabled || loading;

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) => {
      // Only allow dragging if the button is not disabled
      return !buttonDisable && Math.abs(gestureState.dx) > 5;
    },
    onPanResponderMove: Animated.event([null, { dx: swipeX }], {
      useNativeDriver: false,
    }),
    onPanResponderRelease: (_, gestureState) => {
      // Do nothing if the button is disabled
      if (buttonDisable) return;

      if (gestureState.dx > MAX_TRANSLATE_X / 2) {
        Animated.timing(swipeX, {
          toValue: MAX_TRANSLATE_X,
          duration: 200,
          useNativeDriver: false,
        }).start(() => {
          setIsSwiped(true);
          if (onSwipeComplete) onSwipeComplete();
        });
      } else {
        Animated.spring(swipeX, {
          toValue: 0,
          useNativeDriver: false,
        }).start();
      }
    },
  });

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.track,
          {
            borderColor: borderColor,
            backgroundColor: Colors.Black,
            justifyContent: 'center',
            paddingHorizontal: 5,
            marginBottom:Platform.OS== 'ios'?15:FULL_HEIGHT*0.05,
          },
        ]}>
        {!isSwiped ? <Typography
          style={{ alignSelf: 'center', position: 'absolute', marginTop: 15 }}
          fontFamily={Fonts?.Inter_Bold}
          color={Colors.white}
        >
          {localization.driverFlow.completeRide}
        </Typography> :
          <ActivityIndicator size="large" color="#fff" style={{ alignSelf: 'center', position: 'absolute', marginTop: 15 }} />}

        {!isSwiped && <Animated.View
          {...panResponder.panHandlers}
          style={[
            styles.thumb(buttonDisable, backgroundColor, disableColor),
            { transform: [{ translateX: swipeX }] },
          ]}>
          {disabled ? (
            <TouchableOpacity
            // onPress={() => {showToast({
            //     message: `${localization?.setting?.LockText} ${LockHours} ${localization?.setting?.LockTextTwo}`,
            //     type: 'error',
            // });}}
            >
              {/* <Icon source={images?.lockpad} size={25} tintColor={Colors?.red} /> */}
            </TouchableOpacity>
          ) : (

            // <Text style={[styles.text, { Fontsize: titleSize, color: titleColor, fontFamily: titleFont }]}>
            //     {isSwiped ? 'Done!' : title}
            // </Text>
            <Image
              source={Images.Back}
              style={{
                height: 16,
                width: 16,
                tintColor: Colors.white,
                transform: [{ rotate: '180deg' }],
              }}
            />
          )}

          {Icons && (
            <View style={{ marginLeft: 10 }}>
              {/* <Icon source={icon} size={20} /> */}
            </View>
          )}
        </Animated.View>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
  },
  track: {
    width: TRACK_WIDTH,
    height: 60,
    backgroundColor: ' #555555',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    paddingHorizontal: 18,
  },
  thumb: (disable, color, disableColor) => ({
    width: BUTTON_WIDTH,
    height: 50,
    backgroundColor: !disable ? color : color,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    // ...GlobalShadow.highlight,
    shadowColor: !disable ? color : color,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 19,
    zIndex: 100,
  }),
  text: {
    fontWeight: Platform.OS === 'ios' ? '500' : '800',
  },
});

export default SwipeButton;
