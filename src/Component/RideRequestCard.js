import React from 'react';
import {
  View,
  Image,
  StyleSheet,
  Platform,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
// import { Typography } from './Typography'; // Assuming custom Typography component
import Button from './Button'; // Assuming custom Button component
import { Fonts } from '../Constants/Fonts';
import { Colors } from '../Constants/Colors';
import { Images } from '../Constants/Images';
import localization from '../Constants/localization';
import Typography from './UI/Typography';
import { getOrderedRoutePoints } from '../Backend/Utility';
import { localNotificationService } from '../pushNotifacation/LocalNotificationService';

const RideRequestCard = ({
  rideCharge,
  driverName,
  rating,
  reviews,
  pickupTime,
  pickupLocation,
  dropoffTime,
  dropoffLocation,
  onAccept,
  onReject,
  acceptLoading = false,
  rejectLoading = false,
  bookingData,
}) => {
  const { height: windowHeight } = useWindowDimensions();
  /** Parent sheet snap is often 50–65% with outer scroll off — cap inner scroll so the button row stays inside the sheet. */
  const routeScrollMaxHeight = Math.max(
    160,
    Math.round(windowHeight * 0.68 - 240),
  );

  const routePoints = getOrderedRoutePoints(bookingData);

  const displayRoutePoints = routePoints.map((point, index) => {
    let label = '';
    if (point.type === 'pickup') {
      label = localization.rideSummary.pickupLocation;
    } else if (point.type === 'dropoff') {
      label = localization.rideSummary.dropoffLocation;
    } else {
      label = `${localization.rideSummary.stop} ${index}`; // You can change this to index + 1 if you want 1-based indexing
    }

    return {
      ...point,
      label,
      name: point.address,
    };
  });

  const DashedLine = () => (
    <View style={{ alignItems: 'center' }}>
      <View style={{ flexDirection: 'column', alignItems: 'center' }}>
        {Array.from({ length: 7 }).map((_, index) => (
          <View
            key={index}
            style={{
              width: 2,
              height: 4,
              backgroundColor: '#000',
              marginVertical: 1,
            }}
          />
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.mainBottomView}>
      <View style={styles.bottomContent}>
        <View style={styles.cardInner}>
          <ScrollView
            style={[styles.cardScroll, { maxHeight: routeScrollMaxHeight }]}
            contentContainerStyle={styles.cardScrollContent}
            nestedScrollEnabled
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator>
            <View style={styles.driverInfoContainer}>
              <Typography
                textAlign="center"
                size={45}
                fontFamily={Fonts.Inter_Bold}
                color={Colors.Black}>
                {rideCharge}
              </Typography>
              <Typography
                textAlign="center"
                color={Colors.black}
                size={15}
                fontFamily={Fonts.Inter_Medium}>
                {localization.driverFlow.rideCharge}
              </Typography>

              <View style={styles.reviewContainer}>
                <Typography
                  size={20}
                  fontFamily={Fonts.Inter_SemiBold}
                  color={Colors.Black}>
                  {driverName}
                </Typography>
                {!(
                  bookingData?.get_booking_for ||
                  bookingData?.booking_for ||
                  bookingData?.customer_name
                ) && (
                    <>
                      <Image source={Images.single_star} style={styles.starIcon} />
                      <Typography
                        size={16}
                        color={Colors.inputtitle}
                        fontFamily={Fonts.Inter_Regular}>
                        ({Number(rating).toFixed(1)}) {reviews}{' '}
                        {localization.driverFlow.reviews}
                      </Typography>
                    </>
                  )}
              </View>

              <View style={styles.divider} />

              {/* <View style={styles.locationContainer}>
              {/* <Image
                source={Images.ic_LocationIcon}
                style={styles.locationIcon}
              /> */}
              {/* <View style={{ flexDirection: "column", marginRight: 10 }}>
                <View style={styles.green_container}>
                  <View style={styles.circle}></View>
                </View>
                <DashedLine />
                <View style={{ height: 10, justifyContent: 'center' }}>
                  <Image source={Images.Rectangle} style={styles.endIcon} />
                </View>
              </View>
              <View style={styles.locationTextContainer}>
                <View style={styles.locationTextBlock}>
                  <Typography
                    color="#4A4A4A"
                    fontFamily={Fonts.Inter_Medium}
                    size={14}>
                    {pickupTime}
                  </Typography>
                  <Typography
                    color="#000"
                    numberOfLines={2}
                    fontFamily={Fonts.Inter_Medium}
                    size={16}>
                    {pickupLocation}
                  </Typography>
                </View>
                <View style={styles.locationTextBlock}>
                  <Typography
                    color="#4A4A4A"
                    fontFamily={Fonts.Inter_Medium}
                    size={14}>
                    {dropoffTime}
                  </Typography>
                  <Typography
                    color="#000"
                    numberOfLines={2}
                    fontFamily={Fonts.Inter_Medium}
                    size={16}>
                    {dropoffLocation}
                  </Typography>
                </View>
              </View>
            </View> */}
              <View style={styles.routeList}>
                {displayRoutePoints.map((locItem, index) => {
                  const isFirst = index === 0;
                  const isLast = index === displayRoutePoints.length - 1;

                  return (
                    <View
                      key={`route-${index}`}
                      style={styles.routeRow}>
                      <View style={styles.routeMarkerColumn}>
                        {isFirst ? (
                          <>
                            <View style={styles.green_container}>
                              <View style={styles.circle} />
                            </View>
                            {!isLast ? <DashedLine /> : null}
                          </>
                        ) : isLast ? (
                          <View style={styles.endMarkerWrap}>
                            <Image
                              source={Images.Rectangle}
                              style={styles.endIcon}
                            />
                          </View>
                        ) : (
                          <>
                            <View style={styles.black_container}>
                              <Typography color="#fff">{index}</Typography>
                            </View>
                            <DashedLine />
                          </>
                        )}
                      </View>

                      <View style={styles.inputWrapper}>
                        <View
                          style={[styles.inputContainer]}>
                          <View style={styles.routeTextBlock}>
                            <Typography
                              color="#4A4A4A"
                              fontFamily={Fonts.Inter_Medium}
                              size={16}>
                              {locItem.label}
                            </Typography>
                            <Typography
                              style={styles.routeAddress}
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
                })}
              </View>
            </View>
          </ScrollView>

          <View style={styles.buttonContainer}>
            <Button
              loaderColor={Colors?.Black}
              loading={rejectLoading}
              title={localization.driverFlow.reject}
              style_button={styles.rejectButton}
              showImage={true}
              onPressDiasbled={acceptLoading}
              onPress={() => {
                onReject();
                localNotificationService.cancelAllLocalNotifications();
              }}
              text_style={{ color: Colors.black }}
            />

            <Button
              loading={acceptLoading}
              title={localization.driverFlow.accept}
              style_button={styles.acceptButton}
              showImage={true}
              onPressDiasbled={rejectLoading}
              onPress={() => {
                onAccept();
                localNotificationService.cancelAllLocalNotifications();
              }}
              text_style={{ color: Colors.white }}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  /* No flex:1 here — parent BottomSheetScrollView must measure intrinsic height to scroll. */
  mainBottomView: {
    width: '100%',
    marginBottom: Platform.OS === 'ios' ? '10%' : '15%',
  },

  bottomContent: {
    width: '100%',
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 5,
    backgroundColor: Colors.white,
  },
  cardScroll: {
    width: '100%',
  },
  cardScrollContent: {
    width: '100%',
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
  cardInner: {
    width: '95%',
    flexDirection: 'column',
    padding: 16,
    margin: 10,
    marginHorizontal: 12,
    marginBottom: 30,
    borderRadius: 10,
    elevation: 2,
    backgroundColor: Colors.white,
    borderColor: '#ccc',
    paddingHorizontal: 12,
    paddingVertical: 12,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  routeList: {
    paddingHorizontal: 10,
    width: '100%',
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    // marginVertical: 10,
  },
  routeMarkerColumn: {
    width: 22,
    alignItems: 'center',
    // backgroundColor:'blue'
  },
  endMarkerWrap: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  routeTextRow: {
    flexDirection: 'row',
  },
  routeTextBlock: {
    width: '100%',
    minHeight: 40,
    paddingBottom: 4,
    // backgroundColor:"yellow"
  },
  routeAddress: {
    // marginTop: 2,
    width: '90%',
  },
  inputWrapper: {
    flex: 1,
    justifyContent: 'center',
    marginLeft: 12,
    minWidth: 0,


  },
  inputContainer: {
    // flex: 1,
    // backgroundColor:"red",

  },
  driverInfoContainer: { alignItems: 'center' },
  reviewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  starIcon: { width: 16, height: 16, marginHorizontal: 4 },
  divider: {
    height: 1,
    backgroundColor: '#ECECEC',
    marginVertical: 10,
    width: '100%',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  locationIcon: { width: 28, height: 104, marginRight: 10 },
  locationTextContainer: { flex: 1 },
  locationTextBlock: { marginVertical: 7 },
  buttonContainer: {
    width: '100%',
    flexShrink: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 4 : 0,
  },
  rejectButton: {
    backgroundColor: Colors.white,
    flex: 1,
    marginRight: 10,
    borderWidth: 1,
  },
  acceptButton: { backgroundColor: Colors.Black, flex: 1 },
  green_container: {
    height: 19,
    width: 20,
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
  },
  endIcon: {
    width: 20,
    height: 20,
  },
});

export default RideRequestCard;
