import React from 'react';
import {View, StyleSheet, StatusBar} from 'react-native';

const ContainerView = ({children, adjust = 20}) => {
  return (
    <View style={[styles.container,{paddingHorizontal : adjust}]}>
      {children}
    </View>
  );
};

export default ContainerView;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
});
