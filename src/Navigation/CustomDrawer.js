import {
  Alert,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import {
  DrawerContentScrollView,
  useDrawerStatus,
} from '@react-navigation/drawer';
import { Colors } from '../Constants/Colors';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { Images } from '../Constants/Images';
import { useSelector } from 'react-redux';
import { Fonts } from '../Constants/Fonts';
import Typography from '../Component/UI/Typography';
import HeaderWithBack from '../Component/HeaderWithBack';

import { Legals } from '../Constants/ConstantData';
import localization from '../Constants/localization';
import { GET_WITH_TOKEN } from '../Backend/Backend';
import { GET_DRIVER_PROFILE } from '../Backend/ApiRoutes';

const CustomDrawerContent = props => {
  const [list, setList] = useState([]);
  const get_detail = useSelector(store => store.updateAuthData);

  const [singleData, setSinglsingleData] = useState('');
  // console.log("🚀 ~ singleData:", singleData)
  const isFocus = useIsFocused();
  const navigation = useNavigation();
  const [isLegalVisible, setIsLegalVisible] = useState(true);
  const [legal, setLegal] = useState([]);
  const [loading, setLoading] = useState(false);
  const onFocus = useIsFocused();

  const isDrawerOpen = useDrawerStatus() === 'open';

  useEffect(() => {
    setIsLegalVisible(true);
  }, [isDrawerOpen]);

  useEffect(() => {
    setList(DrawerList);
    setLegal(Legals);
  }, [isLegalVisible, onFocus]);

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
        console.log('response for screen',response);
        
        setSinglsingleData(response?.data);
        setLoading(false);

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
  const LangCode = useSelector(store => store.language_code);

  const DrawerList = [
    {
      icon: Images?.ic_Profile,
      name: localization.DrawerScreen.profile,
      navigate: 'DriverProfile',
    },
    {
      icon: Images?.pay,
      name: localization.DrawerScreen.paymentHistory,
      navigate: 'PaymentHistoryScreen',
    },
    {
      icon: Images?.Ride,
      name: localization.DrawerScreen.rideHistory,
      navigate: 'RideHistory',
    },
    {
      icon: Images?.message,
      name: localization.DrawerScreen.messages,
      navigate: 'Message',
    },
    {
      icon: Images?.FAQ,
      name: localization.multiDropDown.help,
      navigate: 'Faq',
      next: Images?.next,
    },
  ];

  return (
    <>
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => {
          props.navigation.closeDrawer();
        }}>
        <Image source={Images.close} style={styles.closeIcon} />
      </TouchableOpacity>

      <DrawerContentScrollView
        {...props}
        style={{ width: '85%', backgroundColor: '#fff' }}>
        <FlatList
          ListHeaderComponent={
            <View style={styles.drawerHeader}>
              <View style={styles.imageContainer}>
                <Image
                  source={
                    singleData?.driver_details?.driver_photo
                      ? { uri: singleData?.image }
                      : Images.user
                  }
                  style={styles.profileIcon}
                />
              </View>
              <View>
                <Typography
                  fontFamily={Fonts.Inter_Bold}
                  size={18}
                  // lineHeight={26.1}
                  numberOfLines={1}
                  // style={{flex: 1}}
                  color={Colors.Primary}>
                  {singleData?.name}
                </Typography>
                <View style={styles.ratingContainer}>
                  <Image source={Images.single_star} style={styles.starIcon} />
                  <Typography
                    fontFamily={Fonts.Inter_Regular}
                    size={18}
                    numberOfLines={1}
                    lineHeight={26.1}
                    color={Colors.Primary}>
                    {`(${singleData?.avg_rating})`} {singleData?.total_reviews} {localization?.DriverProfile?.reviews}
                  </Typography>
                </View>
              </View>
            </View>
          }
          data={list}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <>
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
                onPress={() =>
                  navigation.navigate(item.navigate, {
                    slug: item.slug,
                    screenName: item.name,
                  })
                }>
                <View style={styles.menuButton}>
                  <View style={styles.iconContainer}>
                    <Image source={item.icon} style={styles.icon} />
                  </View>
                  <View style={{ width: '70%' }}>
                    <Typography
                      size={16}
                      lineHeight={19}
                      fontFamily={Fonts.Inter_Medium}
                      color={Colors.Black}>
                      {item?.name}
                    </Typography>
                  </View>
                </View>
              </TouchableOpacity>
              <View style={styles.separator}></View>
            </>
          )}
        />
      </DrawerContentScrollView>
    </>
  );
};

export default CustomDrawerContent;

const styles = StyleSheet.create({
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 7, // Move slightly outside the drawer
    zIndex: 9999999,
    backgroundColor: Colors.Primary,
    borderRadius: 25,
    width: 46,
    height: 46,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 45,
  },
  closeIcon: {
    width: 24,
    height: 24,
    tintColor: Colors.Black,
    transform: [{ rotate: '90deg' }],
    resizeMode: "cover"
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.Black,
    borderRadius: 16,
    padding: 12,
    marginBottom: 20,
  },
  imageContainer: {
    height: 70,
    width: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  profileIcon: {
    width: 60,
    height: 60,
    borderRadius: 10,
    borderColor: Colors.Primary,
    borderWidth: 1,
    resizeMode: "cover"
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    width: '100%',
  },
  starIcon: {
    height: 18,
    width: 18,
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingLeft: 20,
  },
  iconContainer: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
    backgroundColor: '#E7E9E766',
    marginRight: 16,
  },
  icon: {
    width: 25,
    height: 25,
    tintColor: Colors.Black,
  },
  separator: {
    alignItems: 'center',
    borderColor: '#ECECEC',
    borderWidth: 1,
  },
});
