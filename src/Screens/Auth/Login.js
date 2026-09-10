import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Image,
  AppState,
  StatusBar,
  FlatList,
  Keyboard,
  Platform,
  ImageBackground,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { CommonView } from '../../Component/CommonView';
import { Images } from '../../Constants/Images';
import Button from '../../Component/Button';
import { Colors } from '../../Constants/Colors';
import Typography from '../../Component/UI/Typography';
import { Fonts } from '../../Constants/Fonts';
import Input from '../../Component/Input';
import SocialLogins from './SocialLogins';
import ErrorBox from '../../Component/ErrorBox';
import { validators } from '../../Backend/Validator';
import { windowHeight, windowWidth } from '../../Constants/Dimensions';
import { useDispatch, useSelector } from 'react-redux';
import { isAuth, personalData, socialdata, Token, updateAuthData, userDetails } from '../../Redux/action';
import localization from '../../Constants/localization';
import HeaderWithBack from '../../Component/HeaderWithBack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isValidForm } from '../../Backend/Utility';
import {
  POST,
  POST_FORM_DATA,
  POST_URLENCODED,
  POST_WITHOUT_TOKEN,
} from '../../Backend/Backend';

import { setToken } from '../../Constants/AsyncStorage';
import { PhoneNumberParser } from '../../Component/PhoneNumberValidator';
import { ToastMsg } from '../../Component/ToastMsg';
import { LOGIN, SOCIAL_LOGIN } from '../../Backend/ApiRoutes';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import DeviceInfo from 'react-native-device-info';
import { useNavigation } from '@react-navigation/native';
import { FULL_HEIGHT } from '../../Constants/Layout';
import FormContainer from '../../Component/UI/FormContainer';
const Login = ({ }) => {
  const navigation = useNavigation();
  const [number, setNumber] = useState('');
  const [error, setError] = useState(null);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [counteryCode, setCounteryCode] = useState({
    code: 'ZA',
    dial_code: '+27',
  });
  const [btnloader, setbtnloader] = useState(false);
  const dispatch = useDispatch();
  const personal_Data = useSelector(store => store.personalData);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        '704008399574-j5es5ig2ss4151uagqfm81tlkvgvaedf.apps.googleusercontent.com'
    });
  }, [])


  // useEffect(() => {
  //   global.navigatePersonalInfo = () => {
  //     setTimeout(() => {
  //       navigation.navigate('PersonalInfo');
  //     }, 1000);
  //   };
  // }, [navigation]);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener("keyboardDidShow", () => {
      setKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardVisible(false);
    });
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);


  const handleError = error => {
    setbtnloader(false);
    setError(prevError => ({ ...prevError, number: error?.msg }));
    ToastMsg(data?.msg);
  };
  const handleFailure = failData => {
    setbtnloader(false);
  };
  const handleSuccess = data => {
    setbtnloader(false);
    console.log("4444444 333", data)
    if (data?.status === 'success') {
      setbtnloader(false);
      setToken(data?.data?.verify_token);
      navigation.navigate('VerificationMethod', {
        num: number,
        countryCode: counteryCode,
        token: data?.data?.verify_token,
        screen: 'login',

        registerData: {
          num: number,
          countryCode: counteryCode,
        },
      });
      // ToastMsg(data?.msg);
    } else {
      setError(prevError => ({ ...prevError, number: data.msg }));
    }
  };

  const signIn = async () => {
    try {
      // Trigger the Google sign-in flow
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      console.log('User Info:', userInfo);
      if (userInfo?.type === 'success') {
        socialLogin(userInfo?.data?.user, 'google');
      } else {
      }
    } catch (error) {
      console.log(error, "ERRRORROO");

      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('User cancelled the login');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log('Signing in');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        console.log('Play services are not available');
      } else {
        console.error('Something went wrong:', error);
      }
    }
  };

  const socialLogin = async (data, type) => {


    // console.log(data,"data===================>");

    //  return

    const uniqueId = await DeviceInfo?.getUniqueId();
    const email = data?.email;
    const id = data?.id;

    const formdata = new FormData();
    formdata.append('email', email);
    formdata.append('social_type', type);
    formdata.append('social_id', id);
    formdata.append('device_id', uniqueId);
    formdata.append(
      'device_type',
      Platform.OS == 'android' ? 'android' : 'ios',
    );

    console.log('Form data', formdata);
    POST_FORM_DATA(
      SOCIAL_LOGIN,
      formdata,
      success => {
        console.log('🚀 ~ socialLogin ~ success:', success);
        if (success?.token) {
          // setToken(success?.token);
          // dispatch(userDetails(success?.data));
          // dispatch(isAuth(true));
          // ToastMsg(success?.msg);



          if (success?.data?.step == 1) {

            const combinedData = {
              ...personal_Data,
              firstName: success?.data?.first_name,
              lastname: success?.data?.last_name,
              step: success?.data?.step,
              verify_token: success?.data?.verify_token,
            };
            dispatch(personalData(combinedData));
            dispatch(userDetails(success?.data));
            dispatch(isAuth(true));
            ToastMsg(success?.msg);
            setToken(success?.token);
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
              bankAccountHolder: success?.data?.driver_details?.account_holder_name,
              bankAccountNumber: success?.data?.driver_details?.account_number,
              branchCode: success?.data?.driver_details?.branch_code_lookup_id,
              step: success?.data?.step, // Add step
              verify_token: success?.data?.verify_token, // Add verify_token
            };
            dispatch(personalData(combinedData));
            dispatch(userDetails(success?.data));
            dispatch(isAuth(true));
            ToastMsg(success?.msg);
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
              bankAccountHolder: success?.data?.driver_details?.account_holder_name,
              bankAccountNumber: success?.data?.driver_details?.account_number,
              branchCode: success?.data?.driver_details?.branch_code_lookup_id,
              step: success?.data?.step, // Add step
              verify_token: success?.data?.verify_token, // Add verify_token
            };
            dispatch(personalData(combinedData));
            dispatch(userDetails(success?.data));
            dispatch(isAuth(true));
            ToastMsg(success?.msg);
            setToken(success?.token);
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
              bankAccountHolder: success?.data?.driver_details?.account_holder_name,
              bankAccountNumber: success?.data?.driver_details?.account_number,
              branchCode: success?.data?.driver_details?.branch_code_lookup_id,
              carModel: success?.data?.driver_details?.car_model_lookup_id,
              carYear: success?.data?.driver_details?.car_year_lookup_id,
              carColor: success?.data?.driver_details?.car_color_lookup_id,
              carVin: success?.data?.driver_details?.car_vin_number,
              licensePlate: success?.data?.driver_details?.license_plate_number,
              licensExpiryDate: success?.data?.driver_details?.license_expiry_date,
              virExpiry:
                success?.data?.driver_details?.vehicle_inspection_expiry_date,
              licencePhoto: success?.data?.driver_details?.license_disc,
              virPhoto: success?.data?.driver_details?.vehicle_inspection_report,
              photoForth: success?.data?.image,
              RSAPhoto: success?.data?.driver_details?.rsa_prdp_card,
              RSAExpiry: success?.data?.driver_details?.rsa_prdp_card_expiry,
              terms: success?.data?.driver_details?.terms == "0" ? false : true,
              SSRPhoto: success?.data?.driver_details?.safety_screening,
              SSRExpiry: success?.data?.driver_details?.safety_screening_expiry,
              DERPhoto: success?.data?.driver_details?.driving_evalution_report,
              DERExpiry: success?.data?.driver_details?.driving_evalution_report_expiry,
              step: success?.data?.step, // Add step
              verify_token: success?.data?.verify_token, // Add verify_token
            };
            // return;
            dispatch(isAuth(true));
            setToken(success?.token);
            ToastMsg(success?.msg);
            dispatch(personalData(combinedData));
            dispatch(userDetails(success?.data));
          } else {
            setbtnloader(false);
            ToastMsg(success?.msg);
            setToken(success?.token);
            dispatch(Token(success?.token));
            dispatch(updateAuthData(success?.data));
            dispatch(userDetails(success?.data));
            dispatch(isAuth(true));
          }


        } else {
          ToastMsg('You are not registered with us !');
          navigation?.navigate('Register', { usermail: data?.email, first_name: data?.givenName, last_name: data?.familyName });
        }
      },
      fail => {
        console.log("🚀 ~ socialLogin ~ fail:", fail)
        console.log(fail);
      },
      error => {
        console.log("🚀 ~ socialLogin ~ error:", error)
        console.log(error);
      },
    );
  };

  const handleSubmit = () => {
    Keyboard.dismiss();
    let error = {};
    (error.number = validators.checkPhoneNumber(
      '',
      9,
      10,
      number,
      counteryCode?.code,
    )),
      setError(error);
    if (isValidForm(error)) {
      setbtnloader(true);
      const formdata = new FormData();
      formdata.append('phone_number_prefix', `${counteryCode?.dial_code}`);
      formdata.append('phone_number_country_code', counteryCode?.code);
      formdata.append('phone_no', number);
      console.log('555555', formdata);

      POST_FORM_DATA(
        LOGIN,
        formdata,
        handleSuccess,
        handleError,
        handleFailure,
      );
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.white }}>
      <FormContainer>

        <ImageBackground
          source={Images.choose_language}
          style={{
            flex: 1,
            height: FULL_HEIGHT,
            width: '100%',
            backgroundColor: 'white',
          }}
          resizeMode="stretch">
          <TouchableOpacity onPress={() => { navigation.navigate("SelectLanguage") }} style={styles.langIcon}>
            <Image source={Images.language} style={{ height: 22, width: 22 }} />
          </TouchableOpacity>
          <View
            style={{
              flex: 0.35,
              marginHorizontal: 20,
            }}
          />
          <View style={styles.bottomView}>


            <Typography style={styles.bottomText}>
              {localization.login?.welcomeBack}
            </Typography>
            <Typography
              fontFamily={Fonts?.Inter_Regular}
              size={14}
              color={Colors?.textColor}>
              {localization.login?.enterPhoneNumber}
            </Typography>
            <Input
              onCountryPress={item => {
                setCounteryCode(item);
              }}
              setCounteryCode={setCounteryCode}
              title={localization.login?.phoneNumber}
              style_inputContainer={{ borderWidth: 1, }}
              mainStyle={{ marginTop: 30 }}
              countryPicker={true}
              keyboardType={'phone-pad'}
              value={number}
              onChange={v => {
                setNumber(v);
                setError({ ...error, number: '' });
              }}
            />
            <ErrorBox message={error?.number} />

            <View style={{ marginTop: 20, bottom: 0, }}>
              <Button
                loading={btnloader}
                title={localization.login?.continue}
                onPress={() => {
                  handleSubmit();
                  // dispatch(isAuth(true));
                }}
                style_button={{ backgroundColor: Colors?.Black }}
              />
            </View>

            <View
              style={{
                // height: windowHeight / 3.9,
                justifyContent: 'space-between',
              }}>
              <SocialLogins centerLine={true} ongooglepress={signIn} title={localization.login.orLoginWith} />


            </View>


            {!isKeyboardVisible && (
              <View style={styles.signUpContainer}>
                <Typography size={14}>
                  {localization.login?.dontHaveAccount}
                </Typography>
                <TouchableOpacity
                  onPress={() => {
                    AsyncStorage.setItem('isChooseLanguage', 'true');
                    navigation?.navigate('Register');
                  }}
                  style={styles.signUpText}>
                  <Typography
                    size={14}
                    fontFamily={Fonts?.Inter_SemiBold}
                    color={Colors?.selectedBorderColor}>
                    {localization?.login?.register}
                  </Typography>
                </TouchableOpacity>
              </View>)}
          </View>
        </ImageBackground>
      </FormContainer>

    </View>
  );
};
export default Login;

const styles = StyleSheet.create({
  bottomView: {
    flex: 0.62,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  bottomText: {
    color: Colors?.Black,
    fontSize: 20,
    fontFamily: Fonts?.Inter_Bold,
    marginBottom: 5,
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10
    // marginTop: 30
  },
  signUpText: {
    borderBottomWidth: 1.5,
    borderColor: Colors?.selectedBorderColor,
    marginLeft: 5,
  },
  langIcon: {
    alignSelf: "flex-end",
    position: "absolute",
    top: 50, right: 20,
      zIndex: 999,
  }
});
