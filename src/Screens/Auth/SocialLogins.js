import React from 'react';
import {
  View,
  Platform,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Images } from '../../Constants/Images';
import { Colors } from '../../Constants/Colors';
import Typography from '../../Component/UI/Typography';
import { Fonts } from '../../Constants/Fonts';
import { windowWidth } from '../../Constants/Dimensions';
import localization from '../../Constants/localization';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { ToastMsg } from '../../Component/ToastMsg';

const SocialLogins = ({
  ongooglepress = () => { },
  navigation,
  callBack = () => { },
  centerLine,
  title,
}) => {
  return (
    <>
      {centerLine && (
        <View>
          <View
            style={{
              flexDirection: 'row',
              marginTop: 15,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Image
              source={Images.lineLeft}
              style={{
                width: windowWidth / 4,
                tintColor: Colors.darkGrey,
                height: 1,
              }}
            />
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                marginHorizontal: 5,
              }}
            >
              <Typography
                fontFamily={Fonts?.Inter_Regular}
                size={14}
                color={Colors?.textColor}
              >
                {title}
              </Typography>
            </View>
            <Image
              source={Images.lineRight}
              style={{
                width: windowWidth / 4,
                tintColor: Colors.darkGrey,
                height: 1,
              }}
            />
          </View>
        </View>
      )}
      <View style={styles.social}>
        <TouchableOpacity style={styles?.ViewStyle} onPress={() => ToastMsg("Coming soon")}>
          <Image style={[styles.IMG]} source={Images.ic_facebook} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => ongooglepress()}
          style={styles?.ViewStyle}
        >
          <Image style={[styles.IMG]} source={Images.ic_google} />
        </TouchableOpacity>
        {Platform.OS === 'ios' && (
          <TouchableOpacity onPress={() => { }} style={styles?.ViewStyle}>
            <Image style={[styles.IMG]} source={Images.ic_apple} />
          </TouchableOpacity>
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  social: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    marginTop: 30,
  },
  IMG: {
    height: 22,
    width: 22,
    borderRadius: 5,
    backgroundColor: Colors.white,
  },
  ViewStyle: {
    backgroundColor: Colors?.backViewColor,
    borderWidth: 1,
    borderColor: Colors?.backViewColorBorderColor,
    paddingVertical: 15,
    paddingHorizontal: 35,
    borderRadius: 10,
  },
  commonLine: {
    flex: 0.4,
    borderTopWidth: 1,
    borderColor: Colors?.borderColor,
  },
});

export default SocialLogins;
