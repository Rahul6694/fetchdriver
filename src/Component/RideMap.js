import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import MapViewDirection from './MapViewDirection';
import { Images } from '../Constants/Images';


const RideMap = ({ pickup, drop, routeCoordinates, locationData }) => {
  console.log('routeCoordinates', routeCoordinates);
  console.log('55++----', pickup);
  const mapRef = useRef(null);

  useEffect(() => {
    if (pickup && drop && mapRef.current) {
      mapRef?.current?.fitToCoordinates(
        [
          { latitude: pickup.lat, longitude: pickup.lng },
          { latitude: drop.lat, longitude: drop.lng },
        ],
        {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
          animated: true,
        }
      );
    }
  }, [pickup, drop]);
  return (
    <View style={styles.mapContainer}>
      <MapView
        ref={mapRef}
        style={styles.map}
        moveOnMarkerPress={true}
        spiralEnabled={true}
        mapType={Platform.OS === 'android' ? 'standard' : 'standard'}
        region={{
          latitude: 26.9124,
          longitude: 75.7873,
          latitudeDelta: 0.9,
          longitudeDelta: 0.9,
        }}>
        {/* <MapViewDirection locationData={locationData} isCar={true} CustomMarkerImages={Images.pin2} /> */}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  mapContainer: { height: 150, overflow: 'hidden' },
  map: { flex: 1, height: 150, width: "100%" },
});

export default RideMap;
