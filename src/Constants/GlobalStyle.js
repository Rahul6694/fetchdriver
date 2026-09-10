import {Platform, StyleSheet} from 'react-native';
import {Colors} from './Colors';

export const GlobalStyle = StyleSheet.create({
  btnView: {
   marginHorizontal : 15
  },
  btnStyle: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: Colors?.black,
  },
});
