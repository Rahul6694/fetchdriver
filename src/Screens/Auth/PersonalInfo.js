import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import Button from '../../Component/Button';
import Input from '../../Component/Input';
import Date_Picker from '../../Component/DatePicker';
import { validators } from '../../Backend/Validator';
import { isValidForm } from '../../Backend/Utility';
import { Colors } from '../../Constants/Colors';
import { Typography } from '../../Component/Typography';
import { GlobalStyle } from '../../Constants/GlobalStyle';
import { Fonts } from '../../Constants/Fonts';
import { Header, MainTitle } from '../../Component/HeaderContent';
import {
  GET_DRIVER_PROFILE,
  SIGN_UPDATE,
  SIGNUP_STEP_1,
} from '../../Backend/ApiRoutes';
import { GET_WITH_TOKEN, POST, POST_FORM_DATA } from '../../Backend/Backend';
import SimpleToast from 'react-native-simple-toast';
import ErrorBox from '../../Component/ErrorBox';
import moment from 'moment';
import { personalData } from '../../Redux/action';
import { useDispatch, useSelector } from 'react-redux';
import { getOTPToken, setOTPToken } from '../../Constants/AsyncStorage';
import { Images } from '../../Constants/Images';
import { useIsFocused } from '@react-navigation/native';
import HeaderWithBack from '../../Component/HeaderWithBack';
import ContainerView from '../../Component/ContainerView';
import localization from '../../Constants/localization';
import MultiDropDown from '../../Component/MultiDropDown';

