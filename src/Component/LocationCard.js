import { useState } from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { Fonts } from '../Constants/Fonts';
import ContactButtons from './ContactButtons';
import Button from './Button';
import { Colors } from '../Constants/Colors';
import { Images } from '../Constants/Images';
import Typography from './UI/Typography';
import localization from '../Constants/localization';
import { getOrderedRoutePoints } from '../Backend/Utility';
import { FlatList } from 'react-native-gesture-handler';
import AnimatedCancelButton from './AnimatedCancelButton';
import { FULL_HEIGHT } from '../Constants/Layout';

const LocationCard = ({
  pickup,
  destination,
  onChatPress,
  onCallPress,
  onMorePress,
  onPickupPress,
  loading = false,
  caculateData,
  onReject = () => { },
  name, rating, reviews, bookingData
}) => {
  const routePoints = getOrderedRoutePoints(bookingData);
  const displayRoutePoints = routePoints.map((point, index) => {
    let label = '';
    if (point.type === 'pickup') {
      label = localization.rideSummary.pickupLocation;
    } else if (point.type === 'dropoff') {
      label = localization.rideSummary.pickupLocation;
    } else {
      label = `Stop ${index}`; // You can change this to index + 1 if you want 1-based indexing
    }

    return {
      ...point,
      label,
      name: point.address,
    };
  });


  const [More, setMore] = useState(false);
  const DashedLine = () => (
    <View style={{ alignItems: 'center', }}>
      <View
        style={{ flexDirection: 'column', alignItems: 'center', }}>
        {Array.from({ length: 5 }).map((_, index) => (
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
    <ScrollView style={styles.isReachedView}>
      {/* Location Info */}
      <View style={styles.leftContainer}>
        <Typography size={20} fontFamily={Fonts.Inter_SemiBold} color={Colors.Black}>
          {name}
        </Typography>
        {!(
          bookingData?.get_booking_for ||
          bookingData?.booking_for ||
          bookingData?.customer_name
        ) && (
          <View style={styles.reviewContainer}>
            <Image source={Images.single_star} style={styles.starIcon} />
            <Typography size={16} textAlign={'left'} color={Colors.inputtitle} fontFamily={Fonts.Inter_Regular} style={styles.reviewText}>
              ({Number(rating).toFixed(1)}) {reviews} {localization.driverFlow.reviews}
            </Typography>
          </View>
        )}
      </View>
      <FlatList
        data={displayRoutePoints}
        nestedScrollEnabled
        scrollEnabled={false}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item: locItem, index }) => {
          const isFirst = index === 0;
          const isLast = index === displayRoutePoints.length - 1;

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
                    <View style={{ justifyContent: 'center' }}>
                      <Image source={Images.Rectangle} style={styles.endIcon} />
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
              </View>

              <View style={styles.inputWrapper}>
                <View style={[{ flexDirection: 'row' }]}>
                  <View style={{ width: '100%', height: 20 }}>
                    {/* <Typography
                      color="#4A4A4A"
                      fontFamily={Fonts.Inter_Medium}
                      size={16}>
                      { }
                    </Typography> */}
                    <Typography
                      style={{ top: 5, width: '80%' }}
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
      {/* Contact Buttons */}
      <ContactButtons
        onChatPress={onChatPress}
        onCallPress={onCallPress}
        onMorePress={() => {
          setMore(!More);
          // onMorePress();
        }}
      />

      <AnimatedCancelButton
        visible={More}
        onPress={() => onReject()}
        label={localization?.driverFlow?.cancelRide}
      />


      {/* Button */}
      <Button
        loading={loading}
        title={localization.driverFlow.goToPickUp}
        onPress={onPickupPress}
        textColor={Colors.white}
        style_button={{
          backgroundColor: Colors?.Black,
          // marginVertical: 16,
          // marginBottom: 30,
        }}
      />
    </ScrollView >
  );
};
export default LocationCard;

const styles = StyleSheet.create({
  flatListContainer: {
    alignSelf: "flex-end",
    // width: 120,
    paddingHorizontal: 8,
    elevation: 4,
    shadowColor: "#485C44",
    backgroundColor: Colors.white,
    borderRadius: 10,
    marginTop: -10,
    marginRight: 0,
    zIndex: 999,
    // marginBottom: 20,
    shadowColor: "#485C44",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,

  },
  itemContainer: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 5,
    // borderWidth: 1,
    borderColor: "#ECECEC",
    alignItems: "center",
    // borderRadius:7
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
  floatingButton: {
    backgroundColor: Colors.white,
    height: 46,
    width: 46,
    zIndex: 999,
    position: "absolute",
    marginTop: -60,
    borderRadius: 50,
    marginLeft: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonImage: {
    height: 24,
    width: 20,
    resizeMode: "cover",
  },
  leftContainer: {
    flex: 1,
  },
  black_container: {
    height: 20,
    width: 20,
    // borderRadius: 50,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4
  },
  reviewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  starIcon: {
    width: 16,
    height: 16,
    resizeMode: 'contain',
  },
  reviewText: {
    marginLeft: 4,
  },
  rightContainer: {
    alignItems: 'flex-end',
  },
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
    marginBottom: FULL_HEIGHT*0.05,
  }
})
