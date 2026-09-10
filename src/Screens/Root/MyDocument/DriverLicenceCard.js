import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import ContainerView from '../../../Component/ContainerView';
import HeaderWithBack from '../../../Component/HeaderWithBack';
import {Images} from '../../../Constants/Images';
import {MainTitle} from '../../../Component/HeaderContent';
import WarningComponent from '../../../Component/WarningComponent';
import Typography from '../../../Component/UI/Typography';
import Press from '../../../Component/UI/Press';
import CameraPicker from '../../../Component/CameraPicker';
import Date_Picker from '../../../Component/DatePicker';
import Button from '../../../Component/Button';
import {personalData} from '../../../Redux/action';
import {useDispatch, useSelector} from 'react-redux';
import {Colors} from '../../../Constants/Colors';
import {Fonts} from '../../../Constants/Fonts';
import {isValidForm} from '../../../Backend/Utility';
import {useIsFocused} from '@react-navigation/native';
import {GET_DRIVER_PROFILE, UPDATE_DOCUMENT} from '../../../Backend/ApiRoutes';
import {
  GET_WITH_TOKEN,
  POST_FORMDATA_WITH_TOKEN,
} from '../../../Backend/Backend';
import {validators} from '../../../Backend/Validator';
import ErrorBox from '../../../Component/ErrorBox';
import UploadDoc from '../../../Component/UploadDoc';
import {ToastMsg} from '../../../Component/ToastMsg';
import {FULL_HEIGHT} from '../../../Constants/Layout';
import localization from '../../../Constants/localization';

