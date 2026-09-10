import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import HeaderWithBack from '../../Component/HeaderWithBack';
import Typography from '../../Component/UI/Typography';
import { Images } from '../../Constants/Images';
import localization from '../../Constants/localization';
import { CommonView } from '../../Component/CommonView';
import RiderHeader from '../../Component/RideHeader';
import RideMap from '../../Component/RideMap';
import { Fonts } from '../../Constants/Fonts';
import Button from '../../Component/Button';
import { Colors } from '../../Constants/Colors';
import AddressList from '../../Component/AddressList';
import { GET_WITH_TOKEN } from '../../Backend/Backend';
import { PREVIOUS_RIDES } from '../../Backend/ApiRoutes';
import moment from 'moment';
import { windowWidth } from '../../Constants/Dimensions';
import ContainerView from '../../Component/ContainerView';
import { useIsFocused } from '@react-navigation/native';

// const rideData = [
//   {
//     id: '1',
//     name: 'Jon',
//     rating: 4.9,
//     reviews: 127,
//     status: 'Completed',
//     pickup: {
//       lat: 26.9059,
//       lng: 75.7727,
//       address: '1007 Maple Avenue Springfield, IL 62701 USA',
//     },
//     drop: {
//       lat: 26.9243382,
//       lng: 75.6941158,
//       address: '2545 Elm Street New Haven, CT 06510 USA',
//     },
//     date: '02/12/24',
//     time: '03:00 PM',
//     fare: 'ZAR 30',
//   },
//   {
//     id: '1',
//     name: 'Jon',
//     rating: 4.9,
//     reviews: 127,
//     status: 'Completed',
//     pickup: {
//       lat: 26.9059,
//       lng: 75.7727,
//       address: '1007 Maple Avenue Springfield, IL 62701 USA',
//     },
//     drop: {
//       lat: 26.9243382,
//       lng: 75.6941158,
//       address: '2545 Elm Street New Haven, CT 06510 USA',
//     },
//     date: '02/12/24',
//     time: '03:00 PM',
//     fare: 'ZAR 30',
//   },
//   {
//     id: '1',
//     name: 'Jon',
//     rating: 4.9,
//     reviews: 127,
//     status: 'Completed',
//     StopFirst: '1007 Maple Avenue Springfield, IL 62701 USA',
//     pickup: {
//       lat: 26.9059,
//       lng: 75.7727,
//       address: '1007 Maple Avenue Springfield, IL 62701 USA',
//     },
//     drop: {
//       lat: 26.9243382,
//       lng: 75.6941158,
//       address: '2545 Elm Street New Haven, CT 06510 USA',
//     },
//     date: '02/12/24',
//     time: '03:00 PM',
//     fare: 'ZAR 30',
//   },
//   // Add more rides...
// ];

const DashedLine = () => (
  <View style={{ justifyContent: 'center', alignItems: 'center' }}>
    <View style={{ flexDirection: 'column', alignItems: 'center', marginTop: 4 }}>
      {Array.from({ length: 5.5 }).map((_, index) => (
        <View
          key={index}
          style={{
            width: 2, // Line width
            height: 4, // Height of each dash
            backgroundColor: '#000', // Color of dashes
            marginVertical: 2, // Space between dashes
          }}
        />
      ))}
    </View>
  </View>
);

const getPaginationNext = pageData => {
  if (!pageData || typeof pageData !== 'object') {
    return { canLoad: false, next: 1 };
  }
  if (pageData.page != null && pageData.total_pages != null) {
    return {
      canLoad: pageData.page < pageData.total_pages,
      next: (Number(pageData.page) || 1) + 1,
    };
  }
  if (pageData.current_page != null && pageData.last_page != null) {
    return {
      canLoad: Number(pageData.current_page) < Number(pageData.last_page),
      next: (Number(pageData.current_page) || 1) + 1,
    };
  }
  return { canLoad: false, next: 1 };
};

/** GET_WITH_TOKEN passes axios `response.data` — API uses `bookings` + `pagination`, or `data`, or a raw array. */
const extractPreviousRidesPayload = res => {
  if (Array.isArray(res)) {
    return { list: res, pagination: undefined };
  }
  if (res && typeof res === 'object') {
    if (Array.isArray(res.bookings)) {
      return { list: res.bookings, pagination: res.pagination };
    }
    if (Array.isArray(res.data)) {
      return { list: res.data, pagination: res.pagination };
    }
    if (res.data && Array.isArray(res.data.data)) {
      return { list: res.data.data, pagination: res.pagination ?? res.data?.pagination };
    }
  }
  return { list: [], pagination: res?.pagination };
};

