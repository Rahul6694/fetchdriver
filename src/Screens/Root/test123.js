import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  View,
  StyleSheet,
  Platform,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
  BackHandler,
  StatusBar,
  ScrollView,
  Share,
  Linking,
} from 'react-native';
import MapView, {
  Heatmap,
  Marker,
  PROVIDER_DEFAULT,
  PROVIDER_GOOGLE,
} from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import {Images} from '../../Constants/Images';
import {Colors} from '../../Constants/Colors';
import Press from '../../Component/UI/Press';
import Typography from '../../Component/UI/Typography';
import {Fonts} from '../../Constants/Fonts';
// import BottomSheet from '../../Component/UI/BottomSheet';
import AsyncStorage from '@react-native-async-storage/async-storage';
import localization from '../../Constants/localization';
import {
  requestPermissions,
  requestPermissionsHere,
} from '../../Component/Premissions';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import {
  GET_DRIVER_PROFILE,
  UPDATE_DRIVER_STATUS,
} from '../../Backend/ApiRoutes';
import {
  GEOCODE_URL,
  GET_WITH_TOKEN,
  GetNew,
  Socket_URL,
  myApiKey,
} from '../../Backend/Backend';
// import Button from '../../Component/Button';
import {personalData, updateAuthData, userDetails} from '../../Redux/action';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import BottomSheet, {BottomSheetScrollView} from '@gorhom/bottom-sheet';
import Geolocation from 'react-native-geolocation-service';
import {ToastMsg} from '../../Component/ToastMsg';
import {io} from 'socket.io-client';
import { fetchCurrentLocation } from '../../Backend/Utility';
import Input from '../../Component/Input';




