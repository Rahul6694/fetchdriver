import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { CountryPicker } from 'react-native-country-codes-picker';
import { Typography } from './Typography';
import { Fonts } from '../Constants/Fonts';
import {FULL_HEIGHT} from '../Constants/Dimensions';
import { Images } from '../Constants/Images';
import { Colors } from '../Constants/Colors';

const PhoneNumberInput = ({
  value,
  onChange,
  placeholder = '',
//   borderColor = Colors.borderColor,
  onCountryPress = () => {},
  country,
  error = '',
  mainStyle,
  setCountryCode,
  countryCode,
  style_title,
  title
}) => {
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  useEffect(() => {
    if (country?.dial_code && countryCode?.dial_code !== country?.dial_code) {
      setCountryCode(country);
    }
  }, [country]);

  return (
    <View style={[{marginTop: 20}, mainStyle]}>
      <View
        style={{
          flexDirection: 'row',
          marginBottom: 5,
          alignItems: 'center',
        }}>
        <Typography color={Colors.Secondary} size={14} fontFamily={Fonts.Roboto_Medium}
        style={[ style_title]}>{title}</Typography>
      </View>
      <View style={styles.inputContainer}>
        <TouchableOpacity
          onPress={() => setShowCountryPicker(true)}
          style={styles.code}>
          <Typography
            size={17}
            type={Fonts.Roboto_Bold}
            style={{}}>
            {countryCode?.flag}
          </Typography>
          <Typography
            size={17}
            color={Colors.Secondary}
            type={Fonts.Roboto_Medium}
            style={{marginHorizontal: 5}}>
            {countryCode?.dial_code}
          </Typography>
          <Image source={Images.ArrowDown} style={styles.icon} />
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          onChangeText={onChange}
          placeholder={placeholder}
          keyboardType="phone-pad"
          value={value}
          placeholderTextColor="#888"
        />
      </View>

      <CountryPicker
        show={showCountryPicker}
        onBackdropPress={() => setShowCountryPicker(false)}
        style={{
          modal: {height: FULL_HEIGHT * 0.2},
          textInput: {
            fontFamily: Fonts.Poppins_Medium,
            color: 'black',
            paddingHorizontal: 10,
          },
          countryName: {fontFamily: Fonts.Poppins_Medium, color: 'black'},
          dialCode: {fontFamily: Fonts.Poppins_Medium, color: 'black'},
        }}
        pickerButtonOnPress={item => {
          onCountryPress(item);
          setCountryCode(item);
          setShowCountryPicker(false);
        }}
      />

      {/* {error && (
        <Typography textAlign="right" style={{color: 'red', fontSize: 11, paddingTop: 8}}>
          {error}
        </Typography>
      )} */}
    </View>
  );
};

export default PhoneNumberInput;

const styles = StyleSheet.create({
  inputContainer: {
    // borderWidth: 1,
    // borderColor:Colors.Secondary,
    flexDirection: 'row',
    alignItems: 'center',
    // paddingVertical: 10,
    // paddingHorizontal: 5,
    borderRadius: 12,
    height: 54,
    // width:"95%",
    // alignSelf:"center",
    backgroundColor:Colors.LightBlue,
    paddingVertical:10
  },
  input: {
    flex: 1,
    color: Colors.Secondary,
    // paddingLeft: 20,
    fontFamily: Fonts.Roboto_Medium,
    // backgroundColor:"pink",
    padding:5,
    fontSize:16
    // borderLeftWidth:1

  },
  icon: {
    height: 16,
    width: 16,
    resizeMode: 'contain',
    // tintColor: Colors.Secondary,
  },
  code: {
    flexDirection: 'row', 
    alignItems: 'center',
    borderRightWidth:1,
    borderColor:Colors.Secondary,
    paddingHorizontal:5,
    margin:5
  },
});
