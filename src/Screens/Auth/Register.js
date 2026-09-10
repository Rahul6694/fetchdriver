import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Keyboard,
  ImageBackground,
  StatusBar,
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
import RegisterText from '../../Component/Cards/RegisterText';
import { validators } from '../../Backend/Validator';
import { isValidForm } from '../../Backend/Utility';
import DropdownComponent from '../../Component/DropdownComponent';
import ErrorBox from '../../Component/ErrorBox';
import localization from '../../Constants/localization';
import { PhoneNumberParser } from '../../Component/PhoneNumberValidator';
import HeaderWithBack from '../../Component/HeaderWithBack';
import { MASTER_LIST, REGISTER, SOCIAL_LOGIN } from '../../Backend/ApiRoutes';
import { GET, POST_FORM_DATA } from '../../Backend/Backend';
import { useDispatch, useSelector } from 'react-redux';
import { isAuth, masterData, personalData, socialdata, userDetails } from '../../Redux/action';
import SimpleToast from 'react-native-simple-toast';
import { store } from '../../Redux/store';
import Press from '../../Component/UI/Press';
import { useIsFocused } from '@react-navigation/native';
import { FULL_HEIGHT } from '../../Constants/Layout';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { ToastMsg } from '../../Component/ToastMsg';
import { setToken } from '../../Constants/AsyncStorage';
import DeviceInfo from 'react-native-device-info';

