import React, { useEffect, useState } from 'react';
import { View, Image, Platform } from 'react-native';
import { Marker } from 'react-native-maps';
import { Colors } from '../Constants/Colors';
import Typography from './UI/Typography';
import { estimationTime } from '../Backend/Utility';
import localization from '../Constants/localization';

const CustomDestinationMarker = ({ locationData, Images, isCar = false, Reaching, arrivedIn }) => {

  const [tracksChanges, setTracksChanges] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const arrivalTime = estimationTime(arrivedIn);
  useEffect(() => {
    const timeout = setTimeout(() => {
      setTracksChanges(false);
    }, 1000);

    return () => clearTimeout(timeout);
  }, []);


  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);
  const minutess = arrivedIn?.match(/\d+/)?.[0]; // "27 Min" => "27"
  const arrivedInMin = Number(minutess);         // Convert to number
  return (
    <Marker
      anchor={Platform.OS === 'android' ? {x: 0.5, y: 0.9} : {x: 0.5, y: 0.6}}
      tracksViewChanges={Platform?.OS == 'ios' ? null : tracksChanges}
      draggable={false}
      key={'2'}
      coordinate={{
        latitude: locationData?.latitude,
        longitude: locationData?.longitude,
      }}
      style={{borderTopWidth: 2, alignItems: 'center'}}>
      {/* ETA Label */}
      {arrivedInMin >= 1 && (
        <View
          style={{
            backgroundColor: Colors.black,
            borderRadius: 16,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 10,
            height: 20,
            marginBottom: 4,
          }}>
          <Typography size={12} color={Colors.white}>
            {localization.rideSummary.reachingBy} {arrivalTime}
          </Typography>
        </View>
      )}

      {/* Vehicle Icon */}
      <View
        style={{
          width: isCar ? 20 : 48,
          height: isCar ? 20 : 48,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Image
          source={Images}
          style={{
            width: isCar ? 20 : 40,
            height: isCar ? 20 : 40,
            resizeMode: 'contain',
          }}
        />
      </View>
    </Marker>
  );
};

export default CustomDestinationMarker;
