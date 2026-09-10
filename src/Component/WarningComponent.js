import {Alert, Image, ScrollView, StyleSheet, View} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import {Colors} from '../Constants/Colors';
import {Fonts} from '../Constants/Fonts';
import Typography from './UI/Typography';

const WarningComponent = ({title, sub_title}) => {
  return (
    <View style={styles.container}>
      <Typography
        fontFamily={Fonts.Inter_Bold}
        color={Colors.red}
        lineHeight={22}>
        {title}
      </Typography>
      <Typography
        fontFamily={Fonts.Inter_Regular}
        color={'#3A3A3C'}
        size={14}
        lineHeight={20}>
        {sub_title}
      </Typography>
    </View>
  );
};

export default WarningComponent;

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 15,
    borderColor: Colors.LightWhite,
    backgroundColor:"#7B7A7733",
    marginVertical: 20,
  },
});
