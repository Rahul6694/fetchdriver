import {
  Image,
  ImageBackground,
  StyleSheet,
  View,
  FlatList,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { CommonView } from '../../Component/CommonView';
import HeaderWithBack from '../../Component/HeaderWithBack';
import { Images } from '../../Constants/Images';
import Typography from '../../Component/UI/Typography';
import { Fonts } from '../../Constants/Fonts';
import { Colors } from '../../Constants/Colors';
import { Dimensions } from 'react-native';
import { GET_DRIVER_PROFILE } from '../../Backend/ApiRoutes';
import { useIsFocused } from '@react-navigation/native';
import { GET_WITH_TOKEN } from '../../Backend/Backend';
import { useSelector } from 'react-redux';
import { FULL_HEIGHT } from '../../Constants/Layout';
import localization from '../../Constants/localization';
import { getYearsSinceCreated } from '../../Backend/Utility';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
const { width } = Dimensions.get('window');

const DriverProfile = ({ route, navigation }) => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const get_detail = useSelector(store => store.updateAuthData);
  const [singleData, setSinglsingleData] = useState('');

  // console.log("🚀 ~ DriverProfile ~ singleData:", singleData)

  const masterData = useSelector(store => store.master_data);
  const isFocus = useIsFocused();
  // const {screenName} = route.params;
  const dropdownAnim = useSharedValue(0); // 0 = hidden, 1 = visible

  useEffect(() => {
    dropdownAnim.value = withTiming(dropdownVisible ? 1 : 0, { duration: 300 });
  }, [dropdownVisible]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: dropdownAnim.value,
      transform: [
        {
          translateY: interpolate(
            dropdownAnim.value,
            [0, 1],
            [-10, 0], // Slide up when disappearing
          ),
        },
      ],
    };
  });
  const [shouldRender, setShouldRender] = useState(dropdownVisible);

  useEffect(() => {
    if (dropdownVisible) {
      setShouldRender(true);
      dropdownAnim.value = withTiming(1, { duration: 300 });
    } else {
      dropdownAnim.value = withTiming(0, { duration: 300 });
      setTimeout(() => setShouldRender(false), 300);
    }
  }, [dropdownVisible]);

  useEffect(() => {
    if (isFocus) {
      GET_PROFILE();
    }
  }, [isFocus]);
  const GET_PROFILE = () => {
    setLoading(true);
    GET_WITH_TOKEN(
      GET_DRIVER_PROFILE,
      response => {
        setSinglsingleData(response?.data);
        setLoading(false);
        console.log("🚀 ~ constGET_PROFILE= ~ response:", response)
        // dispatch(updateAuthData(response?.data));
      },
      s => {
        setLoading(false);
      },
      s => {
        setLoading(false);
      },
    );

  };
  const handleToggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const getCity = id => {
    const city = masterData?.lookups?.city?.find(city => {
      return city.id == id;
    });

    if (city) {
      return city?.code;
    } else {
      return undefined;
    }
  };
  const getLang = ids => {
    if (!masterData?.lookups?.speaking_languages) {
      return [];
    }

    const langs = masterData?.lookups?.speaking_languages?.filter(lang =>
      ids?.includes(Number(lang?.id)),
    );

    if (langs.length > 0) {
      return langs.map(lang => lang?.code)?.join(', ');
    }

    return [];
  };
  return (
    <View style={{ flex: 1, backgroundColor: Colors.white }}>
      <View style={[styles.headerContainer]}>
        <HeaderWithBack
          source={Images.Back}
          title={localization.myProfile.myProfile}
          showSpace={true}
          rightSource={Images.edit}
          rightOnPress={() => {
            navigation.navigate('ManageProfile');
          }}
        />
      </View>
      {loading ? (
        <View
          style={styles.centeredFullScreenContainer}>
          <ActivityIndicator
            size="large"
            color={Colors.Black}
            style={styles.loader}
          />
        </View>
      ) : (
        <ScrollView style={{ marginBottom: 20, }}>

          <View style={styles.backgroundImage} />


          <View style={styles.profileContainer}>
            <Image
              source={
                singleData?.image
                  ? { uri: singleData?.image }
                  : Images.DriverProfile
              }
              style={styles.profileImage}
            />
            <Typography
              fontFamily={Fonts.Inter_Bold}
              size={22}
              lineHeight={35}
              color={Colors.Black}
              style={styles.profileName}>
              {singleData?.name}
            </Typography>
            {/* <View style={{ marginTop: 20 }}>
              {console.log(singleData?.profile_request?.status, "singleData?.profile_request?.status")}
              {
                singleData?.profile_request?.status == 'waiting_for_approval' ? <>
                  <Typography
                    fontFamily={Fonts.Inter_Bold}
                    size={14}
                    lineHeight={35}
                    color={Colors.yellow}
                    style={{ textTransform: 'words' }}>
                    {singleData?.profile_request?.status == 'waiting_for_approval'
                      ? localization.DriverProfile.waiting
                      : singleData?.profile_request?.cancel_reason}
                  </Typography>
                </> : <>
                  {singleData?.profile_request?.cancel_reason &&
                    <Typography
                      fontFamily={Fonts.Inter_Bold}
                      size={14}
                      lineHeight={35}
                      color={Colors.yellow}
                      style={{ textTransform: 'words' }}>
                      {singleData?.profile_request?.status == 'waiting_for_approval'
                        ? localization.DriverProfile.waiting
                        : singleData?.profile_request?.cancel_reason}
                    </Typography>
                  }
                </>
              }
            </View> */}

            <View
              style={styles.wrappedRowEvenSpacing}>
              <View style={styles.statsContainer}>
                <View style={styles.statBlock}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Typography
                      fontFamily={Fonts.Inter_Bold}
                      size={20}
                      // // lineHeight={25}
                      color={Colors.Black}
                      style={{ marginBottom: 4 }}>
                      {Number(singleData?.avg_rating).toFixed(1)}
                    </Typography>
                    <Image
                      source={Images.single_star}
                      style={styles.smallIconPositioned}
                    />
                  </View>

                  <Typography
                    size={16}
                    lineHeight={20}
                    textAlign="center"
                    color={Colors.selectedBorderColor}>
                    {localization.myProfile.rating}
                  </Typography>
                </View>
              </View>

              <View style={styles.statsContainer}>
                <View style={styles.statBlock}>
                  <Typography
                    fontFamily={Fonts.Inter_Bold}
                    size={20}
                    // lineHeight={25}
                    color={Colors.Black}
                    style={{ marginBottom: 4, textTransform: 'capitalize', }}>
                    {getYearsSinceCreated(singleData?.created_at).split(' ')[0]}
                  </Typography>
                  <Typography
                    size={16}
                    lineHeight={20}
                    textAlign="center"
                    color={Colors.selectedBorderColor} style={{ textTransform: 'capitalize' }}>
                    {getYearsSinceCreated(singleData?.created_at).split(' ')[1]}
                  </Typography>
                </View>
              </View>

              <View style={[styles.statsContainer, { marginTop: 5 }]}>
                <View style={styles.statBlock}>
                  <Typography
                    fontFamily={Fonts.Inter_Bold}
                    size={20}
                    // lineHeight={25}
                    color={Colors.Black}
                    style={{ marginBottom: 4 }}>
                    {singleData?.total_trips}
                  </Typography>
                  <Typography
                    size={16}
                    // lineHeight={25}
                    textAlign="center"
                    color={Colors.selectedBorderColor}>
                    {localization.myProfile.trips}
                  </Typography>
                </View>
              </View>
              <View style={[styles.statsContainer, { marginTop: 5 }]}>
                <View style={styles.statBlock}>
                  <Typography
                    fontFamily={Fonts.Inter_Bold}
                    size={20}
                    // lineHeight={25}
                    color={Colors.Black}
                    style={{ marginBottom: 4 }}>
                    {/* {Number(getYearsSinceCreated(singleData?.created_at)).toFixed(1)} */}
                    {singleData?.delivery_trips}
                  </Typography>
                  <Typography
                    size={16}
                    // lineHeight={25}
                    textAlign="center"
                    color={Colors.selectedBorderColor}>
                    {localization.myProfile.deliveryTrips}
                  </Typography>
                </View>
              </View>
            </View>


            <View style={styles.complimentsContainer}>
              <TouchableOpacity
                onPress={() => {
                  handleToggleDropdown();
                }}
                style={[
                  styles.publicProfile,
                  dropdownVisible && {
                    borderBottomWidth: 1,
                    borderColor: Colors.grey,
                  },
                ]}>
                <Typography
                  fontFamily={Fonts.Inter_Medium}
                  size={16}
                  color={Colors.Black}
                  textAlign="left">
                  {localization.myProfile.publicProfile}
                </Typography>
                <Image
                  source={Images.down}
                  style={[
                    styles.dropdownIcon,
                    {
                      transform: [
                        { rotate: dropdownVisible ? '-0deg' : '180deg' },
                      ],
                    },
                  ]}
                />
              </TouchableOpacity>


              {shouldRender && (
                <Animated.View style={animatedStyle}>

                  <View style={styles.complimentBlock}>
                    <Image source={Images.phone} style={styles.complimentIcon} />
                    <Typography
                      size={16}
                      lineHeight={20}
                      textAlign="center"
                      color={Colors.Black}
                      fontFamily={Fonts.Inter_Bold}
                    >
                      {localization.myProfile.phone}{" "}
                    </Typography>
                    <Typography
                      size={16}
                      lineHeight={20}
                      numberOfLines={1}
                      textAlign="center"
                      color={Colors.Black}
                      fontFamily={Fonts.Inter_Regular}
                    >
                      {singleData?.phone_no || '-'}
                    </Typography>
                  </View>


                  <View style={styles.complimentBlock}>
                    <Image source={Images.email} style={styles.complimentIcon} />
                    <Typography
                      size={16}
                      lineHeight={20}
                      textAlign="center"
                      color={Colors.Black}
                      fontFamily={Fonts.Inter_Bold}
                    >
                      {localization.myProfile.email}{" "}
                    </Typography>
                    <Typography
                      size={16}
                      lineHeight={20}
                      numberOfLines={1}
                      textAlign="center"
                      color={Colors.Black}
                      fontFamily={Fonts.Inter_Regular}
                    >
                      {singleData?.email || '-'}
                    </Typography>
                  </View>


                  <View style={styles.complimentBlock}>
                    <Image source={Images.ic_locationNew} style={styles.iconWithMargin} />
                    <Typography
                      size={16}
                      lineHeight={20}
                      textAlign="center"
                      color={Colors.Black}
                      fontFamily={Fonts.Inter_Bold}
                    >
                      {localization.myProfile.city}{" "}
                    </Typography>
                    <Typography
                      size={16}
                      lineHeight={20}
                      textAlign="center"
                      color={Colors.Black}
                      numberOfLines={1}
                      fontFamily={Fonts.Inter_Regular}
                    >
                      {singleData?.city ? getCity(singleData.city) : localization.DriverProfile.City}
                    </Typography>
                  </View>


                  <View style={[styles.complimentBlock, { borderBottomWidth: 0 }]}>
                    <Image source={Images.language} style={styles.complimentIcon} />
                    <Typography
                      size={16}
                      lineHeight={20}
                      textAlign="center"
                      color={Colors.Black}
                      fontFamily={Fonts.Inter_Bold}
                    >
                      {localization.myProfile.language}: {" "}
                    </Typography>
                    <View style={styles.rowStartAlignedContainer}>
                      <Typography
                        size={16}
                        lineHeight={20}
                        color={Colors.Black}
                        fontFamily={Fonts.Inter_Regular}
                      >
                        {singleData?.speaking_languages
                          ? getLang(singleData.speaking_languages)
                          : localization.DriverProfile.Language}
                      </Typography>
                    </View>
                  </View>
                </Animated.View>
              )}


            </View >
          </View >
        </ScrollView >
      )}
    </View >
  );
};

