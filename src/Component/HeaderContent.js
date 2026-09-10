import {
  Image,
  ImageBackground,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useState } from 'react';
import Typography from './UI/Typography';
import { Colors } from '../Constants/Colors';
import { Fonts } from '../Constants/Fonts';
import { Images } from '../Constants/Images';
import SvgIcon from './UI/svg';
import { FULL_WIDTH } from '../Constants/Layout';
import localization from '../Constants/localization';

const HeaderContent = ({
  title,
  style_text,
  back,
  Sub_title,
  AuthHeader = false,
  onPress,
  RootHeader = false,
  DashText = false,
  otpImg = false,
  lowerTitle = false,
  prefix,
  maskNumber,
}) => {
  // const maskNumber = number => {
  //   if (!number || number.length < 3) return number; // Ensure the number is long enough
  //   const firstTwo = number.slice(0, 2); // First two digits
  //   const lastTwo = number.slice(-2); // Last two digits
  //   const maskedSection = '*'.repeat(number.length - 4); // Mask the middle section
  //   return `${firstTwo}${maskedSection}${lastTwo}`;
  // };
  return (
    <>
      {!!AuthHeader && (
        <View style={{ padding: 20, marginTop: 20 }}>
          <View>
            {back && (
              <TouchableOpacity onPress={onPress} style={styles.back}>
                <SvgIcon name="back" />
              </TouchableOpacity>
            )}
            {otpImg && (
              <View
                style={{
                  marginBottom: 40,
                  alignSelf: 'center',
                  marginTop: -5,
                }}>
                <TouchableOpacity
                  onPress={onPress}
                  style={{ position: 'absolute', top: 35, left: -38 }}>
                  <SvgIcon name="back" />
                </TouchableOpacity>
                <Image
                  source={Images?.Character}
                  resizeMode={'contain'}
                  style={{ height: 250, width: FULL_WIDTH * 0.65, top: Platform?.OS == "ios" ? 10 : 10 }}></Image>
              </View>
            )}
          </View>
          <View style={{}}>
            <Typography
              size={26}
              color={Colors?.black}
              fontFamily={Fonts?.Inter_Bold}
              style={[styles.main_text, style_text]}>
              {title}
            </Typography>
          </View>
          <Typography
            numberOfLines={2}
            size={16}
            color={Colors.textColor}
            style={{ marginTop: 5, paddingRight: 40 }}>
            {Sub_title}
          </Typography>
          {lowerTitle && (
            <Typography
              numberOfLines={2}
              size={16}
              color={Colors.black}
              fontFamily={Fonts?.Inter_SemiBold}
              style={{ marginTop: 5, paddingRight: 40 }}>
              {maskNumber}
            </Typography>
          )}
        </View>
      )}
    </>
  );
};

export default HeaderContent;
export const Header = ({
  back = false,
  onPress = () => { },
  title,
  mainHeader = true,
  subHeader = false,
  boldTitle = false,
  toptitle = localization?.personalInfo?.title,
  subTitle = localization?.personalInfo?.subTitle,
  subTitleStyle,
  stepImg = Images?.Step1,
  mainPadding = 20,
  help = false,
}) => {
  const [modal, setModal] = useState(false);

  return (
    <View style={{ padding: mainPadding }}>
      {subHeader && (
        <View
          style={{
            marginTop: 26,
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}>
          <Image
            source={Images?.Fetch}
            style={{ height: 44, width: 137 }}></Image>
          <Image source={stepImg} style={{ height: 50, width: 50 }}></Image>
        </View>
      )}
      {boldTitle && (
        <View>
          <Typography
            size={26}
            fontFamily={Fonts?.Inter_Bold}
            marginTop={35}
            color={Colors?.black}>
            {toptitle}
          </Typography>
          <Typography
            style={subTitleStyle}
            size={16}
            color={Colors?.textColor}
            lineHeight={22}
            marginVertical={4}>
            {subTitle}
          </Typography>
        </View>
      )}
    </View>
  );
};
export const MainTitle = ({
  subHeader = false,
  boldTitle = false,
  toptitle = localization.personalInfo.personalInfo,
  subTitle = localization.personalInfo.visibleToClients,
  subTitleStyle,
  stepImg = Images?.Step1,
  mainPadding = 20,
  help = false,
  paddingHorizontal = 0,
}) => {
  return (
    <View
      style={{
        paddingTop: 10,
        paddingHorizontal: paddingHorizontal,
      }}>
      {subHeader && (
        <View
          style={{
            // marginTop: 26,
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}>
          <Image
            source={Images?.Fetch}
            style={{ height: 44, width: 137 }}></Image>
          <Image source={stepImg} style={{ height: 50, width: 50 }}></Image>
        </View>
      )}
      {boldTitle && (
        <View>
          <Typography
            size={26}
            fontFamily={Fonts?.Inter_Bold}
            marginTop={25}
            color={Colors?.black}>
            {toptitle}
          </Typography>
          <Typography
            style={subTitleStyle}
            size={16}
            color={Colors?.textColor}
            lineHeight={22}
            marginVertical={4}>
            {subTitle}
          </Typography>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  main_text: {
    // marginTop: 90,
  },
  back: {
    height: 46,
    width: 46,
    justifyContent: 'center',
    marginBottom: 15,
  },
  rootHeaderBackground: {
    width: '100%',
    height: 190,
  },
  rootHeaderContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  rootHeaderIcon: {
    width: 53,
    height: 52,
  },
});