const RideHistory = ({ route, navigation }) => {
  const flatListRef = useRef();
  const isFocus = useIsFocused();
  const [Data, setData] = useState([]);
  console.log('🚀 ~ Data:', Data);
  
  const [listLoader, setListLoader] = useState(false);
  const [isPagination, setIsPagination] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pageData, setPageData] = useState();
  const buildLocationList = item => {
    const locations = [
      {
        label: localization?.rideSummary.pickup,
        name: item.source_name,
        latLng: item.source_latlng,
      },
    ];

    if (item?.StopFirst) {
      locations.push({
        label: 'Stop 1',
        name: item.StopFirstName ?? 'Stop 1 address',
        latLng: item.StopFirstLatLng,
      });
    }

    if (item?.StopSecond) {
      locations.push({
        label: 'Stop 2',
        name: item.StopSecondName ?? 'Stop 2 address',
        latLng: item.StopSecondLatLng,
      });
    }

    locations.push({
      label: localization?.rideSummary.DropOff,
      name: item.destination_name,
      latLng: item.destination_latlng,
    });

    return locations;
  };

  const getPreviousRides = (pageNumber = 1) => {
 
    const slug = `?page=${pageNumber}`;

    if (pageNumber === 1) {
      setListLoader(true);
    } else {
      setIsPagination(true);
    }

    GET_WITH_TOKEN(
      `${PREVIOUS_RIDES}${slug}`,
      res => {
        setListLoader(false);
        const { list: newData, pagination } = extractPreviousRidesPayload(res);
        setPageData(pagination);
        if (pageNumber === 1) {
          setData(newData);
        } else {
          setData(prev => [...(prev || []), ...newData]);
        }
        setRefreshing(false);
        setIsPagination(false);
      },
      error => {
        if (pageNumber === 1) {
          setData([]);
        }

        setListLoader(false);
        setRefreshing(false);
        setIsPagination(false);
        console.log(error, 'API error from ride history');
      },
      fail => {
        setListLoader(false);
        setRefreshing(false);
        setIsPagination(false);
        console.log(fail, 'API fail from ride history');
      },
    );
  };

  useEffect(() => {
    if (isFocus) {
      getPreviousRides(1);
    }
  }, [isFocus]);

  const handleLoadMore = () => {
    const { canLoad, next } = getPaginationNext(pageData);
    if (!canLoad || isPagination || listLoader) {
      return;
    }
    getPreviousRides(next);
  };

  const onRefresh = () => {
    setRefreshing(true);
    getPreviousRides(1);
  };

  const renderFooter = () => {
    if (!isPagination) {
      return null;
    }
    return (
      <View style={styles.loadMoreFooter}>
        <ActivityIndicator size="large" color={Colors.black} />
      </View>
    );
  };
  const renderItem = React.useCallback(({ item }) => {
    const pickupCoords = item.source_latlng?.split(',') || [];
    const dropCoords = item.destination_latlng?.split(',') || [];
    const locations = buildLocationList(item);

    return (
      <View
        style={styles.card}
        onPress={() => {
          navigation.navigate('RideDetail', { rideData: item });
        }}>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('RideDetail', { rideData: item });
          }}>
          <RiderHeader
            name={item.get_user_name?.first_name ?? ''}
            avg_rating={item?.get_user_name?.avg_rating}
            reviews={item?.get_user_name?.total_reviews}
            status={item.status_id}
            ImagePro={
              item.get_user_name?.image
                ? { uri: item.get_user_name?.image }
                : Images.man
            }
          />

          {/* <RideMap
            locationData={{
              latitude: parseFloat(pickupCoords[0]),
              longitude: parseFloat(pickupCoords[1]),
              latitudeDes: parseFloat(dropCoords[0]),
              longitudeDes: parseFloat(dropCoords[1]),
            }}
            mapContainer={{ marginVertical: 10 }}
            pickup={{ lat: parseFloat(pickupCoords[0]), lng: parseFloat(pickupCoords[1]) }}
            drop={{ lat: parseFloat(dropCoords[0]), lng: parseFloat(dropCoords[1]) }}
          /> */}

          {item?.route_image_url && (
            <Image
              source={
                item?.route_image_url
                  ? { uri: item?.route_image_url }
                  : Images.Background_img
              }
              style={{ height: 120, width: '100%' }}
            />
          )}

          <View style={{ width: '100%' }}>
            {/* <View>
              <Image
                source={
                  item?.StopFirst
                    ? Images.ic_MultiDestination
                    : Images.ic_Pick_Droup
                }
                style={{
                  height: item?.StopFirst ? 150 : 100,
                  width: item?.StopFirst ? 150 : 100,
                  resizeMode: 'contain',
                  right: item?.StopFirst ? 60 : 35,
                  top: item?.StopFirst ? 10 : 0
                }}
              />
            </View> */}

            {/* <View style={{ position: 'absolute', top: 20, left: 35, padding: 5 }}>
              <View style={{ width: '100%', height: 50 }}>
                <Typography color="#4A4A4A" fontFamily={Fonts.Inter_Medium} size={14}>
                  PickUp
                </Typography>
                <Typography
                  style={{ top: 2, width: '88%' }}
                  color="#4A4A4A"
                  numberOfLines={2}
                  fontFamily={Fonts.Inter_Medium}
                  size={12}>
                  {item.source_name}
                </Typography>
              </View>

              {!!item?.StopFirst && (
                <View style={{ width: '100%', height: 50 }}>
                  <Typography
                    color="#4A4A4A"
                    style={{ top: 5 }}
                    fontFamily={Fonts.Inter_Medium}
                    size={14}>
                    Stop 1
                  </Typography>
                  <Typography
                    style={{ top: 5, width: '88%' }}
                    color="#4A4A4A"
                    numberOfLines={2}
                    fontFamily={Fonts.Inter_Medium}
                    size={12}>
                    {/* Replace with actual Stop1 address if available */}
            {/* Stop 1 address
                  </Typography>
                </View>
              )}

              <View style={{ width: '100%', height: 50 }}>
                <Typography
                  color="#4A4A4A"
                  style={{ top: 5 }}
                  fontFamily={Fonts.Inter_Medium}
                  size={14}>
                  Drop
                </Typography>
                <Typography
                  style={{ top: 5, width: '88%' }}
                  color="#4A4A4A"
                  numberOfLines={2}
                  fontFamily={Fonts.Inter_Medium}
                  size={12}>
                  {item.destination_name}
                </Typography>
              </View>
            </View> */}
            <FlatList
              data={locations}
              style={{ paddingHorizontal: 10 }}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item: locItem, index }) => {
                const isFirst = index === 0;
                const isLast = index === locations.length - 1;
                return (
                  <View style={{ flexDirection: 'row', marginVertical: 10 }}>
                    <View style={{ justifyContent: 'center' }}>
                      <View style={{ height: 7 }}>
                        {isFirst ? (
                          <>
                            <View style={styles.green_container}>
                              <View style={styles.circle} />
                            </View>
                            <DashedLine />
                          </>
                        ) : isLast ? (
                          <View
                            style={{ justifyContent: 'center', marginLeft: 1 }}>
                            <Image
                              source={Images.Rectangle}
                              style={styles.endIcon}
                            />
                          </View>
                        ) : (
                          <>
                            <View style={styles.black_container}>
                              <Typography color="#fff">{index + 1}</Typography>
                            </View>
                            <DashedLine />
                          </>
                        )}
                      </View>
                    </View>

                    <View style={styles.inputWrapper}>
                      <View
                        style={[styles.inputContainer, { flexDirection: 'row' }]}>
                        <View style={{ width: '100%', height: 30 }}>
                          <Typography
                            color="#4A4A4A"
                            fontFamily={Fonts.Inter_Medium}
                            size={16}>
                            {locItem.label}
                          </Typography>
                          <Typography
                            style={{ top: 2, width: '80%' }}
                            color="#4A4A4A"
                            numberOfLines={1}
                            fontFamily={Fonts.Inter_Medium}
                            size={14}>
                            {locItem.name}
                          </Typography>
                        </View>
                      </View>
                    </View>
                  </View>
                );
              }}
            />

            <View
              style={{
                borderBottomWidth: 0.7,
                paddingVertical: 5,
                borderColor: '#ECECEC',
                // margin: 10,
                justifyContent: 'space-between',
              }}
            />
          </View>

          <View style={styles.details}>
            {/* Ride Date */}
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginBottom: 8 }}>
              <Image
                source={Images.ic_calender}
                style={{ width: 35, height: 35, resizeMode: 'contain' }}
              />
              <Typography
                style={{ marginLeft: 5, flex: 1, flexShrink: 1 }}
                color={Colors.black}
                fontFamily={Fonts.Inter_SemiBold}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {moment(item.ride_date).format('DD/MM/YY')}
              </Typography>
            </View>

            {/* Ride Time */}
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginBottom: 5 }}>
              <Image
                source={Images.ic_Timer}
                style={{ width: 35, height: 35, resizeMode: 'contain' }}
              />
              <Typography
                style={{ marginLeft: 5, flex: 1, flexShrink: 1 }}
                color={Colors.black}
                fontFamily={Fonts.Inter_SemiBold}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {moment(item?.created_at).format('hh:mm A')}
              </Typography>
            </View>

            {/* Amount */}
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginBottom: 5 }}>
              <Image
                source={Images.ic_wallet}
                style={{ width: 35, height: 35, resizeMode: 'contain' }}
              />
              <Typography
                style={{ marginLeft: 5, flex: 1, flexShrink: 1 }}
                color={Colors.black}
                fontFamily={Fonts.Inter_SemiBold}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {'ZAR ' + item.amount}
              </Typography>
            </View>
          </View>

        </TouchableOpacity>

        {item.status_id !== 'Cancelled' && item?.rating === 0 && (
          <View style={{ padding: 10, zIndex: 999 }}>
            <Button
              loading={false}
              title={localization.myProfile.rating}
              onPress={() =>
                navigation.navigate('RatingNow', {
                  userName: item?.get_user_name?.first_name,
                  id: item?.get_user_name?.id,
                  booking_id: item?.id,
                })
              }
              style_button={{
                backgroundColor: Colors?.Black,
                marginVertical: 0,
                zIndex: 999,
              }}
            />
          </View>
        )}
      </View>
    );
  }, [navigation]);

  return (
    <ContainerView>
      <HeaderWithBack
        source={Images.Back}
        title={localization.TabNavigation.Ride}
      />
      <View style={styles.listWrap}>
        <FlatList
          ref={flatListRef}
          data={Data}
          removeClippedSubviews={false}
          keyExtractor={item => String(item.id)}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.4}
          ListFooterComponent={renderFooter}
          refreshing={refreshing}
          onRefresh={onRefresh}
          ListEmptyComponent={() =>
            !listLoader ? (
              <View style={styles.emptyWrap}>
                <Typography color="#000" size={18}>
                  {localization.rideSummary.noRideHistory}
                </Typography>
              </View>
            ) : (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.black} />
              </View>
            )
          }
        />
      </View>
    </ContainerView>
  );
};

