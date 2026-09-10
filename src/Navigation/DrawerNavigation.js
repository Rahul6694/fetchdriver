import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { createDrawerNavigator } from '@react-navigation/drawer';
import CustomDrawer from './CustomDrawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TabNavigation } from './TabNavigation';
import { useNavigation } from '@react-navigation/native';
import { HomeStack } from './StackNavigation';
import Home from '../Screens/Root/Home';
import { useDispatch, useSelector } from 'react-redux';
import { setToken, setUserData } from '../Constants/AsyncStorage';
import { Id, isAuth, Token, updateAuthData } from '../Redux/action';
import { notificationBadgeService } from '../pushNotifacation/NotificationBadgeService';
const Drawer = createDrawerNavigator();

const DrawerNavigation = () => {
  const navigation = useNavigation();
  const [drawerState, setDrawerState] = useState(false);

  // const handleDrawerStateChange = (event) => {
  //   if (event.type === 'drawerOpen') {
  //     setDrawerState(true);
  //   } else if (event.type === 'drawerClose') {
  //     setDrawerState(false);
  //   }
  // };

  // // You can listen for drawer state changes using event listeners
  // React.useEffect(() => {
  //   const unsubscribe = navigation.addListener('drawerStateChange', handleDrawerStateChange);

  //   return () => {
  //     unsubscribe();
  //   };
  // }, [navigation]);

  return (
    <Drawer.Navigator
      drawerContent={props => <CustomDrawer {...props} />}
      screenOptions={{
        swipeEnabled: false,
        headerShown: false,
        drawerStyle: {
          width: '100%',
          backgroundColor: 'transparent',
        },
        drawerType: 'front',
      }}
      backBehavior="none">
      <Drawer.Screen name="DrawerStack" component={TabNavigation} />
      {/* <Drawer.Screen name='HomeStack' component={HomeStack}/> */}
    </Drawer.Navigator>
  );
};

const styles = StyleSheet.create({});

