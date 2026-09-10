import { Alert, Platform, ScrollView, StyleSheet, View } from 'react-native';
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
import messaging from '@react-native-firebase/messaging';
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
import { getAssincStoreToken } from '../../Backend/Validator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FormContainer from '../../Component/UI/FormContainer';

const OtpVerification = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const personal_Data = useSelector(store => store.personalData);

  // const num = route?.params?.num;
  // const countryCode = route?.params?.countryCode;
  // const registerData = route?.params?.registerData;
  const { num, verify_token } = route.params;
  const [clickCount, setClickCount] = useState(0);
  const token = route?.params?.token;
  const screen = route?.params?.screen;
  const [otp, setOtp] = useState('');
  const [counter, setCounter] = useState(30);
  const [error, setError] = useState('');
  const [btnloader, setbtnloader] = useState(false);
  const [resendToken, setresendToken] = useState('');
  const [type, setType] = useState('');


  const GetTok = async()=>{
    const fcm_token = await AsyncStorage.getItem('fcm_token');
  }

  useEffect(() => {
    GetTok();
    let intervalId;
    if (counter > 0) {
      intervalId = BackgroundTimer.setInterval(() => {
        setCounter(prevCounter => prevCounter - 1);
      }, 1000);
    }
    return () => {
      if (intervalId) {
        BackgroundTimer.clearInterval(intervalId);
      }
    };
  }, [counter]);

  const onVerify = () => {
    setbtnloader(true)
    const error = {
      otps:
        otp?.length == 0
          ? localization.OTP_Verification.otpRequired
          : otp?.length < 4
            ? localization.OTP_Verification.otpInvalid
            : '',
    };
    setError(error);
    if (isValidForm(error)) {
      ForApi();
    }
  };
  const ForApi = async () => {
    // setbtnloader(true);
  
    const otpType = type == 'resend' ? resendToken : token;
    const formdata = new FormData();
    const fcm_token = await messaging().getToken();
    formdata.append('device_id', fcm_token);
    formdata.append('device_type', Platform?.OS);
    formdata.append('otp', otp);
    console.log('44444', otpType);
    console.log('faorm data', formdata);

    POST_FORM_DATA(
      `${GET_OTP}${otpType}`,
      formdata,
      async success => {
        setbtnloader(false);
        console.log(success, 'Main success::::');
        if (success?.status == 'success') {
          console.log(success, 'SUVVVVVVV');
          console.log(screen, 'screen');

          // return;
          setOtp('');
          if (screen == 'login') {

            if (success?.data?.step == 1) {
              const combinedData = {
                ...personal_Data,
                firstName: success?.data?.first_name,
                lastname: success?.data?.last_name,
                step: success?.data?.step,
                verify_token: success?.data?.verify_token,
              };
              setToken(success?.token);
              dispatch(personalData(combinedData));
              dispatch(isAuth(true));
            } else if (success?.data?.step == 2) {
              const combinedData = {
                ...personal_Data,
                firstName: success?.data?.first_name,
                lastname: success?.data?.last_name,
                dob: success?.data?.dob,
                trnNo: success?.data?.driver_details?.trn,
                trnDoc: success?.data?.driver_details?.trn_document,
                photo: success?.data?.driver_details?.driver_photo,
                speaking_languages: success?.data?.speaking_languages,
                billType: success?.data?.driver_details?.billing_type_lookup_id,
                bankAccountHolder:
                  success?.data?.driver_details?.account_holder_name,
                bankAccountNumber:
                  success?.data?.driver_details?.account_number,
                branchCode: success?.data?.driver_details?.branch_code_lookup_id,
                step: success?.data?.step, // Add step
                verify_token: success?.data?.verify_token, // Add verify_token
              };
              dispatch(personalData(combinedData));
              dispatch(isAuth(true));
              setToken(success?.token);
              navigation?.navigate('PaymentDetails');
            } else if (success?.data?.step == 3) {
              const combinedData = {
                ...personal_Data, // Include existing personal data
                firstName: success?.data?.first_name,
                lastname: success?.data?.last_name,
                dob: success?.data?.dob,
                trnNo: success?.data?.driver_details?.trn,
                trnDoc: success?.data?.driver_details?.trn_document,
                photo: success?.data?.driver_details?.driver_photo,
                speaking_languages: success?.data?.speaking_languages,
                billType: success?.data?.driver_details?.billing_type_lookup_id,
                bankAccountHolder:
                  success?.data?.driver_details?.account_holder_name,
                bankAccountNumber:
                  success?.data?.driver_details?.account_number,
                branchCode: success?.data?.driver_details?.branch_code_lookup_id,
                step: success?.data?.step, // Add step
                verify_token: success?.data?.verify_token, // Add verify_token
              };
              setToken(success?.token);
              dispatch(personalData(combinedData));

              dispatch(isAuth(true));
              navigation?.navigate('CarDetails');
            } else if (success?.data?.step == 4) {
              const combinedData = {
                ...personal_Data, // Include existing personal data
                firstName: success?.data?.first_name,
                lastname: success?.data?.last_name,
                dob: success?.data?.dob,
                trnNo: success?.data?.driver_details?.trn,
                trnDoc: success?.data?.driver_details?.trn_document,
                photo: success?.data?.driver_details?.driver_photo,
                speaking_languages: success?.data?.speaking_languages,
                billType: success?.data?.driver_details?.billing_type_lookup_id,
                bankAccountHolder:
                  success?.data?.driver_details?.account_holder_name,
                bankAccountNumber:
                  success?.data?.driver_details?.account_number,
                branchCode: success?.data?.driver_details?.branch_code_lookup_id,
                carModel: success?.data?.driver_details?.car_model_lookup_id,
                carYear: success?.data?.driver_details?.car_year_lookup_id,
                carColor: success?.data?.driver_details?.car_color_lookup_id,
                carVin: success?.data?.driver_details?.car_vin_number,
                licensePlate:
                  success?.data?.driver_details?.license_plate_number,
                licensExpiryDate:
                  success?.data?.driver_details?.license_expiry_date,
                virExpiry:
                  success?.data?.driver_details?.vehicle_inspection_expiry_date,
                licencePhoto: success?.data?.driver_details?.license_disc,
                virPhoto:
                  success?.data?.driver_details?.vehicle_inspection_report,
                photoForth: success?.data?.image,
                RSAPhoto: success?.data?.driver_details?.rsa_prdp_card,
                RSAExpiry: success?.data?.driver_details?.rsa_prdp_card_expiry,
                SSRPhoto: success?.data?.driver_details?.safety_screening,
                terms:
                  success?.data?.driver_details?.terms == '0' ? false : true,
                SSRExpiry:
                  success?.data?.driver_details?.safety_screening_expiry,
                DERPhoto:
                  success?.data?.driver_details?.driving_evalution_report,
                DERExpiry:
                  success?.data?.driver_details
                    ?.driving_evalution_report_expiry,
                step: success?.data?.step, // Add step
                verify_token: success?.data?.verify_token, // Add verify_token
              };
              // return;
              setToken(success?.token);
              dispatch(isAuth(true));
              dispatch(personalData(combinedData));
              // navigation?.navigate('SetupAccount');
            } else {
              setbtnloader(false);
              setToken(success?.token);
              dispatch(Token(success?.token));
              dispatch(updateAuthData(success?.data));
              dispatch(userDetails(success?.data));
              dispatch(isAuth(true));
            }
          } else {
            const combinedData = {
              ...personal_Data, // Include existing personal data
              firstName: success?.data?.first_name,
              lastname: success?.data?.last_name,
              step: success?.data?.step,
              verify_token: success?.data?.verify_token, // Add verify_token
              driver_id: success?.data?.id,
            };
            setToken(success?.token);
            dispatch(personalData(combinedData));
            dispatch(isAuth(true));
            // navigation?.navigate('PersonalInfo');
            setOTPToken(success?.data?.verify_token);
          }
        } else {
          SimpleToast.show(success?.msg);
          setbtnloader(false);
        }
      },
      error => {
        console.log(error, 'ERRORRR::::');
        setbtnloader(false);
        // SimpleToast.show(error?.msg);

      },
      fail => {
        console.log(fail, 'FAILLL::::::::');
        setbtnloader(false);
      },
    );
  };

  const onResend = () => {
    const otpType = type == 'resend' ? resendToken : token;
    GetNew(
      `${RESEND_OTP}${otpType}`,
      success => {
        if (success?.status == 'success') {
          SimpleToast.show(success?.msg);
          setCounter(30);
          setType('resend');
          setresendToken(success?.data?.verify_token);
        } else {
          SimpleToast.show(success?.msg);
        }
      },
      error => {
        SimpleToast.show(error?.msg);
      },
      fail => {
        SimpleToast.show('Failed to resend OTP');
      },
    );
  };
  // `${countryCode?.dial_code}` + `${'*****'}` + `${num.slice(0, -5)}`

  return (
    <View style={{ flex: 1, backgroundColor: Colors?.Primary }}>
      <FormContainer>

        <HeaderContent
          // back={true}
          AuthHeader={true}
          otpImg={true}
          title={localization?.OTP_Verification?.otpVerification}
          Sub_title={localization?.OTP_Verification?.enter4DigitCode}
          // style={{ marginTop: Platform?.OS == 'ios' ? 0 : 40 }}
          // back={Images.Back}
          // lowerTitle={registerData?.num}
          lowerTitle={true}
          maskNumber={num}
          onPress={() => navigation.goBack()}
        />
        {/* <ScrollView> */}
        <View>
          <OtpInput
            value={otp}
            setValue={setOtp}
            onChangeText={value => {
              setError({ ...error, otps: '' });
              setOtp(value);
            }}
            error={error?.otps}
          />
          <Otp_Timer
            counter={counter}
            onPressResend={() => {
              setClickCount(prevCount => prevCount + 1);
              if (clickCount >= 3) {
                navigation.navigate('Register');
                return;
              }
              onResend();
            }}
            receiveText={true}
            resendText={true}
          />
        </View>

        <View style={{ ...GlobalStyle?.btnView }}>
          <Button
            loading={btnloader}
            title={localization.OTP_Verification.verify}
            onPress={() => {
              onVerify();
            }}
            style_button={{ backgroundColor: Colors?.Black }}
          />
        </View>
      </FormContainer>

    </View>
  );
};

export default OtpVerification;

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
