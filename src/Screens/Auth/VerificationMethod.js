import {StyleSheet, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import HeaderContent from '../../Component/HeaderContent';
import {Colors} from '../../Constants/Colors';
import Button from '../../Component/Button';
import {GlobalStyle} from '../../Constants/GlobalStyle';
import GetCodeBox from '../../Component/Cards/GetCodeBox';
import {GET} from '../../Backend/Backend';
import {GET_CODE} from '../../Backend/ApiRoutes';
import localization from '../../Constants/localization';
import SimpleToast from 'react-native-simple-toast';

const VerificationMethod = ({navigation, route}) => {
  const { num, countryCode, verify_token } = route.params;
  const screen = route?.params?.screen;
  const token = route?.params?.token;
  const [formattedNumber, setFormattedNumber] = useState('');

  const [type, setType] = useState('mobile');
  const [btnloader, setbtnloader] = useState(false);
React.useEffect(()=>{
if(num){
  setFormattedNumber(formatPhoneNumber(num))
}
},[num])
  const sendCode = () => {
    setbtnloader(true);

    GET(
      `${GET_CODE}${token}/${type}`,
      success => {
        setbtnloader(false);
        if (success?.status == 'success') {
          setbtnloader(false);
          navigation?.navigate('Otp', { num: formattedNumber ,token:success?.data?.verify_token});
          // navigation?.navigate('Otp', {
          //   token: success?.verify_token,
          //   screen: screen,
          //   registerData: registerData,
          // });
        } else {
          setbtnloader(false);
          SimpleToast.show(success?.msg || localization?.SimpleToast?.failed);
        }
      },
      error => {
        setbtnloader(false);
        console.log("5555555",error)
      },
      fail => {
        setbtnloader(false);
        console.log("fail",fail)

      },
    );
  };
  const onBoxPress = type => {
    setType(type);
  };
  const formatPhoneNumber = (num) => {
    if (!num) return '';
    return `${countryCode?.dial_code} ${num.slice(0, 2)}*****${num?.slice(-2)}`;
  };



  return (
    <View style={{flex: 1, backgroundColor: Colors?.Primary}}>
      <HeaderContent
        back={true}
        AuthHeader={true}
        title={localization?.VerificationMethod?.chooseVerificationMethod}
        Sub_title={localization?.VerificationMethod?.verificationCodeSentTo}
        lowerTitle={true}
        maskNumber={formattedNumber}
        onPress={() => navigation.goBack()}
      />
      <GetCodeBox
        title1={localization?.VerificationMethod?.getCodeViaSMS}
        icon1={'msg'}
        title2={localization?.VerificationMethod?.getCodeViaWhatsApp}
        icon2={'whatsApp'}
        defaultType={'mobile'}
        onBoxPress={onBoxPress}
      />
      <View
        style={{...GlobalStyle?.btnView, flex: 1, justifyContent: 'flex-end'}}>
        <Button
          loading={btnloader}
          title={localization?.VerificationMethod?.sendCode}
          onPress={() => {
            // navigation?.navigate('OtpVerification');
            sendCode();
          }}
          style_button={{backgroundColor: Colors?.Black}}
        />
      </View>
    </View>
  );
};

export default VerificationMethod;

const styles = StyleSheet.create({
  timeText: {
    textAlign: 'right',
  },
  resendContainer: {
    flexDirection: 'row',
  },
  underline: {
    textDecorationLine: 'underline',
  },
});
