import {Alert, Dimensions, Platform} from 'react-native';
import {requestPermissionsHere} from '../Component/Premissions';
import Geolocation from 'react-native-geolocation-service';
import moment from 'moment';
import localization from '../Constants/localization';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import BackgroundTimer from 'react-native-background-timer';

export const RFV = e => {
  return e;
};
export const regex = {
  email: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
  phoneNumber: /^(0|[1-9][0-9]*)$/,
};
export const DefaultToast = title => {
  return Toast.show(title, Toast.SHORT);
};
export const formatError = obj => {
  let errorsData = {};
  for (const field in obj) {
    if (Object.hasOwnProperty.call(obj, field)) {
      errorsData[field] = '';
    }
  }
  return errorsData;
};
export const parseValues = data => {
  let parsedData = {};
  for (const field in data) {
    if (Object.hasOwnProperty.call(data, field)) {
      const value = data[field].value;
      parsedData[field] = value;
    }
  }
  return parsedData;
};
export const isValidEmail = email => regex.email.test(email);
export const isValidPassword = email => regex.email.test(email);
export const isValidPhone = phone => regex.phoneNumber.test(phone);

export const isValidValue = ({
  value = '',
  required = true,
  type = '',
  minimum = 0,
  maximum = 1000,
}) => {
  if (required) {
    if (!value) {
      return 'Please Enter Some Value';
    } else if (type === 'email') {
      return !isValidEmail(value) ? 'Please Enter Valid Email!' : '';
    } else if (type === 'phone') {
      return !isValidPhone(value) ? 'Please Enter Valid Phone Number!' : '';
    } else if (value.length < minimum) {
      return `Minimum length should be ${minimum}`;
    } else if (value.length > maximum) {
      return `Maximum length should be ${maximum}`;
    } else {
      return '';
    }
  } else {
    return '';
  }
};

////////////
export const isValidForm = (form = {}) => {
  let valid = true;
  for (const field in form) {
    if (Object.hasOwnProperty.call(form, field)) {
      const error = form[field];
      valid = valid && !error;
    }
  }
  return valid;
};
/////////////

export function getRegionForCoordinates(points) {
  // points should be an array of { latitude: X, longitude: Y }
  let minX, maxX, minY, maxY;

  // init first point
  (point => {
    minX = point.latitude;
    maxX = point.latitude;
    minY = point.longitude;
    maxY = point.longitude;
  })(points[0]);

  // calculate rect
  points.map(point => {
    minX = Math.min(minX, point.latitude);
    maxX = Math.max(maxX, point.latitude);
    minY = Math.min(minY, point.longitude);
    maxY = Math.max(maxY, point.longitude);
  });

  const midX = (minX + maxX) / 2;
  const midY = (minY + maxY) / 2;
  const deltaX = maxX - minX;
  const deltaY = maxY - minY;
  return {
    latitude: +midX,
    longitude: +midY,
    latitudeDelta: +deltaX,
    longitudeDelta: +deltaY,
  };
}

export const isIos = Platform.OS === 'ios';

export const base64ToUri = base64 => `data:image/png;base64,${base64}`;

export const removeUndefinedValues = obj => {
  return Object.keys(obj)
    .filter(key => obj[key] !== undefined)
    .reduce((acc, key) => {
      acc[key] = obj[key];
      return acc;
    }, {});
};

let watchId = null;
let lastCoords = {latitude: null, longitude: null};
let lastUpdateTime = 0; // Track last update timestamp

const getDistance = (start, end) => {
  const toRad = x => (x * Math.PI) / 180;
  const ZAR = 6378137; // Earth’s radius in meters
  const dLat = toRad(end.latitude - start.latitude);
  const dLong = toRad(end.longitude - start.longitude);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(start.latitude)) *
      Math.cos(toRad(end.latitude)) *
      Math.sin(dLong / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return ZAR * c; // distance in meters
};

export const fetchCurrentLocation = async () => {
  try {
    const hasPermission = await requestPermissionsHere();
    if (!hasPermission) return null;

    const result =
      Platform.OS === 'ios'
        ? await Geolocation.requestAuthorization('always')
        : await requestPermissionsHere();

    if (!result) return null;

    return new Promise((resolve, reject) => {
      watchId = Geolocation.watchPosition(
        position => {
          const {latitude, longitude, heading} = position?.coords || {};
          const now = Date.now();

          const distanceMoved = !lastCoords.latitude
            ? Infinity
            : getDistance(lastCoords, {latitude, longitude});

          const enoughTimePassed = now - lastUpdateTime > 1000;

          if (distanceMoved > 10 && enoughTimePassed) {
            lastCoords = {latitude, longitude};
            lastUpdateTime = now;

            UpdateMyLoction({latitude, longitude, heading});
            resolve({latitude, longitude, heading});
          }
        },
        error => {
          console.error('❌ Error fetching location:', error);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          distanceFilter: 0.1,
          // interval: 1,
          // fastestInterval: 2000,
        },
      );
    });
  } catch (error) {
    console.error('⚠️ Error during location fetch:', error);
    return null;
  }
};

