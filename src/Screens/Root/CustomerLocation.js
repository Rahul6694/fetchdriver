import {
  StatusBar,
  StyleSheet,
  Image,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';
import React, { useMemo, useRef } from 'react';
import { Colors } from '../../Constants/Colors';
import { Fonts } from '../../Constants/Fonts';
import { Images } from '../../Constants/Images';
import Press from '../../Component/UI/Press';
import { Typography } from '../../Component/Typography';
import MapView from 'react-native-maps';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import Button from '../../Component/Button';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { windowWidth } from '../../Constants/Dimensions';
import { Text } from 'react-native-svg';
import localization from '../../Constants/localization';

const CustomerLocation = ({ navigation }) => {
  const mapRef = useRef();
  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => ['25%', '70%'], []);
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
            paddingHorizontal: 15,
          }}>
          <TouchableOpacity
            style={{
              backgroundColor: '#fff',
              width: 45,
              height: 45,
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 50,
            }}
            onPress={() => navigation.goBack()}>
            <Image
              source={Images.Back}
              style={{
                height: 20,
                width: 20,
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
              ZAR{' '}
              <Typography
                size={26}
                color={'#ffffff'}
                fontFamily={Fonts.Inter_SemiBold}>
                580
              </Typography>
            </Typography>
          </Press>

          <Press onPress={() => { }}>
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
          style={{ position: 'absolute', height: '100%', width: '100%' }}
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
              <View style={styles.header}>
                <Typography
                  textAlign="center"
                  size={16}
                  lineHeight={22}
                  color={Colors.white}>
                  3.5 Km Away | 05:40 Min
                </Typography>
              </View>
            </>
          )}
          style={{
            borderTopRightRadius: 30,
            borderTopLeftRadius: 30,
            marginTop: '35%',
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
                      <Typography
                        size={20}
                        fontFamily={Fonts.Inter_SemiBold}
                        color={Colors.Black}>
                        Jon Doe
                      </Typography>
                      <View style={styles.reviewContainer}>
                        <Image
                          source={Images.single_star}
                          style={styles.starIcon}
                        />
                        <Typography
                          size={16}
                          color={Colors.inputtitle}
                          fontFamily={Fonts.Inter_Regular}>
                          (4.9) 1.4k reviews
                        </Typography>
                      </View>

                      {/* <View
                        style={{
                          width: '100%',
                          backgroundColor: '#ECECEC',
                          height: 1,
                          marginVertical: 10,
                        }}
                      /> */}

                      <View
                        style={{
                          borderRadius: 10,
                          height: 115,
                        }}>
                        <View>
                          <Image
                            source={Images.ic_LocationIcon}
                            style={{
                              height: 80,
                              width: 80,
                              resizeMode: 'contain',
                              right: 30,
                              top: 10,
                            }}
                          />
                        </View>

                        <View
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 25,
                            padding: 5,
                          }}>
                          <View
                            style={{ width: '95%', height: 50, marginTop: 9 }}>
                            <Typography
                              style={{ top: 2 }}
                              color="#000"
                              numberOfLines={2}
                              fontFamily={Fonts.Inter_Medium}
                              size={16}>
                              45 Maple Johannesburg, 2193, South Africa
                            </Typography>
                          </View>

                          <View style={{ width: '95%', height: 50 }}>
                            <Typography
                              style={{ top: 5 }}
                              color="#000"
                              numberOfLines={2}
                              fontFamily={Fonts.Inter_Medium}
                              size={16}>
                              145 Street New Haven, 2001, South Africa
                            </Typography>
                          </View>
                        </View>
                      </View>

                      <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.chatButton}>
                          <Image
                            source={Images.message}
                            style={styles.buttonIcon}
                          />
                          <Typography style={styles.buttonText}>
                            {localization.driverFlow.chat}
                          </Typography>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.callButton}>
                          <Image
                            source={Images.call}
                            style={styles.buttonIcon}
                          />
                          <Typography style={styles.callButtonText}>
                            {localization.driverFlow.call}
                          </Typography>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.dotButton}
                          onPress={() => setListShow(!listShow)}>
                          <Image
                            source={Images.dot}
                            style={styles.buttonIcon}
                          />
                        </TouchableOpacity>
                      </View>
                      <Button
                        title={localization.driverFlow.goToPickUp}
                        onPress={() => { }}
                        textColor={Colors.white}
                        style_button={{
                          backgroundColor: Colors?.Black,
                          marginVertical: 5,
                          marginBottom: 20,
                        }}
                      />
                    </View>
                  </ScrollView>
                </View>
              </View>
            </View>
          </BottomSheetScrollView>
        </BottomSheet>
      </View>
    </GestureHandlerRootView>
  );
};

export default CustomerLocation;

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
    backgroundColor: Colors.black,
    paddingTop: 20,
    zIndex: 999,
  },

  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.borderColor,
    borderRadius: 10,
    // paddingHorizontal: 10,
    marginBottom: 16,
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
  flatListContainer: {
    alignSelf: 'flex-end',
    width: 120,
    paddingHorizontal: 8,
    elevation: 4,
    shadowColor: '#485C44',
    backgroundColor: Colors.white,
    borderRadius: 10,
    marginTop: 0,
    marginRight: 10,
    zIndex: 999,
    marginBottom: 8,
  },
  itemContainer: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#ECECEC',
    alignItems: 'center',
  },
  itemImage: {
    height: 14.9,
    width: 14.9,
    marginRight: 8.5,
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
  buttonImage: {
    height: 24,
    width: 20,
    resizeMode: 'cover',
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
    alignItems: 'center',
  },
  starIcon: {
    height: 18,
    width: 18,
    marginRight: 5,
  },
  driverInfoContainer: {
    padding: 10,
    margin: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ECECEC',
  },
});