const Register = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const isFocus = useIsFocused();
  const socialdata = useSelector(store => store?.socialdata);
  const masterData = useSelector(store => store.master_data);

  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [number, setNumber] = useState('');
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [counteryCode, setCounteryCode] = useState({
    code: 'ZA',
    dial_code: '+27',
  });
  const [city, setCity] = useState({});
  const [check, setCheck] = useState(false);
  const [btnloader, setbtnloader] = useState(false);
  const usermail = route?.params?.usermail;
  useEffect(() => {
    dispatch(personalData({}));
    if (usermail) {
      setEmail(usermail);
    }
    dispatch(personalData({}));
  }, [isFocus]);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      },
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      },
    );
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const cityArray = masterData?.lookups?.city?.map(i => ({
    label: i?.lookup_description[0]?.code,
    value: i?.id,
  }));

  const handleSubmit = () => {
    const error = {
      email: validators.checkEmail(localization.Sign_up.email, email),
      number: validators.checkFixPhoneNumber(
        localization.login?.phoneNumber,
        number,
      ),
      city: validators.checkRequire(localization.Register.city, city?.label),
      check: check ? '' : localization.Register.acceptTerms,
    };
    setError(error);

    if (isValidForm(error)) {
      ForApi();
    }
  };

  const ForApi = async () => {
    setbtnloader(true);
    const formdata = new FormData();
    formdata.append('email', email);
    route?.params?.first_name &&
      formdata.append('first_name', route?.params?.first_name);
    route?.params?.last_name &&
      formdata.append('last_name', route?.params?.last_name);
    formdata.append('prefix', counteryCode?.dial_code);
    formdata.append('country_code', counteryCode?.code);
    formdata.append('phone_number', number);
    formdata.append('city', city?.value);
    // return;
    POST_FORM_DATA(
      `${REGISTER}`,
      formdata,
      async success => {
        if (success?.status == 'success') {
          setbtnloader(false);
          emptyState();
          navigation.navigate('VerificationMethod', {
            token: success?.data?.verify_token,
            screen: 'register',
            num: number,
            countryCode: counteryCode,

            // registerData: {
            //   num: number,
            //   countryCode: counteryCode,
            // },
          });
        } else {
          setbtnloader(false);
          if (success?.data?.email) {
            const emailErrors = success?.data?.email?.join(', '); // Combine all email errors into a single string
            setError(prevError => ({ ...prevError, email: emailErrors })); // Update the error state
          }
          const phoneFieldErrors = success?.data?.phone_number || success?.data?.phone_no;
          if (phoneFieldErrors) {
            const phoneErrors = phoneFieldErrors.join(', '); // Combine all phone number errors into a single string
            setError(prevError => ({ ...prevError, number: phoneErrors })); // Update the error state
          }

          // If no validation errors, show a generic message
          if (!success?.data?.email && !phoneFieldErrors) {
            SimpleToast.show(
              success?.message || localization?.SimpleToast?.failed,
            );
          }
        }
        setbtnloader(false);

        // SimpleToast.show(success?.error);
      },
      error => {
        setbtnloader(false);

        // SimpleToast.show(error?.msg);
      },
      fail => {
        setbtnloader(false);
      },
    );
  };

  const emptyState = () => {
    setEmail('');
    setNumber('');
    setCity({});
    // setCounteryCode({});
    setCheck(false);
  };



  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        '704008399574-j5es5ig2ss4151uagqfm81tlkvgvaedf.apps.googleusercontent.com'
    });
  }, [])

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
          setEmail(email)
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
  return (
    <View style={{ flex: 1 }}>
      <StatusBar
        translucent
        backgroundColor="#fff" // Transparent background
        barStyle="dark-content" // White content
      />

      <ImageBackground
        source={Images.choose_language}
        style={{
          flex: 1,
          height: FULL_HEIGHT,
          width: '100%',
          backgroundColor: 'white',
        }}
        resizeMode="stretch">
        <View
          style={{
            flex: 0.3,
            marginHorizontal: 20,
            top: 10,
          }}>
          <HeaderWithBack
            style={{ marginTop: Platform?.OS == 'ios' ? 40 : 40 }}
            onBackPress={() => navigation.navigate('Login')}
            source={Images.Back}
          />
        </View>
        <View style={styles.bottomView}>
          <ScrollView
            style={{ flex: 1 }}
            // contentContainerStyle={{ height: 100, backgroundColor: "#4545", zIndex: 9999, }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="never">
            <Typography style={styles.bottomText}>
              {localization?.Register?.title}
            </Typography>

            <Input
              editable={usermail ? false : true}
              title={localization?.Sign_up?.email}
              value={email}
              keyboardType={'email-address'}
              onChange={e => {
                setEmail(e);
                setError({ ...error, email: '' });
              }}
              error={error?.email}
              style_inputContainer={{ borderWidth: 1 }}
              mainStyle={{ marginTop: 30 }}
            />
            <Input
              onCountryPress={item => {
                setCounteryCode(item);
              }}
              setCounteryCode={setCounteryCode}
              title={localization.login?.phoneNumber}
              style_inputContainer={{ borderWidth: 1 }}
              countryPicker={true}
              keyboardType={'phone-pad'}
              value={number}
              onChange={v => {
                setNumber(v);
                setError({ ...error, number: '' });
              }}
              error={error?.number}
            />

            <DropdownComponent
              data={cityArray}
              title={localization?.Register?.city}
              placeholder={''}
              value={city}
              onChange={c => {
                setCity(c);
                setError({ ...error, city: '' });
              }}
              error={error?.city}
            />
            <RegisterText
              checkBox
              iconPress={() => {
                setCheck(!check);
                setError({ ...error, check: '' });
              }}
              OnPrivacy={() => {
                navigation?.navigate('TermsAndConditions', {
                  slug: 'privacy-policy',
                  name: localization?.Legal.privacyPolicy,
                });
              }}
              OnTerms={() => {
                navigation?.navigate('TermsAndConditions', {
                  slug: 'term-conditions-after',
                  name: localization.Legal.termsAndConditions,
                });
              }}
              iconName={check ? 'tickBox' : 'checkbox'}
            />
            <ErrorBox message={error?.check} color="red" />
            <Typography
              color={Colors?.textColor}
              style={{ marginTop: 19 }}
              lineHeight={22}>
              {localization?.Register?.byProceed}
            </Typography>
            <View style={{ marginTop: 20 }}>
              <Button
                loading={btnloader}
                title={localization?.Register?.btnTitle}
                onPress={() => {
                  handleSubmit();
                }}
                style_button={{ backgroundColor: Colors?.Black }}
              />
            </View>
            <View
              style={{
                // height: windowHeight / 3.9,
                justifyContent: 'space-between',
              }}>
              <SocialLogins centerLine={true} ongooglepress={signIn} title={localization.Sign_up.orSignupWith} />


            </View>
            {!isKeyboardVisible && (
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  marginVertical: 20,
                }}>
                <Typography>
                  {localization?.Register?.already}
                  {'?'}{' '}
                </Typography>
                <Press
                  onPress={() => {
                    navigation?.navigate('Login');
                  }}>
                  <Typography
                    style={{
                      borderBottomWidth: 1,
                      borderColor: Colors?.selectedBorderColor,
                    }}
                    fontFamily={Fonts?.Inter_SemiBold}
                    color={Colors?.selectedBorderColor}>
                    {localization?.Sign_up?.login}
                  </Typography>
                </Press>
              </View>
            )}
          </ScrollView>
        </View>
      </ImageBackground>

    </View>
  );
};

export default Register;

const styles = StyleSheet.create({
  bottomView: {
    flex: 0.7,
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,

  },
  bottomText: {
    color: Colors?.Black,
    fontSize: 20,
    fontFamily: Fonts?.Inter_Bold,
    marginTop: 15,
  },
});