export const estimationTime = arrivedIn => {
  // ✅ Normalize input to minutes
  let minutesToAdd = 0;

  if (typeof arrivedIn === 'number') {
    minutesToAdd = arrivedIn;
  } else if (typeof arrivedIn === 'string') {
    // Extract numbers safely (e.g. "1 hr 20 mins", "45 mins")
    const matches = arrivedIn.match(/\d+/g);

    if (matches) {
      if (matches.length === 1) {
        minutesToAdd = Number(matches[0]);
      } else {
        // Assume first = hours, second = minutes
        minutesToAdd = Number(matches[0]) * 60 + Number(matches[1]);
      }
    }
  }

  // ✅ Fallback protection
  if (!minutesToAdd || isNaN(minutesToAdd)) {
    return '--';
  }

  // ✅ Correct time calculation
  const arrivalTime = new Date(Date.now() + minutesToAdd * 60000);

  let hours = arrivalTime.getHours();
  const minutes = arrivalTime.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';

  hours = hours % 12 || 12;

  return `${hours}:${minutes} ${ampm}`;
};

export const formatDuration = seconds => {
  if (!seconds) return `0 ${localization.driverFlow.min}`;

  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours > 0) {
    return `${hours} ${localization.rideSummary.h} ${
      remainingMinutes > 0
        ? `${remainingMinutes} ${localization.driverFlow.min}`
        : ''
    }`;
  } else {
    return `${minutes} ${localization.driverFlow.min}`;
  }
};

export function getTimeAfterMinutes12h(durationMinutes) {
  const now = new Date();
  const eta = new Date(now.getTime() + durationMinutes * 60000);
  let hours = eta.getHours();
  const minutes = eta.getMinutes().toString().padStart(2, '0');
  const ampm =
    hours >= 12 ? localization.rideSummary.pm : localization.rideSummary.am;
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${ampm}`;
}

export const useWatchLocation = () => {
  const watchIdRef = useRef(null);
  console.log('.... start useWatchLocation');
  useEffect(() => {
    const startWatching = async () => {
      console.log('📍 Requesting permission to watch location...');

      const hasPermission = await requestPermissionsHere();
      if (!hasPermission) {
        console.warn('🚫 Location permission denied');
        return;
      }

      const result =
        Platform.OS === 'ios'
          ? await Geolocation.requestAuthorization('always')
          : await requestPermissionsHere();

      if (!result) {
        console.warn('🚫 Location services not enabled');
        return;
      }

      console.log('✅ Permission granted. Starting location watch...');

      watchIdRef.current = Geolocation.watchPosition(
        position => {
          const {latitude, longitude} = position.coords;
          console.log(`📡 New Location: Lat: ${latitude}, Lon: ${longitude}`);
        },
        error => {
          console.error('❌ Error watching location:', error);
        },
        {
          enableHighAccuracy: true,
          distanceFilter: 2,
          interval: 5000,
          fastestInterval: 2000,
        },
      );
    };

    startWatching();

    // Clean up on unmount
    return () => {
      if (watchIdRef.current !== null) {
        Geolocation.clearWatch(watchIdRef.current);
        console.log(
          '🛑 Stopped watching location. Cleared watchId:',
          watchIdRef.current,
        );
      }
    };
  }, []);
};

export const formatTime = dateTimeStr => {
  const date = new Date(dateTimeStr);
  const hours = date.getHours();
  const minutes = date.getMinutes();

  const formattedHours = hours % 12 || 12; // convert to 12-hour format
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

  return `${formattedHours}:${formattedMinutes} ${ampm}`;
};

// export const formatSimpleTime = (timeStr) => {
//   const [hours, minutes] = timeStr.split(':').map(Number);
//   const period = hours >= 12 ? 'PM' : 'AM';
//   const formattedHours = hours % 12 || 12;

//   return `${formattedHours}:${minutes < 10 ? '0' + minutes : minutes} ${period}`;
// };

export const formatSimpleTime = timeStr => {
  if (!timeStr) return '';
  const [hours, minutes] = timeStr.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12;
  return `${formattedHours}:${
    minutes < 10 ? '0' + minutes : minutes
  } ${period}`;
};

export const formatDistance = meters => {
  const km = parseFloat(meters) / 1000;
  return `${km.toFixed(2)} Km`;
};

// Function to calculate duration text between start and end times
export const getRideDurationText = (rideDate, rideTime, completedTime) => {
  if (!rideDate || !rideTime || !completedTime) return '';

  const rideStart = moment(`${rideDate} ${rideTime}`, 'YYYY-MM-DD HH:mm');
  const rideEnd = moment(completedTime, 'YYYY-MM-DD HH:mm:ss');

  if (!rideStart.isValid() || !rideEnd.isValid()) return 'Invalid time range';

  const duration = moment.duration(rideEnd.diff(rideStart));
  const hours = duration.hours();
  const minutes = duration.minutes();

  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else if (minutes > 0) {
    return `${minutes}${localization.driverFlow.min}`;
  } else {
    return `0${localization.driverFlow.min}`;
  }
};

export const groupNotificationsByDate = notifications => {
  const grouped = {};

  notifications.forEach(notification => {
    const createdDate = moment(notification.created_at);
    let sectionTitle;

    if (createdDate.isSame(moment(), 'day')) {
      sectionTitle = 'Today';
    } else if (createdDate.isSame(moment().subtract(1, 'day'), 'day')) {
      sectionTitle = 'Yesterday';
    } else {
      sectionTitle = createdDate.format('MMMM DD, YYYY');
    }

    if (!grouped[sectionTitle]) {
      grouped[sectionTitle] = [];
    }
    grouped[sectionTitle].push(notification);
  });

  return Object.keys(grouped).map(title => ({
    title,
    data: grouped[title],
  }));
};

export const getYearsSinceCreated = createdAt => {
  const createdDate = new Date(createdAt);
  const currentDate = new Date();

  const diffTime = currentDate - createdDate; // in ms
  const diffMonths = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 30.44)); // Avg month length
  const diffYears = Math.floor(diffMonths / 12);

  if (diffMonths === 0) {
    return `0 ${localization.myProfile.month}`;
  } else if (diffMonths === 1) {
    return `1 ${localization.myProfile.month}`;
  } else if (diffMonths > 1 && diffMonths < 12) {
    return `${diffMonths} ${localization.myProfile.months}`;
  } else if (diffMonths >= 12 && diffMonths < 24) {
    return `1 ${localization.myProfile.year}`;
  } else {
    return `${diffYears} ${localization.myProfile.years}`;
  }
};

export const getOrderedRoutePoints = bookingData => {
  if (!bookingData) return [];

  // Parse lat/lng from comma-separated strings
  const [sourceLat, sourceLng] =
    bookingData?.source_latlng?.split(',').map(Number) || [];
  const [destLat, destLng] =
    bookingData?.destination_latlng?.split(',').map(Number) || [];

  const pickup = {
    type: 'pickup',
    address: bookingData?.source_name,
    latitude: sourceLat,
    longitude: sourceLng,
  };

  const dropoff = {
    type: 'dropoff',
    address: bookingData?.destination_name,
    latitude: destLat,
    longitude: destLng,
  };

  const stopPoints = bookingData?.booking_stop_points || [];

  const waypoints = stopPoints.map((stop, index) => {
    const [lat, lng] =
      stop.latitude && stop.longitude
        ? [parseFloat(stop.latitude), parseFloat(stop.longitude)]
        : [null, null];

    return {
      type: 'stop',
      address: stop.stop,
      latitude: lat,
      longitude: lng,
      id: stop.id,
      index,
    };
  });

  return [pickup, ...waypoints, dropoff];
};

export const fetchRouteLegs = async routePoints => {
  if (!routePoints || routePoints.length < 2) return [];

  const updatedPoints = [...routePoints];

  for (let i = 0; i < routePoints.length - 1; i++) {
    const origin = routePoints[i];
    const destination = routePoints[i + 1];

    try {
      const res = await axios.get(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&key=${myApiKey}`,
      );

      const leg = res.data.routes[0]?.legs[0];
      console.log('🚀 ~ fetchRouteLegs ~ leg:', leg);
      if (leg) {
        updatedPoints[i + 1] = {
          ...updatedPoints[i + 1],
          duration: leg.duration.text,
          distance: leg.distance.text,
        };
      }
    } catch (err) {
      console.error('Error fetching duration:', err);
    }
  }

  return updatedPoints;
};

