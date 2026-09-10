import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import ContainerView from '../../Component/ContainerView';
import Button from '../../Component/Button';
import {Colors} from '../../Constants/Colors';
import HeaderWithBack from '../../Component/HeaderWithBack';
import {Images} from '../../Constants/Images';
import Typography from '../../Component/UI/Typography';
import {Fonts} from '../../Constants/Fonts';
import DropdownComponent from '../../Component/DropdownComponent';
import Input from '../../Component/Input';
import {isValidForm} from '../../Backend/Utility';
import {validators} from '../../Backend/Validator';
import {useDispatch, useSelector} from 'react-redux';
import {POST_FORM_DATA} from '../../Backend/Backend';
import {SIGN_UPDATE, SIGNUP_STEP_2} from '../../Backend/ApiRoutes';
import SimpleToast from 'react-native-simple-toast';
import {Header, MainTitle} from '../../Component/HeaderContent';
import {personalData} from '../../Redux/action';
import {useIsFocused} from '@react-navigation/native';
import localization from '../../Constants/localization';

const PaymentDetails = ({navigation, route}) => {
  const masterData = useSelector(store => store.master_data);
  const personal_Data = useSelector(store => store.personalData);
  const dispatch = useDispatch();
  const [billType, setBillType] = useState({});
  const [bankAccountHolder, setBankAccountHolder] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [branchCode, setBranchCode] = useState({});
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [error, setError] = useState({});
  const [btnloader, setbtnloader] = useState(false);
  const is_focus = useIsFocused();
  const billTypeArray = masterData?.lookups?.billing_type?.map(i => ({
    label: i?.lookup_description[0]?.code,
    value: i?.id,
  }));
  const branchCodeArray = masterData?.lookups?.branch_code.map(i => ({
    label: i?.lookup_description[0]?.code,
    value: i?.id,
  }));


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



  React.useEffect(() => {
    if (is_focus) {
      setBankAccountHolder(personal_Data?.bankAccountHolder);
      setBankAccountNumber(personal_Data?.bankAccountNumber);
      let billNumber = billTypeArray?.filter(res => {
        return res?.value == personal_Data?.billType; // Return the condition for filtering
      });
      setBillType({
        label: billNumber[0]?.label,
        value: billNumber[0]?.value,
      });
      let BranchCode = branchCodeArray?.filter(res => {
        return res?.value == personal_Data?.branchCode; // Return the condition for filtering
      });
      setBranchCode({
        label: BranchCode[0]?.label,
        value: BranchCode[0]?.value,
      });

      // setBillType(personal_Data?.billType);
    }
  }, [is_focus]);

  const handleSubmit = () => {
    const error = {
      billType: validators.checkRequire(
        localization.paymentDetails.billingType,
        billType?.label,
      ),
      bankAccountHolder: validators.checkRequire(
        localization.paymentDetails.bankAccountHolderName,
        bankAccountHolder,
      ),
      bankAccountNumber: validators.checkRequire(
        localization.paymentDetails.bankAccountNumber,
        bankAccountNumber,
      ),
      branchCode: validators.checkRequire(
        localization.paymentDetails.branchCode,
        branchCode?.label,
      ),
    };

    setError(error);

    if (isValidForm(error)) {
      ForApi();
    }
  };

  const ForApi = async () => {
    setbtnloader(true);
    const formdata = new FormData();
    formdata.append('billing_type_lookup_id', billType?.value);
    formdata.append('account_holder_name', bankAccountHolder);
    formdata.append('account_number', bankAccountNumber);
    formdata.append('branch_code_lookup_id', branchCode?.value);
    let route = personal_Data?.verify_token
      ? `${SIGN_UPDATE}/${'2'}/${personal_Data?.verify_token}`
      : `${SIGNUP_STEP_2}${personal_Data?.verify_token}`;
    console.log('44444 ==>2', route);
    POST_FORM_DATA(
      route,
      formdata,
      async success => {
        if (success?.status == 'success') {
          setbtnloader(false);
          const combinedData = {
            ...personal_Data, // Include existing personal data
            billType: billType?.value,
            bankAccountHolder: bankAccountHolder,
            bankAccountNumber: bankAccountNumber,
            branchCode: branchCode?.value,
            step: success?.data?.step, // Add step
            verify_token: success?.data?.verify_token, // Add verify_token
          };

          dispatch(personalData(combinedData));
          navigation.navigate('CarDetails');
        } else {
          setbtnloader(false);

          SimpleToast.show(success?.msg);
        }
        setbtnloader(false);

        // SimpleToast.show(success?.msg);
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
  return (
    <ContainerView>
      <HeaderWithBack
        onBackPress={() => {
          navigation.navigate('PersonalInfo');
        }}
        title={localization.carDetails.signUp}
        source={Images.Back}
        headerHelp={true}
        showSpace={false}
      />
      <KeyboardAvoidingView
        style={{flex: 1}}
      behavior={
                Platform.OS == 'ios'
                  ? 'padding'
                  : keyboardHeight
                  ? 'height'
                  : undefined
              }
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{flexGrow: 1, paddingBottom: 30}}>
          <MainTitle
            subHeader={true}
            boldTitle={true}
            stepImg={Images?.Step2}
            toptitle={localization.paymentDetails.paymentDetails}
            subTitle={localization.paymentDetails.paymentNote}
            // mainPadding={0}
          />
          <Typography
            style={{marginVertical: 5}}
            color={Colors.lableColor}
            lineHeight={22}>
            {localization.paymentDetails.getPaid}
          </Typography>
          <Typography
            style={{marginVertical: 5}}
            color={Colors.lableColor}
            lineHeight={22}>
            {localization.paymentDetails.thirdPartyWarning}
          </Typography>

          <DropdownComponent
            data={billTypeArray}
            title={localization.paymentDetails.billingType}
            placeholder={''}
            value={billType}
            onChange={value => {
              setBillType(value);
              setError({...error, billType: ''});
            }}
            error={error?.billType}
          />

          <Input
            title={localization.paymentDetails.bankAccountHolderName}
            style_inputContainer={{borderWidth: 1}}
            placeholder={'XYZ Taxi Ltd / John Smith'}
            placeholderTextColor={'#B5B5B5'}
            value={bankAccountHolder}
            onChange={e => {
              setBankAccountHolder(e);
              setError({...error, bankAccountHolder: ''});
            }}
            error={error?.bankAccountHolder}
          />

          <View>
            <Typography size={12} color={'#7B7A77'}>
              {localization?.paymentDetails?.input1}
            </Typography>
          </View>

          <Input
            title={localization.paymentDetails.bankAccountNumber}
            style_inputContainer={{borderWidth: 1}}
            placeholder={'AA98 2200 2056 9856'}
            placeholderTextColor={'#B5B5B5'}
            value={bankAccountNumber}
            onChange={e => {
              setBankAccountNumber(e);
              setError({...error, bankAccountNumber: ''});
            }}
            error={error?.bankAccountNumber}
          />
          <View>
            <Typography size={12} color={'#7B7A77'}>
              {localization?.paymentDetails?.input2}
            </Typography>
          </View>

          <DropdownComponent
            data={branchCodeArray}
            title={localization.paymentDetails.branchCode}
            placeholder={''}
            value={branchCode}
            onChange={value => {
              setBranchCode(value);
              setError({...error, branchCode: ''});
            }}
            error={error?.branchCode}
          />
        </ScrollView>

        <Button
          loading={btnloader}
          title={localization.paymentDetails.next}
          style_button={{backgroundColor: Colors?.Black}}
          onPress={handleSubmit}
        />
      </KeyboardAvoidingView>
    </ContainerView>
  );
};

export default PaymentDetails;

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderRadius: 10,
    borderColor: Colors.borderColor,
  },
  button: {
    borderWidth: 1,
    borderColor: Colors.Black,
  },
});