const DriverLicenceCard = ({navigation, route}) => {
  const get_detail = useSelector(store => store.updateAuthData);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [singleData, setSinglsingleData] = useState('');
  const [getImage, setGetImage] = React.useState('');

  const [licensExpiryDate, setLicenseExpiryDate] = useState('');
  const [photo, setPhoto] = useState({});
  const [error, setError] = useState('');
  const [openCamera, setOpenCamera] = useState(false);
  const isFocus = useIsFocused();

  React.useEffect(() => {
    if (isFocus) {
      GET_PROFILE();
      // setPhoto(singleData?.driver_details?.)
      setLicenseExpiryDate(singleData?.driver_details?.license_expiry_date);
    }
  }, [isFocus]);

  const GET_PROFILE = () => {
    setLoading(true);
    GET_WITH_TOKEN(
      GET_DRIVER_PROFILE,
      response => {
        setSinglsingleData(response?.data);
        setLoading(false);
        setGetImage(response?.data?.driver_details?.rsa_prdp_card);
        setLicenseExpiryDate(
          response?.data?.driver_details?.license_expiry_date,
        );
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

  const formatDateWithDashes = dateString => {
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString('en-GB');
    return formattedDate.replace(/\//g, '-');
  };

  const onSubmit = type => {
    const error = {
      photo: validators.checkRequire('Photo', photo?.uri || photo),
      licensExpiryDate: validators.checkExpiryDate(
        'License Expiry Date',
        licensExpiryDate,
      ),
    };
    setError(error);
    let formdata = new FormData();
    formdata.append('expiry_date', formatDateWithDashes(licensExpiryDate));
    if (photo?.uri) {
      formdata.append('image', {
        uri: photo.uri,
        type: photo.type,
        name: photo.name,
      });
    }

    let route = `${UPDATE_DOCUMENT}${type}`;
    if (isValidForm(error)) {
      setLoading(true);
      POST_FORMDATA_WITH_TOKEN(
        route,
        formdata,
        success => {
          setLoading(false);
          if (success?.success == true) {
            ToastMsg(success?.message);
            navigation.goBack();
          }
        },
        error => {
          setLoading(false);
        },
        fail => {
          setLoading(false);
        },
      );
    }
  };

  return (
    <ContainerView adjust={10}>
      <HeaderWithBack
        style={{paddingHorizontal: 10}}
        source={Images.Back}
        headerHelp={true}
      />
      {loading ? (
        <View
          style={{
            height: FULL_HEIGHT,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'white',
          }}>
          <ActivityIndicator
            size="large"
            color={Colors.Black}
            style={styles.loader}
          />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={{paddingHorizontal: 10}}>
            <MainTitle
              back={true}
              boldTitle={true}
              toptitle={localization?.DriverLicenceCard?.header}
              subTitleStyle={{marginTop: 16}}
              subTitle={localization?.DriverLicenceCard?.sub_header}
            />
            <WarningComponent
              title={localization?.DriverLicenceCard?.not}
              sub_title={localization?.DriverLicenceCard?.upload}
            />
            <View
              style={{
                justifyContent: 'center',
                alignSelf: 'center',
                marginBottom: 30,
              }}>
              {!getImage && !photo?.uri ? (
                <Image
                  source={Images.defaultUser}
                  style={{height: 160, width: 260}}
                />
              ) : (
                <Image
                  source={{uri: photo?.uri || getImage}}
                  style={{height: 160, width: 260}}
                />
              )}
<View style={{
              padding:10,
              backgroundColor: 'rgba(43, 47, 47, 1)',
              borderRadius: 50,
              elevation: 2,
              marginTop: 10,
              justifyContent:"center",
              alignItems:"center",
              }} >

              <Press
                onPress={() => {
                  setOpenCamera(true);
                }}
                style={{marginTop: 5}}>
                <Typography textAlign={'center'} color={Colors?.uploadGreen}>
                  {localization?.addNew?.Click_Here}
                </Typography>
              </Press>
            </View>
            {!!error?.photo && <ErrorBox message={error?.photo} />}
                  </View>

            <UploadDoc
              showModal={openCamera}
              fileUpload={false}
              close={() => {
                setOpenCamera(false);
              }}
              
                   selected={(img, type) => {
                const selectedImage = Array.isArray(img) ? img[0] : img;

                setPhoto({
                  uri: selectedImage?.uri || selectedImage?.path,
                  type: selectedImage?.type || selectedImage?.mime,
                  name:
                    selectedImage?.name ||
                    selectedImage?.filename ||
                    selectedImage?.path?.split('/').pop() ||
                    'image_name.jpg',
                });
                setError({...error, photo: ''});
              }}
            />
            {/* <Typography
              fontFamily={Fonts.Inter_Medium}
              size={16}
              style={{marginTop: 5}}>
              {localization?.DriverLicenceCard?.documents}
            </Typography> */}
            {/* <View style={styles.container}>
              <View style={styles.dot} />
              <Typography style={{marginLeft: 15}}>
                {localization?.DriverLicenceCard?.Driver}
              </Typography>
            </View>
            <View style={styles.container}>
              <View style={styles.dot} />
              <Typography style={{marginLeft: 15}}>
                {localization?.DriverLicenceCard?.Temporary}
              </Typography>
            </View> */}
            <Date_Picker
              disablePastDates={true}
              title={localization?.DriverLicenceCard?.date}
              allowFutureDates={true}
              onChange={d => {
                setLicenseExpiryDate(d);
              }}
              selected_date={licensExpiryDate}
              onConfirm={d => {
                setLicenseExpiryDate(d);
              }}
              error={error?.licensExpiryDate}
            />
            <WarningComponent
              title={localization?.DriverLicenceCard?.important}
              sub_title={localization?.DriverLicenceCard?.make}
            />
          </View>
        </ScrollView>
      )}
      <Button
        title={localization?.DriverLicenceCard?.btn}
        onPress={() => {
          onSubmit('license-expiry-date');
        }}
        loading={loading}
        style_button={{backgroundColor: Colors?.Black, marginHorizontal: 20}}
      />
    </ContainerView>
  );
};

export default DriverLicenceCard;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    height: 6,
    width: 6,
    backgroundColor: Colors.darkGrey,
    borderRadius: 50,
    alignSelf: 'center',
  },
});
