import React from 'react';
import {
  View,
  StatusBar,
  Keyboard,
  TouchableWithoutFeedback,
  SafeAreaView,
  ImageBackground,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import {Colors} from '../Constants/Colors';
import { FULL_HEIGHT } from '../Constants/Layout';

export const CommonView = ({
  children,
  backgroundColor = Colors?.Primary,
  CommonViewStyle,
  AuthImg, // Background image source
  scrollEnabled=true,
}) => {
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView contentContainerStyle={{flex:1}} scrollEnabled={scrollEnabled}>
      <KeyboardAvoidingView style={{flex: 1}}>
          <ImageBackground
            source={AuthImg}
            style={{
              flex: 1,
              height:FULL_HEIGHT,
              width:"100%",
              backgroundColor: backgroundColor,
              ...CommonViewStyle,
            }}
            resizeMode="stretch">
            <StatusBar
              translucent
              backgroundColor="#fff" // Transparent background
              barStyle="dark-content" // White content
            />
            <SafeAreaView style={{flex: 1}}>{children}</SafeAreaView>
          </ImageBackground>
       
      </KeyboardAvoidingView>
       </ScrollView>
    </TouchableWithoutFeedback>
  );
};
