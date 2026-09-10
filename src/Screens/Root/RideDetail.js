import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  FlatList,
  View,
  Image,
  ScrollView,
  ActivityIndicator,
  Linking,
  Alert,
} from 'react-native';
import HeaderWithBack from '../../Component/HeaderWithBack';
import { Images } from '../../Constants/Images';
import Typography from '../../Component/UI/Typography';
import { Fonts } from '../../Constants/Fonts';
import { Colors } from '../../Constants/Colors';
import RideHeader from '../../Component/RideHeader';
import RideMap from '../../Component/RideMap';
import Press from '../../Component/UI/Press';
import localization from '../../Constants/localization';
import { RIDE_DETAIL } from '../../Backend/ApiRoutes';
import { GET_WITH_TOKEN } from '../../Backend/Backend';
import moment from 'moment';
import { windowWidth } from '../../Constants/Dimensions';
import {
  formatDistance,
  formatSimpleTime,
  formatTime,
} from '../../Backend/Utility';
const RideDetail = ({ route, navigation }) => {
  const { rideData } = route.params;
  console.log('🚀 ~ RideDetail ~ rideData:', rideData);
  const [Id, setId] = useState(rideData.booking_other_information.booking_id);
  const [loading, setLoading] = useState(false);
  const [rideCharges, setRideCharges] = useState([]);
  console.log('rideCharges', rideCharges);


  const [paymentInfo, setPaymentInfo] = useState([]);

  const [Data, setData] = useState();
  const [rideDurationText, setRideDurationText] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');

  const formatZar = value => `ZAR ${parseFloat(value || 0).toFixed(2)}`;

  const getRideChargesData = bookingInfo => {
    if (!bookingInfo) {
      return [];
    }

    const charges = [
      {
        id: 'booking_amount',
        title: localization.rideSummary.rideCharge,
        amount: formatZar(bookingInfo.booking_amount),
      },
      parseFloat(bookingInfo.total_surcharge || 0) > 0 && {
        id: 'total_surcharge',
        title: 'Surcharge',
        amount: formatZar(bookingInfo.total_surcharge),
      },
      parseFloat(bookingInfo.coupon_code_price || 0) > 0 && {
        id: 'coupon_code_price',
        title: bookingInfo.coupon_code
          ? `Coupon (${bookingInfo.coupon_code})`
          : 'Coupon',
        amount: formatZar(bookingInfo.coupon_code_price),
      },
      parseFloat(bookingInfo.airport_pickup || 0) > 0 && {
        id: 'airport_pickup',
        title: 'Airport Pickup',
        amount: formatZar(bookingInfo.airport_pickup),
      },
      parseFloat(bookingInfo.airport_drop_off || 0) > 0 && {
        id: 'airport_drop_off',
        title: 'Airport Drop Off',
        amount: formatZar(bookingInfo.airport_drop_off),
      },
      parseFloat(bookingInfo.start_airport || 0) > 0 && {
        id: 'start_airport',
        title: 'Start Airport',
        amount: formatZar(bookingInfo.start_airport),
      },
      parseFloat(bookingInfo.end_airport || 0) > 0 && {
        id: 'end_airport',
        title: 'End Airport',
        amount: formatZar(bookingInfo.end_airport),
      },
      parseFloat(bookingInfo.total_discount || 0) > 0 && {
        id: 'total_discount',
        title: 'Discount',
        amount: `- ${formatZar(bookingInfo.total_discount)}`,
      },
      {
        id: 'total_fare',
        title: localization.rideSummary.totalFare,
        amount: formatZar(bookingInfo.booking_amount),
      },
    ].filter(Boolean);

    return charges;
  };

  const getPaymentData = rideData => [
    {
      label: localization.rideSummary.paymentId,
      value: `#${rideData?.transaction_id || 'N/A'}`,
    },
    {
      label: localization.rideSummary.paymentType,
      value: 'Stripe',
    },
    {
      label: localization.rideSummary.status,
      value:
        rideData?.status_id === 'Completed'
          ? localization.rideSummary.captured
          : localization.rideSummary.authorised,
    },
  ];

  useEffect(() => {
    setLoading(true);
    GET_WITH_TOKEN(
      `${RIDE_DETAIL}/${Id}`,
      res => {
        console.log('ride details', res?.data?.booking_other_information);

        setData(res?.data);
        setPdfUrl(res?.pdf_url);
        setRideCharges(
          getRideChargesData(res?.data?.booking_other_information),
        );
        setPaymentInfo(getPaymentData(res?.data));
        setLoading(false);
      },
      error => {
        setLoading(false);
      },
      fail => {
        setLoading(false);
      },
    );
  }, [Id]);

  const buildLocationList = item => {
    if (!item) return [];

    const locations = [
      {
        label: localization?.rideSummary.pickup,
        name: item.source_name,
        latLng: item.source_latlng,
      },
    ];

    const stopLabelPrefix = localization?.rideSummary?.stop || 'Stop';
    const bookingStops = item?.booking_stop_points;

    if (Array.isArray(bookingStops) && bookingStops.length > 0) {
      bookingStops.forEach((stop, idx) => {
        const lat = stop?.latitude;
        const lng = stop?.longitude;
        const latLng =
          lat != null && lng != null
            ? `${String(lat).trim()},${String(lng).trim()}`
            : undefined;
        locations.push({
          label: `${stopLabelPrefix} ${idx + 1}`,
          name: stop?.stop || '',
          latLng,
        });
      });
    } else {
      if (item?.stop_first_latlng && item?.stop_first_name) {
        locations.push({
          label: `${stopLabelPrefix} 1`,
          name: item.stop_first_name,
          latLng: item.stop_first_latlng,
        });
      }

      if (item?.stop_second_latlng && item?.stop_second_name) {
        locations.push({
          label: `${stopLabelPrefix} 2`,
          name: item.stop_second_name,
          latLng: item.stop_second_latlng,
        });
      }
    }

    locations.push({
      label: localization?.rideSummary.DropOff,
      name: item.destination_name,
      latLng: item.destination_latlng,
    });

    return locations;
  };

  const pickupCoords = Data?.source_latlng?.split(',') || [
    '23.567826',
    '75.8099313',
  ];
  const dropCoords = Data?.destination_latlng?.split(',') || [
    '26.856169',
    '75.8099313',
  ];
  const locations = buildLocationList(Data);
  console.log('🚀 ~ RideDetail ~ locations:', locations);

  const DashedLine = () => (
    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
      <View
        style={{ flexDirection: 'column', alignItems: 'center', marginTop: 4 }}>
        {Array.from({ length: 5.5 }).map((_, index) => (
          <View
            key={index}
            style={{
              width: 2,
              height: 4,
              backgroundColor: '#000',
              marginVertical: 2,
            }}
          />
        ))}
      </View>
    </View>
  );

  useEffect(() => {
    const rideDate = Data?.ride_date; // e.g. "2025-05-19"
    const rideTime = Data?.ride_time; // e.g. "21:00"
    const completedTime = Data?.ride_completed_time; // e.g. "2025-05-19 18:30:47"
    console.log(
      rideDate,
      rideTime,
      completedTime,
      '================completedTime',
    );
    if (rideDate && rideTime && completedTime) {
      const rideStart = moment(`${rideDate} ${rideTime}`, 'YYYY-MM-DD HH:mm');
      const rideEnd = moment(completedTime, 'YYYY-MM-DD HH:mm:ss');

      console.log('rideStart:', rideStart.format());
      console.log('rideEnd:', rideEnd.format());

      if (rideEnd && rideStart) {
        const duration = moment.duration(rideEnd.diff(rideStart));
        const hours = duration.hours();
        const minutes = duration.minutes();

        // let text = '';
        // if (hours > 0 && minutes > 0) {
        //     text = `${hours}h ${minutes}m`;
        // } else if (hours > 0) {
        //     text = `${hours}h`;
        // } else {
        //     text = `${minutes}m`;
        // }

        setRideDurationText(`${hours}h ${minutes}m`);
      } else {
        setRideDurationText('Invalid time range');
      }
    } else console.log('Invalid');
  }, [Data?.ride_date, Data?.ride_time, Data?.ride_completed_time]);

  const getBookingFor = Data?.get_booking_for;
  const rideForCustomerName = String(
    getBookingFor?.customer_name ?? '',
  ).trim();
  const rideForPhoneNumber = `${getBookingFor?.customer_phone_prefix ?? ''}${getBookingFor?.customer_phone_number ?? ''
    }`.trim();

  return (
    <View style={styles.screen}>
      <HeaderWithBack
        style={{ paddingHorizontal: 20 }}
        source={Images.Back}
        title={localization.rideSummary.rideDetails}
        showSpace={true}
        rightImage={Images.downloads}
        rightOnPress={() => {
          if (pdfUrl) {
            Linking.openURL(pdfUrl).catch(err =>
              console.error('Failed to open PDF:', err),
            );
          } else {
            console.warn('PDF URL is not available.');
          }
        }}
      />
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.padding} />
        </View>
      ) : (
        <ScrollView style={styles.screen}>
          {/* <RideMap
                        locationData={{
                            latitude: parseFloat(pickupCoords[0]),
                            longitude: parseFloat(pickupCoords[1]),
                            latitudeDes: parseFloat(dropCoords[0]),
                            longitudeDes: parseFloat(dropCoords[1]),
                        }}
                        mapContainer={{ marginVertical: 10 }}
                        pickup={{
                            lat: parseFloat(pickupCoords[0]),
                            lng: parseFloat(pickupCoords[1]),
                        }}
                        drop={{
                            lat: parseFloat(dropCoords[0]),
                            lng: parseFloat(dropCoords[1]),
                        }}
                    /> */}
          <Image
            source={
              Data?.route_image_url
                ? { uri: Data?.route_image_url }
                : Images.Background_img
            }
            style={{ height: 150, width: '100%' }}
          />

          <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
            {/* <RideHeader
                        name={'Jon xxxx'}
                        // rating={'rating'}
                        reviews={'(4.9) 1.4k '}
                        callPress={() => alert('Call')}
                        containerBorder={{
                            borderColor: Colors.borderColor,
                            borderWidth: 1,
                            borderRadius: 10,
                            marginBottom: 10,
                        }}
                        callNow={true}
                        ImagePro={Images.DriverProfile}
                    /> */}

            <RideHeader
              rating={Data?.rating}
              avg_rating={Data?.get_user_name?.avg_rating}
              reviews={Data?.get_user_name?.total_reviews}
              name={Data?.get_user_name?.first_name || 'N/A'}
              containerBorder={{
                borderColor: Colors.borderColor,
                borderWidth: 1,
                borderRadius: 10,
                marginBottom: 10,
              }}
              status={Data?.status_id || ''}
              BottomDateTime={true}
              time={moment(Data?.created_at).format('hh:mm A')}
              date={moment(Data?.created_at).format('DD/MM/YY')}
              ImagePro={
                Data?.get_user_name?.image
                  ? { uri: Data?.get_user_name?.image }
                  : Images.man
              }
            />

            <Typography
              marginVertical={10}
              size={16}
              color={Colors.Black}
              fontFamily={Fonts.Inter_Bold}>
              {localization.rideSummary.rideDetails}
            </Typography>

            <View style={{ backgroundColor: Colors.borderColor, height: 1 }} />

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingVertical: 10,
              }}>
              <Typography
                size={16}
                fontFamily={Fonts.Inter_SemiBold}
                color={Colors.Black}>
                {localization.rideSummary.bookingId} :{' '}
                <Typography
                  size={16}
                  fontFamily={Fonts.Inter_Regular}
                  color={Colors.Black}>
                  {' '}
                  {Data?.booking_id}
                </Typography>
              </Typography>
              {/* <Typography
                                size={16}
                                fontFamily={Fonts.Inter_SemiBold}
                                color={Colors.Black}>
                                {localization.rideSummary.paymentBy} :{' '}
                                <Typography
                                    size={16}
                                    fontFamily={Fonts.Inter_Regular}
                                    color={Colors.Black}>
                                    {' '}
                                    Google Pay
                                </Typography>
                            </Typography> */}
            </View>
            {!!rideForCustomerName && (
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  paddingVertical: 10,
                }}>
                <Typography
                  size={16}
                  fontFamily={Fonts.Inter_SemiBold}
                  color={Colors.Black}>
                  {localization.rideSummary.rideFor} :{' '}
                  <Typography
                    size={16}
                    fontFamily={Fonts.Inter_Regular}
                    color={Colors.Black}>
                    {' '}
                    {rideForCustomerName}
                  </Typography>
                </Typography>
              </View>
            )}
            {!!rideForPhoneNumber && (
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  paddingVertical: 10,
                }}>
                <Typography
                  size={16}
                  fontFamily={Fonts.Inter_SemiBold}
                  color={Colors.Black}>
                  {localization.rideSummary.number} :{' '}
                  <Typography
                    size={16}
                    fontFamily={Fonts.Inter_Regular}
                    color={Colors.Black}>
                    {' '}
                    {rideForPhoneNumber}
                  </Typography>
                </Typography>
              </View>
            )}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingVertical: 10,
              }}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Typography
                  size={15}
                  fontFamily={Fonts.Inter_SemiBold}
                  color={Colors.Black}>
                  {localization.rideSummary.startRide} :{' '}
                  <Typography
                    size={15}
                    fontFamily={Fonts.Inter_Regular}
                    color={Colors.Black}>
                    {formatSimpleTime(Data?.ride_time || rideData?.ride_time)}
                  </Typography>
                </Typography>
              </View>
              {Data?.ride_completed_time && (
                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                  <Typography
                    size={15}
                    fontFamily={Fonts.Inter_SemiBold}
                    color={Colors.Black}
                    textAlign="right">
                    {localization.rideSummary.endRide} :{' '}
                    <Typography
                      size={15}
                      fontFamily={Fonts.Inter_Regular}
                      color={Colors.Black}>
                      {formatTime(Data?.ride_completed_time)}
                    </Typography>
                  </Typography>
                </View>
              )}
            </View>

            <View
              style={{
                paddingTop: -10,
                borderWidth: 1,
                borderColor: Colors.borderColor,
                borderRadius: 10,
                paddingVertical: 12,
              }}>
              {/* <View>
                                <Image
                                    source={Images.ic_LocationIcon}
                                    style={{
                                        height: 80,
                                        width: 80,
                                        resizeMode: 'contain',
                                        right: 20,
                                        top: 30,
                                    }}
                                />
                            </View> */}

              {/* <View style={{ position: 'absolute', top: 20, left: 35, padding: 5 }}>
                                <View style={{ width: '100%', height: 50 }}>
                                    <View style={{ justifyContent: "space-between", flexDirection: "row", marginRight: 20 }}>

                                        <Typography
                                            color="#4A4A4A"
                                            fontFamily={Fonts.Inter_Medium}
                                            size={14}>
                                            {
                                                localization.rideSummary.pickup
                                            }                  </Typography>

                                    </View>

                                    <Typography
                                        style={{ top: 2, width: '80%' }}
                                        color="#4A4A4A"
                                        numberOfLines={2}
                                        fontFamily={Fonts.Inter_Medium}
                                        size={12}>
                                        P1007 Maple Avenue Springfield, IL 62701 USA P1007 sdfsd sdfs
                                    </Typography>
                                </View>

                                <View style={{ width: '100%', height: 50 }}>
                                    <View style={{ justifyContent: "space-between", flexDirection: "row", marginRight: 20 }}>
                                        <Typography
                                            color="#4A4A4A"
                                            style={{ top: 5 }}
                                            fontFamily={Fonts.Inter_Medium}
                                            size={14}>
                                            {localization.rideSummary.drop}
                                        </Typography>

                                    </View>
                                    <Typography
                                        style={{ top: 5, width: '80%' }}
                                        color="#4A4A4A"
                                        numberOfLines={2}
                                        fontFamily={Fonts.Inter_Medium}
                                        size={12}>
                                        P1007 Maple Avenue Springfield, IL 62701 USA P1007{' '}
                                    </Typography>
                                </View>
                            </View> */}
              <FlatList
                data={locations} // This should be your array of locations from the API
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
                                <Typography color="#fff">
                                  {index}
                                </Typography>
                                {/* Middle rows: 1, 2, … (index 0 is pickup) */}
                              </View>
                              <DashedLine />
                            </>
                          )}
                        </View>
                      </View>

                      <View style={styles.inputWrapper}>
                        <View
                          style={[
                            styles.inputContainer,
                            { flexDirection: 'row' },
                          ]}>
                          <View style={{ width: '100%', height: 30 }}>
                            <Typography
                              color="#4A4A4A"
                              fontFamily={Fonts.Inter_Medium}
                              size={16}>
                              {locItem.label}{' '}
                              {/* This will be 'PickUp', 'Stop', or 'Drop' */}
                            </Typography>
                            <Typography
                              style={{ top: 2, width: '80%' }}
                              color="#4A4A4A"
                              numberOfLines={1}
                              fontFamily={Fonts.Inter_Medium}
                              size={14}>
                              {locItem.name}{' '}
                              {/* Address or location description */}
                            </Typography>
                          </View>
                        </View>
                      </View>
                    </View>
                  );
                }}
              />
            </View>

            {/* <View style={[styles.details]}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <View style={{ height: 32, width: 32, borderRadius: 50, backgroundColor: "#E7E9E766", justifyContent: "center", alignItems: "center" }}>

                                    <Image
                                        source={Images.ic_locationNew}
                                        style={{ width: 20, height: 20, resizeMode: 'contain' }}
                                    />
                                </View>
                                <Typography
                                    style={{ left: 5 }}
                                    color={Colors.black}
                                    fontFamily={Fonts.Inter_SemiBold}>
                                    {formatDistance(Data?.distance || 0)}
                                </Typography>
                            </View>
                            {rideDurationText && <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <View style={{ height: 32, width: 32, borderRadius: 50, backgroundColor: "#E7E9E766", justifyContent: "center", alignItems: "center" }}>

                                    <Image
                                        source={Images.ic_History}
                                        style={{ width: 20, height: 20, resizeMode: 'contain', tintColor: Colors.black }}
                                    />
                                </View>
                                <Typography
                                    style={{ left: 5 }}
                                    color={Colors.black}
                                    fontFamily={Fonts.Inter_SemiBold}>
                                    {rideDurationText}
                                </Typography>

                            </View>}
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <View style={{ height: 32, width: 32, borderRadius: 50, backgroundColor: "#E7E9E766", justifyContent: "center", alignItems: "center" }}>


                                    <Image
                                        source={Images.ic_wallet}
                                        style={{ width: 32, height: 32, resizeMode: 'contain' }}
                                    />
                                </View>
                                <Typography
                                    style={{ left: 5 }}
                                    color={Colors.black}
                                    fontFamily={Fonts.Inter_SemiBold}>
                                    {'ZAR '}{Data?.booking_other_information?.booking_amount}
                                </Typography>
                            </View>
                        </View> */}

            <Typography
              marginVertical={10}
              size={16}
              color={Colors.Black}
              fontFamily={Fonts.Inter_Bold}>
              {localization.rideSummary.fareDetails}{' '}
            </Typography>

            <View style={{ backgroundColor: Colors.borderColor, height: 1 }} />

            <FlatList
              style={{
                borderWidth: 1,
                borderColor: Colors.borderColor,
                padding: 10,
                borderRadius: 7,
                marginTop: 10,
              }}
              data={rideCharges}
              keyExtractor={item => item.id}
              renderItem={({ item, index }) =>
                item.amount != 'ZAR 0' && (
                  <>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingHorizontal: 1,
                      }}>
                      <Typography
                        size={16}
                        fontFamily={Fonts.Inter_SemiBold}
                        color={Colors.Black}>
                        {item.title}
                      </Typography>
                      <Typography
                        size={16}
                        fontFamily={Fonts.Inter_Regular}
                        color={Colors.Black}>
                        {item.amount}
                      </Typography>
                    </View>
                    {index !== rideCharges.length - 1 && (
                      <View
                        style={{
                          backgroundColor: Colors.borderColor,
                          height: 1,
                          marginVertical: 10,
                        }}
                      />
                    )}
                  </>
                )
              }
            />

            {/* <Press onPress={() => navigation.navigate('ConfirmPickup')}>
                        <Typography
                            marginVertical={15}
                            textAlign={'right'}
                            size={16}
                            fontFamily={Fonts.Inter_SemiBold}
                            color={Colors.selectedBorderColor}>
                            {localization.rideSummary.payTip}
                        </Typography>
                    </Press> */}

            {/* <Typography
                            marginVertical={10}
                            size={16}
                            color={Colors.Black}
                            fontFamily={Fonts.Inter_Bold}>
                            {
                                localization.rideSummary.paymentMethod
                            }          </Typography>

                        <View style={{ backgroundColor: Colors.borderColor, height: 1 }} />
                        <FlatList
                            style={{
                                borderWidth: 1,
                                borderColor: Colors.borderColor,
                                padding: 10,
                                borderRadius: 7,
                                marginTop: 10,
                                marginBottom: 20
                            }}
                            data={paymentInfo}
                            keyExtractor={item => item.id}
                            renderItem={({ item, index }) => (
                                <>
                                    <View
                                        style={{
                                            flexDirection: 'row',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            paddingHorizontal: 1,

                                        }}>
                                        <Typography
                                            size={16}
                                            fontFamily={Fonts.Inter_SemiBold}
                                            color={Colors.Black}>
                                            {item.label}
                                        </Typography>
                                        <Typography
                                            textAlign={"right"}
                                            style={{ width: "50%", }}
                                            size={16}
                                            fontFamily={Fonts.Inter_Regular}
                                            color={Colors.Black}>
                                            {item.value}
                                        </Typography>
                                    </View>
                                    {index !== paymentInfo.length - 1 && (
                                        <View
                                            style={{
                                                backgroundColor: Colors.borderColor,
                                                height: 1,
                                                marginVertical: 10,
                                            }}
                                        />
                                    )}
                                </>
                            )}
                        /> */}
          </View>
        </ScrollView>
      )}
    </View>
  );
};

export default RideDetail;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  /////
  list: {
    padding: 10,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#fff',
    marginBottom: 10,
    borderRadius: 8,
    width: '95%',
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  details: {
    marginTop: 10,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
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
