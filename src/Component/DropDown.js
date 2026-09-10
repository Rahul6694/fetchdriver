import { StyleSheet, Text, View, Image } from 'react-native';
import React, { useState } from 'react';
import { Dropdown } from "react-native-element-dropdown"
import { ImageConstant } from '../Constants/ImageConstant';
import { Colors } from '../Constants/Colors';
import { Images } from '../Constants/Images';
import Typography from './UI/Typography';
import { Fonts } from '../Constants/Fonts';

const DropDown= ({ title, source, style_img, style_title, style_dropdown ,placeholder,data}) => {

  const [value, setValue] = useState(null);
  const [isFocus, setIsFocus] = useState(false);


  return (
    <View style={{ marginVertical: 10, }}>
      <View style={styles.titleContainer}>
       {source && <Image source={source} style={[styles.img_style, style_img]} />}
        <Typography style={[styles.txt_style, style_title]}>{title}</Typography>
      </View>
      <Dropdown
        style={[styles.dropdown, style_dropdown]}
        selectedTextStyle={styles.selectedTextStyle}
        iconStyle={styles.iconStyle}
        data={data}
        maxHeight={300}
        labelField="label"
        valueField="value"
        placeholderStyle={styles.placeholderStyle}
        placeholder={placeholder}
        iconColor={Colors.Black}
        onChange={item => {
          setValue(item.value);
          setIsFocus(false);
        }}
      />
    </View>
  )
}

export default DropDown

const styles = StyleSheet.create({
//   img_style: {
//     height: 16,
//     width: 16,
//   },
  txt_style: {
    color: Colors.Secondary,
    fontSize: 14,
    // marginLeft: 2,
    fontFamily: Fonts.Roboto_Medium,
  },
  dropdown: {
    borderRadius: 12,
    backgroundColor:Colors.LightBlue,
  },
  placeholderStyle: {
    color: Colors.lableColor,
    marginLeft:15
  },
  inputSearchStyle: {
    borderWidth: 1,
  },
  iconStyle: {
    height: 24,
    width: 24,
    marginHorizontal: 10,
    marginVertical: 13,
  },
  selectedTextStyle: {
    color: Colors.lableColor,
    paddingLeft: 20,
    // paddingVertical: 15
  },
  titleContainer: {
    flexDirection: 'row',
    marginBottom: 5,
    alignItems: 'center',
    // justifyContent:'space-between',
  },
})

// const data = [
//   { label: 'Item 1', value: '1' },
//   { label: 'Item 2', value: '2' },
//   { label: 'Item 3', value: '3' },
//   { label: 'Item 4', value: '4' },
//   { label: 'Item 5', value: '5' },
//   { label: 'Item 6', value: '6' },
//   { label: 'Item 7', value: '7' },
//   { label: 'Item 8', value: '8' },
// ];
