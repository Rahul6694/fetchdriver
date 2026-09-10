import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import React, {useState} from 'react';
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
import {POST_FORM_DATA, POST_FORMDATA_WITH_TOKEN} from '../../Backend/Backend';
import {
  SIGN_UPDATE,
  SIGNUP_STEP_2,
  UPADTE_BANK_DETAILS,
} from '../../Backend/ApiRoutes';
import SimpleToast from 'react-native-simple-toast';
import {Header, MainTitle} from '../../Component/HeaderContent';
import {personalData} from '../../Redux/action';
import {useIsFocused} from '@react-navigation/native';
import localization from '../../Constants/localization';
import {CommonView} from '../../Component/CommonView';
const paymentMethods = [
  {id: 1, name: 'Google Pay'},
  {id: 2, name: 'Samsung Pay'},
  {id: 3, name: 'Apple Pay'},
  {id: 4, name: 'Credit Card'},
];
const rideCharges = [
  {
    id: 1,
    title: localization.driverFlow.rideCharge,
    amount: 'GNF 90',
    type: 'charge',
  },
  {
    id: 2,
    title: 'Waiting Charge',
    amount: 'GNF 5',
    type: 'charge',
  },
  {
    id: 3,
    title: 'Referral Offer',
    amount: '- GNF 5',
    type: 'discount',
  },
  {
    id: 4,
    title: 'Total',
    amount: 'GNF 90',
    type: 'total',
  },
];

const PaymentDetail = ({navigation}) => {
  const masterData = useSelector(store => store.master_data);
  const personal_Data = useSelector(store => store.personalData);
  const dispatch = useDispatch();
  const [billType, setBillType] = useState({});
  const [bankAccountHolder, setBankAccountHolder] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [branchCode, setBranchCode] = useState({});
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

    console.log('formdata',formdata);
    
    POST_FORMDATA_WITH_TOKEN(
      UPADTE_BANK_DETAILS,
      formdata,
      success => {
        console.log(success, 'success==============>');
        if (success?.status == 'success') {
          setbtnloader(false);
          SimpleToast.show(success?.msg || success?.message || 'succes');
          const combinedData = {
            ...personal_Data, // Include existing personal data
            billType: billType?.value,
            bankAccountHolder: bankAccountHolder,
            bankAccountNumber: bankAccountNumber,
            branchCode: branchCode?.value,
          };

          dispatch(personalData(combinedData));
          navigation?.goBack();
          // navigation.navigate('CarDetails');
        } else {
          setbtnloader(false);

          SimpleToast.show(success?.msg);
        }
        setbtnloader(false);

        // SimpleToast.show(success?.msg);
      },
      error => {
        setbtnloader(false);
console.log('error from paymant details',error);

        // SimpleToast.show(error?.msg);
      },
      fail => {
        console.log('fail from paymant details',fail);
        setbtnloader(false);
      },
    );
  };
  return (
    <View style={{paddingHorizontal: 22, flex: 1}}>
      <HeaderWithBack
        title={localization.MyAccount.paymentDetails}
        source={Images.Back}
        showSpace={false}
      />
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        // keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0} // Adjust offset as needed
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <DropdownComponent
            title={'Billing Type'}
            data={billTypeArray}
            placeholder={localization.paymentDetails.billingType}
            placeholderTextColor={'#B5B5B5'}
            value={billType}
            onChange={value => {
              setBillType(value);
              setError({...error, billType: ''});
            }}
            error={error?.billType}
          />

          <Input
            title={'Bank Account Holder Name'}
            placeholder={localization.paymentDetails.bankAccountHolderName}
            style_inputContainer={{marginBottom: 10}}
            placeholderTextColor={'#B5B5B5'}
            value={bankAccountHolder}
            onChange={e => {
              setBankAccountHolder(e);
              setError({...error, bankAccountHolder: ''});
            }}
            error={error?.bankAccountHolder}
          />

          <View>
            <Typography size={15} color={'#7B7A77'}>
              {localization?.paymentDetails?.input1}
            </Typography>
          </View>

          <Input
            title={'Bank Account Number'}
            placeholder={localization.paymentDetails.bankAccountNumber}
            style_inputContainer={{marginBottom: 10}}
            placeholderTextColor={'#B5B5B5'}
            value={bankAccountNumber}
            onChange={e => {
              setBankAccountNumber(e);
              setError({...error, bankAccountNumber: ''});
            }}
            error={error?.bankAccountNumber}
          />
          <View>
            <Typography size={15} color={'#7B7A77'}>
              {localization?.paymentDetails?.input2}
            </Typography>
          </View>

          <DropdownComponent
            title={'Branch Code'}
            data={branchCodeArray}
            placeholder={localization.paymentDetails.branchCode}
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
          title={'Update'}
          style_button={{backgroundColor: Colors?.Black}}
          onPress={handleSubmit}
        />
      </KeyboardAvoidingView>
    </View>
  );
};

export default PaymentDetail;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  container: {
    backgroundColor: Colors.white,
    // justifyContent: 'center',
    // alignItems: 'center',
  },
  paymentContainer: {
    backgroundColor: '#FFFFFF',
    // width: '98%',
    marginHorizontal: 2,
    paddingVertical: 17,
    paddingHorizontal: 12,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
    elevation: 4,
    shadowColor: '#485C4414',
  },
  paymentText: {
    fontFamily: Fonts.Inter_Medium,
    fontSize: 16,
    lineHeight: 22,
    color: Colors.Black,
  },
  radioOuter: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.Black,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    height: 14,
    width: 14,
    borderRadius: 7,
    backgroundColor: Colors.Black,
  },
  RideContainer: {
    width: '100%',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  input: {
    borderRadius: 10,

    overflow: 'hidden',
    //  width: "70%"
    height: 50,
  },
});
