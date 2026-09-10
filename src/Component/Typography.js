import React from 'react';
import { View, Text, PixelRatio } from 'react-native';
import { Fonts } from '../Constants/Fonts';
export const Typography = ({
  children,
  size = 14,
  color = '#212121',
  fontFamily = Fonts?.Inter_Regular,
  textAlign,
  textTransform,
  style,
  numsOfLine,
  ellipsisMode='tail'
}) => {
  const fontScale = PixelRatio?.getFontScale()

  return (
    <View style={{}}>
      <Text
        style={{
          fontSize: (size-1)/fontScale,
          color: color,
          fontFamily: fontFamily,
          textAlign,
          numberOfLines: numsOfLine,
          ellipsizeMode:ellipsisMode,
          textTransform: textTransform,
          ...style
        }}>
        {children}
      </Text>
    </View>
  );
};
