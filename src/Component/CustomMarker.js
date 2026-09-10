
import { WINDOW_HEIGHT, WINDOW_WIDTH } from '@gorhom/bottom-sheet';
import React, { memo, useEffect, useState } from 'react';
import { View, Image, Platform, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MapView, { Callout, CalloutSubview, Marker } from 'react-native-maps';
import Typography from './UI/Typography';
import { Images } from '../Constants/Images';
import { Colors } from '../Constants/Colors';

const CustomMarker = ({ locationData, Imagess = Images?.car, header = false, arrivedIn }) => {
  const [tracksChanges, setTracksChanges] = useState(true);
  const imageSource = typeof Imagess === 'string' ? { uri: Imagess } : Imagess;

  const markerSize = {
    width: WINDOW_WIDTH * 0.12,
    height: WINDOW_HEIGHT * 0.07,
  };
  useEffect(() => {
    const timeout = setTimeout(() => {
      setTracksChanges(false);
    }, 1000);

    return () => clearTimeout(timeout);
  }, []);
  const minutes = arrivedIn?.match(/\d+/)?.[0]; // "27 Min" => "27"
  const arrivedInMin = Number(minutes);         // Convert to number

  const heading = locationData?.heading;
  const validHeading = heading !== undefined && heading >= 0 ? heading : 0;
  return (
    <Marker

      // image={Imagess}
      tracksViewChanges={Platform?.OS == "ios" ? null : tracksChanges}
      anchor={Platform.OS === "ios" ? { x: 0.5, y: 0.7 } : { x: 0.6, y: 0.7 }}
      // rotation={90 || 0}
      draggable={false}
      key={'1'}
      // tracksViewChanges={false}
      coordinate={{
        latitude: locationData?.latitude,
        longitude: locationData?.longitude,
      }}
      style={{ borderTopWidth: 2, alignItems: "center" }}
    >
      <View style={{ alignItems: 'center' }}>

        {arrivedInMin >= 1 && (
          <View
            style={{
              backgroundColor: Colors.selectedBorderColor,
              borderRadius: 12,
              paddingHorizontal: 10,
              paddingVertical: 2,
              marginBottom: 5,
            }}
          >
            <Typography size={12} color={Colors.white}>
              {arrivedIn}
            </Typography>
          </View>
        )}

        {/* Vehicle Icon */}
        <View
          style={{
            width: 45,
            height: 45,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Image
            source={imageSource}
            style={{
              width: 45,
              height: 45,
              transform: [{ rotate: `${validHeading || 0}deg` }],
            }}
            resizeMode="center"
          />
        </View>
      </View>

    </Marker>

  );
};

export default CustomMarker;

const styles = StyleSheet.create({
  callout: {
    width: 80,
    padding: 5,
    backgroundColor: "#00DB46",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontWeight: 'bold',
    fontSize: 14,
    color: "#fff"
  }
});