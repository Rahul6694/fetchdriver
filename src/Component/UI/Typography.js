import { StyleSheet, Text as RNText, View, PixelRatio } from 'react-native';
import React from 'react';
import { Colors } from '../../Constants/Colors';
import { Fonts } from '../../Constants/Fonts';

const Typography = ({
  size = 14,
  children,
  fontFamily = Fonts?.Inter_Regular,
  color = Colors?.Black,
  textAlign = undefined,
  style = {},
  numberOfLines,
  lineHeight = lineHeight,
  fontWeight,
  letterSpacing,
  ...props
}) => {
  const fontScale = PixelRatio?.getFontScale()
  return (
    <RNText
      numberOfLines={numberOfLines}
      style={[
        styles.font,
        {
          fontSize: (size - 1) / fontScale,
          color: color,
          textAlign,
          lineHeight: lineHeight,
          fontFamily: fontFamily,
          letterSpacing: letterSpacing,
        },
        style,
      ]}
      {...props}>
      {children}
    </RNText>
  );
};

export default Typography;

const styles = StyleSheet.create({
  font: {
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
});
