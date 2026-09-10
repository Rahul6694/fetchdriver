import {
  BackHandler,
  InteractionManager,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import HeaderWithBack from '../../Component/HeaderWithBack';
import { Images } from '../../Constants/Images';
import { Typography } from '../../Component/Typography';
import { Fonts } from '../../Constants/Fonts';
import Button from '../../Component/Button';
import { Colors } from '../../Constants/Colors';
import Input from '../../Component/Input';
import ErrorBox from '../../Component/ErrorBox';
import { validators } from '../../Backend/Validator';
import { isValidForm } from '../../Backend/Utility';
import CustomRating from '../../Component/CustomRating';
import { POST_FORMDATA_WITH_TOKEN, POST_WITHOUT_TOKEN } from '../../Backend/Backend';
import { REVIEW_SUBMIT } from '../../Backend/ApiRoutes';
import { ToastMsg } from '../../Component/ToastMsg';
import localization from '../../Constants/localization';
import { rideRatingLock } from '../../Navigation/rideRatingLock';

const leaveRatingScreen = navigation => {
  if (navigation.canGoBack()) {
    navigation.goBack();
  } else {
    navigation.navigate('DrawerNavigation');
  }
};

const RatingNow = ({ navigation, route }) => {
  const [loder, setloder] = useState(false)
  const [rating, setRating] = useState(1);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { userName, id, booking_id } = route.params;

  useEffect(() => {
    const sub = navigation.addListener('beforeRemove', () => {
      // Sync unlock let Home fetch CURRENT_RIDE while the API still echoed the
      // finished booking — re-showing rating or ride UI. Defer unlock + one refresh.
      InteractionManager.runAfterInteractions(() => {
        setTimeout(() => {
          rideRatingLock.active = false;
          global.fetchCurrentRideAfterRating?.();
        }, 320);
      });
    });
    return sub;
  }, [navigation]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      leaveRatingScreen(navigation);
      return true;
    });
    return () => sub.remove();
  }, [navigation]);

  const OnRatting = () => {
    // Validate rating and message fields
    let valid = {
      message: validators.checkRequire('message', message),
      ratingNumber: validators.checkRequire('ratingNumber', rating),
    };

    setError(valid); // Set error messages based on validation
    if (isValidForm(valid)) {
      submitApi();
    }
  };

  const submitApi = () => {
    setloder(true)
    const formdata = new FormData();

    formdata.append('customer_id', id);
    formdata.append('rating', rating);
    formdata.append('review', message);
    formdata.append('booking_id', booking_id);
    console.log("🚀 ~ submitApi ~ formdata:", formdata)
    POST_FORMDATA_WITH_TOKEN(
      REVIEW_SUBMIT,
      formdata,
      success => {
        console.log("🚀 ~ submitApi ~ formdata:", success)
        setloder(false)
        if (success?.status) {
          leaveRatingScreen(navigation);
        } else {
          ToastMsg(success?.msg || 'Error');
        }
      },
      error => {
        setloder(false)

        console.log('🚀 ~ OnRatting ~ error:', error);
        ToastMsg(error?.message || 'Network Error');
      },
      fail => {
        setloder(false)

        ToastMsg(fail?.message || 'Network Error');
      },
    );
  };

  return (
    <View style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false}>

        <HeaderWithBack
          onBackPress={() => leaveRatingScreen(navigation)}
          source={Images.Back}
          title={localization.myProfile.rating}
          SkipNow={true}
          SkipOnPress={() => leaveRatingScreen(navigation)}
        />

        <View style={{ flex: 1, justifyContent: 'space-between' }}>
          <View
            style={{
              borderWidth: 1,
              borderColor: '#ECECEC',
              padding: 15,
              borderRadius: 7,
            }}>
            <Typography
              style={{ marginTop: 15 }}
              textAlign="center"
              size={25}
              fontFamily={Fonts.Inter_SemiBold}
              color="#000">
              {localization.rideSummary.rateYourRider}
            </Typography>
            <Typography
              textAlign="center"
              size={16}
              fontFamily={Fonts.Inter_Regular}
              color="#7B7A77">
              {localization.rideSummary.howWasYourTripWith} {userName}
            </Typography>

            <View style={{ marginVertical: 10 }}>
              {/* Custom Rating component */}
              <CustomRating
                currentRating={rating}
                onChangeRating={val => setRating(val)}
              />
              <View
                style={{
                  backgroundColor: '#ECECEC',
                  height: 1,
                  marginTop: 15,
                }}
              />

              {/* <Input
              title={localization.driverFlow.comment}
              style_input={{


                justifyContent: "flex-start",
                height: 150
              }}
              height={150}
              style_inputContainer={{
                height: 300,
                borderRadius: 9,
                borderWidth: 1,
                borderColor: Colors.borderColor,
                marginBottom: 10,
                paddingHorizontal: 10,
                marginBottom: 5,

              }}
              numberOfLines={3}
              value={message}
              onChange={e => {
                setMessage(e);
                setError({ ...error, message: '' });
              }}
              multiline={true}
              placeholderTextColor={Colors.textColor}
            /> */}


              <Input
                title={localization.driverFlow.comment}
                style_input={{


                  justifyContent: "flex-start",
                  height: 150
                }}
                height={150}
                style_inputContainer={{
                  height: 300,
                  borderRadius: 9,
                  borderWidth: 1,
                  borderColor: Colors.borderColor,
                  marginBottom: 10,
                  paddingHorizontal: 10,
                  marginBottom: 5,

                }}
                numberOfLines={3}
                value={message}
                onChange={e => {
                  setMessage(e);
                  setError({ ...error, message: '' });
                }}
                multiline={true}
                placeholderTextColor={Colors.textColor}
                style_input={{
                  alignSelf: 'flex-start',
                  textAlignVertical: 'top',
                  height: 150,
                }}
                style_inputContainer={{
                  borderWidth: 1,
                  lineHeight: 23,
                  height: 150,
                  maxHeight: 150,
                }}
                numberOfLines={3}
                value={message}
                onChange={e => {
                  setMessage(e);
                  setError({ ...error, message: '' });
                }}
                multiline={true}
                placeholderTextColor={Colors.textColor}
              />
              <ErrorBox message={error?.message} />
            </View>

            <Button
              loading={loder}
              title={localization.ContactUs.button}
              style_button={{
                borderWidth: 1,
                width: '100%',
                backgroundColor: Colors.Black,
              }}
              showImage={true}
              text_style={{ color: Colors.white }}
              onPress={() => submitApi()} // Trigger rating submission
            />
          </View>
        </View>
      </ScrollView>

    </View>
  );
};

export default RatingNow;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
});
