import React, { useEffect, useState } from 'react';
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Platform,
} from 'react-native';
import { Typography } from './Typography';
import { Images } from '../Constants/Images';
import { Fonts } from '../Constants/Fonts';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../Constants/Colors';
import { FULL_HEIGHT, FULL_WIDTH } from '../Constants/Layout';
import { GET, GetNew } from '../Backend/Backend';
import { FAQ } from '../Backend/ApiRoutes';
import localization from '../Constants/localization';
import Press from './UI/Press';

const HeaderWithBack = ({
  title,
  onBackPress,
  style,
  titleStyle,
  source,
  rightSource,
  headerHelp,
  onPress,
  image_style,
  showSpace = false,
  icon_style,
  textContainer,
  rightOnPress,
  SkipNow = false,
  SkipOnPress,
  rightImage = Images?.edit
}) => {
  const navigation = useNavigation();
  const [visible, setvisible] = useState(false);
  const [data, setData] = useState([1, 2]);
  console.log('data from cms', data);

  const [expandedItem, setExpandedItem] = useState(null);
  const toggleExpand = id => {
    setExpandedItem(prev => (prev === id ? null : id));
  };
  useEffect(() => {
    fetchFaqData();
  }, []);
  const fetchFaqData = () => {
    GetNew(
      `${FAQ}${'before'}`,
      success => {
        console.log('success from cmshhhhhhhhhhhhhhhhhhhhh', success);

        setData(success?.data || []);
        console.log('success from cms', success);

      },
      error => { },
      fail => { },
    );
  };
  return (
    <>
      <View style={[styles.container, style]}>
        {/* Back Button */}

        <TouchableOpacity
          onPress={onBackPress || (() => navigation.goBack())}
          style={[styles.backButton, icon_style, { left: 10 }]}>
          <Image source={source} style={[styles.icon]} />
        </TouchableOpacity>

        {/* Title */}
        {title && (
          <View style={[styles.textView, textContainer]}>
            <Typography
              fontFamily={Fonts.Inter_SemiBold}
              size={20}
              textAlign={'center'}
              style={[styles.title, titleStyle]}>
              {title}
            </Typography>
          </View>
        )}

        {SkipNow && (
          <Press onPress={() => SkipOnPress()}>
            <Typography
              fontFamily={Fonts.Inter_SemiBold}
              size={20}
              textAlign={'center'}
              color="#00DB46"
              style={{ textDecorationLine: 'underline' }}>
              {localization.driverFlow.skip}
            </Typography>
          </Press>
        )}
        {showSpace && (
          <TouchableOpacity
            onPress={rightOnPress}
            style={{ justifyContent: 'center', alignItems: 'center' }}>
            <Image
              source={rightImage}
              style={{ height: 20, width: 20, tintColor: Colors.Black }}
            />
          </TouchableOpacity>
        )}
        {headerHelp && (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => {
              setvisible(!visible);
            }}
            style={styles.image_container}>
            <Typography
              size={13}
              color={Colors?.white}
              style={{ marginRight: 8 }}>
              {localization?.multiDropDown?.help}
            </Typography>
            <Image
              source={Images?.arrow_up}
              style={{
                height: 12,
                width: 12,
                tintColor: '#fff',
                resizeMode: 'contain',
                transform: [{ rotate: visible ? '360deg' : '180deg' }],
              }}
            />
          </TouchableOpacity>
        )}
      </View>
      {!!visible && (
        <View
          style={{
            backgroundColor: 'rgba(0,0,0,0.5)',
            position: 'absolute',
            width: FULL_WIDTH,
            height: FULL_HEIGHT,
            top: 85,
            left: 0,
            zIndex: 99999,
          }}>
          <View style={{ backgroundColor: 'white', paddingHorizontal: 20 }}>
            <FlatList
              data={data}
              ItemSeparatorComponent={() => (
                <View
                  style={{
                    height: 0.5,
                    backgroundColor: Colors?.grey,
                    width: '100%',
                  }}
                />
              )}
              renderItem={({ item, index }) => {
                return (
                  <View style={{ marginVertical: 20 }}>
                    <TouchableOpacity
                      activeOpacity={0.9}
                      onPress={() => {
                        toggleExpand(item?.id);
                      }}
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}>
                      <View style={{ flexDirection: 'row' }}>
                        <View
                          style={{
                            backgroundColor: '#E7E9E766',
                            height: 40,
                            width: 40,
                            borderRadius: 20,
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                          <Image
                            source={Images?.support}
                            style={{ height: 20, width: 20 }}
                          />
                        </View>
                        <Typography
                          style={{ marginLeft: 12, top: 5 }}
                          size={16}
                          fontFamily={Fonts?.Inter_Medium}
                          color={Colors?.black}>
                          {item?.question}
                        </Typography>
                      </View>
                      <Image
                        source={Images?.arrow_up}
                        tintColor={Colors?.lightGrey}
                        style={{
                          height: 12,
                          width: 12,
                          top: 5,
                          resizeMode: 'contain',
                          transform: [
                            {
                              rotate:
                                expandedItem === item?.id ? '360deg' : '180deg',
                            },
                          ],
                        }}
                      />
                    </TouchableOpacity>
                    {expandedItem === item?.id && (
                      <Typography
                        style={{ marginHorizontal: 10, marginTop: 5 }}
                        size={14}
                        fontFamily={Fonts?.Inter_Regular}
                        color={Colors?.gray}>
                        {item?.answer}
                      </Typography>
                    )}
                  </View>
                );
              }}
            />
          </View>
        </View>
      )}
    </>
  );
};

export default HeaderWithBack;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 10,
    justifyContent: 'space-between',
    marginTop: Platform.OS === 'ios' ? 52 : 53,
  },

  icon: {
    height: 20,
    width: 20,
  },
  title: {
    justifyContent: 'center',
    textAlign: 'center',
  },
  image_container: {
    backgroundColor: '#00DB46',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textView: {
    alignItems: 'center',
    flex: 1,
    // width: '50%',
    justifyContent: 'center',
  },
  backButton: {

    height: 30,
    width: 30,
    justifyContent: "center",
    // alignItems: "center"
  }
});