const PersonalInfo = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const info = route?.params?.info;
  const personal_Data = useSelector(store => store.personalData);
  const socialdata = useSelector(store => store?.socialdata);
  const masterData = useSelector(store => store.master_data);
  const IsToken = useSelector(store => store.Token);
  const [firstName, setFirstname] = useState('');
  const [lastname, setlastName] = useState('');
  const [dob, setDob] = useState(personal_Data?.dob);
  const [trnNo, setTrnNo] = useState('');
  const [error, setError] = useState('');
  const [trnDoc, setTrnDoc] = useState('');
  const [btnloader, setbtnloader] = useState(false);
  const [otpToken, setOtpToken] = useState(null);
  const [driverImg, setDriverImg] = useState('');
  const [speaking_languages, setSpeaking_Languages] = useState([]);
  const [Loading, setLoading] = useState(false);
  const is_focus = useIsFocused();

  console.log(personal_Data, 'personal_Data=================>');
  // useEffect(() => {
  //   const combinedData = {
  //     ...personal_Data, // Include existing personal data
  //     trnDoc: trnDoc,
  //   };
  //   dispatch(personalData(combinedData));
  // }, [trnDoc]);

  useEffect(() => {
    const combinedData = {
      ...personal_Data, // Include existing personal data
      firstName: firstName,
      lastname: lastname,
      dob: dob,
      trnNo: trnNo,
      speaking_languages: speaking_languages,
      trnDoc: trnDoc,
    };
    dispatch(personalData(combinedData));
  }, [firstName, lastname, dob, trnDoc, speaking_languages, trnNo]);



  useEffect(() => {
    if (is_focus) {
      console.log(personal_Data, 'personal_Data?.trnDoc=======>');
      setTrnDoc(personal_Data?.trnDoc);
      setDriverImg(personal_Data?.photo);
      setFirstname(personal_Data?.firstName);
      setlastName(personal_Data?.lastname);
      setDob(personal_Data?.dob);
      // setTrnDoc({uri:personal_Data?.trn_document})
      setTrnNo(personal_Data?.trnNo);
      let languages = masterData?.lookups?.speaking_languages?.filter(res => {
        return personal_Data?.speaking_languages?.includes(res?.id);
      });

      let languageIds = languages?.map(lang => lang.id);
      setSpeaking_Languages(languageIds || []);
      if (personal_Data?.photo) {
        setError({ ...error, photo: '' });
      }
    }
  }, [is_focus]);

  // useEffect(() => {
  //   if (socialdata?.user) {
  //     setFirstname(socialdata?.user?.name);
  //   }

  //   setFirstname(personal_Data?.firstName ? personal_Data?.firstName : '');
  //   setlastName(personal_Data?.lastname ? personal_Data?.lastname : '');

  //   if (info?.dob) {
  //     const formattedDob = moment(info.dob).format('DD-MM-YYYY');
  //     setDob(formattedDob);
  //   }

  //   setTrnNo(personal_Data?.trnNo ? personal_Data?.trnNo : '');
  //   // setTrnDoc(personal_Data?.trnDoc ? personal_Data?.trnDoc : {});
  // }, []);

  useEffect(() => {
    // Call getOTPToken when the screen loads (or at an appropriate time)
    const fetchOTPToken = async () => {
      const token = await getOTPToken();
      setOtpToken(token); // Set the token in the state
    };

    fetchOTPToken();
  }, []);

  const langArray = masterData?.lookups?.speaking_languages.map(i => ({
    label: i?.lookup_description[0]?.code,
    value: i?.id,
  }));

  const onVerify = () => {
    const error = {
      firstName: validators.checkChar(
        localization.personalInfo.firstName,
        firstName,
      ),
      lastname: validators.checkChar(
        localization.personalInfo.lastName,
        lastname,
      ),
      trnNo: validators.checkTRNumber(localization.personalInfo.Trn, trnNo),
      speaking_languages: validators?.checkRequire(
        localization?.myProfile?.language,
        speaking_languages[0],
      ),
      photo: validators.checkRequire(
        localization.personalInfo.driverPhoto,
        driverImg?.path || driverImg?.uri || driverImg,
      ),
    };
    setError(error);
    if (isValidForm(error)) {
      ForApi();
    }
  };



  const formatDateWithDashes = dateString => {
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString('en-GB');
    return formattedDate.replace(/\//g, '-');
  };

  const ForApi = async () => {
    setbtnloader(true);

    const formdata = new FormData();
    formdata.append('first_name', firstName);
    formdata.append('last_name', lastname);
    formdata.append('speaking_languages', JSON.stringify(speaking_languages));

    {
      dob && formdata.append('dob', formatDateWithDashes(dob));
    }
    {
      trnNo && formdata.append('trn', trnNo);
    }
    // if (trnDoc?.uri?.path) {
    //   {
    //     trnDoc?.uri && formdata.append('trn_document', trnDoc);
    //   }
    // }
    const trnDocUri = trnDoc?.path || trnDoc?.uri;
    if (trnDocUri && trnDoc != '') {
      formdata.append(
        'trn_document',
        trnDoc && {
          uri: trnDocUri,
          type: trnDoc?.type,
          name: trnDoc?.name,
        },
      );
    }

    const driverImgUri = driverImg?.path || driverImg?.uri;
    if (driverImgUri && driverImg != '') {
      formdata.append(
        'driver_photo',
        driverImg && {
          uri: driverImgUri,
          type: driverImg?.type,
          name: driverImg?.name,
        },
      );
    }

    console.log(trnDoc, '---imgg----');

    // return;
    let route = personal_Data?.verify_token
      ? `${SIGN_UPDATE}/${'1'}/${personal_Data?.verify_token}`
      : `${SIGNUP_STEP_1}${otpToken}`;

    console.log('formdata:::::::::', JSON.stringify(formdata));
    console.log('route:::::::::', route);

    POST_FORM_DATA(
      route,
      formdata,
      async success => {
        setbtnloader(false);
        console.log('success:::::::::', success);

        if (success?.status == 'success') {
          console.log('111111:::::::::');

          const combinedData = {
            ...personal_Data, // Include existing personal data
            firstName: firstName,
            lastname: lastname,
            dob: dob,
            trnNo: trnNo,
            trnDoc: trnDoc,
            speaking_languages: speaking_languages,
            photo: driverImg,
            step: success?.data?.step, // Add step
            verify_token: success?.data?.verify_token, // Add verify_token
          };

          dispatch(personalData(combinedData));
          setOTPToken('');
          navigation.navigate('PaymentDetails', { token: success?.data?.verify_token });
        } else {
          console.log('12121212:::::::::1', success);

          setbtnloader(false);
          SimpleToast.show(success?.msg || 'Something went wrong');
        }
        setbtnloader(false);
        // SimpleToast.show(success?.msg);
        if (success?.data?.first_name) {
          success?.data?.first_name.forEach(msg => {
            SimpleToast.show(msg); // Show email validation error
          });
        }
        if (success?.data?.last_name) {
          success?.data?.last_name.forEach(msg => {
            SimpleToast.show(msg); // Show email validation error
          });
        }
      },
      error => {
        setbtnloader(false);
        console.log('2222222:::::::::');

        // SimpleToast.show(error?.msg);
      },
      fail => {
        console.log('3333:::::::::');

        setbtnloader(false);
      },
    );
  };

  return (
    <ContainerView adjust={10}>
      <HeaderWithBack
        style={{ paddingHorizontal: 10 }}
        title={localization?.login?.signUp}
      // source={Images?.Back}
      // onBackPress={() => {
      //   navigation?.goBack();
      // }}
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      // keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0} // Adjust offset as needed
      >
        <ScrollView showsVerticalScrollIndicator={false} >
          <MainTitle
            step={Images.ic_step}
            subHeader={true}
            boldTitle={true}
            paddingHorizontal={10}
          />
          <View style={{ paddingHorizontal: 20 }}>
            <Input
              title={localization.personalInfo.firstName}
              aesterick={true}
              value={firstName}
              highlightBorder={true}
              onChange={f => {
                setFirstname(f);
                setError({ ...error, firstName: '' });
              }}
              error={error?.firstName}
              style_inputContainer={{ borderWidth: 1 }}
            // mainStyle={{marginTop: 30}}
            />
            <Input
              title={localization.personalInfo.lastName}
              aesterick={true}
              value={lastname}
              highlightBorder={true}
              onChange={l => {
                setlastName(l);
                setError({ ...error, lastname: '' });
              }}
              error={error?.lastname}
              style_inputContainer={{ borderWidth: 1 }}
            />

            <MultiDropDown
              value={speaking_languages || []}
              data={langArray}
              asterick={true}
              placeholder=""
              title={localization?.personalInfo?.langYouSpeak}
              onChange={(item, index) => {
                setSpeaking_Languages(
                  item?.map(i => {
                    return i?.value;
                  }),
                );
                setError({ ...error, speaking_languages: '' });
              }}
              error={error?.speaking_languages}
            />




            <Date_Picker
              selected_date={dob}
              ageRestrict={true}
              onChange={d => {
                setDob(d);
              }}
              onConfirm={d => {
                setDob(d);
              }}
              allowFutureDates={false}

            />
            <Input
              aesterick={true}
              title={localization.personalInfo.idNumber}
              keyboardType={'number-pad'}
              value={trnNo}
              highlightBorder={true}
              onChange={t => {
                setTrnNo(t);
                setError({ ...error, trnNo: '' });
              }}
              maxLength={13}
              style_inputContainer={{ borderWidth: 1 }}
              error={error?.trnNo}
            />
            <Typography
              color={Colors?.textColor}
              lineHeight={22}
              style={{ marginTop: 10 }}>
              {localization.personalInfo.trnDescription}
            </Typography>
            <Button
              title={
                trnDoc?.path || trnDoc?.uri || trnDoc
                  ? localization?.multiDropDown?.upload
                  : localization.personalInfo.uploadID
              }
              onPress={() => {
                navigation?.navigate('TakePhotoSa');
              }}
              textSize={14}
              textColor={'black'}
              leftIcon={trnDoc?.path || trnDoc?.uri || trnDoc ? 'tickMark' : 'upload'}
              style_button={{
                ...GlobalStyle.btnStyle,
              }}
            />

            <Typography color={Colors?.textColor} lineHeight={22}>
              {localization.personalInfo.idGuidelines}
            </Typography>
            <View
              style={{
                flexDirection: 'row',
                width: '90%',
                marginTop: 25,
              }}>
              <Typography size={16} fontFamily={Fonts?.Inter_Medium}>
                {localization.personalInfo.driverPhoto}
              </Typography>
              <Typography color="red">{'*'}</Typography>
            </View>
            <Typography color={Colors?.textColor} lineHeight={22}>
              {localization.personalInfo.selfieGuidelines}
            </Typography>
            <Button
              title={
                driverImg?.path || driverImg?.uri || driverImg
                  ? localization?.multiDropDown?.upload
                  : localization.personalInfo.uploadPhoto
              }
              onPress={() => {
                navigation?.navigate('TakePhoto');
              }}
              textSize={14}
              textColor="black"
              leftIcon={driverImg?.path || driverImg?.uri || driverImg ? 'tickMark' : 'upload'}
              style_button={{
                ...GlobalStyle.btnStyle,
                marginBottom: 5,
              }}
            />

            {!!error?.photo && <ErrorBox message={error?.photo} />}
          </View>
        </ScrollView>
        <Button
          loading={btnloader}
          title={localization.personalInfo.verify}
          onPress={() => {
            onVerify();
          }}
          style_button={{ backgroundColor: Colors?.Black, marginHorizontal: 10 }}
        />
      </KeyboardAvoidingView>
    </ContainerView>
  );
};

export default PersonalInfo;

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