import AsyncStorage from '@react-native-async-storage/async-storage';
import {myApiKey} from './Backend';
import axios from 'axios';

export const useStartStopTimer = () => {
  const [seconds, setSeconds] = useState(0);

  const intervalRef = useRef(null);

  const startTimer = useCallback(async () => {
    const savedTime = await AsyncStorage.getItem('timerStartTime');

    if (!savedTime) {
      const now = Date.now();
      await AsyncStorage.setItem('timerStartTime', now.toString());
      setSeconds(0);
    } else {
      const elapsed = Math.floor((Date.now() - parseInt(savedTime, 10)) / 1000);
      setSeconds(elapsed);
    }

    if (!intervalRef.current) {
      intervalRef.current = BackgroundTimer.setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    }
  }, []);

  const stopTimer = useCallback(async () => {
    resetTimer();
    if (intervalRef.current) {
      BackgroundTimer.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    await AsyncStorage.removeItem('timerStartTime');
  }, []);

  const resetTimer = useCallback(async () => {
    setSeconds(0);
    await AsyncStorage.setItem('timerStartTime', Date.now().toString());
  }, []);

const formatTime = useCallback(() => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  const pad = (n) => (n < 10 ? '0' + n : n);

  return `${pad(mins)}:${pad(secs)}`;
}, [seconds]);

const formattedTime = useMemo(() => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  const pad = (n) => (n < 10 ? '0' + n : n);

  return `${pad(mins)}:${pad(secs)}`;
}, [seconds]);

  return {
    seconds,
    startTimer,
    stopTimer,
    resetTimer,
    formatTime,
    formattedTime,
  };
};
