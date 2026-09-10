import React from 'react';
import MapViewDirections from 'react-native-maps-directions';
import {Images} from '../Constants/Images';
import {myApiKey} from '../Backend/Backend';
import {Colors} from '../Constants/Colors';
import CustomMarker from './CustomMarker';
import CustomDestinationMarker from './CustomDestinationMarker';

const MapViewDirection = ({
  locationData,
  locationDataPick,
  locationDataDrop,
}) => {
  console.log('44444++++', locationDataPick);
  console.log('44444++++666', locationDataDrop);

  return (
    <>
      {locationDataPick?.lat &&
        locationDataPick?.lng &&
        locationDataDrop?.lat &&
        locationDataDrop?.lng && (
          <>
            <CustomMarker
              locationData={locationData?.address}
              latitude={+locationDataPick?.lat}
              longitude={+locationDataPick?.lng}
              Images={Images?.Rectangle}
            />

            <CustomDestinationMarker
              locationData={locationDataDrop}
              Images={Images?.ic_Destination}
            />

            {locationDataPick?.lat &&
              locationDataPick?.lng &&
              locationDataDrop?.lat &&
              locationDataDrop?.lng && (
                <MapViewDirections
                  origin={{
                    latitude: parseFloat(locationDataDrop.lat),
                    longitude: parseFloat(locationDataDrop.lng),
                    
                  }}
                  destination={{
                    latitude: parseFloat(locationDataPick.lat),
                    longitude: parseFloat(locationDataPick.lng),
                    // latitude: parseFloat(locationDataDrop.lat),
                    // longitude: parseFloat(locationDataDrop.lng),
                  }}
                  apikey={myApiKey}
                  strokeWidth={2}
                  optimizeWaypoints={true}
                  strokeColor={'#FF0000'}
                  precision="high"
                  mode="DRIVING"
                  lineJoin="round"
                  onStart={params => {
                    // console.log(
                    //   `Started routing between "${params.origin}" and "${params.destination}"`,
                    // );
                  }}
                  onReady={result => {
                    // setDistance(result.distance);
                    // setDuration(result.duration);
                    // You can perform additional actions here, e.g., handling vehicle type
                    // mapRef.current?.fitToCoordinates(result.coordinates, {
                    //   edgePadding: {
                    //     right: FULL_WIDTH / 20,
                    //     bottom: FULL_HEIGHT / 20,
                    //     left: FULL_WIDTH / 20,
                    //     top: FULL_HEIGHT / 20,
                    //   },
                    // });
                  }}
                  onError={errorMessage => {
                    // console.log('GOT AN ERROR', errorMessage);
                    // SimpleToast.show(localization?.NavigationScreen?.NoRoute);
                    // // Handle location update failure here
                    // updateCurrentLocation({}, 1, true);
                    // handleScroll(-1);
                    // onFocus(); // Call any required functions here
                  }}
                />
              )}
          </>
        )}
    </>
  );
};

export default MapViewDirection;
