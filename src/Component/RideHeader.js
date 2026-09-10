import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Typography } from './Typography';
import { Images } from '../Constants/Images';
import { Fonts } from '../Constants/Fonts';
import { Colors } from '../Constants/Colors';
import Press from './UI/Press';
import localization from '../Constants/localization';

const RideHeader = ({
  name,
  avg_rating,
  reviews,
  status,
  containerBorder,
  callNow = false,
  callPress,
  BottomDateTime = false,
  ImagePro = Images.car,
  time,
  date,
  rating
}) => {
  return (
    <View style={[styles.containerBorder, containerBorder]}>
      <View style={styles.container}>
        {/* <Image source={ImagePro} style={styles.avatar} /> */}
        <View style={styles.info}>
          <Typography size={20} fontFamily={Fonts.Inter_Bold}>
            {name}
          </Typography>
          <View style={{ flexDirection: "row" }}>
            <Image source={Images.single_star} style={{ height: 18, width: 18 }} />
            <Typography style={styles.rating}> ({Number(avg_rating).toFixed(1)}) {reviews} {!callNow && localization.rideSummary.reviews}</Typography>
          </View>
        </View>
        {status &&

          <Typography
            size={16}
            fontFamily={Fonts.Inter_SemiBold}
            color={status == 'Completed' ? Colors.selectedBorderColor : 'red'}
            style={[
              styles.status,
              { color: status == 'Completed' ? 'green' : 'red' },

            ]}
          >
            {status === 'Completed'
              ? localization.rideSummary.completed
              : localization.rideSummary.cancelled}

          </Typography>

        }
        {callNow && (
          <Press onPress={callPress} style={{ alignSelf: "center", marginRight: 10, }}>
            <Image
              source={require('../../assets/images/Call.png')}
              style={styles.call}
            />
          </Press>
        )}
      </View>

      {BottomDateTime && (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginHorizontal: 10,
            borderTopColor: Colors.borderColor,
            borderTopWidth: 1,
            paddingVertical: 10,
          }}>
          <View style={{}}>
            <Typography
              size={14}
              color="#000"
              fontFamily={Fonts.Inter_SemiBold}>
              {date} | {time}
            </Typography>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
            <Image source={Images.single_star} style={{ height: 18, width: 18 }} />
            <Typography style={styles.rating}> ({Number(rating).toFixed(1)})</Typography>
          </View>
        </View>
      )}

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 10,
    // alignItems: 'center',
  },
  avatar: { width: 60, height: 60, borderRadius: 10, resizeMode: 'contain' },
  info: { flex: 1, marginLeft: 10 },
  name: { fontSize: 16, fontWeight: 'bold', fontFamily: Fonts.Inter_Medium },
  rating: { fontSize: 14, color: '#4A4A4A', alignSelf: "center", justifyContent: "center" },
  status: { fontSize: 14, fontWeight: 'bold', },
  call: { width: 20, height: 20, alignSelf: "center" },
});

export default RideHeader;
