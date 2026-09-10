import React, {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
} from 'react';
import {
  View,
  StyleSheet,
  Linking,
  Platform,
  Image,
  TouchableOpacity,
  Alert,
  BackHandler,
  StatusBar,
  Modal,
  Keyboard,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import MapView, { Heatmap, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Images } from '../../Constants/Images';
import { Colors } from '../../Constants/Colors';
import Press from '../../Component/UI/Press';
import Typography from '../../Component/UI/Typography';
import { Fonts } from '../../Constants/Fonts';
import BottomSheets from '../../Component/UI/BottomSheet';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import AsyncStorage from '@react-native-async-storage/async-storage';
import localization from '../../Constants/localization';
import { requestPermissionsHere } from '../../Component/Premissions';
import { useIsFocused, useNavigation, useRoute } from '@react-navigation/native';
import { rideRatingLock } from '../../Navigation/rideRatingLock';
import { useDispatch, useSelector } from 'react-redux';
import {
  ACCEPT_RIDE,
  CHANGE_STATUS,
  CURRENT_RIDE,
  GET_DRIVER_PROFILE,
  MASTER_LIST,
  REJECT_RIDE,
  UPDATE_DRIVER_STATUS,
} from '../../Backend/ApiRoutes';
import {
  GEOCODE_URL,
  GET_WITH_TOKEN,
  isNetworkAvailable,
  Socket_URL,
  myApiKey,
} from '../../Backend/Backend';
import { fetchCurrentRideData } from '../../Backend/ActiveRideGuard';
import {
  FORCE_LOGOUT_SOCKET_EVENTS,
  handleForceLogout,
  isDeactivatedDriverProfile,
} from '../../Backend/ForceLogout';
import {
  isActiveRideStatus,
  isTerminalRideStatus,
} from '../../Constants/RideStatus';
import Button from '../../Component/Button';
import {
  clearIncomingBooking,
  isAuth,
  personalData,
  expiredDocDetails as setExpiredDocDetails,
} from '../../Redux/action';
import { FULL_HEIGHT, FULL_WIDTH } from '../../Constants/Layout';
import Geolocation from 'react-native-geolocation-service';
import {
  estimationTime,
  fetchCurrentLocation,
  formatDistance,
  formatDuration,
  formatSimpleTime,
  getRideDurationText,
  useStartStopTimer,
} from '../../Backend/Utility';
import { io } from 'socket.io-client';
import { ToastMsg } from '../../Component/ToastMsg';
import ProfileCard from '../../Component/ProfileCard';
import LocationCard from '../../Component/LocationCard';
import RideInfoCard from '../../Component/RideInfoCard';
import RideRequestCard from '../../Component/RideRequestCard';
import { windowWidth } from '../../Constants/Dimensions';
import MapViewDirection from '../../Component/MapViewDirection';
import AnimatedMarkers from '../../Component/AnimatedMarkers';
import ContactButtons from '../../Component/ContactButtons';
import OTP_for_ride from './OTP_for_ride';
import moment from 'moment';
const SIZE = 50;
import NetInfo from '@react-native-community/netinfo';
import Chat from './Chat';
import MessageCard from '../../Component/MessageCard';
import AnimatedCancelButton from '../../Component/AnimatedCancelButton';

/** API may return is_approved as 0, "0", 2, or "2". */
const normalizeApprovalStatus = value => {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

const applyRideState = ({
  booking,
  hasAccepted,
  setBookingData,
  setHasAccepted,
  setShowBooking,
  setIsAccept,
  setIsReached,
  setIsOtp,
  setIsNear,
  setIsStart,
  setIsOnline,
  setIsArrivedDestination,
  setWaypoints,
  setAddressData,
  resetTimer,
  startTimer,
  stopTimer,
}) => {
  if (!booking?.status_id) return;

  const { status_id, source_latlng, destination_latlng, booking_stop_points } =
    booking;

  console.log('status_id', status_id);

  const [srcLat, srcLng] = source_latlng?.split(',') || [];
  const [dstLat, dstLng] = destination_latlng?.split(',') || [];

  setIsAccept(false);
  setIsReached(false);
  setIsStart(false);
  setIsArrivedDestination(false);

  setBookingData(booking);
  setShowBooking(true);
  setIsOnline(false);

  if (status_id === 'Confirmed' && !hasAccepted) {
    setIsReached(false); // hard guard
  }

  switch (status_id) {
    case 'Driver Assigned':
      // Server status after accept; hasAccepted is in-memory so we must re-sync for cold start.
      setHasAccepted(true);
      resetTimer();
      stopTimer();
      setIsAccept(true);
      setAddressData(p => ({
        ...p,
        latitudeDes: srcLat,
        longitudeDes: srcLng,
        IsTrack: true,
      }));
      setWaypoints([]);
      break;

    case 'Confirmed':
      if (!hasAccepted) {
        // 🔔 booking just arrived
        setIsAccept(true); // Accept / Reject UI
      } else {
        // ✅ driver already accepted
        setIsReached(true); // Go to pickup UI
      }

      setAddressData(p => ({
        ...p,
        latitudeDes: srcLat,
        longitudeDes: srcLng,
        IsTrack: true,
      }));
      break;

    case 'On My Way':
      setIsReached(true);
      setIsOtp(false);
      setIsNear(false); // avoid stale proximity skipping manual "I've Arrived"
      setAddressData(p => ({
        ...p,
        latitudeDes: srcLat,
        longitudeDes: srcLng,
        IsTrack: true,
      }));
      break;

    case 'On The Spot':
      setIsReached(true);
      setIsOtp(true); // side-effects (timer, modal logic)
      setIsNear(true);
      setIsStart(true);
      startTimer();

      setAddressData(p => ({
        ...p,
        latitudeDes: srcLat,
        longitudeDes: srcLng,
        IsTrack: true,
      }));
      break;

    case 'Customer in the Car':
      resetTimer();
      stopTimer();
      setIsReached(true);
      setIsOtp(false);
      setAddressData(p => ({
        ...p,
        latitudeDes: dstLat,
        longitudeDes: dstLng,
        IsTrack: true,
      }));
      setIsArrivedDestination(true);
      setWaypoints(booking_stop_points || []);
      break;

    case 'Cancelled':
      resetTimer();
      stopTimer();
      setShowBooking(false);
      setIsOnline(true);
      break;

    default:
      console.warn('⚠️ Unknown ride status:', status_id);
  }
};

const Home = ({ }) => {
  const mapRef = useRef();
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const expiredDocDetails = useSelector(store => store.expiredDocDetails);
  const isDocExpired = useSelector(store => store.isDocExpired);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const personal_Data = useSelector(store => store.personalData);
  const [isOnline, setIsOnline] = useState(false);
  const [loading, setLoading] = useState(false);
  const [singleData, setSinglsingleData] = useState(null);
  const approvalStatusRef = useRef(null);
  const [data, setData] = useState([]);
  const [height, setheight] = useState('40%');
  const [isUserOnline, setIsUserOnline] = useState(false);
  const isFocus = useIsFocused();
  const socketRef = useRef(null);
  const [addressData, setAddressData] = useState({
    latitude: 26.9124,
    longitude: 75.7873,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0521,
  });
  const bottomSheetRef = useRef(null);
  const [bookingData, setBookingData] = useState({});
  const approvalStatus = useMemo(
    () =>
      normalizeApprovalStatus(
        singleData?.is_approved ?? personal_Data?.is_approved,
      ),
    [singleData?.is_approved, personal_Data?.is_approved],
  );
  const isUnderReview = approvalStatus === 0;
  const isApplicationRejected = approvalStatus === 2;
  const showApprovalSheet = isUnderReview || isApplicationRejected;

  useEffect(() => {
    approvalStatusRef.current = approvalStatus;
  }, [approvalStatus]);

  const setOnlineIfApproved = useCallback(value => {
    if (!value) {
      setIsOnline(false);
      return;
    }
    const approval = approvalStatusRef.current;
    if (approval !== 0 && approval !== 2) {
      setIsOnline(true);
    }
  }, []);

  const screenHeight = Dimensions.get('window').height;
  const estimateHeight = (text, buttonPresnt = false) => {
    if (!text) return 220; // default minimum height
    const baseHeight = buttonPresnt ? 250 : 150; // base height for header and padding
    const extraHeightPerChar = 0.6; // adjust this factor as needed
    const calculated = baseHeight + text.length * extraHeightPerChar;
    const maxHeight = screenHeight * 0.8; // max 80% of screen
    return calculated > maxHeight ? maxHeight : calculated;
  };
  const [caculateData, setCaculateData] = useState({
    distance: '',
    time: '',
    durationSec: null,
  });

  const [isOtp, setIsOtp] = useState(true);
  const [isAccept, setIsAccept] = useState(false);
  const [isArrived, setIsArrived] = useState(false);
  const [isStart, setIsStart] = useState(false);
  const [isReached, setIsReached] = useState(false);
  const [isEmergency, setIsEmergency] = useState(false);
  const [, setIsNear] = useState(false);
  const [isEmergencyNumber, setIsEmergencyNumber] = useState();
  const [showBooking, setShowBooking] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [isArrivedDestination, setIsArrivedDestination] = useState(false);
  const [isChat, setIsChat] = useState(false);
  const [error, setError] = useState('');
  const [rideDurationText, setRideDurationText] = useState('');
  const [waypoints, setWaypoints] = useState([]);
  const [More, setMore] = useState(false);
  const [visible, setVisible] = useState(false);
  const [msg, setMsg] = useState({});
  const bookingDataRef = useRef(bookingData);
  const showBookingRef = useRef(showBooking);
  const [ariveLoader, serAriveLoader] = useState(false);
  const [acceptRideLoading, setAcceptRideLoading] = useState(false);
  const [rejectRideLoading, setRejectRideLoading] = useState(false);
  // console.log('ariveLoaderariveLoaderariveLoader', ariveLoader);
  const [isKeyboard, setIsKeyboard] = useState(false);
  const [onlineOfflineLoader, setOnlineOfflineLoader] = useState(false);
  const isChatsRef = useRef(isChat);
  const wasChatRef = useRef(false);
  const isFocusRef = useRef(isFocus);

  useEffect(() => {
    isFocusRef.current = isFocus;
  }, [isFocus]);
  /** Chat keeps fixed snap points; ride UI uses dynamic height (content-sized) capped below. */
  const snapPoints = useMemo(() => {
    if (isChat) {
      return Platform.OS === 'android' ? ['60%', '95%'] : ['50%'];
    }
    return ['100%'];
  }, [isChat]);

  const maxBookingDynamicContentSize = useMemo(
    () => Math.round(Dimensions.get('window').height * 0.92),
    [],
  );

  const [showExpiryModal, setShowExpiryModal] = useState(false);
  const [expiryMessages, setExpiryMessages] = useState([]);
  const expiryAlertShownRef = useRef(false);
  const [hasAccepted, setHasAccepted] = useState(false);
  const completedRideRef = useRef(null);
  /** Ignore CURRENT_RIDE echo of the ride we just finished until the server clears it. */
  const lastRatedBookingIdRef = useRef(null);
  const getCurrentLocationRef = useRef(() => { });

  const resetRideUI = () => {
    setHasAccepted(false);
    setShowBooking(false);
    setBookingData({});
    setIsAccept(false);
    setIsReached(false);
    setIsOtp(false);
    setIsNear(false);
    setIsStart(false);
    setIsArrivedDestination(false);
    setWaypoints([]);
    setAcceptRideLoading(false);
    setRejectRideLoading(false);
    serAriveLoader(false);

    // 🔥 CRITICAL FIXES
    completedRideRef.current = null;
    rideRatingLock.active = false;

    resetTimer();
    stopTimer();
    setOnlineIfApproved(true);
  };

  // useEffect(() => {
  //   console.log('RIDE STATE>>>>>>>>>>>>>>>>>', {
  //     status: bookingData?.status_id,
  //     hasAccepted,
  //     isAccept,
  //     isReached,
  //   });
  // }, [bookingData, hasAccepted, isAccept, isReached]);

  useEffect(() => {
    if (!profileLoaded) return;
    if (!isDocExpired) return;
    if (expiryAlertShownRef.current) return;
    if (!Array.isArray(expiredDocDetails) || expiredDocDetails.length === 0)
      return;

    expiryAlertShownRef.current = true;

    const formatted = expiredDocDetails.map(item => ({
      label: item.document_name,
      daysLeft: item.days_left,
      status: item.status,
    }));

    setExpiryMessages(formatted);
    setShowExpiryModal(true);
  }, [profileLoaded, isDocExpired, expiredDocDetails]);

  useEffect(() => {
    if (!personal_Data?.driver_id) {
      expiryAlertShownRef.current = false;
      setProfileLoaded(false);
    }
  }, [personal_Data?.driver_id]);

  const SOCKET_SERVER_URL = Socket_URL;
  // console.log('🔌 SOCKET URL:', SOCKET_SERVER_URL);

  const {
    seconds,
    startTimer,
    stopTimer,
    resetTimer,
    formatTime,
    formattedTime,
  } = useStartStopTimer();
  console.log('🚀 ~ Home ~ seconds:', formattedTime);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setIsKeyboard(true); // 🔻 keyboard open
      },
    );

    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setIsKeyboard(false); // 🔺 keyboard closed
      },
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  /** When chat opens, snap to 60% (index 0) once — not every re-render (keyboard). */
  useLayoutEffect(() => {
    if (isChat && !wasChatRef.current) {
      bottomSheetRef.current?.snapToIndex(0);
    }
    wasChatRef.current = isChat;
  }, [isChat]);

  /** After keyboard closes, Android `extend` can stick on 95% — snap back to 60%. */
  useEffect(() => {
    if (!isChat || isKeyboard) {
      return;
    }
    const t = setTimeout(() => {
      bottomSheetRef.current?.snapToIndex(0);
    }, 120);
    return () => clearTimeout(t);
  }, [isChat, isKeyboard]);

  useEffect(() => {
    if (isFocus) {
      GET_HEATMAP();
      GET_PROFILE();
      fetchLocation();
      const socket = socketRef.current;
      if (socket?.connected && personal_Data?.driver_id) {
        socket.emit('stopsUpdated', { driver_id: personal_Data.driver_id });
      }
    }
  }, [isFocus]);

  const GET_HEATMAP = async () => {
    GET_WITH_TOKEN(
      MASTER_LIST,
      success => {
        setData(success?.data);
      },
      error => { },
      fail => { },
    );
  };

  useEffect(() => {
    bookingDataRef.current = bookingData;
  }, [bookingData]);

  useEffect(() => {
    showBookingRef.current = showBooking;
  }, [showBooking]);

  useEffect(() => {
    isChatsRef.current = isChat;
  }, [isChat]);

  // useEffect(() => {
  //   const backAction = () => {
  //     Alert.alert(localization.home.Hold, localization.home.exit, [
  //       {
  //         text: localization.home.Cancel,
  //         onPress: () => null,
  //         style: 'cancel',
  //       },
  //       { text: localization.home.YES, onPress: () => BackHandler.exitApp() },
  //     ]);
  //     return true;
  //   };

  //   const backHandler = BackHandler.addEventListener(
  //     'hardwareBackPress',
  //     backAction,
  //   );

  //   return () => backHandler.remove(); // Clean up
  // }, []);

  useEffect(() => {
    const backAction = () => {
      // Agar previous screen hai to normal back karo
      if (navigation.canGoBack()) {
        navigation.goBack();
        return true;
      }

      // Sirf Home screen par exit popup
      Alert.alert(
        localization.home.Hold,
        localization.home.exit,
        [
          {
            text: localization.home.Cancel,
            style: 'cancel',
          },
          {
            text: localization.home.YES,
            onPress: () => BackHandler.exitApp(),
          },
        ],
        { cancelable: true },
      );

      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, [navigation]);
  useEffect(() => {
    let watchId = null;

    const startTracking = async () => {
      const hasPermission = await requestPermissionsHere();
      if (!hasPermission) return;

      watchId = Geolocation.watchPosition(
        position => {
          const { latitude, longitude, heading } = position.coords;

          // 1️⃣ Update map state
          setAddressData(prev => ({
            ...prev,
            latitude: Number(latitude),
            longitude: Number(longitude),
            heading: Number(heading) || 0,
          }));

          // 2️⃣ Emit socket
          const socket = socketRef.current;
          if (socket?.connected) {
            socket.emit('driver_lat_lng', {
              driver_id: personal_Data?.driver_id,
              lat: latitude,
              lng: longitude,
              angle: heading ?? 0,
            });
          }
        },
        error => {
          // console.log('Location watch error:', error);
        },
        {
          enableHighAccuracy: true,
          distanceFilter: 5, // update every 5 meters
          interval: 3000,
          fastestInterval: 2000,
        },
      );
    };

    startTracking();

    return () => {
      if (watchId !== null) {
        Geolocation.clearWatch(watchId);
      }
    };
  }, [personal_Data?.driver_id]);

  useEffect(() => {
    if (!personal_Data?.driver_id || socketRef.current) return;

    const socket = io(SOCKET_SERVER_URL, {
      transports: ['polling', 'websocket'],
      timeout: 20000,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 3000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('loginChatRoom', {
        room: `user_${personal_Data.driver_id}`,
      });
    });

    socket.on('connect_error', err => {
      console.error('❌ Socket error', err.message);
    });

    const onForceLogout = data => {
      const msg =
        data?.msg ??
        data?.message ??
        'Your account has been deactivated. Please contact support.';
      handleForceLogout(msg);
    };

    FORCE_LOGOUT_SOCKET_EVENTS.forEach(event => {
      socket.on(event, onForceLogout);
    });

    return () => {
      FORCE_LOGOUT_SOCKET_EVENTS.forEach(event => {
        socket.off(event, onForceLogout);
      });
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
    };
  }, [personal_Data?.driver_id]);

  /** In-app chat banner (MessageCard): rider messages — same socket event as Chat.js */
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) {
      return;
    }

    const onIncomingChatBanner = data => {
      if (!data || !isFocusRef.current) {
        return;
      }

      const booking = bookingDataRef.current;
      const driverId = personal_Data?.driver_id;
      if (!driverId || !booking?.id || !booking?.get_user_name?.id) {
        return;
      }

      if (String(data.sender_id) === String(driverId)) {
        return;
      }

      if (
        data.channel_id != null &&
        booking.id != null &&
        String(data.channel_id) !== String(booking.id)
      ) {
        return;
      }

      if (isChatsRef.current) {
        return;
      }

      const u = booking.get_user_name;
      const senderLabel =
        [u?.first_name, u?.last_name].filter(Boolean).join(' ').trim() ||
        u?.first_name ||
        'Customer';

      setMsg({
        avatar: u?.image,
        sender: senderLabel,
        message: String(data.message ?? '').trim(),
      });
      setVisible(true);
    };

    socket.on('sendEmitMessageResponce', onIncomingChatBanner);
    return () => {
      socket.off('sendEmitMessageResponce', onIncomingChatBanner);
    };
  }, [personal_Data?.driver_id]);

  const incomingBooking = useSelector(state => state.incomingBooking);

  useEffect(() => {
    Get_Current_location();
  }, []);

  useEffect(() => {
    if (!incomingBooking) return;
    Get_Current_location();

    dispatch(clearIncomingBooking());
  }, [incomingBooking]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const onNotifyBooking = data => {
      if (data?.room !== 'notifyBooking') return;
      if (data?.driver_id !== personal_Data?.driver_id) return;

      // 🔥 SINGLE SOURCE OF TRUTH
      Get_Current_location();
    };

    const onRideMissed = async () => {
      const online = await isNetworkAvailable();
      if (!online) {
        return;
      }
      Get_Current_location({ preserveLocalOnEmpty: false });
    };
    const onCancelRide = data => {
      // console.log('🚨 Ride cancelled:', data);

      resetRideUI(); // 🔥 immediate UI cleanup
      Get_Current_location(); // 🔄 backend sync (safe)
    };

    const onStopsUpdated = () => Get_Current_location();

    socket.on('notifyBooking', onNotifyBooking);
    socket.on('rideMissed', onRideMissed);
    socket.on('cancelRideCustomer', onCancelRide);
    socket.on('stopsUpdated', onStopsUpdated);

    return () => {
      socket.off('notifyBooking', onNotifyBooking);
      socket.off('rideMissed', onRideMissed);
      socket.off('cancelRideCustomer', onCancelRide);
      socket.off('stopsUpdated', onStopsUpdated);
    };
  }, [personal_Data?.driver_id]);

  const GET_PROFILE = () => {
    setLoading(true);
    GET_WITH_TOKEN(
      GET_DRIVER_PROFILE,
      response => {
        if (isDeactivatedDriverProfile(response?.data)) {
          handleForceLogout(
            response?.msg ??
              'Your account has been deactivated. Please contact support.',
          );
          setLoading(false);
          return;
        }

        // console.log(response?.data, 'response==ddd==============>');
        dispatch(
          setExpiredDocDetails(
            response.data?.expired_documents || [],
            response.data?.has_expired_documents || false,
          ),
        );

        // ✅ mark API completion
        setProfileLoaded(true);

        setIsEmergencyNumber(response?.admin_emergency_contact);
        setSinglsingleData(response?.data);
        approvalStatusRef.current = normalizeApprovalStatus(
          response?.data?.is_approved,
        );
        if (response?.data?.is_approved == 2) {
          const combinedData = {
            ...personal_Data, //
            firstName: response?.data?.first_name,
            lastname: response?.data?.last_name,
            dob: response?.data?.dob,
            trnNo: response?.data?.driver_details?.trn,
            trnDoc: response?.data?.driver_details?.trn_document,
            photo: response?.data?.driver_details?.driver_photo,
            speaking_languages: response?.data?.speaking_languages,
            billType: response?.data?.driver_details?.billing_type_lookup_id,
            bankAccountHolder:
              response?.data?.driver_details?.account_holder_name,
            bankAccountNumber: response?.data?.driver_details?.account_number,
            branchCode: response?.data?.driver_details?.branch_code_lookup_id,
            carModel: response?.data?.driver_details?.car_model_lookup_id,
            carYear: response?.data?.driver_details?.car_year_lookup_id,
            carColor: response?.data?.driver_details?.car_color_lookup_id,
            carVin: response?.data?.driver_details?.car_vin_number,
            licensePlate: response?.data?.driver_details?.license_plate_number,
            licensExpiryDate:
              response?.data?.driver_details?.license_expiry_date,
            virExpiry:
              response?.data?.driver_details?.vehicle_inspection_expiry_date,
            licencePhoto: response?.data?.driver_details?.license_disc,
            virPhoto: response?.data?.driver_details?.vehicle_inspection_report,
            photoForth: response?.data?.image,
            RSAPhoto: response?.data?.driver_details?.rsa_prdp_card,
            RSAExpiry: response?.data?.driver_details?.rsa_prdp_card_expiry,
            SSRPhoto: response?.data?.driver_details?.safety_screening,
            SSRExpiry: response?.data?.driver_details?.safety_screening_expiry,
            DERPhoto: response?.data?.driver_details?.driving_evalution_report,
            DERExpiry:
              response?.data?.driver_details?.driving_evalution_report_expiry,
            terms: response?.data?.driver_details?.terms == '0' ? false : true,
            is_approved: response?.data?.is_approved,
            verify_token: response?.data?.verify_token,
            lastStep: true,
            edit: 're_Submit',
            driver_id: response?.data?.id,
            step: 5,
          };

          dispatch(personalData(combinedData));
        } else {
          const combinedData = {
            ...personal_Data, //
            driver_id: response?.data?.id,
            firstName: response?.data?.first_name,
            lastname: response?.data?.last_name,
            dob: response?.data?.dob,
            trnNo: response?.data?.driver_details?.trn,
            trnDoc: response?.data?.driver_details?.trn_document,
            photo: response?.data?.driver_details?.driver_photo,
            speaking_languages: response?.data?.speaking_languages,
            billType: response?.data?.driver_details?.billing_type_lookup_id,
            bankAccountHolder:
              response?.data?.driver_details?.account_holder_name,
            bankAccountNumber: response?.data?.driver_details?.account_number,
            branchCode: response?.data?.driver_details?.branch_code_lookup_id,
            carModel: response?.data?.driver_details?.car_model_lookup_id,
            carYear: response?.data?.driver_details?.car_year_lookup_id,
            carColor: response?.data?.driver_details?.car_color_lookup_id,
            carVin: response?.data?.driver_details?.car_vin_number,
            licensePlate: response?.data?.driver_details?.license_plate_number,
            licensExpiryDate:
              response?.data?.driver_details?.license_expiry_date,
            virExpiry:
              response?.data?.driver_details?.vehicle_inspection_expiry_date,
            licencePhoto: response?.data?.driver_details?.license_disc,
            virPhoto: response?.data?.driver_details?.vehicle_inspection_report,
            photoForth: response?.data?.image,
            RSAPhoto: response?.data?.driver_details?.rsa_prdp_card,
            RSAExpiry: response?.data?.driver_details?.rsa_prdp_card_expiry,
            SSRPhoto: response?.data?.driver_details?.safety_screening,
            SSRExpiry: response?.data?.driver_details?.safety_screening_expiry,
            DERPhoto: response?.data?.driver_details?.driving_evalution_report,
            DERExpiry:
              response?.data?.driver_details?.driving_evalution_report_expiry,
            terms: response?.data?.driver_details?.terms == '0' ? false : true,
            is_approved: response?.data?.is_approved,
            verify_token: response?.data?.verify_token,
            is_approved: response?.data?.is_approved,
            step: 5,
          };
          dispatch(personalData(combinedData));
        }
        if (
          response?.data?.is_approved == 0 ||
          response?.data?.is_approved == 2
        ) {
          setIsOnline(false);
        } else {
          setIsOnline(true);
          setIsUserOnline(!!response?.data?.is_online);
          Get_Current_location();
        }
        setLoading(false);
      },
      s => {
        // console.log(s, 's==ddd==============>');
        setLoading(false);
      },
      s => {
        // console.log(s, 's==ddd==============>');
        setLoading(false);
      },
    );
  };
  const fetchLocation = async () => {
    try {
      const hasPermission = await requestPermissionsHere();
      if (hasPermission) {
        const result =
          Platform.OS === 'ios'
            ? Geolocation.requestAuthorization('always')
            : requestPermissionsHere();

        result.then(res => {
          if (res) {
            Geolocation.getCurrentPosition(
              async position => {
                const currentLatitude = position.coords.latitude;
                const currentLongitude = position.coords.longitude;

                // Now update the map region with the current coordinates

                // Proceed with your geocoding logic
                try {
                  const response = await fetch(
                    `${GEOCODE_URL}${currentLatitude},${currentLongitude}&key=${myApiKey}`,
                  );
                  const responseJson = await response.json();

                  if (responseJson.status === 'OK') {
                    const addressComponents =
                      responseJson.results[0]?.address_components || [];
                    const fullAddress =
                      responseJson.results[0]?.formatted_address ||
                      'Address not found';

                    const country =
                      addressComponents.find(component =>
                        component.types.includes('country'),
                      )?.long_name || 'Country not found';

                    const countryCode =
                      addressComponents.find(component =>
                        component.types.includes('country'),
                      )?.short_name || 'Country code not found';

                    const state =
                      addressComponents.find(component =>
                        component.types.includes('administrative_area_level_1'),
                      )?.long_name || 'State not found';

                    const city =
                      addressComponents.find(
                        component =>
                          component.types.includes('locality') ||
                          component.types.includes(
                            'administrative_area_level_2',
                          ),
                      )?.long_name || 'City not found';

                    const pincode =
                      addressComponents.find(component =>
                        component.types.includes('postal_code'),
                      )?.long_name || 'Pin code not found';
                    const sourceId =
                      responseJson.results[0]?.place_id ||
                      'Source ID not found';

                    const Adreess = {
                      country: country,
                      countryCode: countryCode,
                      state: state,
                      city: city,
                      pincode: pincode,
                      fullAddress: fullAddress,
                      latitude: currentLatitude,
                      longitude: currentLongitude,
                      sourceId: sourceId,
                    };

                    const obj = {
                      driver_id: personal_Data?.driver_id,
                      lat: position.coords.latitude,
                      lng: position.coords.longitude,
                      angle: position.coords.heading ?? 0,
                    };

                    const socket = socketRef.current;

                    if (socket?.connected) {
                      socket.emit('driver_lat_lng', obj);
                    }

                    setTimeout(() => {
                      const latitude = currentLatitude
                        ? +currentLatitude
                        : 37.3317876;
                      const longitude = currentLongitude
                        ? +currentLongitude
                        : -122.0054812;

                      setAddressData(
                        prevState => ({
                          ...prevState,
                          latitude: +currentLatitude || '37.3317876',
                          longitude: +currentLongitude || '-122.0054812',
                          latitudeDelta: 0.0922,
                          longitudeDelta: 0.0521,
                        }),
                        1000,
                      );
                      if (!bookingData?.id) {
                        mapRef.current?.animateCamera(
                          {
                            center: {
                              latitude,
                              longitude,
                            },
                            pitch: 0,
                            zoom: 18,
                          },
                          { duration: 500 },
                        );
                      }
                    }, 1000);

                    return {
                      latitude: currentLatitude,
                      longitude: currentLongitude,
                    };
                  } else {
                    console.error(
                      'Geocoding failed:',
                      responseJson.error_message || responseJson.status,
                    );
                  }
                } catch (error) {
                  console.error('Error fetching geocode:', error);
                }
              },
              error => {
                console.error('Error fetching location:', error);
              },
              { enableHighAccuracy: true },
            );
          }
        });
      }
    } catch (error) {
      console.error('Error during location fetch:', error);
    }
  };

  const Get_Current_location = (options = {}) => {
    const { preserveLocalOnEmpty = true } = options;

    GET_WITH_TOKEN(
      CURRENT_RIDE,
      res => {
        console.log('res from current ride ==>', res);
        
        if (res?.status !== 'success') {
          return;
        }
        if (!res?.data) {
          lastRatedBookingIdRef.current = null;

          const localBooking = bookingDataRef.current;
          if (
            preserveLocalOnEmpty &&
            showBookingRef.current &&
            localBooking?.id &&
            isActiveRideStatus(localBooking.status_id)
          ) {
            return;
          }

          resetRideUI();
          return;
        }

        const bookingId = res.data?.id;
        if (
          lastRatedBookingIdRef.current != null &&
          String(bookingId) === String(lastRatedBookingIdRef.current)
        ) {
          return;
        }
        if (
          lastRatedBookingIdRef.current != null &&
          String(bookingId) !== String(lastRatedBookingIdRef.current)
        ) {
          lastRatedBookingIdRef.current = null;
        }

        if (rideRatingLock.active) {
          return;
        }

        if (isTerminalRideStatus(res.data?.status_id)) {
          resetRideUI();
          return;
        }

        applyRideState({
          booking: res.data,
          hasAccepted,
          setBookingData,
          setHasAccepted,
          setShowBooking,
          setIsAccept,
          setIsReached,
          setIsOtp,
          setIsNear,
          setIsStart,
          setIsOnline: setOnlineIfApproved,
          setIsArrivedDestination,
          setWaypoints,
          setAddressData,
          resetTimer,
          startTimer,
          stopTimer,
        });
      },
      () => {
        // Keep local ride UI when the sync API fails.
      },
      () => {
        // Keep local ride UI when offline / network fails.
      },
    );
  };

  getCurrentLocationRef.current = Get_Current_location;

  useEffect(() => {
    if (!route.params?.openChatFromNotification) {
      return;
    }
    getCurrentLocationRef.current?.();
    const t = setTimeout(() => {
      setIsChat(true);
      navigation.setParams({ openChatFromNotification: undefined });
    }, 600);
    return () => clearTimeout(t);
  }, [route.params?.openChatFromNotification, navigation]);

  useEffect(() => {
    if (!route.params?.openBookingFromNotification) {
      return;
    }
    getCurrentLocationRef.current?.();
    navigation.setParams({ openBookingFromNotification: undefined });
  }, [route.params?.openBookingFromNotification, navigation]);


  useEffect(() => {
    let lastResyncAt = 0;

    global.fetchCurrentRideAfterRating = () => {
      getCurrentLocationRef.current();
    };
    global.resyncCurrentRide = () => {
      const now = Date.now();
      if (now - lastResyncAt < 1500) {
        return;
      }
      lastResyncAt = now;
      getCurrentLocationRef.current();
    };
    return () => {
      delete global.fetchCurrentRideAfterRating;
      delete global.resyncCurrentRide;
    };
  }, []);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const online =
        state.isConnected && state.isInternetReachable !== false;
      if (!online) {
        return;
      }

      getCurrentLocationRef.current?.();

      const socket = socketRef.current;
      if (socket && !socket.connected) {
        socket.connect();
      }
    });

    return () => unsubscribe();
  }, []);

  const handleCallPress = phoneNumber => {
    const url = `tel:${phoneNumber}`;
    Linking.openURL(url);
  };

  const sendCurrentLocation = async () => {
    if (!socketRef.current?.connected) return;

    const location = await fetchCurrentLocation();
    if (!location) return;

    socketRef.current.emit('driver_lat_lng', {
      driver_id: personal_Data?.driver_id,
      lat: location.latitude,
      lng: location.longitude,
      angle: location.heading ?? 0,
    });
  };

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !socket.connected) return;
  }, []);

  useEffect(() => {
    global.UpdateMyLoction = location => {
      const socket = socketRef.current;
      if (!socket || !socket.connected) return;

      socket.emit('driver_lat_lng', {
        driver_id: personal_Data?.driver_id,
        lat: location.latitude,
        lng: location.longitude,
        angle: location.heading ?? 0,
      });
    };

    return () => {
      delete global.UpdateMyLoction;
    };
  }, [personal_Data?.driver_id]);

  const handleDriverStatus = targetOnline => {
    if (onlineOfflineLoader) return;
    setOnlineOfflineLoader(true);
    setLoading(true);

    GET_WITH_TOKEN(
      `${UPDATE_DRIVER_STATUS}?online=${targetOnline}`,
      success => {
        setLoading(false);
        setOnlineOfflineLoader(false);

        setIsUserOnline(!!success?.data?.is_online);
        AsyncStorage.setItem('driverData', JSON.stringify(success.data));
        GET_PROFILE();
        // ToastMsg(success?.msg || success?.message || 'success');
      },
      error => {
        setLoading(false);
        setOnlineOfflineLoader(false);
      },
      fail => {
        setLoading(false);
        setOnlineOfflineLoader(false);
      },
    );
  };

  const Reject_ride = async ID => {
    const online = await isNetworkAvailable();
    if (!online) {
      ToastMsg(localization.rideSummary.NoInternet);
      return;
    }

    setRejectRideLoading(true);
    GET_WITH_TOKEN(
      `${REJECT_RIDE}/${ID}`,
      success => {
        setRejectRideLoading(false);
        if (success?.status == 'success') {
          console.log('res from success ride', success);
          setShowBooking(false);
          resetRideUI();
        }
      },
      error => {
        setRejectRideLoading(false);
        console.log('err from success ride', error);
      },
      fail => {
        setRejectRideLoading(false);
        console.log('fail from success ride', fail);
      },
    );
  };

  const Accept_ride = async ID => {
    const online = await isNetworkAvailable();
    if (!online) {
      ToastMsg(localization.rideSummary.NoInternet);
      return;
    }

    setAcceptRideLoading(true);

    try {
      const currentRide = await fetchCurrentRideData();
      if (
        currentRide?.id &&
        String(currentRide.id) !== String(ID) &&
        isActiveRideStatus(currentRide.status_id)
      ) {
        setAcceptRideLoading(false);
        applyRideState({
          booking: currentRide,
          hasAccepted,
          setBookingData,
          setHasAccepted,
          setShowBooking,
          setIsAccept,
          setIsReached,
          setIsOtp,
          setIsNear,
          setIsStart,
          setIsOnline: setOnlineIfApproved,
          setIsArrivedDestination,
          setWaypoints,
          setAddressData,
          resetTimer,
          startTimer,
          stopTimer,
        });
        return;
      }
    } catch {
      setAcceptRideLoading(false);
      return;
    }

    GET_WITH_TOKEN(
      `${ACCEPT_RIDE}/${ID}`,
      success => {
        setAcceptRideLoading(false);
        if (success?.status === 'success') {
          setHasAccepted(true);
          setIsOnline(false);
          Get_Current_location();
        }
      },
      () => {
        setAcceptRideLoading(false);
      },
      () => {
        setAcceptRideLoading(false);
      },
    );
  };

  const Change_Status = ID => {
    serAriveLoader(true);
    if (!bookingData?.status_id) {
      serAriveLoader(false);
      return;
    }

    NetInfo.fetch().then(state => {
      if (!state.isConnected) {
        serAriveLoader(false);
        ToastMsg(localization.rideSummary.NoInternet);
        return;
      }

      let url = `${CHANGE_STATUS}/${ID}`;

      if (bookingData.status_id == 'Customer in the Car') {
        completedRideRef.current = {
          booking_id: bookingData.id,
          user_id: bookingData?.get_user_name?.id,
          userName: bookingData?.get_user_name?.first_name,
          waiting_time: seconds,
        };

        url = `${CHANGE_STATUS}/${ID}/?ride_completed_time=${moment().format(
          'YYYY-MM-DD HH:mm:ss',
        )}`;
        console.log('url change status', url);
      }

      GET_WITH_TOKEN(
        url,
        success => {
          serAriveLoader(false);

          if (success?.status !== 'success') return;
          console.log('res from success on complite ride', success);

          const nextStatus = success?.data?.status_id;
          console.log('nextStatus', nextStatus);

          if (Number(nextStatus) === 8 && completedRideRef.current) {
            const ratingData = completedRideRef.current;

            navigation.navigate('RatingNow', {
              booking_id: ratingData.booking_id,
              id: ratingData.user_id,
              userName: ratingData.userName,
            });

            setTimeout(() => {
              resetRideUI();
            }, 300);

            return;
          }

          Get_Current_location();
        },
        error => {
          serAriveLoader(false);
        },
        fail => {
          serAriveLoader(false);
        },
      );
    });
  };

  const Change_Status_Otp = async ({ ID, otp }) => {
    const online = await isNetworkAvailable();
    if (!online) {
      ToastMsg(localization.rideSummary.NoInternet);
      return;
    }

    GET_WITH_TOKEN(
      `${CHANGE_STATUS}/${ID}/${otp}/?waiting_time=${formattedTime}`,
      success => {
        // console.log(success, 'success===========CHANGE_STATUS==========>');
        if (success?.status === 'success') {
          let [latitudeDes, longitudeDes] =
            success?.data?.destination_latlng?.split(',') || [];
          setAddressData(prevState => ({
            ...prevState,
            latitudeDes,
            longitudeDes,
          }));
          setModalVisible(false);
          // 🔥 OTP verified → move to "Customer in the Car"
          Get_Current_location();
          resetTimer();
          stopTimer();
        }

        if (success?.status === 'error') {
          setError({ otps: success?.msg });
          // console.log(success?.msg, 'oooooooooo');
        }
      },
      error => {
        // console.log(error, 'error=====================>');
        // ToastMsg(error?.msg || error?.message);
      },
      fail => {
        // console.log(fail, 'fail=====================>');
        // ToastMsg(fail?.msg || fail?.message || 'network error');
      },
    );
  };

  useEffect(() => {
    let interval;
    if (
      isArrivedDestination &&
      bookingData?.ride_date &&
      bookingData?.ride_time
    ) {
      const tick = () => {
        const text = getRideDurationText(
          bookingData.ride_date,
          bookingData.ride_time,
          moment().format('YYYY-MM-DD HH:mm:ss'),
        );
        if (text && text !== 'Invalid time range') {
          setRideDurationText(text);
        }
      };
      tick();
      interval = setInterval(tick, 1000);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [
    isArrivedDestination,
    bookingData?.ride_date,
    bookingData?.ride_time,
    bookingData?.ride_completed_time,
  ]);

  const RenderAcceptCard = () => (
    <BottomSheetScrollView
      scrollEnabled={false}
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled={true}>
      <View style={styles.bookingSheetScrollRoot}>
        <View style={styles.bookingSheetInner}>
          <View style={styles.contentContainer}>
            <LocationCard
              addressData={addressData}
              caculateData={caculateData}
              bookingData={bookingData}
              rating={bookingData?.get_user_name?.avg_rating}
              reviews={bookingData?.get_user_name?.total_reviews}
              name={bookingData?.get_user_name?.first_name}
              loading={ariveLoader}
              pickup={bookingData?.source_name}
              destination={bookingData?.destination_name}
              onCallPress={() =>
                handleCallPress(`${bookingData?.get_user_name?.phone_no}`)
              }
              onChatPress={
                () => {
                  setIsChat(true), setVisible(false);
                }
                // receiveNewMessage()
              }
              // onMorePress={() => console.log('More options pressed')}
              onPickupPress={() => Change_Status(bookingData?.id)}
              onReject={() => Reject_ride(bookingData?.id)}
            />
          </View>
        </View>
      </View>
    </BottomSheetScrollView>
  );
  const RenderReachedCard = useCallback(() => {
    const showOtpBlock =
      bookingData?.status_id === 'On My Way' ||
      bookingData?.status_id === 'On The Spot' ||
      bookingData?.status_id === 'Customer in the Car';
    // console.log(
    //   'DEBUG>>>>>>> ~ Home.js:1061 ~ Home ~ showOtpBlock:',
    //   showOtpBlock,
    // );
    const userLanguage = bookingData?.get_user_name?.language_preference;

    const handleChatPress = useCallback(() => {
      setIsChat(true);
    }, []);

    const handleCallPress = useCallback(() => {
      // console.log(bookingData?.get_user_name?.phone_no);
      return Linking.openURL(
        `tel:${bookingData?.get_user_name?.phone_no}`,
      ).catch(err => console.log('Error', 'Unable to make a call'));
    }, [bookingData]);

    const handleMorePress = useCallback(() => {
      setMore(prevMore => !prevMore);
    }, []);

    const handleButtonPress = () => {
      const status = bookingData?.status_id;

      switch (status) {
        case 'On My Way':
          // I've Arrived
          Change_Status(bookingData.id);
          break;

        case 'On The Spot':
          // Start Ride → show OTP
          setModalVisible(true);
          break;

        default:
          break;
      }
    };

    const getPrimaryButtonLabel = () => {
      // console.log(
      //   'DEBUG>>>>>>> ~ Home.js:1191 ~ getPrimaryButtonLabel ~ bookingData?.status_id:',
      //   bookingData?.status_id,
      // );
      switch (bookingData?.status_id) {
        case 'On My Way':
          return localization.driverFlow.iveArrived;

        case 'On The Spot':
          return localization.driverFlow.startRide;

        default:
          return '';
      }
    };

    // This memoization prevents unnecessary recalculations of the UI
    const rideInfoCard = useMemo(() => {
      const startLabel = formatSimpleTime(bookingData?.ride_time);
      const secFromMap = caculateData?.durationSec;
      const secFromBooking =
        bookingData?.distance_to_destination?.duration != null
          ? Number(bookingData.distance_to_destination.duration)
          : null;
      const routeSec =
        secFromMap != null && secFromMap > 0
          ? secFromMap
          : secFromBooking != null && secFromBooking > 0
            ? secFromBooking
            : null;
      let endLabel = '\u2026';
      if (routeSec != null) {
        const eta = estimationTime(formatDuration(routeSec));
        if (eta && eta !== '--') {
          endLabel = eta;
        }
      }
      return isArrivedDestination ? (
        <RideInfoCard
          amount={bookingData?.amount}
          startTime={startLabel}
          endRideTime={endLabel}
          duration={rideDurationText}
          distance={formatDistance(bookingData?.distance || 0)}
          onSwipeComplete={() => Change_Status(bookingData?.id)}
        />
      ) : (
        <>
          <ProfileCard
            name={bookingData?.get_user_name?.first_name}
            image={bookingData?.get_user_name?.image}
            rating={bookingData?.get_user_name?.avg_rating}
            reviews={bookingData?.get_user_name?.total_reviews}
            price={`ZAR ${bookingData?.amount}`}
            distance={caculateData?.distance}
            bookingData={bookingData}
          />
          {showOtpBlock && bookingData?.status_id != 'Customer in the Car' && (
            <View>
              <ContactButtons
                onChatPress={handleChatPress}
                onCallPress={handleCallPress}
                onMorePress={handleMorePress}
              />
              <AnimatedCancelButton
                visible={More}
                onPress={() => Reject_ride(bookingData?.id)}
                label={localization?.driverFlow?.cancelRide}
              />
              <Button
                loading={ariveLoader}
                title={getPrimaryButtonLabel()}
                onPress={handleButtonPress}
                textColor={Colors.white}
                style_button={styles.startButton}
              />
            </View>
          )}

          {!showOtpBlock && userLanguage && (
            <TouchableOpacity
              onPress={() => setIsArrived(true)}
              style={styles.languageButton}>
              <Typography size={14}>
                {localization.driverFlow.languages} : {userLanguage}
              </Typography>
            </TouchableOpacity>
          )}
        </>
      );
    }, [
      isArrivedDestination,
      bookingData,
      isStart,
      showOtpBlock,
      More,
      userLanguage,
      caculateData?.distance,
      caculateData?.durationSec,
      bookingData?.distance_to_destination?.duration,
      rideDurationText,
      localization,
      handleChatPress,
      handleCallPress,
      handleMorePress,
      handleButtonPress,
      bookingData?.status_id,
      ariveLoader,
    ]);

    return (
      <BottomSheetScrollView
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}>
        <View style={styles.bookingSheetScrollRoot}>
          <View style={styles.bookingSheetInner}>
            <View style={styles.contentContainer}>
              <View style={styles.isReachedView}>{rideInfoCard}</View>
            </View>
          </View>
        </View>
      </BottomSheetScrollView>
    );
  }, [
    isOtp,
    isArrivedDestination,
    isStart,
    More,
    bookingData,
    caculateData,
    localization,
    rideDurationText,
    ariveLoader,
  ]);

  const RenderRequestCard = () => (
    <BottomSheetScrollView
      scrollEnabled={false}
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled={true}>
      <RideRequestCard
        addressData={addressData}
        bookingData={bookingData}
        acceptLoading={acceptRideLoading}
        rejectLoading={rejectRideLoading}
        rideCharge={`ZAR ${bookingData?.amount}`}
        driverName={`${bookingData?.get_user_name?.first_name}`}
        rating={bookingData?.get_user_name?.avg_rating}
        reviews={bookingData?.get_user_name?.total_reviews}
        pickupTime={`${(
          bookingData?.distance_to_driver?.distance / 1000
        ).toFixed(1)} Km ${localization.driverFlow.away} | ${formatDuration(
          bookingData?.distance_to_driver?.duration,
        )}`}
        dropoffTime={`${(
          (bookingData?.distance_to_driver?.distance +
            bookingData?.distance_to_destination?.distance) /
          1000
        ).toFixed(1)} Km ${localization.driverFlow.away} | ${formatDuration(
          bookingData?.distance_to_driver?.duration +
          bookingData?.distance_to_destination?.duration,
        )}`}
        pickupLocation={bookingData?.source_name}
        dropoffLocation={bookingData?.destination_name}
        onAccept={() => Accept_ride(bookingData?.id)}
        onReject={() => Reject_ride(bookingData?.id)}
      />
    </BottomSheetScrollView>
  );

  const renderBottomSheetContent = () => {
    if (!showBooking) return null;

    if (isEmergency)
      return (
        <BottomSheetScrollView style={{ flex: 0.5, backgroundColor: '#fff' }}>
          <View
            style={{
              paddingHorizontal: 15,
              backgroundColor: '#fff',
              flex: 0.5,
            }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 1,
                paddingVertical: 10,
              }}>
              <Typography
                size={18}
                fontFamily={Fonts.Inter_SemiBold}
                color="#CF1F25">
                {localization.driverFlow.emergencyAssistance}
              </Typography>

              <Press
                onPress={() => {
                  setIsEmergency(false);
                }}>
                <Typography
                  style={{ textDecorationLine: 'underline' }}
                  size={18}
                  fontFamily={Fonts.Inter_SemiBold}
                  color="#000000">
                  {localization.multiDropDown.btn}
                </Typography>
              </Press>
            </View>

            <View style={{ height: 1, backgroundColor: '#ECECEC' }} />

            <View style={{ alignItems: 'center' }}>
              <Image
                key={Images.Emergency}
                source={Images.Emergency}
                style={{ width: 100, height: 90, marginVertical: 25 }}
              />
              <Typography
                textAlign="center"
                size={16}
                fontFamily={Fonts.Inter_Regular}
                color="#383838">
                {localization?.ManageProfile?.shareLocationHelp}
              </Typography>
            </View>

            <View
              style={{
                borderWidth: 1,
                borderColor: '#E7E8EA',
                borderRadius: 7,
                padding: 10,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingRight: 1,
                marginVertical: 20,
                height: 70,
                paddingHorizontal: 10,
                paddingRight: 15,
                marginBottom: 30,
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                <Press onPress={() => handleCallPress(isEmergencyNumber)}>
                  <Image
                    source={Images.share}
                    style={{
                      width: 25,
                      height: 25,
                      marginVertical: 25,
                      marginRight: 10,
                    }}
                  />
                </Press>
                <Typography
                  size={16}
                  color="#000"
                  fontFamily={Fonts.Inter_SemiBold}>
                  {localization.ManageProfile.Emergency}
                </Typography>
              </View>

              <Press onPress={() => handleCallPress(isEmergencyNumber)}>
                <Image
                  source={Images.contact}
                  style={{
                    width: 45,
                    height: 45,
                    marginVertical: 25,
                  }}
                />
              </Press>
            </View>
            <View style={{ height: 120 }} />
          </View>
        </BottomSheetScrollView>
      );

    if (isChat)
      return (
        <Chat
          bookingData={bookingData}
          socket={socketRef.current}
          title={localization.ManageProfile.chat}
          actionText={localization.multiDropDown.btn}
          isKeyboard={isKeyboard}
          onCloseChat={() => {
            Keyboard.dismiss();
            setIsChat(false);

            requestAnimationFrame(() => {
              setTimeout(() => {
                bottomSheetRef.current?.snapToIndex(0);
              }, 120);
            });
          }}
        />
      );

    // 🔒 STRICT ORDER — no fallback
    if (!hasAccepted && isAccept) {
      return <RenderRequestCard />; // Accept / Reject
    }

    if (hasAccepted && !isReached) {
      return <RenderAcceptCard />; // Go to pickup
    }

    if (isReached) {
      return <RenderReachedCard />; // Active ride
    }

    return null;
  };

  return (
    <View style={styles.container}>
      <Modal
        visible={showExpiryModal}
        transparent
        animationType="fade"
        statusBarTranslucent>
        <View style={expiryStyles.overlay}>
          <View style={expiryStyles.modal}>
            <Image source={Images.Emergency} style={expiryStyles.icon} />

            <Typography
              size={20}
              fontFamily={Fonts.Inter_Bold}
              color={Colors.black}
              textAlign="center">
              Documents Expiring Soon
            </Typography>

            <View style={expiryStyles.list}>
              {expiryMessages.map((item, index) => (
                <Typography
                  key={index}
                  size={14}
                  color={item.status === 'expired' ? '#D32F2F' : '#555'}
                  style={{ marginTop: 6 }}>
                  • {item.label} expires in {item.daysLeft} day(s)
                </Typography>
              ))}
            </View>

            <Button
              title="Update Now"
              onPress={() => {
                setShowExpiryModal(false);
                navigation.navigate('MyDocument');
              }}
              style_button={expiryStyles.updateBtn}
              textColor={Colors.white}
            />
          </View>
        </View>
      </Modal>

      <StatusBar
        translucent
        backgroundColor={!modalVisible ? 'transparent' : '#ffffff'}
        barStyle={modalVisible ? 'light-content' : 'dark-content'}
      />

      {/* <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: 25,
          zIndex: 999,
        }}>
        <TouchableOpacity
          onPress={() => {
            // Alert.alert('true')
            navigation?.openDrawer();
            AsyncStorage.setItem('isDrawer', 'true');
          }}>
          <Image
            source={Images.homeMenu}
            style={{
              height: 80,
              width: 80,
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 999,
            }}
          />
        </TouchableOpacity>

        <Press onPress={() => {}}>
          <Image
            source={Images.SearchIcon}
            style={{
              height: 80,
              width: 80,
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 999,
            }}
          />
        </Press>
      </View> */}

      <View
        pointerEvents="box-none"
        style={[
          styles.container1,
          { justifyContent: isReached ? 'center' : 'space-between' },
        ]}>
        {!isKeyboard && !isReached && (
          <TouchableOpacity
            onPress={() => {
              navigation?.openDrawer();
              AsyncStorage.setItem('isDrawer', 'true');
            }}>
            <Image
              source={Images.homeMenu}
              style={{
                height: 80,
                width: 80,
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 999,
              }}
            />
          </TouchableOpacity>
        )}

        {!isKeyboard && showBooking && (
          <>
            {!isReached ? (
              <Press
                style={{
                  backgroundColor: Colors.black,
                  paddingHorizontal: 25,
                  paddingVertical: 10,
                  borderRadius: 50,
                  height: FULL_HEIGHT * 0.062,
                  minWidth: FULL_WIDTH * 0.3,
                }}
              // onPress={() => navigation.navigate('OnlineRequest')}
              >
                <Typography
                  size={26}
                  color={Colors.selectedBorderColor}
                  fontFamily={Fonts.Inter_SemiBold}>
                  ZAR{' '}
                  <Typography
                    size={26}
                    color={'#ffffff'}
                    fontFamily={Fonts.Inter_SemiBold}>
                    {/* {bookingData?.amount} */}
                    {Number(
                      bookingData?.get_driver?.today_collection || 0,
                    ).toFixed(0)}
                  </Typography>
                </Typography>
              </Press>
            ) : (
              <View
                style={{
                  backgroundColor: Colors.black,
                  paddingHorizontal: 25,
                  paddingVertical: 10,
                  borderRadius: 16,
                  marginTop: 20,
                  width: FULL_WIDTH * 0.75,
                }}>
                {!isOtp ? (
                  <>
                    {/* {bookingData?.destination_short_name !== "undefined" && (
                      <Typography
                        fontFamily={Fonts.Inter_Bold}
                        size={16}
                        textAlign="center"
                        color={Colors.white}
                        numberOfLines={2}>
                        {bookingData?.destination_short_name}
                      </Typography>
                    )} */}
                    {
                      <Typography
                        numberOfLines={2}
                        fontFamily={Fonts.Inter_Regular}
                        size={14}
                        textAlign="center"
                        color={Colors.white}>
                        {bookingData?.destination_name?.replace(
                          bookingData?.destination_short_name + ', ',
                          '',
                        )}
                      </Typography>
                    }
                  </>
                ) : (
                  <>
                    {/* {bookingData?.source_short_name !== "undefined" && (
                      <Typography
                        fontFamily={Fonts.Inter_Bold}
                        size={16}
                        textAlign="center"
                        color={Colors.white}
                        numberOfLines={2}>
                        {bookingData?.source_short_name}
                      </Typography>
                    )} */}
                    <Typography
                      numberOfLines={2}
                      fontFamily={Fonts.Inter_Regular}
                      size={14}
                      textAlign="center"
                      color={Colors.white}>
                      {bookingData?.source_name?.replace(
                        bookingData?.source_short_name + ', ',
                        '',
                      )}
                    </Typography>
                  </>
                )}
              </View>
            )}
          </>
        )}

        {!isReached && (
          <Press onPress={() => { }}>
            <Image
              // source={Images.SearchIcon}
              style={{
                height: 80,
                width: 80,
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 999,
              }}
            />
          </Press>
        )}
      </View>

      {addressData?.latitude && addressData?.longitude && (
        <MapView
          mapType={'standard'}
          provider={Platform?.OS == 'ios' ? PROVIDER_GOOGLE : PROVIDER_GOOGLE}
          // customMapStyle={MapStyle}
          rotateEnabled={false}
          moveOnMarkerPress={true}
          spiralEnabled={true}
          showsCompass={false}
          ref={mapRef}
          // key={`${addressData?.latitude}-${addressData?.longitude}`}
          style={{ position: 'absolute', height: '100%', width: '100%' }}
          initialRegion={{
            latitude: +addressData?.latitude,
            longitude: +addressData?.longitude,
            latitudeDelta: 0.0052,
            longitudeDelta: 0.00121,
          }}
          zoomEnabled={true}>
          {/* {data?.high_demand_zones?.length > 0 && (
            <Heatmap
              points={data?.high_demand_zones}
              radius={50} // tighter clusters = more intensity
              opacity={1} // max visible
              gradient={{
                colors: [
                  '#F50001CC', // 80% opacity
                  // '#F50001DD', // 87%
                  // '#F50001EE', // 93%
                  '#F50001FF', // 100%
                ],
                startPoints: [0.1, 0.3, 0.5, 0.7],
                colorMapSize: 1024,
              }}
            />
          )}
          {data?.mid_demand_zones?.length > 0 && (
            <Heatmap
              points={data?.mid_demand_zones}
              radius={50}
              opacity={1} // overall layer opacity
              gradient={{
                colors: [
                  '#FFBF00B3', // 70%
                  '#FFBF00CC', // 80%
                  '#FFBF00E6', // 90%
                  '#FFBF00FF', // 100%
                ],
                startPoints: [0.1, 0.3, 0.5, 0.7],// smooth & progressive transition
                colorMapSize: 1024,
              }}
            />
          )} */}

          {showBooking ? null : (
            <>
              {data?.high_demand_zones?.length > 0 && (
                <Heatmap
                  points={data?.high_demand_zones}
                  radius={50} // tighter clusters = more intensity
                  opacity={1} // max visible
                  gradient={{
                    colors: [
                      '#F50001CC', // 80% opacity
                      '#F50001DD', // 87%
                      '#F50001EE', // 93%
                      '#F50001FF', // 100%
                    ],
                    startPoints: [0.1, 0.3, 0.5, 0.7],
                    colorMapSize: 1024, // smoother transitions, sharper color detail
                  }}
                />
              )}
              {data?.mid_demand_zones?.length > 0 && (
                <Heatmap
                  points={data?.mid_demand_zones}
                  radius={50}
                  opacity={1} // overall layer opacity
                  gradient={{
                    colors: [
                      '#FFBF00B3', // 70%
                      '#FFBF00CC', // 80%
                      '#FFBF00E6', // 90%
                      '#FFBF00FF', // 100%
                    ],
                    startPoints: [0.1, 0.3, 0.5, 1], // smooth & progressive transition
                    colorMapSize: 1024,
                  }}
                />
              )}
            </>
          )}

          {showBooking ? (
            <>
              {/* {(isAccept || isReached) && ( */}
              <>
                {addressData?.latitudeDes &&
                  addressData?.longitudeDes &&
                  addressData?.latitude &&
                  addressData?.longitude &&
                  bookingData?.get_vehicle_type?.vehicle_upper_image && (
                    <MapViewDirection
                      pickupImage={
                        bookingData?.get_vehicle_type?.vehicle_upper_image
                      }
                      mapRaf={(res, fitOptions) => {
                        if (!mapRef.current) {
                          return;
                        }
                        if (fitOptions?.edgePadding) {
                          mapRef.current.fitToCoordinates(res, {
                            ...fitOptions,
                            edgePadding: {
                              ...fitOptions.edgePadding,
                              top: (fitOptions.edgePadding.top ?? 0) + 80,
                            },
                          });
                        } else {
                          mapRef.current.fitToCoordinates(res, fitOptions);
                        }
                      }}
                      arrivedIn={formatDuration(
                        bookingData?.distance_to_driver?.duration,
                        localization,
                      )}
                      Reaching={bookingData?.distance_to_driver?.duration}
                      setIsNear={setIsNear}
                      onSetDest={(d, t, durationSec) => {
                        setCaculateData({
                          distance: d,
                          time: t,
                          durationSec: durationSec != null ? durationSec : null,
                        });
                      }}
                      isCar={true}
                      locationData={{
                        latitude: addressData?.latitude,
                        longitude: addressData?.longitude,
                        longitudeDes: addressData?.longitudeDes,
                        latitudeDes: addressData?.latitudeDes,
                        heading: addressData?.heading,
                        waypoints: waypoints,
                        IsTrack: addressData?.IsTrack ? true : false,
                      }}
                    />
                    // null
                  )}
              </>
              {/* )} */}
            </>
          ) : (
            <>
              <Marker
                // tracksViewChanges={false}
                coordinate={addressData}
                anchor={{ x: 0.5, y: 0.5 }}>
                <AnimatedMarkers coordinate={addressData} />
              </Marker>
            </>
          )}
        </MapView>
      )}

      <View
        pointerEvents="box-none"
        style={{
          ...StyleSheet.absoluteFillObject,
          zIndex: 2000,
          elevation: 2000,
        }}>
        <MessageCard
          onPress={() => setIsChat(true)}
          avatar={msg.avatar}
          sender={msg.sender}
          message={msg.message}
          visible={visible}
          setVisible={setVisible}
          top={Platform.OS === 'ios' ? 52 : 100}
        />
      </View>

      {
        !showBooking ? (
          <>
            <BottomSheets
              android_keyboardInputMode="adjustResize"
              keyboardBehavior="interactive"
              keyboardBlurBehavior="restore"
              enableDynamicSizing={true}
              isVisible={showApprovalSheet}
              bottomSheetCss={{
                borderTopLeftRadius: 15,
                borderTopRightRadius: 15,
                marginHorizontal: 15,
                borderRadius: 15,
                marginBottom: 20,
                paddingBottom: 20,
                bottom: isUnderReview
                  ? Platform.OS === 'ios'
                    ? 100
                    : 90
                  : 70,
              }}
              onClose={() => setheight('15%')}
              height={estimateHeight(
                singleData?.cancel_reason,
                isApplicationRejected,
              )}>
              {/* <View style={[styles.mainBottomView]}> */}
              <View style={{ marginTop: 20 }}>
                {isApplicationRejected && (
                  <Typography
                    size={17}
                    fontFamily={Fonts.Inter_Bold}
                    color={Colors.black}
                    textAlign={'center'}>
                    {localization.home.Application}
                  </Typography>
                )}
                {singleData?.is_document_request == 2 ? (
                  <Typography
                    style={{ marginTop: 10 }}
                    color="red"
                    size={18}
                    textAlign={'center'}
                    fontFamily={Fonts.Inter_Bold}>
                    {isApplicationRejected ? '' : localization.home.Document}{' '}
                    {localization.home.REJECTED}
                  </Typography>
                ) : (
                  <Typography
                    style={{ marginTop: 10 }}
                    size={18}
                    fontFamily={Fonts.Inter_Bold}
                    color={isUnderReview ? '#FFB600' : '#FF2C2C'}
                    textAlign={'center'}>
                    {isUnderReview
                      ? localization.home.UnderReview
                      : localization.home.REJECTED}
                  </Typography>
                )}
              </View>
              <View
                style={{
                  width: '100%',
                  height: 1.5,
                  backgroundColor: '#ECECEC',
                  marginTop: 20,
                }}
              />

              {/* </View> */}
              <ScrollView
                style={{ paddingHorizontal: 20, flex: 1 }}
                contentContainerStyle={{ paddingBottom: 90 }}
                showsVerticalScrollIndicator={true}>
                {isApplicationRejected && (
                  <>
                    <Typography
                      numberOfLines={4}
                      style={{ paddingVertical: 10 }}
                      size={20}
                      color="#3A3A3C">
                      {localization.home.Reason}
                    </Typography>
                    <Typography textAlign={'start'} color="#7B7A77" size={14}>
                      {singleData?.cancel_reason}
                    </Typography>
                  </>
                )}

                {isUnderReview && (
                  <>
                    {singleData?.is_document_request == 2 ? (
                      <View>
                        <Typography style={{ top: 5 }} size={20} color="#3A3A3C">
                          {localization.home.Reason}
                        </Typography>
                        <Typography
                          style={{ top: 5 }}
                          fontFamily={Fonts.Inter_Regular}
                          textAlign={'start'}
                          color="#7B7A77"
                          size={14}>
                          {singleData?.document_cancel_reason}
                        </Typography>
                      </View>
                    ) : (
                      <Typography
                        style={{
                          top: 10,
                          paddingBottom: Platform.OS === 'android' ? 10 : 0,
                        }}
                        fontFamily={Fonts.Inter_Regular}
                        textAlign={'start'}
                        color="#7B7A77"
                        size={14}>
                        {localization.home.LongText}
                      </Typography>
                    )}
                  </>
                )}
              </ScrollView>

              {isApplicationRejected && (
                <Button
                  loading={false}
                  title={localization.home.Resubmit}
                  onPress={() => {
                    navigation.navigate('PersonalInfo');
                  }}
                  style_button={{
                    backgroundColor: Colors?.Black,
                    marginHorizontal: 20,
                  }}
                />
              )}
            </BottomSheets>

            <BottomSheets
              isVisible={isOnline}
              // onClose={() => setBtmHeight('17%')}
              height={isUserOnline ? '18%' : '40%'}>
              <View style={styles.mainBottomView}>
                {isUserOnline && (
                  <Press
                    onPress={() => {
                      handleDriverStatus(false);
                    }}
                    style={{
                      height: 75,
                      width: 75,
                      borderRadius: 40,
                      backgroundColor: Colors?.selectGreen,
                      position: 'absolute',
                      justifyContent: 'center',
                      alignItems: 'center',
                      top: -90,
                      alignSelf: 'center',
                    }}>
                    <View
                      style={{
                        height: 65,
                        width: 65,
                        borderRadius: 35,
                        borderWidth: 1,
                        borderColor: Colors?.white,
                        justifyContent: 'center',
                      }}>
                      <Typography
                        color={Colors?.white}
                        textAlign={'center'}
                        size={22}
                        fontFamily={Fonts?.Inter_SemiBold}>
                        {localization.home.Go}
                      </Typography>
                    </View>
                  </Press>
                )}

                <View style={{ marginTop: 20, height: 20 }}>
                  {!isUserOnline ? (
                    <Typography
                      size={17}
                      fontFamily={Fonts.Inter_Bold}
                      color={Colors.selectGreen}
                      textAlign={'center'}>
                      {localization.home.OnLineHere}
                    </Typography>
                  ) : (
                    <Typography
                      size={17}
                      fontFamily={Fonts.Inter_Bold}
                      color={Colors.black}
                      textAlign={'center'}>
                      {localization.home.OnLine}
                    </Typography>
                  )}
                </View>
                {!isUserOnline && (
                  <Press
                    onPress={() => {
                      handleDriverStatus(true);
                    }}
                    style={{
                      borderWidth: 1,
                      borderColor: '#7B7A7733',
                      alignItems: 'center',
                      padding: 25,
                      marginHorizontal: 20,
                      borderRadius: 12,
                      marginTop: 12,
                    }}>
                    <Image
                      source={Images?.Offline}
                      style={{ height: 80, width: 80, resizeMode: 'contain' }}
                    />
                    <Typography
                      size={17}
                      fontFamily={Fonts.Inter_Bold}
                      style={{ marginTop: 15 }}
                      color={Colors.black}
                      textAlign={'center'}>
                      {localization.home.Offline}
                    </Typography>
                  </Press>
                )}
              </View>
            </BottomSheets>
          </>
        ) : (
          // {showBooking && (
          <BottomSheet
            handleComponent={() => (
              <>
                <TouchableOpacity
                  style={[styles.floatingButtonRight, { marginTop: -60 }]}
                  onPress={() => {
                    const destinationLat = addressData?.latitudeDes;
                    const destinationLng = addressData?.longitudeDes;

                    if (destinationLat && destinationLng) {
                      const url = `https://www.google.com/maps/dir/?api=1&destination=${destinationLat},${destinationLng}&travelmode=driving`;
                      Linking.openURL(url).catch(err =>
                        console.error('Failed to open Google Maps:', err),
                      );
                    } else {
                      console.warn('Destination coordinates not available');
                    }
                  }}>
                  <Image
                    key={Images.map_rediect}
                    source={Images.map_rediect}
                    style={[styles.buttonImage]}
                  />
                </TouchableOpacity>

                {!isOtp && (
                  <View>
                    {!isEmergency && (
                      <TouchableOpacity
                        style={styles.floatingButton}
                        onPress={() => {
                          setIsEmergency(true);
                        }}>
                        <Image
                          source={Images.Emergency2}
                          style={styles.buttonImage}
                        />
                      </TouchableOpacity>
                    )}

                    {/* <TouchableOpacity
                      style={styles.floatingButtonRight}
                      onPress={() => navigation.navigate('Message')}>
                      <Image
                        source={Images.message}
                        style={[styles.buttonImage, { tintColor: Colors.Black }]}
                      />
                    </TouchableOpacity> */}
                  </View>
                )}
                {!isStart &&
                  !isArrivedDestination &&
                  !isChat &&
                  !isEmergency &&
                  (() => {
                    const minutes = caculateData?.time
                      ? parseInt(caculateData.time)
                      : Math.ceil(
                        (bookingData?.distance_to_driver?.duration || 0) / 60,
                      );

                    return minutes > 1 ? (
                      <View style={styles.header}>
                        <Typography
                          textAlign="center"
                          size={16}
                          lineHeight={22}
                          color={Colors.white}>
                          {caculateData?.distance}{' '}
                          {localization.driverFlow.away} |{' '}
                          {caculateData?.time ||
                            formatDuration(
                              bookingData?.distance_to_driver?.duration,
                              localization,
                            )}
                        </Typography>
                      </View>
                    ) : null;
                  })()}

                {isStart && (
                  <View style={styles.header}>
                    <Typography
                      textAlign="center"
                      size={16}
                      lineHeight={22}
                      color={Colors.white}>
                      {localization?.driverFlow?.waitingRider} |{' '}
                      {/* <TimerComponent formatTime={formatTime} /> */}
                      {formatTime()}
                    </Typography>
                  </View>
                )}
              </>
            )}
            style={{
              borderTopRightRadius: 30,
              borderTopLeftRadius: 30,
              marginTop: Platform.OS == 'android' ? '18%' : '12%',
            }}
            snapPoints={snapPoints}
            enableDynamicSizing={!isChat}
            {...(!isChat
              ? { maxDynamicContentSize: maxBookingDynamicContentSize }
              : {})}
            ref={bottomSheetRef}
            index={0}
            bottomInset={
              personal_Data?.is_approved === 2
                ? 0
                : Platform.OS === 'ios'
                  ? 90
                  : 70
            }
            keyboardBehavior={
              isChat && Platform.OS === 'android' ? 'extend' : 'interactive'
            }
            keyboardBlurBehavior="restore"
            enablePanDownToClose={false}
            enableOverDrag={false}
            failOffsetX={[-0, 0]}
            activeOffsetY={[-999, 999]}
            animateOnMount={true}
            android_keyboardInputMode="adjustResize">
            {/* <BottomSheetScrollView
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled={true}> */}
            {renderBottomSheetContent()}
            {/* </BottomSheetScrollView> */}
          </BottomSheet>
        )
        // )
        // }
      }
      <Modal visible={modalVisible} transparent={false} animationType="slide">
        <OTP_for_ride
          setError={setError}
          error={error}
          userName={bookingData}
          setModalVisibless={() => {
            setModalVisible(false);
          }}
          Change_Status_Otp={Change_Status_Otp}
          setIsOtp={setIsOtp}
        />
      </Modal>
      {onlineOfflineLoader && (
        <View style={styles.overlayLoader}>
          <ActivityIndicator size="large" color={'black'} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 10,
    flex: 1,
  },
  filteHead: {
    borderColor: Colors.Black,
    borderWidth: 1.5,
    borderRadius: 50,
    width: '100%',
  },
  //
  input: {
    borderRadius: 50,
    borderWidth: 1,
  },
  listContainer: {
    backgroundColor: '#ffffff',
    paddingBottom: 80,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomColor: Colors.gray,
    borderBottomWidth: 0.5,
    borderRadius: 8,
    paddingVertical: 20,
  },
  icon: {
    width: 40,
    height: 40,
    marginRight: 12,
    zIndex: 999,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontFamily: Fonts.Inter_SemiBold,
    color: Colors.black,
  },
  description: {
    fontSize: 14,
    fontFamily: Fonts.Inter_Regular,
    color: Colors.gray,
    marginTop: 4,
  },
  badgeIcon: {
    width: 24,
    height: 24,
  },
  mainBottomView: {
    // paddingHorizontal: 20,
    flex: 1,
    // alignItems: 'center',
  },
  bottomsheet: {
    backgroundColor: Colors?.white,
    width: '100%',
    borderTopRightRadius: 32,
    borderTopLeftRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 80,
  },
  mapContainer: {
    flex: 1,
  },
  bottomSheetOpen: {
    backgroundColor: 'white',
    width: '100%',
    borderTopRightRadius: 32,
    borderTopLeftRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    bottom: 70,
    position: 'absolute',
  },
  mainBottomView: {
    flex: 1,
    marginBottom: Platform.OS === 'ios' ? '10%' : '15%',
  },

  /** No flex:1 — lets @gorhom/bottom-sheet dynamic sizing measure intrinsic content height. */
  bookingSheetScrollRoot: {
    width: '100%',
  },
  bookingSheetInner: {
    width: '100%',
    paddingTop: 20,
    zIndex: 999,
    paddingHorizontal: 20,
  },

  bottomContent: {
    flex: 1,
    // backgroundColor: Colors.black,
    paddingTop: 20,
    zIndex: 999,
    paddingHorizontal: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.borderColor,
    borderRadius: 10,
    // paddingHorizontal: 10,
    marginVertical: 16,
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 15,
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    borderLeftWidth: 1,
    borderColor: Colors.borderColor,
    paddingVertical: 15,
  },
  callButtonText: {
    color: Colors.Black,
    marginLeft: 5,
  },
  dotButton: {
    width: windowWidth / 7,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderLeftWidth: 1,
    borderColor: Colors.borderColor,
    // borderRadius: 5,
    backgroundColor: Colors.backViewColor,
  },
  buttonIcon: {
    width: 20,
    height: 20,
    marginRight: 5,
    tintColor: Colors.Black,
  },
  buttonText: {
    color: Colors.Black,
  },

  header: {
    backgroundColor: Colors.Black,
    height: 40,
    borderTopRightRadius: 15,
    borderTopLeftRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  reviewContainer: {
    flexDirection: 'row',
    padding: 1,
    alignSelf: 'center',
    alignItems: 'center',
  },
  starIcon: {
    height: 18,
    width: 18,
    marginHorizontal: 5,
  },
  wrapper: {
    flex: 1,
    width: '100%',
    // alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.Black,
  },
  box: {
    height: SIZE,
    width: SIZE,
    backgroundColor: Colors.selectedBorderColor,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    height: 16,
    width: 16,
    tintColor: Colors.white,
  },
  contentContainer: {
    backgroundColor: Colors.white,
    marginTop: -20,
    borderTopRightRadius: 15,
    borderTopLeftRadius: 15,
    paddingTop: 10,
    // paddingHorizontal: 20,
  },
  languageButton: {
    marginVertical: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 5,
    borderWidth: 1,
    backgroundColor: Colors.backViewColor,
    borderColor: Colors.borderColor,
    marginBottom: 25,
  },
  startButton: {
    backgroundColor: Colors?.Black,
    marginVertical: 5,
    marginBottom: Platform.OS == 'ios' ? 15 : FULL_HEIGHT * 0.05,
    marginTop: 15,
  },
  divider: {
    width: '100%',
    backgroundColor: '#ECECEC',
    height: 1,
    marginVertical: 10,
  },
  locationContainer: {
    borderRadius: 10,
    height: 115,
  },
  locationIcon: {
    height: 80,
    width: 80,
    resizeMode: 'contain',
    right: 20,
    top: 10,
  },
  locationTextContainer: {
    position: 'absolute',
    top: 0,
    left: 35,
    padding: 5,
  },
  locationTextBlock: {
    width: '100%',
    height: 50,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rejectButton: {
    borderWidth: 1,
    width: '45%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  acceptButton: {
    borderWidth: 1,
    width: '45%',
    backgroundColor: Colors.Black,
  },
  buttonImage: {
    height: 24,
    width: 24,
    resizeMode: 'contain',
  },
  floatingButton: {
    backgroundColor: Colors.white,
    height: 46,
    width: 46,
    zIndex: 999,
    position: 'absolute',
    marginTop: -60,
    borderRadius: 50,
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingButtonRight: {
    backgroundColor: Colors.white,
    height: 46,
    width: 46,
    zIndex: 1,
    position: 'absolute',
    marginTop: -60,
    borderRadius: 50,
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
    right: 20,
  },
  carIcon: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  destinationMarker: {
    backgroundColor: 'black',
    padding: 6,
    borderRadius: 5,
  },
  destinationIcon: {
    width: 20,
    height: 20,
    tintColor: 'white',
  },

  isReachedView: {
    marginBottom: 20,
    margin: 10,
    borderRadius: 10,
    elevation: 2,
    backgroundColor: Colors.white,
    borderColor: '#ccc',
    padding: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    marginHorizontal: 2,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 30,
  },
  container1: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 25,
    zIndex: 999,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderWidth: 1,
    borderColor: '#eee',
    alignItems: 'center',
    borderRadius: 8,
    justifyContent: 'flex-end',
  },
  textInput: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: '#000',
    padding: 12,
    borderRadius: 12,
  },
  card: {
    position: 'absolute', // Absolute position for floating
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 2,
    margin: 10,

    zIndex: 999,
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    marginRight: 12,
  },
  messageContent: {
    flex: 1,
  },
  senderName: {
    color: '#555',
    fontSize: 12,
    marginBottom: 2,
  },
  messageText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '500',
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginTop: -10,
    marginRight: 0,
    borderWidth: 1,
    borderColor: '#ECECEC',
    borderRadius: 10,
    backgroundColor: Colors.white,
    zIndex: 999,
    elevation: 1, // Android shadow
    shadowColor: '#485C44', // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },

  itemImage: {
    height: 14.9,
    width: 14.9,
    marginRight: 8.5,
  },
  inputWrapper: {
    width: '100%',
    justifyContent: 'center',
    // alignItems: 'center',
    marginLeft: 20,
  },
});

const expiryStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  icon: {
    width: 60,
    height: 60,
    marginBottom: 12,
    resizeMode: 'contain',
  },
  list: {
    width: '100%',
    marginVertical: 12,
  },
  updateBtn: {
    backgroundColor: Colors.Black,
    marginTop: 10,
    width: '100%',
  },
  overlayLoader: {
    position: 'absolute',
    top: 0,
    bottom: 150,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
});

export default Home;