export default DriverProfile;

const styles = StyleSheet.create({
  headerContainer: {
    alignItems: 'center',
    marginHorizontal: 22,
  },
  backgroundImage: {
    width: '100%',
    height: 168,
    // marginTop: 22,
    backgroundColor: '#000',
  },
  profileContainer: {
    alignItems: 'center',
    marginHorizontal: 22,
  },
  profileImage: {
    width: 102,
    height: 102,
    marginTop: -51,
    // resizeMode: 'contain',
    borderRadius: 10,
  },
  profileName: {
    marginTop: 22,
  },
  statsContainer: {
    width: '46%',
    height: 100,
    borderWidth: 1,
    borderColor: Colors.selectedBorderColor,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  statBlock: {
    alignItems: 'center',
  },
  complimentBlock: {
    // padding:10,
    // paddingTop: 15,
    // paddingBottom: 12,
    flexDirection: 'row',
    borderBottomWidth: 1,
    margin: 10,
    borderColor: Colors.borderColor,
    paddingVertical: 8,
    alignItems: 'center',
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    height: 20,
    width: 20,
    marginHorizontal: 4,
    marginTop: -7,
  },
  complimentsContainer: {
    width: '100%',
    borderWidth: 1,
    borderColor: Colors.borderColor,
    borderBottomWidth: 1,
    borderRadius: 12,
    marginTop: 22,
    // paddingHorizontal: 12,
  },
  complimentsGrid: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    paddingHorizontal: 8,
    marginTop: 12,
  },
  complimentIcon: {
    height: 20,
    width: 20,
    marginRight: 10,
    tintColor: Colors.Black,
  },
  dropdownIcon: {
    height: 16,
    width: 16,
    resizeMode: 'contain',
  },
  publicProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  centeredFullScreenContainer: {
    height: FULL_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  wrappedRowEvenSpacing: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly',
  },
  smallIconPositioned: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    left: 5,
    bottom: 4,
  },
  iconWithMargin: {
    height: 20,
    width: 20,
    marginRight: 10,
    tintColor: Colors.Black,
  },
  rowStartAlignedContainer: {
    flexDirection: 'row',
    width: '70%',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
});
