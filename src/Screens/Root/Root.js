import {StyleSheet, Text, View, Image} from 'react-native';
import React from 'react';
import HeaderWithBack from '../../Component/HeaderWithBack';
import {Images} from '../../Constants/Images';
import Typography from '../../Component/UI/Typography';

const Root = ({route}) => {
  const ScreenName = route.params.screenName;
  console.log('4444', ScreenName);
  return (
    <View style={styles.screen}>
      <HeaderWithBack source={Images.Back} title={ScreenName} />
      <View style={styles.container}>
        <View style={{top: -25}}>
          <Image
            source={require('../../../assets/images/comingSoon.png')}
            style={{
              width: 60,
              height: 60,
              resizeMode: 'contain',
              alignSelf: 'center',
            }}
          />
          <Typography style={styles.comingSoon}>Coming Soon...</Typography>
        </View>
      </View>
    </View>
  );
};

export default Root;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  comingSoon: {
    fontSize: 18,
    color: '#6c757d',
    fontStyle: 'italic',
  },
});
