import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  StyleSheet,
  Linking,
  Platform,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
  PermissionsAndroid,
  BackHandler,
  StatusBar,
} from 'react-native';
import MapView, {Marker, PROVIDER_GOOGLE} from 'react-native-maps';
import {Images} from '../../Constants/Images';
import {Colors} from '../../Constants/Colors';
import Press from '../../Component/UI/Press';
import Typography from '../../Component/UI/Typography';
import {Fonts} from '../../Constants/Fonts';
import Input from '../../Component/Input';
import BottomSheet from '../../Component/UI/BottomSheet';
import AsyncStorage from '@react-native-async-storage/async-storage';
import localization from '../../Constants/localization';
import {checkMultiple} from 'react-native-permissions';
import {requestPermissions} from '../../Component/Premissions';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import HeaderWithBack from '../../Component/HeaderWithBack';
import {useDispatch, useSelector} from 'react-redux';
import {GET_DRIVER_PROFILE} from '../../Backend/ApiRoutes';
import {GET_WITH_TOKEN} from '../../Backend/Backend';
import Button from '../../Component/Button';
import {isAuth, personalData} from '../../Redux/action';
import {FULL_HEIGHT} from '../../Constants/Layout';

const Home = ({}) => {
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
  const [data, setData] = useState({});
  const [bottomSheetHight, setBottomSheetHight] = useState('45%');
  const [height, setheight] = useState('40%');
  const [isUserOnline, setIsUserOnline] = useState(false);
  const [btmHeight, setBtmHeight] = useState('44%');
  const isFocus = useIsFocused();

  
  useEffect(() => {
    if (isFocus) {
      GET_PROFILE();
      false;
    }
  }, [isFocus]);

  useEffect(() => {
    const backAction = () => {
      // Optional confirmation dialog
      Alert.alert(localization.home.Hold, localization.home.exit, [
        {
          text: localization.home.Cancel,
          onPress: () => null,
          style: 'cancel',
        },
        {text: localization.home.YES, onPress: () => BackHandler.exitApp()},
      ]);
      return true; // Prevent default back button behavior
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove(); // Clean up
  }, []);

  const GET_PROFILE = () => {
    setLoading(true);
    GET_WITH_TOKEN(
      GET_DRIVER_PROFILE,
      response => {
        console.log('444444 KKKKKKK 555666 33', response);
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
            lastStep:true,
            edit: 're_Submit',
          };
          // console.log(combinedData, "combindata=======>")
          dispatch(personalData(combinedData));
        } else {
          const combinedData = {
            ...personal_Data, //
            is_approved: response?.data?.is_approved,
          };
          // console.log(combinedData, "combindata=2222======>")
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



  return (
    <View style={styles.container}>
       <StatusBar
        translucent
        backgroundColor="transparent" // Transparent background
        barStyle="dark-content" // White content
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
      </View>

      <MapView
        moveOnMarkerPress={true}
        spiralEnabled={true}
        ref={mapRef}
        mapType={Platform.OS === 'android' ? 'standard' : 'standard'}
        // provider={PROVIDER_GOOGLE}
        style={{position: 'absolute', height: '100%', width: '100%'}}
        region={{
          latitude: -30.5595, // South Africa's approximate center latitude
          longitude: 22.9375, // South Africa's approximate center longitude
          latitudeDelta: 5.0, // Adjust this value for zoom level (lower is more zoomed in)
          longitudeDelta: 5.0, // Adjust this value for zoom level (lower is more zoomed in)
        }}
      />


      {/* for status */}

      <BottomSheet
        isVisible={status}
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
          <View style={{marginTop: 20}}>
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
                style={{marginTop: 10}}
                color="red"
                size={18}
                textAlign={'center'}
                fontFamily={Fonts.Inter_Bold}>
               {singleData?.is_approved == 2 ? "" : localization.home.Document} {localization.home.REJECTED}
              </Typography>
            ) : (
              <Typography
                style={{marginTop: 10}}
                size={18}
                fontFamily={Fonts.Inter_Bold}
                color={
                  singleData?.is_approved == 0 ? "#FFB600" : '#FF2C2C'
                }
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
          <View style={{paddingHorizontal: 20, padding: 0}}>
            {singleData?.is_approved == '2' && (
              <>
                <Typography
                  numberOfLines={4}
                  style={{paddingVertical: 10}}
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
                    <Typography style={{top: 5}} size={20} color="#3A3A3C">
                      {localization.home.Reason}
                    </Typography>
                    <Typography
                      style={{top: 5}}
                      fontFamily={Fonts.Inter_Regular}
                      textAlign={'start'}
                      color="#7B7A77"
                      size={14}>
                      {singleData?.document_cancel_reason}
                    </Typography>
                  </View>
                ) : (
                  <Typography
                    style={{top: 10}}
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
                style_button={{backgroundColor: Colors?.Black}}
              />
            )}
          </View>
        </View>
      </BottomSheet>

      {/* ONLINE AND OFFLINE STATUS */}

      <BottomSheet
        isVisible={isOnline}
        // onClose={() => setBtmHeight('17%')}
        height={isUserOnline ? '18%' : '42%'}>
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

          <View style={{marginTop: 20}}>
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
                style={{height: 80, width: 80, resizeMode: 'contain'}}
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
      </BottomSheet>
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
});

export default Home;
