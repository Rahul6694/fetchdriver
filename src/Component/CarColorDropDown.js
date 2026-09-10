import React, {useRef, useState} from 'react';
import {Keyboard, StyleSheet, TouchableOpacity, View} from 'react-native';
import {Dropdown} from 'react-native-element-dropdown';
import {Fonts} from '../Constants/Fonts';
import ErrorBox from './ErrorBox';
import {Colors} from '../Constants/Colors';
import {Typography} from './Typography';
import localization from '../Constants/localization';
import { Text } from 'react-native-svg';

const ta = [];

const CarColorDropDown = ({
  data = ta,
  placeholder = placeholder,
  value = {},
  search = true,
  onChange,
  title,
  error,
  mode = 'modal',
}) => {
  const [isFocus, setIsFocus] = useState(false);
  const drop_ref = useRef(null);

  console.log(data,"data==========>")
  const renderItem = item => {
    console.log("4444444444", item);
    return (
      <View style={{flexDirection:"row", padding:10}}>
        {/* Color Box */}
        <View
          style={[
            styles.colorBox,
            { backgroundColor: item.type || '#fff',borderWidth:0.2 }, // Fallback to white if no color is provided
          ]}
        />
        {/* Label */}
        <Typography color='black'>{item?.label}</Typography>
      </View>
    );
  };

  return (
    <View style={[styles.container]}>
      <Typography
        color={Colors.inputtitle}
        size={14}
        fontFamily={Fonts?.Inter_Medium}
        style={{marginBottom: 5}}>
        {title}
      </Typography>
      
      <Dropdown
        style={[styles.dropdown]}
        
        placeholderStyle={[
          value
            ? {
                fontSize: 12,
              }
            : [styles.placeholderStyle],
        ]}
        mode={mode}
        selectedTextStyle={[styles?.selectedTextStyle]}
        inputSearchStyle={styles.inputSearchStyle}
        iconStyle={styles.iconStyle}
        containerStyle={{
          borderRadius: 8,
          height: 250,
          backgroundColor: Colors?.Primary,
        }}
        itemContainerStyle={{
          fontSize: 12,
        }}
        data={data}
        ref={drop_ref}
        search={search}
        onFocus={() => setIsFocus(true)}
        onBlur={() => setIsFocus(false)}
        maxHeight={200}
        labelField="label"
        valueField="value"
        placeholder={isFocus ? '' : placeholder}
        searchPlaceholder= {localization?.modals?.Search}
        value={value.value}
        onChange={e => {
          onChange(e);
        }}
        renderItem={renderItem}
      />
      <ErrorBox message={error} color={'red'} />
    </View>
  );
};

export default CarColorDropDown;

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    backgroundColor: Colors?.Primary,
    justifyContent: 'center',
  },
  dropdown: {
    height: 52,
    backgroundColor: Colors?.Primary,
    borderRadius: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: Colors?.LightWhite,
  },
  icon: {
    marginRight: 5,
  },
  item: {
    padding: 17,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textItem: {
    flex: 1,
  },
  placeholderStyle: {
    fontFamily: Fonts.Inter_Medium,
    color: 'red',
    fontSize: 14,
    backgroundColor: 'transparent',
  },
  selectedTextStyle: {
    fontSize: 14,
    fontFamily: Fonts.Inter_Medium,
    color: Colors?.black,
  },
  iconStyle: {
    width: 28,
    height: 28,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
    borderRadius: 20,
  },
  errorBox: {
    marginTop: 15,
  },
  colorBox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    marginRight: 10,
  },
});