export const DrawerStack = () => {
  const Stack = createNativeStackNavigator();
  const personal_Data = useSelector(store => store.personalData);
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const online =
        state.isConnected && state.isInternetReachable !== false;
      if (online) {
        global.resyncCurrentRide?.();
      }
    });

    return () => unsubscribe();
  }, []);

  global.LogoutHandle = async () => {
    await setToken('');
    await setUserData('');
    notificationBadgeService.clear();
    dispatch(isAuth(false));
    dispatch(Token({ token: '' }));
    dispatch(updateAuthData({}));
    dispatch(Id(''));
  }
  return (

    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName={
        personal_Data?.step == '1'
          ? 'PersonalInfo'
          : personal_Data?.step == '2'
            ? 'PaymentDetails'
            : personal_Data?.step == '3'
              ? 'CarDetails'
              : personal_Data?.step == '4'
                ? 'SetupAccount'
                : 'DrawerNavigation'
      }>
      <Stack.Screen name="DrawerNavigation" component={DrawerNavigation} />
      {/* <Stack.Screen name="Home" component={Home} /> */}

      <Stack.Screen
        name="Root"
        getComponent={() => require('../Screens/Root/Root').default}
      />

      {/* <Stack.Screen
          name="Notification"
          getComponent={() => require('../Screens/Root/Notification').default}
        />
        <Stack.Screen
          name="Customers"
          getComponent={() => require('../Screens/Root/Customers').default}
        />
        <Stack.Screen
          name="Inventory"
          getComponent={() => require('../Screens/Root/Inventory').default}
        />
        <Stack.Screen
          name="Settings"
          getComponent={() => require('../Screens/Root/Settings').default}
        />
        <Stack.Screen name="SelectLanguage"
          getComponent={() => require('../Screens/Root/SelectLanguage').default}
        /> */}

      <Stack.Screen
        options={{ headerShown: false }}
        name="DriverProfile"
        getComponent={() => require('../Screens/Root/DriverProfile').default}
      />
      {/* <Stack.Screen
          options={{ headerShown: false }}
          name="TripPlan"
          getComponent={() => require('../Screens/Root/TripPlan').default}
        /> */}
      {/* <Stack.Screen
          options={{ headerShown: false }}
          name="ChooseRide"
          getComponent={() => require('../Screens/Root/ChooseRide').default}
        /> */}
      {/* <Stack.Screen
          options={{ headerShown: false }}
          name="Chat"
          getComponent={() => require('../Screens/Root/Chat').default}
        /> */}
      {/* <Stack.Screen
          options={{ headerShown: false }}
          name="RideConfirmedPin"
          getComponent={() => require('../Screens/Root/RideConfirmedPin').default}
        /> */}
      {/* <Stack.Screen
          options={{ headerShown: false }}
          name="PINdetail"
          getComponent={() => require('../Screens/Root/HomeScreens/PINdetail').default}
        /> */}
      <Stack.Screen
        options={{ headerShown: false }}
        name="ManageProfile"
        getComponent={() => require('../Screens/Root/ManageProfile').default}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name="RideHistory"
        getComponent={() => require('../Screens/Root/RideHistory').default}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name="MyDocument"
        getComponent={() =>
          require('../Screens/Root/MyDocument/MyDocument').default
        }
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name="UpdateTemporaryPrDp"
        getComponent={() =>
          require('../Screens/Root/MyDocument/UpdateTemporaryPrDp').default
        }
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name="DriverLicenceCard"
        getComponent={() =>
          require('../Screens/Root/MyDocument/DriverLicenceCard').default
        }
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name="UpdateLicenceDisc"
        getComponent={() =>
          require('../Screens/Root/MyDocument/UpdateLicenceDisc').default
        }
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name="UpdateVIR"
        getComponent={() =>
          require('../Screens/Root/MyDocument/UpdateVIR').default
        }
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name="UpdateSSR"
        getComponent={() =>
          require('../Screens/Root/MyDocument/UpdateSSR').default
        }
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name="UpdateDER"
        getComponent={() =>
          require('../Screens/Root/MyDocument/UpdateDER').default
        }
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name="UpdateBusinessInsurence"
        getComponent={() =>
          require('../Screens/Root/MyDocument/UpdateBusinessInsurence')
            .default
        }
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name="UpdateLibality"
        getComponent={() =>
          require('../Screens/Root/MyDocument/UpdateLibality').default
        }
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name="PaymentHistoryScreen"
        getComponent={() => require('../Screens/Root/PaymentHistoryScreen').default}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name="Notifications"
        getComponent={() => require('../Screens/Root/Notifications').default}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name="RideDetail"
        getComponent={() =>
          require('../Screens/Root/RideDetail').default
        }
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name="Settings"
        getComponent={() => require('../Screens/Root/Settings').default}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name="ReferToFriend"
        getComponent={() => require('../Screens/Root/ReferToFriend').default}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name="Support"
        getComponent={() => require('../Screens/Root/Support').default}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name="Legal"
        getComponent={() => require('../Screens/Root/Legal').default}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name="aboutUs"
        getComponent={() => require('../Screens/Root/about').default}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name="TermsAndConditions"
        getComponent={() => require('../Screens/Root/Cms').default}
      />
      <Stack.Screen
        name="ChangeLanguage"
        getComponent={() => require('../Screens/Root/Changelanguage').default}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name="PersonalInfo"
        getComponent={() => require('../Screens/Auth/PersonalInfo').default}
      // initialParams={route?.params}
      />
      <Stack.Screen
        name="ProfilePhoto"
        getComponent={() => require('../Screens/Auth/ProfilePhoto').default}
      />
      <Stack.Screen
        name="PaymentDetails"
        getComponent={() => require('../Screens/Auth/PaymentDetails').default}
      />
      <Stack.Screen
        name="CarDetails"
        getComponent={() => require('../Screens/Auth/CarDetails').default}
      />
      <Stack.Screen
        name="SetupAccount"
        getComponent={() => require('../Screens/Auth/SetupAccount').default}
      />
      <Stack.Screen
        name="TakePhoto"
        getComponent={() =>
          require('../Screens/Auth/SignUp/TakePhoto').default
        }
      />
      <Stack.Screen
        name="Terms_Condition"
        getComponent={() =>
          require('../Screens/Auth/SignUp/Terms_Condition').default
        }
      />
      <Stack.Screen
        name="ProfilePhotoUpload"
        getComponent={() =>
          require('../Screens/Auth/SignUp/ProfilePhotoUpload').default
        }
      />
      <Stack.Screen
        name="UploadBusinessInsurance"
        getComponent={() =>
          require('../Screens/Auth/SignUp/UploadBusinessInsurance').default
        }
      />

      <Stack.Screen
        name="TemporaryPrDP"
        getComponent={() =>
          require('../Screens/Auth/SignUp/TemporaryPrDP').default
        }
      />
      <Stack.Screen
        name="UploadSSR"
        getComponent={() =>
          require('../Screens/Auth/SignUp/UploadSSR').default
        }
      />
      <Stack.Screen
        name="UploadDER"
        getComponent={() =>
          require('../Screens/Auth/SignUp/UploadDER').default
        }
      />
      <Stack.Screen
        name="UploadPLC"
        getComponent={() =>
          require('../Screens/Auth/SignUp/UploadPLC').default
        }
      />
      {/* <Stack.Screen
        options={{headerShown: false}}
        name="TermsAndConditions"
        getComponent={() => require('../Screens/Root/Cms').default}
      /> */}
      {/* <Stack.Screen
          options={{ headerShown: false }}
          name="CopyRight"
          getComponent={() => require('../Screens/Root/MyAccountScreens/Legal/CopyRight').default}
        />
          <Stack.Screen
          options={{ headerShown: false }}
          name="PrivacyPolicy"
          getComponent={() => require('../Screens/Root/MyAccountScreens/Legal/PrivacyPolicy').default}
        />
         {/* <Stack.Screen
          options={{ headerShown: false }}
          name="DataProviders"
          getComponent={() => require('../Screens/Auth/TermsAndConditions').default}
        /> */}
      {/* <Stack.Screen
          options={{ headerShown: false }}
          name="SoftwareLicence"
          getComponent={() => require('../Screens/Root/MyAccountScreens/Legal/SoftwareLicence').default}
        />
          <Stack.Screen
          options={{ headerShown: false }}
          name="LocationInformation"
          getComponent={() => require('../Screens/Root/MyAccountScreens/Legal/LocationInformation').default}
        />
          <Stack.Screen
          options={{ headerShown: false }}
          name="ContactUs"
          getComponent={() => require('../Screens/Root/MyAccountScreens/ContactUs').default}
        />
          <Stack.Screen
          options={{ headerShown: false }}
          name="AboutUs"
          getComponent={() => require('../Screens/Root/MyAccountScreens/AboutUs').default}
        /> */}
      <Stack.Screen
        options={{ headerShown: false }}
        name="Faq"
        getComponent={() => require('../Screens/Root/Faq').default}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name="Message"
        getComponent={() => require('../Screens/Root/Message').default}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name="RatingNow"
        getComponent={() => require('../Screens/Root/RatingNow').default}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name="PaymentDetail"
        getComponent={() => require('../Screens/Root/PaymentDetail').default}
      />
      {/* <Stack.Screen
          options={{headerShown: false}}
          name="OnlineRequest"
          getComponent={() => require('../Screens/Root/OnlineRequest').default}
        /> */}
      <Stack.Screen
        options={{ headerShown: false }}
        name="CustomerLocation"
        getComponent={() =>
          require('../Screens/Root/CustomerLocation').default
        }
      />

      <Stack.Screen
        options={{ headerShown: false }}
        name="ContactUs"
        getComponent={() => require('../Screens/Root/ContactUs').default}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name="TakePhotoSa"
        getComponent={() =>
          require('../Screens/Auth/SignUp/TakePhotoSa').default
        }
      />
      {/* <Stack.Screen
          name="OTP_for_ride"
          getComponent={() => require('../Screens/Root/OTP_for_ride').default}
        /> */}
    </Stack.Navigator>

  );
};

export default DrawerNavigation;
