import {
  StatusBar,
  StyleSheet,
  Image,
  TouchableOpacity,
  View,
  Linking,
  Share,
  Platform,
  Alert,
} from 'react-native';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Colors } from '../../Constants/Colors';
import { Fonts } from '../../Constants/Fonts';
import { Images } from '../../Constants/Images';
import Press from '../../Component/UI/Press';
import { Typography } from '../../Component/Typography';
import MapView from 'react-native-maps';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import Button from '../../Component/Button';
import { windowWidth } from '../../Constants/Dimensions';
import { useNavigation, useRoute } from '@react-navigation/native';

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import ProfileCard from '../../Component/ProfileCard';
import ContactButtons from '../../Component/ContactButtons';
import RideInfoCard from '../../Component/RideInfoCard';
import LocationCard from '../../Component/LocationCard';
import RideRequestCard from '../../Component/RideRequestCard';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SIZE = 50;
const BOUNDARY_OFFSET = 50;

const OnlineRequest = () => {
  const route = useRoute();
  const { isOtp } = route.params || {};
  const mapRef = useRef();
  const navigation = useNavigation();
  const bottomSheetRef = useRef(null);
  //  const snapPoints = useMemo(() => ['30%'], []);
  // const snapPoints = useMemo(() => ['22%'], []);

  const snapPoints = useMemo(
    () => [Platform.OS === 'android' ? '22%' : '30%'],
    [],
  );
  const [isAccept, setIsAccept] = useState(true);
  const [isPickUp, setIsPickUp] = useState(false);
  const [isArrived, setIsArrived] = useState(false);
  const [isStart, setIsStart] = useState(false);
  const [isReached, setIsReached] = useState(false);
  const [isEmergency, seiIsEmergency] = useState(false);
  const handleCallPress = phoneNumber => {
    const url = `tel:${phoneNumber}`;
    Linking.canOpenURL(url)
      .then(supported => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert('Error', 'Your device does not support calling.');
        }
      })
      .catch(err => console.error('Error opening dialer', err));
  };
  useEffect(() => {
    setIsAccept(isOtp);
    setIsPickUp(isOtp);
    if (isOtp === true) {
      setTimeout(() => {
        setIsReached(true);
      }, 5000);
    }
  }, [isOtp]);
  useEffect(() => {
    bottomSheetRef.current?.snapToIndex(-1);
  }, [isAccept || isArrived || isOtp || isPickUp || isReached || isStart]);

  /////
  const onShare = async () => {
    try {
      const result = await Share.share({
        message:
          'React Native | A framework for building native apps using React',
      });
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
        } else {
        }
      } else if (result.action === Share.dismissedAction) {
        dismissed;
      }
    } catch (error) {
      Alert.alert(error.message);
    }
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
          style={[
            {
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: 25,
              zIndex: 999,
            },
            {justifyContent: !isPickUp ? 'space-between' : 'center'},
          ]}>
          {!isPickUp ? (
            <TouchableOpacity
              onPress={() => {
                navigation?.openDrawer();
                AsyncStorage.setItem('isDrawer', 'true');
              }}
              style={{alignSelf: 'flex-start'}}>
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
          ) : (
            <View style={{height: 80, width: 80}} />
          )}

          {!isPickUp ? (
            <Press
              style={{
                backgroundColor: Colors.black,
                paddingHorizontal: 25,
                paddingVertical: 10,
                borderRadius: 50,
                flexDirection: 'row',
                alignSelf: 'center',
              }}
              onPress={() => navigation.navigate('CustomerLocation')}>
              <Typography
                size={26}
                color={Colors.selectedBorderColor}
                fontFamily={Fonts.Inter_SemiBold}>
                ZAR{' '}
              </Typography>
              <Typography
                size={26}
                color={'#ffffff'}
                fontFamily={Fonts.Inter_SemiBold}>
                580
              </Typography>
            </Press>
          ) : (
            <View
              style={{
                backgroundColor: Colors.black,
                paddingHorizontal: 25,
                paddingVertical: 10,
                borderRadius: 10,
                marginTop: 20,
              }}>
              <Typography
                fontFamily={Fonts.Inter_Bold}
                size={16}
                textAlign={'center'}
                color={Colors.white}>
                269 Main Road
              </Typography>
              <Typography
                fontFamily={Fonts.Inter_Regular}
                size={14}
                textAlign={'center'}
                color={Colors.white}>
                1007 Maple Avenue Springfield, IL 62701 USA
              </Typography>
            </View>
          )}
          <View
            style={{
              height: 80,
              width: 80,
            }}
          />
        </View>

        <MapView
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
        />

        <BottomSheet
          handleComponent={() => (
            <>
              {isOtp && (
                <View>
                  <TouchableOpacity
                    style={styles.floatingButton}
                    onPress={() => {
                      seiIsEmergency(true);
                    }}>
                    <Image
                      source={Images.Emergency2}
                      style={styles.buttonImage}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.floatingButtonRight}
                    onPress={() => {
                      handleCallPress('+1234567890');
                    }}>
                    <Image source={Images.call} style={styles.buttonImage} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.floatingButtonRight, {marginTop: -120}]}
                    onPress={() => navigation.navigate('Message')}>
                    <Image
                      source={Images.message}
                      style={[styles.buttonImage, {tintColor: Colors.Black}]}
                    />
                  </TouchableOpacity>
                </View>
              )}
              <View style={styles.header}>
                <Typography
                  textAlign="center"
                  size={16}
                  lineHeight={22}
                  color={Colors.white}>
                  0.4 Km Away | 01:00 Min
                </Typography>
              </View>
            </>
          )}
          style={{
            borderTopRightRadius: 30,
            borderTopLeftRadius: 30,
            marginTop: Platform.OS == 'android' ? '18%' : '15%',
          }}
          snapPoints={snapPoints}
          enableDynamicSizing={false}
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
            {isAccept ? (
              <View style={styles.mainBottomView}>
                <View style={styles.bottomContent}>
                  <View style={styles.contentContainer}>
                    {!isEmergency ? (
                      <View
                        style={{
                          marginBottom: 20,

                          margin: 10,
                          borderRadius: 10,
                          elevation: 2,
                          backgroundColor: Colors.white,
                          borderColor: '#ccc',
                          padding: 16,
                          shadowOffset: {width: 0, height: 4},
                          shadowOpacity: 0.2,
                          shadowRadius: 4,
                          marginHorizontal: 2,
                          paddingHorizontal: 12,
                          paddingVertical: 12,
                          marginBottom: 30,
                        }}>
                        {!isReached ? (
                          <ProfileCard
                            name="Jon Doe"
                            rating={4.9}
                            reviews="1.4k"
                            price={isOtp && '45 ZAR'}
                            distance={isOtp && '5.0'}
                          />
                        ) : (
                          <RideInfoCard
                            startTime="02:42 Min"
                            endRideTime="02:42 Min"
                            duration="0 min"
                            amount="45 ZAR"
                            distance="4.25"
                            onSwipeComplete={() =>
                              navigation.navigate('RatingNow')
                            }
                          />
                        )}

                        {!isPickUp ? (
                          <LocationCard
                            pickup="45 Maple Johannesburg, 2193, South Africa"
                            destination="145 Street New Haven, 2001, South Africa"
                            onChatPress={() => navigation.navigate('Message')}
                            onCallPress={() => handleCallPress('+1234567890')}
                            onMorePress={() =>
                              console.log('More options pressed')
                            }
                            onPickupPress={() => {
                              setIsPickUp(true);
                              bottomSheetRef.current?.snapToIndex(1);
                            }}
                          />
                        ) : !isArrived ? (
                          !isOtp && (
                            <TouchableOpacity
                              onPress={() => setIsArrived(true)}
                              style={styles.languageButton}>
                              <Typography size={14}>
                                Languages : English, French
                              </Typography>
                            </TouchableOpacity>
                          )
                        ) : (
                          <View style={{}}>
                            <ContactButtons
                              onChatPress={() => navigation.navigate('Message')}
                              onCallPress={() => handleCallPress('+1234567890')}
                              onMorePress={() =>
                                console.log('More options pressed')
                              }
                            />
                            <Button
                              title={isStart ? 'Start Ride' : 'I’ve Arrived'}
                              onPress={() => {
                                isStart
                                  ? navigation.navigate('OTP_for_ride')
                                  : setIsStart(true);
                              }}
                              textColor={Colors.white}
                              style_button={styles.startButton}
                            />
                          </View>
                        )}
                      </View>
                    ) : (
                      <View
                        style={{
                          paddingHorizontal: 15,
                          backgroundColor: '#fff',
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
                            Emergency Assistance
                          </Typography>

                          <Press
                            onPress={() => {
                              seiIsEmergency(false);
                            }}>
                            <Typography
                              style={{textDecorationLine: 'underline'}}
                              size={18}
                              fontFamily={Fonts.Inter_SemiBold}
                              color="#000000">
                              Close
                            </Typography>
                          </Press>
                        </View>

                        <View style={{height: 1, backgroundColor: '#ECECEC'}} />

                        <View style={{alignItems: 'center'}}>
                          <Image
                            source={Images.Emergency}
                            style={{width: 100, height: 90, marginVertical: 25}}
                          />
                          <Typography
                            textAlign="center"
                            size={16}
                            fontFamily={Fonts.Inter_Regular}
                            color="#383838">
                            Feel unsafe? Share your live location with your
                            emergency contacts so they can assist you
                            immediately.
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
                            <Press onPress={() => onShare()}>
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
                              Emergency
                            </Typography>
                          </View>

                          <Press onPress={() => handleCallPress()}>
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
                      </View>
                    )}
                  </View>
                </View>
              </View>
            ) : (
              <RideRequestCard
                rideCharge="R45.00"
                driverName="Jon Doe"
                rating={4.9}
                reviewCount="1.4k"
                pickupTime={'3 mins (0.4 Km) away'}
                dropoffTime={'10 mins (4.5 Km) trip'}
                pickupLocation="45 Maple Johannesburg, 2193, South Africa"
                dropoffLocation="145 Street New Haven, 2001, South Africa"
                onAccept={() => {
                  setIsAccept(true);
                }}
                onReject={() => console.log('Ride Rejected')}
              />
            )}
          </BottomSheetScrollView>
        </BottomSheet>
      </View>
    </GestureHandlerRootView>
  );
};

export default OnlineRequest;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 10,
    flex: 1,
  },
  /////
  mainBottomView: {
    flex: 1,
    marginBottom: '30%',
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

    marginTop: 20,
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
    width: 20,
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
    zIndex: 999,
    position: 'absolute',
    marginTop: -60,
    borderRadius: 50,
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
    right: 20,
  },
});
