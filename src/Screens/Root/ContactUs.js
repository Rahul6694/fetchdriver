import {
  Image,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useState} from 'react';
import Input from '../../Component/Input';
import localization from '../../Constants/localization';
import {Images} from '../../Constants/Images';
import ContainerView from '../../Component/ContainerView';
import Button from '../../Component/Button';
import {validators} from '../../Backend/Validator';
import {isValidForm} from '../../Backend/Utility';
import {Colors} from '../../Constants/Colors';
import ErrorBox from '../../Component/ErrorBox';
import {CONTACT_US, LOGIN} from '../../Backend/ApiRoutes';
import {ToastMsg} from '../../Component/ToastMsg';
import {POST_FORMDATA_WITH_TOKEN, POST_WITH_TOKEN} from '../../Backend/Backend';
import HeaderWithBack from '../../Component/HeaderWithBack';
import SimpleToast from 'react-native-simple-toast';
import FormContainer from '../../Component/UI/FormContainer';

const ContactUs = ({route, navigation}) => {
  const [loading, setLoading] = useState(false);
  const [first_name, setFirst_name] = useState('');
  const [last_name, setLast_name] = useState('');
  const [email, setEmail] = useState('');
  const [number, setNumber] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [counteryCode, setCounteryCode] = useState({
    code: 'ZA',
    dial_code: '+27',
  });

  const handleSubmit = () => {
    let error = {
      first_name: validators.checkChar(
        localization.Sign_up?.firstName,
        first_name,
      ),
      last_name: validators.checkChar(
        localization.Sign_up?.lastName,
        last_name,
      ),
      email: validators.checkEmail(localization.Sign_up?.email, email),
      number: validators.checkFixPhoneNumber(
        localization.login?.phoneNumber,
        number,
      ),

      // number: validators.checkFixPhoneNumber(
      //   localization.login?.phoneNumber,
      //   number,
      // ),
      message: validators.checkRequire(
        localization?.ContactUs?.message,
        message,
      ),
    };

    setError(error);
    if (isValidForm(error)) {
      Keyboard.dismiss();
      setLoading(true);
      const formdata = new FormData();
      formdata.append('first_name', first_name);
      formdata.append('last_name', last_name);
      formdata.append('email', email);
      formdata.append('phone_number', number);
      formdata.append('message', message);
      formdata.append('phone_number_prefix', counteryCode?.dial_code);
      formdata.append('phone_number_country_code', counteryCode?.code);

      POST_FORMDATA_WITH_TOKEN(
        CONTACT_US,
        formdata,
        async success => {
          setLoading(false);

          if (success?.status === 'success') {
            ToastMsg(success?.msg, SimpleToast.LONG);
            navigation?.goBack();
          } else {
            ToastMsg(success.msg || 'something went wrong');
          }
        },
        error => {
          console.log('error', error);
          setLoading(false);
          ToastMsg(error?.msg || 'something went wrong');
        },
        fail => {
          console.log('fail', fail);
          setLoading(false);

          ToastMsg(fail?.msg || 'Network error');
        },
      );
    }
  };

  return (
    <ContainerView>
      <HeaderWithBack
        source={Images.Back}
        title={localization?.ContactUs?.Header}
      />
          <FormContainer>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>

        <Input
          title={localization.Sign_up?.firstName}
          style_inputContainer={styles.input}
          value={first_name}
          onChange={e => {
            setFirst_name(e);
            setError({...error, first_name: ''});
          }}
        />
        <ErrorBox message={error.first_name} />

        <Input
          title={localization.Sign_up?.lastName}
          style_inputContainer={styles.input}
          value={last_name}
          onChange={e => {
            setLast_name(e);
            setError({...error, last_name: ''});
          }}
        />
        <ErrorBox message={error?.last_name} />
        <Input
          title={localization.Sign_up?.email}
          style_inputContainer={styles.input}
          keyboardType={'email-address'}
          value={email}
          onChange={e => {
            setEmail(e);
            setError({...error, email: ''});
          }}
        />
        <ErrorBox message={error?.email} />
        <Input
          onCountryPress={item => {
            setCounteryCode(item);
          }}
          setCounteryCode={setCounteryCode}
          title={localization.login?.phoneNumber}
          style_inputContainer={{borderWidth: 1}}
          mainStyle={{marginTop: 10}}
          countryPicker={true}
          keyboardType={'phone-pad'}
          value={number}
          onChange={v => {
            setNumber(v);
            setError({...error, number: ''});
          }}
        />
        <ErrorBox message={error?.number} />

        <Input
          title={localization?.ContactUs?.message}
          style_input={{
            justifyContent: 'flex-start',
            height: 150,
          }}
          height={150}
          style_inputContainer={{
            // height: 300,
            borderRadius: 9,
            borderWidth: 1,
            borderColor: Colors.borderColor,
            marginBottom: 10,
            paddingHorizontal: 10,
            marginBottom: 5,
          }}
          numberOfLines={3}
          value={message}
          onChange={e => {
            setMessage(e);
            setError({...error, message: ''});
          }}
          multiline={true}
          placeholder={localization?.ContactUs?.typeYourMessage}
          placeholderTextColor={Colors.textColor}
        />
        <ErrorBox message={error?.message} />

      </ScrollView>
        </FormContainer>
      <Button
        title={localization?.ContactUs?.button}
        onPress={() => handleSubmit()}
        loading={loading}
        style_button={{backgroundColor: Colors.Black}}
      />
    </ContainerView>
  );
};

export default ContactUs;

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderRadius: 10,
    borderColor: Colors.borderColor,
  },
  // inputMag: {
  //   borderWidth: 1,
  //   borderRadius: 10,
  //   borderColor: Colors.borderColor,
  //   height: 146,
  //   alignItems: 'flex-start',
  // },
});
