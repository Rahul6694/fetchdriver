import React from 'react';
import {Image, StyleSheet, View, Modal} from 'react-native';
import PropTypes from 'prop-types';
import {Colors} from '../../Constants/Colors';
import Typography from './Typography';
import {Fonts} from '../../Constants/Fonts';
import {Images} from '../../Constants/Images';
import Button from '../Button';
import {useDispatch} from 'react-redux';
import {isAuth, isChooseLanguage} from '../../Redux/action';

const FindingRideModal = ({
  showModal,
  close = () => {},
  title,
  subtitle,
  imageSource,
  containerStyle,
  imageStyle,
  textContainerStyle,
  Buttontitle,
  onPress,
  showButton,
  secondButtonTitle,
  titleSize = 30,
  onDeletedAccount = () => {},
}) => {
  const dispatch = useDispatch();

  return (
    <Modal
      statusBarTranslucent
      onRequestClose={() => close()}
      transparent={true}
      visible={showModal}>
      <View style={styles.overlay}>
        <View style={[styles.container, containerStyle]}>
          <Image source={imageSource} style={[imageStyle]} />
          <View style={[styles.textContainer, textContainerStyle]}>
            <Typography
              size={titleSize}
              lineHeight={35}
              fontFamily={Fonts.Inter_Bold}
              color={Colors.Black}
              textAlign="center">
              {title}
            </Typography>
            {subtitle && (
              <Typography
                size={16}
                lineHeight={25}
                textAlign="center"
                style={{marginTop: 12}}>
                {subtitle}
              </Typography>
            )}
            {showButton && (
              <View style={{marginTop: 20}}>
                <Button
                  title={Buttontitle}
                  onPress={() => {
                    onDeletedAccount();
                  }}
                  // onPress={() => dispatch(isAuth(false), dispatch(isChooseLanguage(false)))}
                  style_button={{backgroundColor: Colors?.Black}}
                />
                <Button
                  title={secondButtonTitle}
                  onPress={() => close()}
                  style_button={styles.callButton}
                  image_style={styles.buttonIcon}
                  text_style={styles.callButtonText}
                />
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default FindingRideModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 20,
    paddingVertical: 20,
    shadowColor: Colors.black,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  textContainer: {
    justifyContent: 'center',
    width: '90%',
    alignSelf: 'center',
    marginVertical: 20,
  },
  callButtonText: {
    color: Colors.Black,
  },
  callButton: {
    borderWidth: 1,
    borderColor: Colors.black,
    marginVertical: -10,
  },
});
