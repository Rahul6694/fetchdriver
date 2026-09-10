import React from 'react';
import { View, Image } from 'react-native';
import Typography from '../Component/UI/Typography';
import SwipeButton from './SwipeButton';
import { Colors } from '../Constants/Colors';
import { Fonts } from '../Constants/Fonts';
import { Images } from '../Constants/Images';
import localization from '../Constants/localization';

const RideInfoCard = ({
  startTime,
  distance,
  onSwipeComplete,
  amount,
  duration,
  endRideTime,
}) => {
  return (
    <View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: 24,
        }}>
        <View
          style={{
            flex: 1,
            marginRight: 16,
          }}>
          <Typography
            fontFamily={Fonts.Inter_Bold}
            size={14}
            color={Colors.Black}
            style={{ flexWrap: 'wrap' }}>
            {localization.driverFlow.startRide}:
          </Typography>
          <Typography
            fontFamily={Fonts.Inter_Regular}
            size={16}
            color={Colors.Black}
            style={{ marginTop: 4 }}
            numberOfLines={1}
            ellipsizeMode="tail">
            {startTime}
          </Typography>
        </View>

        <View
          style={{
            flex: 1,
          }}>
          <Typography
            fontFamily={Fonts.Inter_Bold}
            size={14}
            color={Colors.Black}
            style={{ flexWrap: 'wrap' }}>
            {localization.driverFlow.endRide}:
          </Typography>
          <Typography
            fontFamily={Fonts.Inter_Regular}
            size={16}
            color={Colors.Black}
            style={{ marginTop: 4 }}
            numberOfLines={1}
            ellipsizeMode="tail">
            {endRideTime}
          </Typography>
        </View>
      </View>

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'flex-start',
            marginRight: 8,
          }}>
          <View
            style={{
              height: 40,
              width: 40,
              borderRadius: 20,
              backgroundColor: '#E7E9E766',
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 8,
              flexShrink: 0,
            }}>
            <Image
              source={Images.location}
              style={{ height: 20, width: 20, tintColor: Colors.Black }}
            />
          </View>
          <View style={{ flexShrink: 1 }}>
            <Typography
              fontFamily={Fonts.Inter_SemiBold}
              size={15}
              color={Colors.Black}
              numberOfLines={1}
              ellipsizeMode="tail">
              {distance}
            </Typography>
          </View>
        </View>

        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 8,
          }}>
          <View
            style={{
              height: 40,
              width: 40,
              borderRadius: 20,
              backgroundColor: '#E7E9E766',
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 8,
              flexShrink: 0,
            }}>
            <Image
              source={Images.Clock}
              style={{ height: 20, width: 20, tintColor: Colors.Black }}
            />
          </View>
          <View style={{ flexShrink: 1 }}>
            <Typography
              fontFamily={Fonts.Inter_SemiBold}
              size={15}
              color={Colors.Black}
              numberOfLines={1}
              ellipsizeMode="tail">
              {duration}
            </Typography>
          </View>
        </View>

        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'flex-end',
          }}>
          <View
            style={{
              height: 40,
              width: 40,
              borderRadius: 20,
              backgroundColor: '#E7E9E766',
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 8,
              flexShrink: 0,
            }}>
            <Image
              source={Images.pay}
              style={{
                height: 20,
                width: 20,
                tintColor: Colors.Black,
                resizeMode: 'cover',
              }}
            />
          </View>
          <View style={{ flexShrink: 1 }}>
            <Typography
              fontFamily={Fonts.Inter_SemiBold}
              size={15}
              color={Colors.Black}
              numberOfLines={1}
              ellipsizeMode="tail">
              {amount}
            </Typography>
          </View>
        </View>
      </View>

      <SwipeButton
        title="Swipe to Start"
        backgroundColor={Colors.selectedBorderColor}
        borderColor={Colors.Black}
        titleColor="white"
        titleSize={18}
        onSwipeComplete={onSwipeComplete}
        disabled={false}
        loading={false}
      />
    </View>
  );
};

export default RideInfoCard;
