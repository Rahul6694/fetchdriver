import {
  NavigationContainer,
  createNavigationContainerRef,
  useIsFocused,
} from '@react-navigation/native';
import React, { useEffect } from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { AuthStack, RootStack } from './StackNavigation';
import { useDispatch, useSelector } from 'react-redux';
import DrawerNavigation, { DrawerStack } from './DrawerNavigation';
import { MASTER_LIST } from '../Backend/ApiRoutes';
import { GET, GetNew } from '../Backend/Backend';
import { masterData } from '../Redux/action';
import NetAlert from '../Component/NetAlert';

export const navigationRef = createNavigationContainerRef();
const MainNavigation = () => {
  const isAuth = useSelector(store => store.isAuth);
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  useEffect(() => {
    GetCity();
  }, []);
  global.GetCity = async () => {
    GetNew(
      MASTER_LIST,
      success => {
        dispatch(masterData(success?.data));
      },
      error => { },
      fail => { },
    );
  };
  return (
    <SafeAreaView
      style={[styles.container, {paddingTop: -insets.top}]}
      edges={['bottom']}>
      {/* <NetAlert /> */}

      <StatusBar
        translucent={true}
        backgroundColor={'transparent'}
        barStyle="dark-content"
      />
      <NavigationContainer ref={navigationRef}>
        {!isAuth ? <AuthStack /> : <DrawerStack />}
      </NavigationContainer>
    </SafeAreaView>
  );
};

export default MainNavigation;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});