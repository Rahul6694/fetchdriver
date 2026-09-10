import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Colors} from '../Constants/Colors';
import Typography from './UI/Typography';

const ErrorBox = ({message, style}) => {
  if (!message) return null;

  return (
    <View style={styles.container}>
      <Typography
        color={Colors.red}
        size={12}
        style={[styles.text, {...style}]}>
        {message}
      </Typography>
    </View>
  );
};

export default ErrorBox;

const styles = StyleSheet.create({
  container: {
    paddingVertical: 0,
    marginTop:5
  },
  text: {
    textAlign: 'right',
  },
});
