import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {useState} from 'react';
import {FULL_WIDTH} from '../../Constants/Layout';
import SvgIcon from '../UI/svg';
import Typography from '../UI/Typography';
import {Fonts} from '../../Constants/Fonts';
import {Colors} from '../../Constants/Colors';

const GetCodeBox = ({
  title1,
  icon1,
  title2,
  icon2,
  onBoxPress,
  defaultType = 'mobile',
}) => {
  const [selectedBox, setSelectedBox] = useState(
    defaultType === 'mobile' ? 1 : 2,
  );

  const onPress = (box, type) => {
    setSelectedBox(box);
    if (onBoxPress) {
      onBoxPress(type);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => onPress(1, 'mobile')}
        activeOpacity={0.9}
        style={[
          styles.box,
          {
            borderColor:
              selectedBox === 1 ? Colors?.selectGreen : Colors?.LightWhite,
            borderWidth: selectedBox === 1 ? 2 : 1,
          },
        ]}>
        <View style={styles.innerRow}>
          <SvgIcon name={icon1} />
          <Typography
            size={18}
            fontFamily={Fonts?.Inter_Medium}
            color={Colors?.black}
            marginLeft={15}>
            {title1}
          </Typography>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => onPress(2, 'whatsapp')}
        activeOpacity={0.9}
        style={[
          styles.box,
          {
            borderColor:
              selectedBox === 2 ? Colors?.selectGreen : Colors?.LightWhite,
            borderWidth: selectedBox === 2 ? 2 : 1,
          },
        ]}>
        <View style={styles.innerRow}>
          <SvgIcon name={icon2} />
          <Typography
            size={18}
            fontFamily={Fonts?.Inter_Medium}
            color={Colors?.black}
            marginLeft={15}>
            {title2}
          </Typography>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default GetCodeBox;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    height: 62,
    width: FULL_WIDTH * 0.9,
    alignSelf: 'center',
    borderRadius: 10,
    justifyContent: 'center',
    marginVertical: 10,
  },
  innerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
});
