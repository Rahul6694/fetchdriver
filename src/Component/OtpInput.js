import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from 'react-native-confirmation-code-field';
import Typography from './UI/Typography';
import {Colors} from '../Constants/Colors';
import {Fonts} from '../Constants/Fonts';
import {windowHeight, windowWidth} from '../Constants/Dimensions';
import ErrorBox from './ErrorBox';
import Press from './UI/Press';
import localization from '../Constants/localization';

const OtpInput = ({
  value,
  setValue,
  onChangeText = () => {},
  error,
  mainStyle,
  resendOtp = () => {},
}) => {
  const CELL_COUNT = 4;
  const ref = useBlurOnFulfill({value, cellCount: CELL_COUNT});
  const [prop, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue,
  });

  return (
    <KeyboardAvoidingView
      style={{flex: 1}}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={80}>
      <View style={{padding: 15}}>
        <View style={[{}, mainStyle]}>
          <CodeField
            ref={ref}
            value={value}
            onChangeText={onChangeText}
            cellCount={CELL_COUNT}
            rootStyle={[styles.codeFieldRoot]}
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            caretHidden={false}
            renderCell={({index, symbol, isFocused}) => (
              <View
                key={index}
                style={[styles.cell, isFocused && styles.focusedCell]}
                onLayout={getCellOnLayoutHandler(index)}>
                <Typography
                  size={28}
                  style={{textAlign: 'center'}}
                  color={Colors.black}
                  fontFamily={Fonts.Inter_SemiBold}
                  onLayout={getCellOnLayoutHandler(index)}>
                  {symbol || (isFocused ? '_' : '')}
                </Typography>
              </View>
            )}
          />
          <ErrorBox message={error} />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default OtpInput;
export const Otp_Timer = ({
  counter,
  onPressResend = () => {},
  receiveText = false,
  resendText = false,
}) => {
  return (
    <View
      style={{
        flexDirection: 'row',
        padding: 15,
        justifyContent: 'space-between',
      }}>
      <View style={{flexDirection: 'row'}}>
       
      {!!resendText && counter == 0 && (
         <>
        {!!receiveText && (
          
          <Typography textAlign={'center'} size={16} color={'#848484'}>
            {localization.OTP_Verification.didntGetCode}
          </Typography>
        )}
        </>
      )}

        {!!resendText && counter == 0 && (
          <Press
            activeOpacity={0.4}
            onPress={onPressResend}
            disable={counter > 0}>
            <Typography
              style={{textDecorationLine: 'underline'}}
              textAlign={'center'}
              size={16}
              fontFamily={Fonts?.Inter_SemiBold}
              color={Colors?.selectGreen}>
                {" "}{localization.OTP_Verification.resend}
            </Typography>
          </Press>
        )}
      </View>
      {counter !== 0 && (
        <View
          style={{
            alignSelf: 'center',
          }}>
          <Typography size={16} color={Colors?.textColor}>
            {counter < 10 ? '00:0' + counter : '00:' + counter}
          </Typography>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  codeFieldRoot: {
    alignSelf: 'center',
  },
  cell: {
    width: 72,
    height: 78,
    borderWidth: 1,
    borderColor: Colors?.differentGrey,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 6,
  },
  focusedCell: {
    borderColor: Colors.blue,
  },
});
