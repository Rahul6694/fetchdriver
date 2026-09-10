import React, {useState} from 'react';
import {
  StyleSheet,
  Modal,
  TouchableOpacity,
  KeyboardAvoidingView,
  TextInput,
  View,
  Image,
  Keyboard,
} from 'react-native';
import Button from '../Button';
import {Colors} from '../../Constants/Colors';
import {FULL_WIDTH} from '../../Constants/Layout';
import {Images} from '../../Constants/Images';
import Typography from './Typography';
import {Fonts} from '../../Constants/Fonts';
import SvgIcon from './svg';
import Press from './Press';
import localization from '../../Constants/localization';
import Input from '../Input';
import {isValidForm} from '../../Backend/Utility';
import {validators} from '../../Backend/Validator';

const TextInputModal = ({
  visible = false,
  close = () => {},
  backgroundColor = Colors.white,
  style,
  mainText = 'Success!',
  subText = 'Expect to be contacted by Fetch in a few days',
  loading,
  trnNo,
  ButtonLoading = false,
  onSubmit = inputValue => {},
  valueset,
}) => {
  const [textInputValue, setTextInputValue] = useState('');
  const [error, setError] = useState(null);
  React.useEffect(() => {
      if(valueset){
        setTextInputValue(valueset.toString());
      }
  }, [valueset,visible]);
  const handleSubmit = () => {
    Keyboard.dismiss();
    const error = {
      textInputValue:validators.checkTRNumber(localization.personalInfo.Trn, textInputValue),
    };

    setError(error);

    if (isValidForm(error)) {
      onSubmit(textInputValue); // Call the parent-provided callback
      setTextInputValue(''); // Clear the input
      close();
    }
  };

  return (
    <Modal
      transparent
      statusBarTranslucent={true}
      animationType="fade"
      visible={visible}
      onRequestClose={close}>
      <KeyboardAvoidingView style={styles.modalContainer} behavior="padding">
        <TouchableOpacity
          onPress={() => {
            close();
            setError(null);
            setTextInputValue(null)
          }}
          style={[
            styles.animateView,
            {backgroundColor: backgroundColor},
            {...style},
          ]}
          activeOpacity={1}>
          <TouchableOpacity activeOpacity={1}>
            <Press
              style={{alignSelf: 'flex-end'}}
              onPress={() => {
                close();
                setError(null);
                setTextInputValue(null)

              }}>
              <SvgIcon name="crossIcon" />
            </Press>
            {/* <Image source={Images?.Slice1} style={styles?.logoutImage} /> */}

            {/* <Typography
              fontFamily={Fonts?.Inter_Bold}
              textAlign={'center'}
              color={Colors?.black}
              size={30}
              style={{marginTop: 10}}>
              {mainText}
            </Typography> */}
            {/* <Typography
              textAlign={'center'}
              size={16}
              color={Colors?.textColor}
              style={{marginTop: 10}}>
              {subText}
            </Typography> */}

            <Input
              title={localization.personalInfo.idNumber}
              keyboardType={'number-pad'}
              value={textInputValue}
              highlightBorder={true}
              maxLength={13}
              onChange={e => {
                setTextInputValue(e);
                setError({...error, textInputValue: ''});
              }}
              // onChange={t => {
              //     setTextInputValue(t);
              // }}
              error={error?.textInputValue}
              style_inputContainer={{borderWidth: 1}}
            />

            <Button
              loading={ButtonLoading}
              title={localization.ContactUs?.button}
              onPress={() => {
                handleSubmit();
              }}
              style_button={{backgroundColor: Colors?.Black}}
            />
          </TouchableOpacity>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default TextInputModal;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
  },
  animateView: {
    width: '90%',
    padding: 20,
    borderRadius: 20,
    alignSelf: 'center',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  modalButton: {
    width: FULL_WIDTH * 0.38,
  },
  logoutImage: {
    height: 100,
    width: 100,
    alignSelf: 'center',
    marginTop: 35,
  },
  textInput: {
    borderWidth: 1,
    borderColor: Colors.textColor,
    borderRadius: 8,
    padding: 10,
    marginTop: 20,
    color: Colors.black,
  },
});
