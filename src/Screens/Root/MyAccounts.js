import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  FlatList,
  Linking,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import HeaderWithBack from '../../Component/HeaderWithBack';
import ContainerView from '../../Component/ContainerView';
import Typography from '../../Component/UI/Typography';
import localization from '../../Constants/localization';
import { Images } from '../../Constants/Images';
import { Fonts } from '../../Constants/Fonts';
import { Colors } from '../../Constants/Colors';
import {
  Id,
  isAuth,
  isChooseLanguage,
  Token,
  updateAuthData,
} from '../../Redux/action';
import { useIsFocused } from '@react-navigation/native';
import { setToken, setUserData } from '../../Constants/AsyncStorage';
import CommonModal from '../../Component/UI/CommonModal';
import Button from '../../Component/Button';
import { FULL_WIDTH } from '../../Constants/Layout';
import { GET_WITH_TOKEN } from '../../Backend/Backend';
import { LOGOUT } from '../../Backend/ApiRoutes';
import { ToastMsg } from '../../Component/ToastMsg';

const MyAccounts = ({ navigation }) => {
  const dispatch = useDispatch();
  const [openLogout, setOpenLogout] = useState(false);
  // const masterData = useSelector(store => store.master_data);
  const Links = useSelector(store => store.master_data);
  const [facebook, SetFacebook] = useState("")
  const [twitter, SetTwitter] = useState("")
  const [instagram, SetInstagram] = useState("")
  const [linkedin, SetLinkedin] = useState("")
  const focus = useIsFocused();
  const [accounts, setaccounts] = useState([]);
  const LogoutApiCall = async () => {
    const handleLogout = async (message) => {
      try {
        // Close logout modal
        setOpenLogout(false);

        // Show toast message
        // ToastMsg(message);

        // Clear token and user data
        await setToken('');
        await setUserData('');

        // Update redux state
        dispatch(isAuth(false));
        dispatch(Token({ token: '' }));
        dispatch(updateAuthData({}));
        dispatch(Id(''));
      } catch (err) {
        console.error('Error during logout cleanup:', err);
      }
    };

    try {
      await GET_WITH_TOKEN(
        LOGOUT,
        async (success) => {
          console.log('Logout Success:', success);
          await handleLogout(success?.msg);
        },
        async (error) => {
          console.error('Logout Error:', error);
          await handleLogout(error?.msg || 'Logout failed');
        },
        () => {
          console.error('Failed to make the API call.');
        }
      );
    } catch (err) {
      console.error('Unexpected error during logout:', err);
    }
  };

  useEffect(() => {
    setSocialMediaLinks();
  }, [Links]);
  const setSocialMediaLinks = () => {
    SetFacebook(Links.social_link_facebook);
    SetTwitter(Links.social_link_twitter);
    SetInstagram(Links.social_link_instagram);
    SetLinkedin(Links.social_link_linkedin);
  };
  useEffect(() => {
    setaccounts([
      {
        icon: Images?.Profile_icon,
        name: localization.MyAccount.manageProfile,
        navigate: 'DriverProfile',
      },
      {
        icon: Images?.myDocuments,
        name: localization.MyAccount.myDocuments,
        navigate: 'MyDocument',
      },
      {
        icon: Images?.Setting,
        name: localization.MyAccount.settings,
        navigate: 'Settings',
      },
      {
        icon: Images?.FAQ,
        name: localization.MyAccount.support,
        navigate: 'Support',
        next: Images.next,
      },
      // {
      //   icon: Images?.rate,
      //   name: localization.MyAccount.rateTheApp,
      //   navigate: 'ReferToFriend',
      // },
      { icon: Images?.Logout, name: localization.MyAccount.logout, navigate: '' },
    ]);
  }, [focus]);

  const openLink = url => {
    Linking.openURL(url).catch(err =>
      console.error('Failed to open URL:', err),
    );
  };
  return (
    <ContainerView>
      <HeaderWithBack

        source={Images.Back}
        title={localization.MyAccount.myAccount}
      />
      <FlatList
        data={accounts}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          <>
            <View style={styles.container}>
              <Typography
                size={16}
                fontFamily={Fonts.Inter_Medium}
                color={Colors.Black}
                textAlign={'left'}>
                {localization.MyAccount.followUs}
              </Typography>
              <View style={styles.image_Container}>
                <TouchableOpacity onPress={() => openLink(twitter)}>
                  <Image source={Images.Twitter} style={styles.image} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => openLink(linkedin)}>
                  <Image source={Images.LinkedIn} style={styles.image} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => openLink(facebook)}>
                  <Image source={Images.Facebook} style={styles.image} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => openLink(instagram)}>
                  <Image source={Images.Insta} style={styles.image} />
                </TouchableOpacity>
              </View>
            </View>
          </>
        }
        renderItem={({ item }) => (
          <>
            <View>
              <TouchableOpacity
                style={styles.menuButton}
                onPress={async () => {
                  if (item.name === localization.MyAccount.logout) {
                    setOpenLogout(true);
                  } else {
                    // Navigate to the appropriate screen
                    navigation.navigate(item?.navigate, {
                      screenName: item.name,
                    });
                  }
                }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={styles.iconContainer}>
                    <Image source={item.icon} style={[styles.icon]} />
                  </View>
                  <Typography
                    size={16}
                    lineHeight={19.36}
                    fontFamily={Fonts.Inter_Medium}
                    color={Colors.Black}>
                    {item?.name}
                  </Typography>
                </View>
                {item?.next && (
                  <View>
                    <Image source={item.next} style={{ height: 16, width: 16 }} />
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </>
        )}
      />
      <CommonModal
        visible={openLogout}
        mainText={localization?.imagemodal?.logout}
        textSize={26}
        subText=""
        onPressYes={() => {
          LogoutApiCall();
        }}
        close={() => {
          setOpenLogout(false);
        }}></CommonModal>
    </ContainerView>
  );
};

export default MyAccounts;

const styles = StyleSheet.create({
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderColor,
  },
  iconContainer: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
    backgroundColor: Colors.bg_grey,
    marginRight: 16,
  },
  icon: {
    width: 24,
    height: 24,
    tintColor: Colors.Black,
  },
  separator: {
    alignItems: 'center',
    borderColor: Colors.borderColor,
    borderWidth: 0.5,
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
    marginTop: 32,
  },
  image_Container: {
    flexDirection: 'row',
    width: 150,
    justifyContent: 'space-between',
  },
  image: {
    height: 31,
    width: 31,
  },
});
