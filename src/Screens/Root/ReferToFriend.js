import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Share,
  Image,
  ScrollView,
} from 'react-native';
import React from 'react';
import {Images} from '../../Constants/Images';
import {Colors} from '../../Constants/Colors';
import {Fonts} from '../../Constants/Fonts';
import Typography from '../../Component/UI/Typography';
import HeaderWithBack from '../../Component/HeaderWithBack';
import Button from '../../Component/Button';
import ContainerView from '../../Component/ContainerView';
import {windowWidth} from '../../Constants/Dimensions';
import localization from '../../Constants/localization';
import {useSelector} from 'react-redux';
import Clipboard from '@react-native-clipboard/clipboard';
import { ToastMsg } from '../../Component/ToastMsg';
const ReferToFriend = ({navigation}) => {
  const get_detail = useSelector(store => store.updateAuthData);
  const copyToClipboard = data => {
    Clipboard.setString(data);
    ToastMsg('Your promocode is copied');
  };

  console.log("44444444444",get_detail)
  return (
    <ContainerView>
      <HeaderWithBack
        source={Images.Back}
        title={localization?.ReferToFriend?.header}
      />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Image source={Images.Gift} style={styles.image} />
        <Typography
          fontFamily={Fonts.Inter_Bold}
          size={26}
          lineHeight={34}
          textAlign="left"
          color={Colors.black}>
          {localization?.ReferToFriend?.main_title}
        </Typography>
        <Typography
          size={14}
          lineHeight={22}
          textAlign="left"
          style={styles.subtitle}>
          {localization?.ReferToFriend?.sub_title}
        </Typography>
        <Typography
          size={20}
          fontFamily={Fonts.Inter_SemiBold}
          color={Colors.Black}>
          {localization?.ReferToFriend?.get}
        </Typography>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginVertical: 20,
          }}>
          <Image source={Images.Gift} style={{height: 37, width: 37}} />
          <View style={{marginLeft: 10, width: windowWidth / 2 + 110}}>
            <Typography
              size={20}
              fontFamily={Fonts.Inter_SemiBold}
              color={Colors.Black}>
              {localization?.ReferToFriend?.Fetch}
            </Typography>
            <Typography>{localization?.ReferToFriend?.offer}</Typography>
          </View>
        </View>
        <Typography
          size={20}
          fontFamily={Fonts.Inter_SemiBold}
          color={Colors.Black}>
          {localization?.ReferToFriend?.friends_get}
        </Typography>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginVertical: 20,
          }}>
          <Image
            source={Images.ReferFriendLetter}
            style={{height: 37, width: 37}}
          />
          <View style={{marginLeft: 10, width: windowWidth / 2 + 110}}>
            <Typography
              size={20}
              fontFamily={Fonts.Inter_SemiBold}
              color={Colors.Black}>
              {localization?.ReferToFriend?.Fetch}
            </Typography>
            <Typography>{localization?.ReferToFriend?.offer}</Typography>
          </View>
        </View>

        <Typography
          fontFamily={Fonts.Inter_SemiBold}
          size={16}
          lineHeight={22}
          color={Colors.Black}>
          {localization?.ReferToFriend?.share}
        </Typography>
        <View style={styles.RefContainer}>
          <Typography
            fontFamily={Fonts.Inter_Medium}
            style={styles.referralCode}>
            {localization?.ReferToFriend?.code}
          </Typography>
          <TouchableOpacity 
          onPress={() => {
            copyToClipboard(get_detail?.referral_code)
          }}
          accessibilityLabel="Copy referral code">
            <Image source={Images.Copy} style={styles.copyIcon} />
          </TouchableOpacity>
        </View>
      </ScrollView>
      <Button
        title={localization?.ReferToFriend?.button}
        style_button={{backgroundColor: Colors.Black}}
        onPress={async () =>
          await Share.share({
            message: `Check out my referral code: ${get_detail?.referral_code}`,
          })}
      />
    </ContainerView>
  );
};

export default ReferToFriend;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.Background,
  },
  card: {
    backgroundColor: Colors.selectedBorderColor,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 33,
    marginBottom: 36,
  },
  imgView: {
    marginVertical: 36,
    paddingHorizontal: 46,
    paddingVertical: 40,
    backgroundColor: Colors.Primary,
    borderRadius: 120,
  },
  image: {
    height: 171,
    width: 171,
    alignSelf: 'center',
    marginVertical: 10,
  },
  subtitle: {
    marginVertical: 10,
  },
  shareButton: {
    backgroundColor: Colors.Primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  RefContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#485C4414',
    paddingHorizontal: 12,
    paddingVertical: 15,
    borderRadius: 12,
    marginVertical: 10,
    alignItems: 'center',
  },
  referralCode: {
    color: '#000',
    fontSize: 16,
  },
  copyIcon: {
    height: 24,
    width: 24,
  },
});
