

import React, { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import MapView, { Polyline } from 'react-native-maps';

import CustomMarker from './CustomMarker';
import CustomDestinationMarker from './CustomDestinationMarker';
import StopMarker from './StopMarker';

import { Images } from '../Constants/Images';
import { Colors } from '../Constants/Colors';
import { DISTANCE_MATRIX_URL, myApiKey } from '../Backend/Backend';

import * as turf from '@turf/turf';
import { FULL_HEIGHT, FULL_WIDTH } from '../Constants/Layout';
import axios from 'axios';
import { formatDuration } from '../Backend/Utility';

function decodePolyline(encoded) {
  let points = [];
  let index = 0, lat = 0, lng = 0;

  while (index < encoded.length) {
    let b, shift = 0, result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const deltaLat = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lat += deltaLat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const deltaLng = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lng += deltaLng;

    points.push({
      latitude: lat / 1e5,
      longitude: lng / 1e5,
    });
  }

  return points;
}
function getPreciseDistanceToPolyline(point, polyline) {
  const pt = turf.point([point.longitude, point.latitude]);
  const line = turf.lineString(polyline.map(p => [p.longitude, p.latitude]));
  const nearest = turf.nearestPointOnLine(line, pt);
  const meters = turf.distance(pt, nearest, { units: 'meters' });
  return meters;
}
const MapViewDirection = ({
  locationData,
  mapRaf = () => { },
  pickupImage = Images?.MarkerImg,
  destinationImage = Images?.Rectangle,
  isCar,
  setIsNear,
  arrivedIn = false,
  Reaching,
  onSetDest = () => { },
}) => {
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [startPoint, setStartPoint] = useState(null);
  const [endPoint, setEndPoint] = useState(null);
  const [estimatedDuration, setEstimatedDuration] = useState(null);

  useEffect(() => {

    if (
      locationData?.latitude &&
      locationData?.longitude &&
      locationData?.latitudeDes &&
      locationData?.longitudeDes
    ) {
      const currentLocation = {
        latitude: +locationData?.latitude,
        longitude: +locationData?.longitude,
      };

      fetchRoute();
      // if (routeCoordinates?.length === 0) {
      // } else {
      //   const dist = getPreciseDistanceToPolyline(currentLocation, routeCoordinates) * 1000;

      //   if (dist > 20) {
      //     console.log("📍 Too far from route, fetching new route", dist);
      //     fetchRoute();
      //   }
      // }
    }
  }, [
    locationData?.latitude,
    locationData?.longitude,
    locationData?.latitudeDes,
    locationData?.longitudeDes,
    locationData?.waypoints,
  ]);
  // const getDistanceAndTime = async (locationData) => {
  //   const url = `${DISTANCE_MATRIX_URL}${locationData.latitude},${locationData.longitude}&destinations=${locationData.latitudeDes},${locationData.longitudeDes}&key=${myApiKey}`;

  //   try {
  //     const response = await axios.get(url);
  //     const data = response.data;

  //     if (data.rows[0].elements[0].status === 'OK') {
  //       const distanceText = data.rows[0].elements[0].distance.text;
  //       const duration = data.rows[0].elements[0].duration.text;

  //       console.log("🚀 ~ getDistanceAndTime ~ duration:", duration, distanceText);

  //       let distanceInMeters = 0;
  //       if (distanceText.includes('km')) {
  //         distanceInMeters = parseFloat(distanceText.replace(' km', '')) * 1000;
  //       } else if (distanceText.includes('m')) {
  //         distanceInMeters = parseFloat(distanceText.replace(' m', ''));
  //       }

  //       if (distanceInMeters <= 100) {
  //         !isOtp ? setIsArrivedDestination(true) : setIsNear(true);
  //         console.log("✅ Still near the route", distanceInMeters, 'm');
  //         console.log("🚀 ~ getDistanceAndTime ~ isOtp:", isOtp)
  //       } else {
  //         setIsNear(false);
  //         console.log("❌ Too far from route", distanceInMeters, 'm');
  //       }
  //     } else {
  //       throw new Error('Error fetching data from Google Maps API');
  //     }
  //   } catch (error) {
  //     console.error('❌ Error in getDistanceAndTime:', error.message);
  //     throw error;
  //   }
  // };



  const fetchRoute = async () => {
    const origin = {
      latitude: +locationData?.latitude,
      longitude: +locationData?.longitude,
    };

    const destination = {
      latitude: +locationData?.latitudeDes,
      longitude: +locationData?.longitudeDes,
    };

    const waypoints = locationData?.waypoints
      ?.map(wp => `via:${wp.latitude},${wp.longitude}`)
      .join('|');

    if (origin.latitude && origin.longitude && destination.latitude && destination.longitude) {
      let url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&key=${myApiKey}&mode=driving`;

      if (waypoints) {
        url += `&waypoints=${encodeURIComponent(waypoints)}`;
      }

      try {
        const res = await fetch(url);
        const data = await res.json();

        if (data.routes?.length > 0) {
          const decodedPoints = decodePolyline(data.routes[0].overview_polyline.points);
          // console.log(decodedPoints, "data.routes[0].legs[0]==============>");

          if (decodedPoints.length >= 2) {
            setRouteCoordinates(decodedPoints);
            setStartPoint(decodedPoints[0]);
            setEndPoint(decodedPoints[decodedPoints.length - 1]);

            const leg = data.routes[0].legs[0];
            const duration = leg?.duration;

            const distance = leg?.distance;

            setEstimatedDuration(duration?.value);
            onSetDest(distance?.text, duration?.text, duration?.value);

            // Convert distance to meters
            let distanceInMeters = 0;
            if (distance?.text?.includes("km")) {
              distanceInMeters = parseFloat(distance.text) * 1000;
            } else if (distance?.text?.includes("m")) {
              distanceInMeters = parseFloat(distance.text);
            }

            // Only toggle "near pickup/dropoff" here. isArrivedDestination must come
            // from booking status (Customer in the Car); using !isOtp after resetRideUI
            // falsely showed complete-ride UI during On My Way.
            if (distanceInMeters <= 100) {
              setIsNear(true);
            } else {
              setIsNear(false);
            }

            // Fit route into map view
            if (locationData?.IsTrack) {
              mapRaf(decodedPoints, {
                edgePadding: {
                  right: FULL_WIDTH / 10,
                  bottom: FULL_HEIGHT / 1.5,
                  left: FULL_WIDTH / 10,
                  top: FULL_HEIGHT / 9,
                },
                animated: true,
              });
            }
          } else {
            console.warn("⚠️ Decoded route has fewer than 2 points.");
          }
        }
      } catch (error) {
        console.error("🚨 Failed to fetch or process route data:", error);
      }
    } else {
      console.warn("❌ Invalid origin or destination, route not fetched");
    }
  };


  return (
    <>
      {locationData?.latitude && locationData?.longitude && (
        <CustomMarker locationData={{
          latitude: startPoint?.latitude || +locationData?.latitude,
          longitude: startPoint?.longitude || +locationData?.longitude,
          heading: +locationData?.heading


        }}
          Imagess={pickupImage}
          arrivedIn={formatDuration(estimatedDuration)}
        />
      )}

      {locationData?.latitudeDes && locationData?.longitudeDes && (
        <CustomDestinationMarker
          locationData={{
            latitude: endPoint?.latitude || +locationData?.latitudeDes,
            longitude: endPoint?.longitude || +locationData?.longitudeDes,
          }}
          Images={destinationImage}
          isCar={isCar}
          Reaching={Reaching}
          arrivedIn={formatDuration(estimatedDuration)}
        />
      )}

      {locationData?.waypoints?.map((point, index) => (
        <StopMarker
          key={index}
          coordinate={{
            latitude: +point.latitude,
            longitude: +point.longitude,
          }}
          stopNumber={index + 1}
        />
      ))}

      {routeCoordinates?.length > 1 && (
        <Polyline
          fillColor='#000'
          coordinates={routeCoordinates}
          strokeWidth={4}
          strokeColor={Colors.black}
          lineJoin="round"
        />
      )}

      {/* {startPoint && (
        <Polyline
          key={locationData.latitude}
          coordinates={[
            {
              latitude: +locationData.latitude,
              longitude: +locationData.longitude,
            },
            startPoint,
          ]}

          strokeWidth={4}
          strokeColor={Colors.black}
          lineJoin="round"

        />
      )}

      {endPoint && (
        <Polyline
          coordinates={[
            endPoint,
            {
              latitude: +locationData.latitudeDes,
              longitude: +locationData.longitudeDes,
            },
          ]}
          strokeWidth={4}
          strokeColor={Colors.black}
          lineJoin="round"

        />
      )}

      {routeCoordinates?.length > 0 && locationData?.waypoints?.map((stop, index) => {
        const stopCoord = {
          latitude: +stop.latitude,
          longitude: +stop.longitude,
        };

        const nearestIndex = turf.nearestPointOnLine(
          turf.lineString(routeCoordinates.map(p => [p.longitude, p.latitude])),
          turf.point([stopCoord.longitude, stopCoord.latitude])
        ).properties.index;

        const nearestRoutePoint = routeCoordinates[nearestIndex];

        return (
          <Polyline
            coordinates={[stopCoord, nearestRoutePoint]}

            strokeWidth={3}
            strokeColor={Colors.black}
            lineJoin="round"
          />
        );
      })} */}
    </>
  );
};

export default MapViewDirection;
