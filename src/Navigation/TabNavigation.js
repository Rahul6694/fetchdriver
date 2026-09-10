import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React, { useEffect, useState } from 'react';
import {
  Image,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
// import { Chat, Home, Liked, Pin, Profile } from './StackNavigation';

import { Images } from '../Constants/Images';
import Typography from '../Component/UI/Typography';
import Home from '../Screens/Root/Home';
import RideHistory from '../Screens/Root/RideHistory';
import MyAccounts from '../Screens/Root/MyAccounts';
import { Colors } from '../Constants/Colors';
import localization from '../Constants/localization';
import { useSelector } from 'react-redux';
import { FULL_WIDTH } from '../Constants/Layout';

const Tab = createBottomTabNavigator();
const bottomTabHeight = Platform.OS === 'ios' ? 90 : 70;
export const TabNavigation = () => {
  const personal_Data = useSelector(store => store.personalData);
  // console.log('====================================');
  // console.log('--personal_Data---',personal_Data?.is_approved);
  // console.log('====================================');
  console.log(personal_Data?.is_approved, "====================================")

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarHideOnKeyboard: true,
        headerShown: false,
        // tabBarStyle: {
        //   display: isBottomSheetOpen ? 'none' : 'flex',
        // },
        tabBarStyle: {
          height: bottomTabHeight,
          elevation: 10,
          borderWidth: 1,
          borderColor: Colors?.borderView,
          backgroundColor: Colors?.Primary,
          justifyContent: 'center',
          alignItems: 'center',
          position: 'absolute',
          // display: isBottomSheetOpen ? 'none' : 'flex',
          display: personal_Data?.is_approved === 2 ? 'none' : 'flex',
        },
        tabBarButton: props => (
          <TouchableOpacity {...props}>{props.children}</TouchableOpacity>
        ),
      }}
      initialRouteName="Home">
      <Tab.Screen
        name="Home"
        // component={Home}
        getComponent={() => require('../Navigation/StackNavigation').HomeStack}
        options={{
          tabBarLabel: '',
          tabBarIcon: ({ focused }) =>
            renderTabIcon(
              focused,
              Images.ic_Home,
              localization.TabNavigation.Home,
            ),
        }}
      />

      <Tab.Screen
        name="RideHistory"
        component={RideHistory}
        options={{
          tabBarLabel: '',
          tabBarIcon: ({ focused }) =>
            renderTabIcon(
              focused,
              Images.ic_History,
              localization.TabNavigation.Ride,
            ),
        }}
      />
      <Tab.Screen
        name="Liked"
        component={MyAccounts}
        options={{
          tabBarLabel: '',
          tabBarIcon: ({ focused }) =>
            renderTabIcon(
              focused,
              Images.ic_Profile,
              localization.TabNavigation.Account,
            ),
        }}
      />
    </Tab.Navigator>
  );
};

const renderTabIcon = (focused, icon, label) => {
  const language = localization?.getLanguage();
  const lang = useSelector(store => store?.language_code);

  return focused ? (
    <View style={styles.focusedTabContainer} key={lang}>
      <Image
        source={icon}
        style={[styles.tabIcon, { tintColor: Colors?.Black }]}
      />
      <Typography size={12} style={styles.focusedTabLabel}>{label}</Typography>
    </View>
  ) : (
    <View style={styles.focusedTabContainer} key={lang}>
      <Image
        source={icon}
        style={[styles.tabIcon, { tintColor: Colors?.textColor }]}
      />
      <Typography size={12} style={styles.unfocusedTabLabel} numberOfLines={2}>
        {label}
      </Typography>
    </View>
  );
};

const styles = StyleSheet.create({
  tabIcon: {
    height: 20,
    width: 20.5,
    marginBottom: 7,
    marginRight: -5
  },
  unfocusedTabIcon: {
    tintColor: 'grey',
    marginTop: 20,
  },
  focusedTabContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: FULL_WIDTH / 3.8,
    zIndex: 999,
    marginBottom: -34,

  },
  focusedTabLabel: {
    color: Colors?.Black,
    marginLeft: 5,
    fontSize: 12,
    textAlign: "center"
  },
  unfocusedTabLabel: {
    color: Colors?.textColor,
    marginLeft: 5,
    fontSize: 12,
    textAlign: "center"
  },
});
export default TabNavigation;
