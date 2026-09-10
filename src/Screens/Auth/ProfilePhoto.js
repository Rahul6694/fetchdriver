import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  ScrollView,
} from 'react-native';
import React from 'react';
import ContainerView from '../../Component/ContainerView';
import HeaderWithBack from '../../Component/HeaderWithBack';
import {Images} from '../../Constants/Images';
import Typography from '../../Component/UI/Typography';
import {Fonts} from '../../Constants/Fonts';
import {Colors} from '../../Constants/Colors';
import Button from '../../Component/Button';
import {useSelector} from 'react-redux';

const ProfilePhoto = ({navigation}) => {
  const personal_Data = useSelector(store => store.personalData);

  return (
    <ContainerView>
      <HeaderWithBack source={Images.Back} headerHelp={true} />
      <ScrollView>
        <Typography
          size={26}
          fontFamily={Fonts.Inter_Bold}
          color={Colors.Black}
          style={{marginVertical: 15}}>
          Take your profile photo
        </Typography>
        <Typography
          color={Colors.lableColor}
          style={{marginVertical: 10}}
          lineHeight={22}>
          Please note that once you submit your profile photo, it can only be
          changed in limited circumstances.
        </Typography>
        <Typography style={{marginVertical: 10}} lineHeight={22}>
          1. Face the camera and make sure your eyes and mouth are clearly
          visible
        </Typography>
        <Typography style={{marginVertical: 10}} lineHeight={22}>
          2. Make sure the photo is well lit, free of glare and in focus
        </Typography>
        <Typography style={{marginVertical: 10}} lineHeight={22}>
          3.No photos of a photo, filters or alterations
        </Typography>
        <View
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            marginVertical: '12%',
          }}>
          <Image
            source={Images.profilePhoto}
            style={{height: 250, width: 250}}
          />
        </View>
        <Typography lineHeight={22}>
          Fetch will use the photo to check for duplication across other
          accounts.{' '}
          <Typography style={styles.text} color={Colors.selectedBorderColor}>
            Learn More
          </Typography>
        </Typography>
      </ScrollView>
      <Button
        title={'Take Photo'}
        style_button={{backgroundColor: Colors?.Black}}
      />
    </ContainerView>
  );
};

export default ProfilePhoto;

const styles = StyleSheet.create({
  text: {
    textDecorationLine: 'underline',
  },
});
