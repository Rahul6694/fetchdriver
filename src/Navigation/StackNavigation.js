import {StyleSheet} from 'react-native';
import React, {useEffect} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

export const AuthStack = ({route}) => {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen
        name="Login"
        getComponent={() => require('../Screens/Auth/Login').default}
      />

      <Stack.Screen
        name="SelectLanguage"
        getComponent={() => require('../Screens/Auth/SeletLanguage').default}
      />
      <Stack.Screen
        name="Register"
        getComponent={() => require('../Screens/Auth/Register').default}
      />
      <Stack.Screen
        name="Otp"
        getComponent={() => require('../Screens/Auth/Otp').default}
      />
      <Stack.Screen
        name="VerificationMethod"
        getComponent={() =>
          require('../Screens/Auth/VerificationMethod').default
        }
      />
      {/* <Stack.Screen
        options={{headerShown: false}}
        name="PersonalInfo"
        getComponent={() => require('../Screens/Auth/PersonalInfo').default}
        initialParams={route?.params}
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
        getComponent={() => require('../Screens/Auth/SignUp/TakePhoto').default}
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
        getComponent={() => require('../Screens/Auth/SignUp/UploadSSR').default}
      />
      <Stack.Screen
        name="UploadDER"
        getComponent={() => require('../Screens/Auth/SignUp/UploadDER').default}
      />
      <Stack.Screen
        name="UploadPLC"
        getComponent={() => require('../Screens/Auth/SignUp/UploadPLC').default}
      />
      <Stack.Screen
        options={{headerShown: false}}
        name="TermsAndConditions"
        getComponent={() => require('../Screens/Root/Cms').default}
      /> */}
      <Stack.Screen
        options={{headerShown: false}}
        name="TermsAndConditions"
        getComponent={() => require('../Screens/Root/Cms').default}
      />
    </Stack.Navigator>
  );
};

export const HomeStack = () => {
  return (
    <Stack.Navigator
    // screenOptions={{
    //   ...commonOptions,
    // }}
    >
      <Stack.Screen
        options={{headerShown: false}}
        name="HomeScreen"
        getComponent={() => require('../Screens/Root/Home').default}
      />

      <Stack.Screen
        options={{headerShown: false}}
        name="OnlineRequest"
        getComponent={() => require('../Screens/Root/OnlineRequest').default}
      />
      <Stack.Screen
        options={{headerShown: false}}
        name="OTP_for_ride"
        getComponent={() => require('../Screens/Root/OTP_for_ride').default}
      />
    </Stack.Navigator>
  );
};

export const Chat = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        options={{headerShown: false}}
        name="RideConfirmedPin"
        getComponent={() => require('../Screens/Root/RideHistory').default}
      />
    </Stack.Navigator>
  );
};
export const Liked = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        options={{headerShown: false}}
        name="Liked"
        getComponent={() => require('../Screens/Root/Liked').default}
      />
    </Stack.Navigator>
  );
};
export const Pin = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        options={{headerShown: false}}
        name="Pin"
        getComponent={() => require('../Screens/Root/Pin').default}
      />
    </Stack.Navigator>
  );
};
export const Profile = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        options={{headerShown: false}}
        name="Profile"
        getComponent={() => require('../Screens/Root/Profile').default}
      />
    </Stack.Navigator>
  );
};
const styles = StyleSheet.create({});