export default React.memo(RideHistory);
const styles = StyleSheet.create({
  list: {
    padding: 10,
    paddingBottom: 100,
  },
  listWrap: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    marginTop: 30,
  },
  loadMoreFooter: {
    marginVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  card: {
    backgroundColor: '#fff',
    marginBottom: 10,
    // padding: 10,
    borderRadius: 8,
    width: '95%',
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  details: {
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    backgroundColor: '#000',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 5,
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  comingSoon: {
    fontSize: 18,
    color: '#6c757d',
    fontStyle: 'italic',
  },
  addressContainer: {
    width: windowWidth - 40,
    padding: 10,
    marginVertical: 10,
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 14,
    marginHorizontal: 20,
  },
  green_container: {
    height: 22,
    width: 22,
    borderRadius: 50,
    backgroundColor: '#b4ffcc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    height: 12,
    width: 12,
    backgroundColor: Colors.selectedBorderColor,
    borderRadius: 50,
    resizeMode: 'center',
  },
  black_container: {
    height: 20,
    width: 20,
    // borderRadius: 50,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
  },
  inputWrapper: {
    width: '100%',
    justifyContent: 'center',
    // alignItems: 'center',
    marginLeft: 20,
  },
  endIcon: {
    width: 20,
    height: 20,
  },
  dashedLine: {
    borderRightWidth: 1,
    height: 25,
    width: 2,
    borderStyle: 'dashed',
    marginTop: 7,
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});