const Home = ({}) => {
  const snapPoints = useMemo(() => ['20%'], []);
  // bottomSheetRef.current?.snapToIndex(1);
  const bottomSheetRef = useRef(null);
  const [bottomSheetHight, setBottomSheetHight] = useState('45%');
  const [data, setData] = useState({});

  const mapRef = useRef();
  const navigation = useNavigation();
  const detail = useSelector(store => store.updateAuthData);
  const dispatch = useDispatch();
  const personal_Data = useSelector(store => store.personalData);
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [status, setStatus] = useState(false);
  const [loading, setLoading] = useState(false);
  const [singleData, setSinglsingleData] = useState('');
  const [isUserOnline, setIsUserOnline] = useState();
  const isFocus = useIsFocused();
  const [CurrentAdd, setCurrentAdd] = useState(null);
  const [socket, setSocket] = useState(null);

  const [addressData, setAddressData] = useState({
    latitude: 26.9124,
    longitude: 75.7873,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0521,
  });
  const [DriverData, setDriverData] = useState();
  const SOCKET_SERVER_URL = Socket_URL;



  const sendCurrentLocation = async () => {
    const location = await fetchCurrentLocation();

    var obj = {
      driver_id: personal_Data?.driver_id,
      lat: location?.latitude,
      lng: location?.longitude,
    };
    if (socket) {
      console.warn('Fffff', obj);
      socket.emit('driver_lat_lng', obj);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      sendCurrentLocation();
    }, 20000);

    // return () => clearInterval(interval);
  }, [socket,CurrentAdd]);


  useEffect(() => {
    fetchLocation();
    getDriverData();
  }, [isFocus]);

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

                console.log('Location:', position);


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

                    console.log(Adreess,"Adreess==================>")

                    setCurrentAdd(Adreess);
                    setTimeout(() => {
                      setAddressData(
                        {
                          latitude: +currentLatitude || '37.3317876',
                          longitude: +currentLongitude || '-122.0054812',
                          latitudeDelta: 0.0922,
                          longitudeDelta: 0.0521,
                        },
                        1000,
                      );
                    });
                    // return {latitude : currentLatitude,longitude:currentLongitude}
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
              {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
            );
          }
        });
      }
    } catch (error) {
      console.error('Error during location fetch:', error);
    }
  };

  const getDriverData = async () => {
    try {
      const value = await AsyncStorage.getItem('driverData');

      if (value !== null) {
        const parsedValue = JSON.parse(value);
        console.log('🚀 ~ getDriverData ~ parsedValue:', parsedValue);

        if (parsedValue.is_online === 'available') {
          setIsUserOnline(true);
        } else {
          setIsUserOnline(false);
        }
      }
    } catch (error) {
      console.log('❌ Error retrieving driver data:', error);
    }
  };

  useEffect(() => {
    if (isFocus) {
      GET_PROFILE();
      false;
    }
  }, [isFocus]);

  useEffect(() => {
    const backAction = () => {
      Alert.alert(localization.home.Hold, localization.home.exit, [
        {
          text: localization.home.Cancel,
          onPress: () => null,
          style: 'cancel',
        },
        {text: localization.home.YES, onPress: () => BackHandler.exitApp()},
      ]);
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, []);

  const GET_PROFILE = () => {
    setLoading(true);
    GET_WITH_TOKEN(
      GET_DRIVER_PROFILE,
      response => {
        setSinglsingleData(response?.data);
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
            billType: response?.data?.driver_details?.billing_type,
            bankAccountHolder:
              response?.data?.driver_details?.account_holder_name,
            bankAccountNumber: response?.data?.driver_details?.account_number,
            branchCode: response?.data?.driver_details?.branch_code,
            carModel: response?.data?.driver_details?.car_model,
            carYear: response?.data?.driver_details?.car_year,
            carColor: response?.data?.driver_details?.car_color,
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
            driver_id:response?.data?.id
          };
          dispatch(personalData(combinedData));
        } else {
          const combinedData = {
            ...personal_Data,
            firstName: response?.data?.first_name,
            lastname: response?.data?.last_name,
            dob: response?.data?.dob,
            trnNo: response?.data?.driver_details?.trn,
            trnDoc: response?.data?.driver_details?.trn_document,
            photo: response?.data?.driver_details?.driver_photo,
            speaking_languages: response?.data?.speaking_languages,
            billType: response?.data?.driver_details?.billing_type,
            bankAccountHolder:
              response?.data?.driver_details?.account_holder_name,
            bankAccountNumber: response?.data?.driver_details?.account_number,
            branchCode: response?.data?.driver_details?.branch_code,
            carModel: response?.data?.driver_details?.car_model,
            carYear: response?.data?.driver_details?.car_year,
            carColor: response?.data?.driver_details?.car_color,
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
          };
          dispatch(personalData(combinedData));
        }

        if (
          response?.data?.is_approved == 0 ||
          response?.data?.is_approved == 2
        ) {
          setStatus(true);
          setIsOnline(false);
        } else {
          setStatus(false);
          setIsOnline(true);
        }
        setLoading(false);
      },
      s => {
        setLoading(false);
      },
      s => {
        setLoading(false);
      },
    );
  };


  useEffect(() => {
    requestPermissions();
  }, []);

  useEffect(() => {
    if (isFocus) {
      // Create socket connection
      const newSocket = io(SOCKET_SERVER_URL, {
        transports: ['websocket'],
        timeout: 20000,
      });

      newSocket.on('connect', () => {
        console.log('Connected to socket server');
        setSocket(newSocket);
      });
      newSocket.on('notifyBooking', (data)=>{
        console.log('notifyBooking data===========>',data);
        if(data?.room==="notifyBooking"){
          
        }
      });
      newSocket.on('disconnect', () => {
        console.log('Disconnected from socket server');
      });

      newSocket.on('connect_error', error => {
        console.error('Connection error:', error);
      });
    }
  }, [isFocus]);

  const renderItem = ({item, index}) => {
    const isLastItem = index === data.length - 1;
    return (
      <View
        style={[
          styles.listItem,
          isLastItem && {borderBottomWidth: 1, borderBottomWidth: 0},
        ]}>
        <Image resizeMode="center" source={item.icon} style={styles.icon} />

        <View style={styles.textContainer}>
          <Typography style={styles.title}>{item.title}</Typography>
          <Typography style={styles.description}>{item.description}</Typography>
        </View>
        {item.badgeIcon && (
          <Image
            resizeMode="center"
            source={item.badgeIcon}
            style={styles.badgeIcon}
          />
        )}
      </View>
    );
  };

  // const heatmapData = [
  //   {latitude: 26.9124, longitude: 75.7873, weight: 10}, // Jaipur Center
  //   {latitude: 26.915, longitude: 75.7895, weight: 5}, // Nearby point
  //   {latitude: 26.92, longitude: 75.8, weight: 8}, // North Jaipur
  //   {latitude: 26.9, longitude: 75.78, weight: 15}, // South Jaipur
  //   {latitude: 26.93, longitude: 75.81, weight: 12}, // East Jaipur
  //   {latitude: 26.91, longitude: 75.77, weight: 7}, // West Jaipur
  //   {latitude: 26.925, longitude: 75.795, weight: 6}, // Central
  //   {latitude: 26.905, longitude: 75.765, weight: 14}, // Outskirts
  // ];

  const handleDriverStatus = () => {
    setLoading(true);

    GET_WITH_TOKEN(
      `${UPDATE_DRIVER_STATUS}`,
      success => {
        setDriverData(success.data);
        setLoading(false);
        AsyncStorage.setItem('driverData', JSON.stringify(success.data));
        getDriverData();
        ToastMsg(success?.msg || success?.message || "success");
      },
      error => {
        // console.log("❌ API Error:", error);
        setLoading(false);
      },
      fail => {
        // console.log("❌ API Failed:", fail);
        setLoading(false);
      },
    );
  };

  return (
    <GestureHandlerRootView>
      <View style={styles.container}>
        <StatusBar
          translucent
          backgroundColor="transparent"
          barStyle="dark-content"
        />

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: 25,
            zIndex: 999,
          }}>
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
          <Press
            style={{
              backgroundColor: Colors.black,
              paddingHorizontal: 25,
              paddingVertical: 10,
              borderRadius: 50,
            }}
            onPress={() => navigation.navigate('OnlineRequest')}>
            <Typography
              size={26}
              color={Colors.selectedBorderColor}
              fontFamily={Fonts.Inter_SemiBold}>
              R{' '}
              <Typography
                size={26}
                color={'#ffffff'}
                fontFamily={Fonts.Inter_SemiBold}>
                580
              </Typography>
            </Typography>
          </Press>

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
        </View>

        {/* <MapView
        moveOnMarkerPress={true}
        spiralEnabled={true}
        ref={mapRef}
        mapType={Platform.OS === 'android' ? 'standard' : 'standard'}
        style={{position: 'absolute', height: '100%', width: '100%'}}
        region={{
          latitude: -30.5595,
          longitude: 22.9375,
          latitudeDelta: 5.0,
          longitudeDelta: 5.0,
        }}
      /> */}

        <MapView
          moveOnMarkerPress={true}
          spiralEnabled={true}
          key={`${addressData?.latitude}-${addressData?.longitude}`}
          mapType={Platform.OS === 'android' ? 'standard' : 'standard'}
          onRegionChangeComplete={region => console.log(region)}
          style={{position: 'absolute', height: '100%', width: '100%'}}
          initialRegion={{
            latitude: +addressData?.latitude || '26.9124',
            longitude: +addressData?.longitude || '75.7873',
            latitudeDelta: 0.0122,
            longitudeDelta: 0.00521,
          }}
          // provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}

          zoomEnabled={true}>
          {/* Route Line */}
          {/* <MapViewDirections
            origin={coordinates[0]}
            destination={coordinates[1]}
            apikey={myApiKey}
            strokeWidth={4}
            strokeColor="black"
          /> */}

          {/* <Marker coordinate={coordinates[0]}>
            <Image source={Images.car} style={styles.carIcon} />
          </Marker>

          <Marker coordinate={coordinates[1]}>
            <View style={styles.destinationMarker}>
              <Image source={Images.Rectangle} style={styles.destinationIcon} />
            </View>
          </Marker> */}

          {/* <Heatmap

            style={{ height: 100, width: 100, borderRadius: 60, backgroundColor: "#cfc" }}
            points={heatmapData}
            opacity={1}
            radius={50}
            maxIntensity={100}
            gradient={{
              colors: ['#f00', '#f00', '#f00'],
              startPoints: [0.1, 0.5, 1],
              colorMapSize: 256,
            }}
          /> */}
        </MapView>

        {isUserOnline && (
          <Press
            onPress={() => {
              handleDriverStatus();
              // setIsUserOnline(false);
            }}
            style={{
              height: 75,
              width: 75,
              borderRadius: 40,
              backgroundColor: Colors?.selectGreen,
              position: 'absolute',
              justifyContent: 'center',
              alignItems: 'center',
              bottom: 180,
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



        <BottomSheet
          style={{
            borderTopRightRadius: 30,
            borderTopLeftRadius: 30,
            marginTop: Platform.OS == 'android' ? '12%' : '5%',
          }}
          snapPoints={snapPoints}
          ref={bottomSheetRef}
          index={1}
          enablePanDownToClose={false}
          enableOverDrag={false}
          activeOffsetX={[-999, 999]}
          activeOffsetY={[-5, 5]}
          failOffsetX={[-5, 5]}
          animateOnMount={true}>
          <BottomSheetScrollView
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}>
            <View style={styles?.mainBottomView}>
              <View style={styles.bottomContent}>
                <View
                  style={{
                    backgroundColor: Colors.white,
                    marginTop: -20,
                    borderTopRightRadius: 15,
                    borderTopLeftRadius: 15,
                    paddingTop: 10,
                    paddingHorizontal: 20,
                  }}>
                  <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={styles.driverInfoContainer}>
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

                      {!isUserOnline && (
                        <Press
                          onPress={() => {
                            handleDriverStatus();
                            // setIsUserOnline(true);
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
                            style={{
                              height: 80,
                              width: 80,
                              resizeMode: 'contain',
                            }}
                          />
                          <Typography
                            size={17}
                            fontFamily={Fonts.Inter_Bold}
                            style={{marginTop: 15}}
                            color={Colors.black}
                            textAlign={'center'}>
                            {localization.home.Offline}
                          </Typography>
                        </Press>
                      )}
                    </View>
                  </ScrollView>
                </View>
              </View>
            </View>
          </BottomSheetScrollView>
        </BottomSheet>

        
      <BottomSheet
        isVisible={true}
        bottomSheetCss={{
          borderTopLeftRadius: 15,
          borderTopRightRadius: 15,
          marginHorizontal: 15,
          borderRadius: 15,
          bottom:
            singleData?.is_approved == 0
              ? Platform.OS === 'ios'
                ? 100
                : 90
              : 150,
        }}
        onClose={() => setheight('15%')}
        height={
          singleData?.is_approved == 0
            ? Platform.OS === 'ios'
              ? '29%'
              : '32%'
            : '35%'
        }>
        <View style={[styles.mainBottomView]}>
          <View style={{ marginTop: 20 }}>
            {singleData?.is_approved == 2 && (
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
                {singleData?.is_approved == 2 ? '' : localization.home.Document}{' '}
                {localization.home.REJECTED}
              </Typography>
            ) : (
              <Typography
                style={{ marginTop: 10 }}
                size={18}
                fontFamily={Fonts.Inter_Bold}
                color={singleData?.is_approved == 0 ? '#FFB600' : '#FF2C2C'}
                textAlign={'center'}>
                {singleData?.is_approved == 0
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
          <View style={{ paddingHorizontal: 20, padding: 0 }}>
            {singleData?.is_approved == '2' && (
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

            {singleData?.is_approved == '0' && (
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
                    style={{ top: 10 }}
                    fontFamily={Fonts.Inter_Regular}
                    textAlign={'start'}
                    color="#7B7A77"
                    size={14}>
                    {localization.home.LongText}
                  </Typography>
                )}
              </>
            )}
            {singleData?.is_approved == 2 && (
              <Button
                loading={false}
                title={localization.home.Resubmit}
                onPress={() => {
                  navigation.navigate('PersonalInfo');
                }}
                style_button={{ backgroundColor: Colors?.Black }}
              />
            )}
          </View>
        </View>
      </BottomSheet>


      <BottomSheet isVisible={isOnline} height={isUserOnline ? '18%' : '42%'}>
        <View style={styles.mainBottomView}>
          {isUserOnline && (
            <Press
              onPress={() => {
                setIsUserOnline(false);
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

          <View style={{ marginTop: 20 }}>
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
                setIsUserOnline(true);
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
      </BottomSheet>
      </View>
    </GestureHandlerRootView>
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

  // mainBottomView: {
  //   flex: 1,
  // },
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
  /////////////

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
  /////
  mainBottomView: {
    flex: 1,
    marginBottom: '30%',
  },
  bottomContent: {
    flex: 1,
    paddingTop: 10,
    zIndex: 999,
  },
});

export default Home;
