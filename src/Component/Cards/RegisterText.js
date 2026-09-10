import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import Typography from '../UI/Typography';
import {Fonts} from '../../Constants/Fonts';
import {Colors} from '../../Constants/Colors';
import SvgIcon from '../UI/svg';
import Press from '../UI/Press';
import localization from '../../Constants/localization';

const RegisterText = ({
  text = 'Register',
  title = 'Don’t have an account?',
  register,
  checkBox,
  fontFamily = Fonts?.Inter_SemiBold,
  color = Colors?.selectedBorderColor,
  mainStyle,
  iconName,
  onPress = () => {},
  iconPress = () => {},
  OnPrivacy = () => {},
  OnTerms = () => {},
}) => {
  return (
    <View style={{}}>
      {register && (
        <View style={[styles?.mainStyle, {alignItems: 'center', ...mainStyle}]}>
          <View>
            <Typography>{title}</Typography>
          </View>
          <TouchableOpacity onPress={onPress}>
            <Typography
              fontFamily={Fonts?.Inter_SemiBold}
              color={Colors?.selectedBorderColor}
              style={{
                borderBottomWidth: 1,
                borderColor: Colors?.selectedBorderColor,
              }}>
              {' '}
              {text}
            </Typography>
          </TouchableOpacity>
        </View>
      )}
      {checkBox && (
        <View style={[styles?.mainStyle]}>
          <Press onPress={iconPress}>
            <SvgIcon name={iconName} />
          </Press>
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              width: '95%',
            }}>
            <Typography onPress={iconPress} style={{marginLeft: 5}}>
              {localization?.Register?.iAgree}
            </Typography>
            <Press
              onPress={() => {
                OnTerms();
              }}>
              <Typography  color={color} style={{...styles?.txtStyle,left:1}}>
              {localization?.Register?.termsOf}
              </Typography>
            </Press>
            <Typography onPress={iconPress} > {localization?.Register?.and} </Typography>
            <Press
              onPress={() => {
                OnPrivacy();
              }}>
              <Typography color={color} style={styles?.txtStyle}>
                {localization?.Register?.privacyPolicy}
              </Typography>
            </Press>
          </View>
        </View>
      )}
    </View>
  );
};

export default RegisterText;

const styles = StyleSheet.create({
  mainStyle: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
    padding: 2,
  },
  txtStyle: {
    borderBottomWidth: 1,
    borderColor: Colors?.selectedBorderColor,
  },
});
