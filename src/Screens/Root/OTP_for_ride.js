import {
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import HeaderContent from '../../Component/HeaderContent';
import { Colors } from '../../Constants/Colors';
import Button from '../../Component/Button';
import GetCodeBox from '../../Component/Cards/GetCodeBox';
import OtpInput, { Otp_Timer } from '../../Component/OtpInput';
import BackgroundTimer from 'react-native-background-timer';
import { isValidForm } from '../../Backend/Utility';
import { GlobalStyle } from '../../Constants/GlobalStyle';
import { GET, GetNew, POST, POST_FORM_DATA } from '../../Backend/Backend';
import { GET_OTP, RESEND_OTP } from '../../Backend/ApiRoutes';
import SimpleToast from 'react-native-simple-toast';
import { useDispatch, useSelector } from 'react-redux';
import {
  isAuth,
  personalData,
  Token,
  updateAuthData,
  userDetails,
} from '../../Redux/action';
import { setOTPToken, setToken, setUserData } from '../../Constants/AsyncStorage';
import localization from '../../Constants/localization';
import { Images } from '../../Constants/Images';
import { FULL_WIDTH } from '../../Constants/Layout';
import Typography from '../../Component/UI/Typography';
import { Fonts } from '../../Constants/Fonts';
import HeaderWithBack from '../../Component/HeaderWithBack';
import { windowWidth } from '../../Constants/Dimensions';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
const OTP_for_ride = ({
  userName,
  setModalVisibless = () => { },
  Change_Status_Otp,
  setIsOtp,
  setError,
  error,
}) => {
  const dispatch = useDispatch();
  const personal_Data = useSelector(store => store.personalData);

  useEffect(() => {
    if (error) {
      console.log("OTP Error:", error);
    }
  }, [error]);
  // const num = route?.params?.num;
  // const countryCode = route?.params?.countryCode;
  // const registerData = route?.params?.registerData;
  // const { num, verify_token } = route.params;
  const [clickCount, setClickCount] = useState(0);
  // const token = route?.params?.token;
  // const screen = route?.params?.screen;
  const [otp, setOtp] = useState('');
  const [counter, setCounter] = useState(30);

  const [btnloader, setbtnloader] = useState(false);
  const [resendToken, setresendToken] = useState('');
  const [type, setType] = useState('');
      const [keyboardHeight, setKeyboardHeight] = useState(0);

  // useEffect(() => {
  //   let intervalId;
  //   if (counter > 0) {
  //     intervalId = BackgroundTimer.setInterval(() => {
  //       setCounter(prevCounter => prevCounter - 1);
  //     }, 1000);
  //   }
  //   return () => {
  //     if (intervalId) {
  //       BackgroundTimer.clearInterval(intervalId);
  //     }
  //   };
  // }, [counter]);

  // const onResend = () => {
  //   const otpType = type == 'resend' ? resendToken : token;
  //   GetNew(
  //     `${RESEND_OTP}${otpType}`,
  //     success => {
  //       if (success?.status == 'success') {
  //         SimpleToast.show(success?.msg);
  //         setCounter(30);
  //         setType('resend');
  //         setresendToken(success?.verify_token);
  //       } else {
  //         SimpleToast.show(success?.msg);
  //       }
  //     },
  //     error => {
  //       SimpleToast.show(error?.msg);
  //     },
  //     fail => {
  //       SimpleToast.show('Failed to resend OTP');
  //     },
  //   );
  // };
  // `${countryCode?.dial_code}` + `${'*****'}` + `${num.slice(0, -5)}`

useEffect(() => {
    const onKeyboardShow = e => {
      -setKeyboardHeight(e.endCoordinates?.height || 0);
    };

    const onKeyboardHide = () => {
      -setKeyboardHeight(0);
    };

    const showListener = Keyboard.addListener(
      'keyboardDidShow',
      onKeyboardShow,
    );
    const hideListener = Keyboard.addListener(
      'keyboardDidHide',
      onKeyboardHide,
    );

    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, []);


  const onVerify = () => {
    Keyboard.dismiss()
    if (btnloader) return; // Prevent double-tap
    const error = {
      otps:
        otp?.length === 0
          ? localization.OTP_Verification.otpRequired
          : otp?.length < 4
            ? localization.OTP_Verification.otpInvalid
            : '',
    };
    setError(error);

    if (isValidForm(error)) {

      setbtnloader(true);
      Change_Status_Otp({ ID: userName?.id, otp });

      setTimeout(() => {
        setbtnloader(false);
        // setModalVisibless()

      }, 1000);
    }
  };


  return (
    <View
      style={{ flex: 1, backgroundColor: Colors?.white, alignItems: 'center',paddingTop:Platform.OS ==="ios"? 20:0 }}>
      <HeaderWithBack
        source={Images.Back}
        title={' '}
        icon_style={{
          height: 46,
          width: 46,
          borderRadius: 30,
          elevation: 4,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: Colors?.Primary,
          marginLeft: 10,
          marginTop: -50
        }}
        onBackPress={() => {
          setModalVisibless()
        }}
        showSpace={false}
      />
         <KeyboardAvoidingView
      style={{ flex: 1, width: '100%' }}
     behavior={
          Platform.OS == 'ios'
            ? 'padding'
            : keyboardHeight
            ? 'height'
            : undefined
        }
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          alignItems: 'center',
          // marginTop: 40

        }}
      >
        <View style={{ alignSelf: "center" }}>
          <Image
            source={Images.OTP_Verification_for_ride}
            style={{
              width: FULL_WIDTH * 0.9,
              resizeMode: 'contain',
              height: 200,
              alignSelf: "center"
            }}
          />
          <Typography
            textAlign={"left"}
            fontFamily={Fonts.Inter_Bold}
            size={30}
            color={Colors.Black}
            style={{ marginBottom: 4, alignSelf: "center" }}>
            {localization.driverFlow.enterPinStartRide}
          </Typography>
          <Typography
            textAlign={"left"}
            style={{ marginBottom: 4, alignSelf: "center" }}
            fontFamily={Fonts.Inter_Regular}
            size={16}
            color={Colors.textColor}>
            {localization.driverFlow.ask} {userName?.get_user_name?.first_name} {localization.driverFlow.pinToStartRide}
          </Typography>
          <View style={{ marginTop: 30, width: "100%", alignItems: "center", }}>

            <OtpInput
              value={otp}
              setValue={setOtp}
              onChangeText={value => {
                setError({ ...error, otps: '' });
                setOtp(value);
              }}
              error={error?.otps}
            />



          </View>

        </View>
      </ScrollView>
      <Button
        loading={btnloader}
        title={localization.driverFlow.verifyRider}
        onPress={() => {
          onVerify()
        }}
        style_button={{ backgroundColor: Colors?.Black, width: windowWidth*0.85,alignSelf:"center" }}
      />
      </KeyboardAvoidingView>
      {/* <View style={{ ...GlobalStyle?.btnView }}> */}
      {/* </View> */}
    </View>
  );
};


export default OTP_for_ride;

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
