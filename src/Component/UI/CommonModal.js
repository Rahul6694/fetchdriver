import {
  StyleSheet,
  Modal,
  TouchableOpacity,
  KeyboardAvoidingView,
  Animated,
  View,
  Image,
} from 'react-native';
import React from 'react';
import {Colors} from '../../Constants/Colors';
import {FULL_WIDTH} from '../../Constants/Layout';
import {Images} from '../../Constants/Images';
import Typography from './Typography';
import {Fonts} from '../../Constants/Fonts';
import SvgIcon from './svg';
import Press from './Press';
import Button from '../Button';
import localization from '../../Constants/localization';

const CommonModal = ({
  visible = false,
  close = () => {},
  children,
  backgroundColor = Colors.white,
  style,
  mainView = {},
  onPressYes = () => {},
  button,
  mainText = localization?.imagemodal?.Success,
  subText = localization?.imagemodal?.Fetch,
  loading,
  yesBtn,
  noBtn,
  BackImage,
  textSize = 30,
}) => {
  return (
    <Modal
      transparent
      statusBarTranslucent={true}
      animationType="fade"
      visible={visible}
      onRequestClose={close}>
      <KeyboardAvoidingView
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.7)',
          justifyContent: 'center',
        }}
        behavior="padding">
        <TouchableOpacity
          onPress={close}
          style={[
            styles.animateView,
            {backgroundColor: backgroundColor},
            {...style},
          ]}
          activeOpacity={1}>
          <TouchableOpacity activeOpacity={1}>
            {BackImage && (
              <>
                <Press style={{alignSelf: 'flex-end'}} onPress={close}>
                  <SvgIcon name="crossIcon" />
                </Press>
                <Image
                  source={Images?.Slice1}
                  style={styles?.logoutImage}></Image>
              </>
            )}
            <Typography
              fontFamily={Fonts?.Inter_Bold}
              textAlign={'center'}
              color={Colors?.black}
              size={textSize}
              style={{marginTop: 10}}>
              {mainText}
            </Typography>
            <Typography
              textAlign={'center'}
              size={16}
              color={Colors?.textColor}
              style={{marginTop: 10}}>
              {subText}
            </Typography>

            {children}
            {!button && (
              <View style={styles.modalButtonContainer}>
                {!noBtn && (
                  <Button
                    loading={false}
                    title={localization?.imagemodal?.yes}
                    onPress={() => {
                      onPressYes();
                    }}
                    textColor={Colors.white}
                    style_button={{
                      backgroundColor: Colors?.Black,
                      marginVertical: 5,
                    }}
                  />
                )}
                {!yesBtn && (
                  <Button
                    loading={false}
                    title={localization?.imagemodal?.back}
                    onPress={() => {
                      close();
                    }}
                    textColor={Colors.black}
                    style_button={{
                      backgroundColor: Colors?.white,
                      marginVertical: 5,
                      borderWidth: 1,
                    }}
                  />
                )}
              </View>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default CommonModal;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#00000090',
    justifyContent: 'center',
    alignItems: 'center',
  },
  animateView: {
    width: '90%',
    padding: 20,
    borderRadius: 20,
    alignSelf: 'center',
  },
  modalButtonContainer: {
    // flexDirection: 'row',
    justifyContent: 'space-between',
    // marginTop: 20,
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
});
