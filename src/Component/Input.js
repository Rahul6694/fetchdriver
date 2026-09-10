import {
  StyleSheet,
  View,
  Image,
  TextInput,
  TouchableOpacity,
  Platform,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { Colors } from '../Constants/Colors';
import Typography from './UI/Typography';
import { CountryPicker } from 'react-native-country-codes-picker';
import { Fonts } from '../Constants/Fonts';
import { Images } from '../Constants/Images';
import SvgIcon from './UI/svg';
import { getLanguage } from '../Constants/AsyncStorage';
import localization from '../Constants/localization';

const Input = ({
  title,
  style_title,
  style_input,
  placeholder,
  keyboardType,
  maxLength,
  multiline,
  value,
  optional,
  editable = true,
  onChange,
  secureTextEntry,
  onPress,
  source_eye,
  style_inputContainer,
  placeholderTextColor,
  borderColor = Colors.LightWhite,
  countryPicker = false,
  onCountryPress = () => { },
  country,
  numberOfLines,
  onFocus = () => { },
  error = '',
  mainStyle,
  titleTo,
  icon_style,
  aesterick = false,
  highlightBorder = false,
  rightIcon = false,
  height=50
}) => {
  const [show, setShow] = useState(false);
  const [countryCode, setCountryCode] = useState({
    flag: '🇿🇦', // Default to ZA flag and dial code
    dial_code: '+27',
  });
  const [inputBorderColor, setInputBorderColor] = useState(borderColor);

  useEffect(() => {
    // Update country code if it changes
    if (country?.dial_code && countryCode?.dial_code !== country?.dial_code) {
      setCountryCode(country);
    }
  }, [country]);

  return (
    <>
      <View style={[styles.container, mainStyle]}>
        <View style={styles.titleContainer}>
          <Typography style={[styles.txt_style, style_title]}>
            {title}
          </Typography>
          {aesterick && <Typography color="red">{'*'}</Typography>}
        </View>

        <View
          style={[
            styles.input_container,
            style_inputContainer,
            Platform.OS === "ios" && { height:height  },
            {
              borderColor: highlightBorder
                ? inputBorderColor
                : Colors.LightWhite,


            },
          ]}>
          {countryPicker && (
            <>
              <TouchableOpacity
                onPress={() => setShow(true)}
                style={styles.countryPickerContainer}>
                <View style={styles.countryInfo}>
                  <Typography
                    size={17}
                    type={Fonts.Inter_Bold}
                    style={styles.countryFlag}>
                    {countryCode?.flag}
                  </Typography>
                  <Typography
                    size={15}
                    type={Fonts.Inter_Bold}
                    color={Colors?.codeColr}
                    style={styles.countryDialCode}>
                    {countryCode?.dial_code}
                  </Typography>
                </View>
                <SvgIcon name="dropdown" />
              </TouchableOpacity>

              <CountryPicker
                show={show}
                onBackdropPress={() => setShow(false)}
                pickerButtonOnPress={item => {
                  onCountryPress(item);
                  setCountryCode(item);
                  setShow(false);
                }}

                style={{
                  modal: {
                    height: '70%',
                    numberOfLines: 1
                  },

                  countryName: {
                    fontFamily: Fonts.Inter_Regular,
                    color: 'black',
                    height: 40,
                    textAlignVertical: Platform.OS === "android" && 'center',
                    lineHeight: Platform.OS === "ios" ? 40 : null,

                    // justifyContent:"center",
                    // alignItems:"center"
                  },
                }}
              />
            </>
          )}

          <TextInput
            style={[styles.input, style_input]}
            onChangeText={onChange}
            multiline={multiline}
            numberOfLines={numberOfLines}
            maxLength={maxLength}
            placeholder={placeholder}
            editable={editable}
            keyboardType={keyboardType}
            secureTextEntry={secureTextEntry}
            value={value}
            textAlignVertical={multiline ? 'top' : 'center'}
            placeholderTextColor={placeholderTextColor}
            onFocus={() => setInputBorderColor(Colors?.selectGreen)}
            onBlur={() => setInputBorderColor(borderColor)}
          // onFocus={onFocus}
          />
          {rightIcon && <SvgIcon name={rightIcon} />}

          {source_eye && (
            <TouchableOpacity style={styles.icon_container} onPress={onPress}>
              <Image
                source={source_eye}
                style={[styles.icon_style, icon_style]}
              />
            </TouchableOpacity>
          )}
        </View>

        {optional && (
          <View style={styles.optionalContainer}>
            <Typography
              size={12}
              marginTop={5}
              type={Fonts.Inter_Regular}
              marginBottom={-20}
              color="#72778C">
              {'(Optional)'}
            </Typography>
          </View>
        )}

        {error && (
          <Typography textAlign={'right'} style={styles.errorText}>
            {error}
          </Typography>
        )}
      </View>
    </>
  );
};

export default Input;

const styles = StyleSheet.create({
  container: {
    marginTop: 20,

  },
  titleContainer: {
    flexDirection: 'row',
    marginBottom: 5,
    alignItems: 'center',
    // justifyContent: 'space-between',
  },
  txt_style: {
    color: Colors.lableColor,
    fontSize: 14,
    fontFamily: Fonts.Inter_Medium,
  },
  input_container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 4,
    backgroundColor: Colors.white,
  },
  input: {
    flex: 1,
    paddingHorizontal: 15,
    marginTop: 0,
    fontSize: 16,
    fontFamily: Fonts.Inter_Regular,
    color: Colors.black,
    maxHeight: 'fixed',
  },
  icon_container: {
    paddingRight: 5,
  },
  icon_style: {
    height: 22,
    width: 22,
    marginRight: 5,
  },
  countryPickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countryFlag: {
    marginLeft: 10,
  },
  countryDialCode: {
    marginHorizontal: 5,
  },

  countryPickerStyle: {
    modal: {
      height: '50%',
      backgroundColor: 'red',
    },
    textInput: {
      fontFamily: Fonts.Poppins_Medium,
      color: 'black',
      paddingHorizontal: 10,
    },

    dialCode: {
      fontFamily: Fonts.Poppins_Medium,
      color: 'black',
    },
  },
  optionalContainer: {
    alignSelf: 'flex-end',
  },
  errorText: {
    color: 'red',
    fontSize: 11,
    paddingTop: 8,
  },
});
