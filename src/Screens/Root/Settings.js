import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Switch,
  ScrollView,
  Image,
  PermissionsAndroid,
  Linking,
  ToastAndroid,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import SettingList from '../../Component/SettingList';
import {openSettings} from 'react-native-permissions';
import FindingRideModal from '../../Component/UI/FindingRideModal';
import localization from '../../Constants/localization';
import ContainerView from '../../Component/ContainerView';
import HeaderWithBack from '../../Component/HeaderWithBack';
import {Images} from '../../Constants/Images';
import {Colors} from '../../Constants/Colors';
import Typography from '../../Component/UI/Typography';
import {Fonts} from '../../Constants/Fonts';
import {useIsFocused} from '@react-navigation/native';
import {DELETE_WITH_TOKEN, GET_WITH_TOKEN} from '../../Backend/Backend';
import {
  GET_DRIVER_PROFILE,
  GET_USER_PROFILE,
  UPDATE_SETTING,
} from '../../Backend/ApiRoutes';
import {ToastMsg} from '../../Component/ToastMsg';
import {useDispatch} from 'react-redux';
import {
  Id,
  isAuth,
  isChooseLanguage,
  Token,
  updateAuthData,
} from '../../Redux/action';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Settings = () => {
  const [isLocationChecked, setIsLocationChecked] = useState(false);
  const [isStorageChecked, setIsStorageChecked] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState(false);
  const [whatsApp, setWhatsApp] = useState(false);
  const [push, setPush] = useState(false);
  const isFocused = useIsFocused();
  const dispatch = useDispatch();

  React.useEffect(() => {
    if (isFocused) {
      fetchSignUpData();
    }
  }, [isFocused]);

  const checkSpecificPermission = async (
    permissionType,
    setIsPermissionChecked,
  ) => {
    try {
      const status = await PermissionsAndroid.check(permissionType);
      if (status) {
        setIsPermissionChecked && setIsPermissionChecked(true);
      } else {
        setIsPermissionChecked && setIsPermissionChecked(false);
      }
    } catch (err) {
      setIsPermissionChecked && setIsPermissionChecked(false);
    }
  };

  const openAppSettings = async () => {
    await openSettings();
  };

  const checkPermissionsOnInit = async () => {
    await checkSpecificPermission(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      setIsLocationChecked,
    );
    await checkSpecificPermission(
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      setIsStorageChecked,
    );
  };

  useEffect(() => {
    checkPermissionsOnInit();
  }, [isLocationChecked || isLocationChecked]);

  const fetchSignUpData = () => {
    setLoading(true);
    // alert ("4449999")
    GET_WITH_TOKEN(
      `${GET_DRIVER_PROFILE}`,
      success => {
        setLoading(false);
        console.log(
          '4444444===============>',
          success?.data?.is_email_notification,
          success?.data?.is_sms_whatsapp,
          success?.data?.is_mobile_push_notification,
        );
        if (success) {
          setEmail(success?.data?.is_email_notification == 1 ? true : false);
          setWhatsApp(success?.data?.is_sms_whatsapp == 1 ? true : false);
          setPush(success?.data?.is_mobile_push_notification == 1 ? true : false);
        }
        // setSignUpData(success?.data || []);
      },
      error => {
        setLoading(false);
      },
      fail => {
        setLoading(false);
      },
    );
  };

  const fetchFaqData = type => {
    // alert ("45444")
    // update-setting?type={}
    let route = `update-setting?type=${type}`;
    console.log(route,"route------------------->");
    setLoading(true);
    GET_WITH_TOKEN(
      route,
      success => {
        // alert ("444")
        setLoading(false);
        // setFaqData(success?.data || []);
        // ToastMsg(success?.message);

        // fetchSignUpData();
      },
      error => {
        setLoading(false);
      },
    );
  };

  const DeletMethod = () => {
    DELETE_WITH_TOKEN(
      'delete-account',
      success => {
        if (success?.status == 'success') {
          setModalVisible(false);
          setTimeout(async () => {
            dispatch(Token(''));
            dispatch(Id(''));
            dispatch(updateAuthData({}));
            dispatch(isChooseLanguage(true));
            dispatch(isAuth(false));
            await AsyncStorage.clear();
          }, 2000);
          console.log("Success =>",success?.msg)
          ToastMsg(success?.msg);
        }
      },
      error => {
        setModalVisible(false);
      },
      fail => {
        setModalVisible(false);
      },
    );
  };

  const handleSwitchChange = async () => {
    await openAppSettings();
    await checkPermissionsOnInit();
  };

  return (
    <ContainerView>
      <HeaderWithBack
        title={localization?.Settings?.header}
        source={Images.Back}
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <Typography
            size={16}
            fontFamily={Fonts.Inter_Medium}
            color={Colors.Black}
            style={styles.text}>
            {localization?.Settings?.notification}
          </Typography>
          <SettingList
            handleSwitchChange={e => {
              setEmail(!email);
              console.log(e, 'e------>');
              fetchFaqData('email-notification');

              //
            }}
            showSwitchButton={true}
            isSwitch={email}
            showImage={true}
            title={localization?.Settings?.email}
            source={Images.letter}
          />
          <SettingList
            handleSwitchChange={e => {
              setWhatsApp(!whatsApp);

              fetchFaqData('sms-whatsapp');

              //
            }}
            isSwitch={whatsApp}
            showSwitchButton={true}
            showImage={true}
            title={localization?.Settings?.sms}
            source={Images.Whatsapp}
          />
          <SettingList
            handleSwitchChange={e => {
              setPush(!push);
              fetchFaqData('mobile-push-notification');
              //
            }}
            isSwitch={push}
            showSwitchButton={true}
            showImage={true}
            title={localization?.Settings?.mobile}
            source={Images.Bell}
          />
        </View>
        {/* <View style={styles.container}>
          <Typography
           size={16}
            fontFamily={Fonts.Inter_Medium}
            color={Colors.Black}
            style={styles.text}>
            {localization?.Settings?.permissions}
          </Typography>
          <SettingList
            showSwitchButton={true}
            showImage={true}
            title={localization?.Settings?.location}
            source={Images.location}
            isSwitch={isLocationChecked}
            handleSwitchChange={() =>
              handleSwitchChange(
                isLocationChecked,
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
              )
            }
          />
          <SettingList
            showSwitchButton={true}
            showImage={true}
            title={localization?.Settings?.phone}
            source={Images.Folder}
            isSwitch={isStorageChecked}
            handleSwitchChange={() =>
              handleSwitchChange(
                isStorageChecked,
                PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
              )
            }
          />
        </View> */}
        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.container}
          onPress={() => setModalVisible(true)}>
          <SettingList

            showImage={true}
            title={localization?.Settings?.delete}
            source={Images.Delete}
            container_style={{borderTopColor: Colors.white,paddingVertical:0}}
          />
        </TouchableOpacity>
        <FindingRideModal
          showModal={modalVisible}
          close={() => setModalVisible(false)}
          imageSource={Images.DeleteImg}
          imageStyle={styles.modal_img}
          title={localization?.Settings?.modaltitle}
          titleSize={26}
          showButton={true}
          onDeletedAccount={() => {
            DeletMethod();
          }}
          Buttontitle={localization?.Settings?.confirm}
          secondButtonTitle={localization?.Settings?.cancel}
        />
      </ScrollView>
    </ContainerView>
  );
};

export default Settings;

const styles = StyleSheet.create({
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: Colors.borderColor,
  },
  container: {
    borderWidth: 1,
    borderColor: Colors.borderColor,
    padding: 10,
    borderRadius: 12,
    marginVertical: 10,
  },
  text: {
    marginBottom: 15,
    marginTop: 5,
  },
  modal_img: {
    height: '167',
    width: '300',
    alignSelf: 'center',
  },
});
