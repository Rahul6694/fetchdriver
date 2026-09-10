import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';
import React from 'react';
import Typography from './UI/Typography';
import {Colors} from '../Constants/Colors';
import {Font, Fonts} from '../Constants/Fonts';
import SvgIcon from './UI/svg';

const Button = ({
  text_style,
  style_button,
  title,
  onPress,
  textColor = Colors.Primary,
  textFont = Fonts?.Inter_SemiBold,
  textSize = 18,
  leftIcon,
  loading = false,
  onPressDiasbled = false,
  source,
  showImage = false,
  image_style,
  loaderColor=Colors?.white
}) => {
  return (
    <TouchableOpacity
      disabled={onPressDiasbled}
      style={[styles.button_style, style_button]}
      onPress={onPress}
      activeOpacity={0.9}>
      <View
        style={{
          flexDirection: 'row',
          width: '80%',
          justifyContent: 'center',
        }}>
        {leftIcon && (
          <View style={{marginRight: 8}}>
            <SvgIcon name={leftIcon} />
          </View>
        )}
        {loading ? (
          <ActivityIndicator
            size={'small'}
            color={loaderColor}
            style={styles.indicator}
          />
        ) : (
          <>
            {showImage && <Image source={source} style={[image_style]} />}
            <Typography
              style={[styles.btn_text, text_style]}
              size={textSize}
              fontFamily={textFont}
              color={textColor}>
              {title}
            </Typography>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default Button;

const styles = StyleSheet.create({
  button_style: {
    backgroundColor: Colors.Secondary,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
    paddingVertical: 15,
    flexDirection: 'row',
  },
  btn_text: {
    // marginVertical: 10,
    textAlign: 'center',
  },
  indicator: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
