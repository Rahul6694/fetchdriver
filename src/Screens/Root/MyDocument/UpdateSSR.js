import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import {Header} from '../../../Component/HeaderContent';
import {Colors} from '../../../Constants/Colors';
import {Typography} from '../../../Component/Typography';
import Button from '../../../Component/Button';
import {Images} from '../../../Constants/Images';
import CameraPicker from '../../../Component/CameraPicker';
import SvgIcon from '../../../Component/UI/svg';
import Press from '../../../Component/UI/Press';
import {Fonts} from '../../../Constants/Fonts';
import Date_Picker from '../../../Component/DatePicker';
import WarningComponent from '../../../Component/WarningComponent';
import ContainerView from '../../../Component/ContainerView';
import HeaderWithBack from '../../../Component/HeaderWithBack';
import {useDispatch, useSelector} from 'react-redux';
import {validators} from '../../../Backend/Validator';
import {checkBox, personalData} from '../../../Redux/action';
import {isValidForm} from '../../../Backend/Utility';
import ErrorBox from '../../../Component/ErrorBox';
import UploadDoc from '../../../Component/UploadDoc';
import {
  GET_WITH_TOKEN,
  POST_FORMDATA_WITH_TOKEN,
} from '../../../Backend/Backend';
import {GET_DRIVER_PROFILE, UPDATE_DOCUMENT} from '../../../Backend/ApiRoutes';
import {FULL_HEIGHT} from '../../../Constants/Layout';
import {useIsFocused} from '@react-navigation/native';
import {ToastMsg} from '../../../Component/ToastMsg';
import localization from '../../../Constants/localization';

const UpdateSSR = ({navigation, route}) => {
  const [loading, setLoading] = useState(false);
  const [singleData, setSinglsingleData] = useState('');
  const [licensExpiryDate, setLicenseExpiryDate] = useState('');
  const [photo, setPhoto] = useState({});
  const [error, setError] = useState('');
  const [openCamera, setOpenCamera] = useState(false);
  const [getImage, setGetImage] = React.useState('');
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
        setGetImage(response?.data?.driver_details?.safety_screening);
        setLicenseExpiryDate(
          response?.data?.driver_details?.safety_screening_expiry,
        );
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
    <ContainerView>
      <HeaderWithBack source={Images.Back} headerHelp={true} />
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
          <Typography
            size={26}
            fontFamily={Fonts.Inter_Bold}
            color={Colors.Black}
            style={{marginTop: 15}}>
            {localization?.UploadSSR?.header}
          </Typography>
          <Typography
            color={Colors.lableColor}
            style={{marginVertical: 10}}
            lineHeight={22}>
            {localization?.UploadSSR?.sub_header}
          </Typography>
          <WarningComponent
            title={localization?.UploadSSR?.not}
            sub_title={localization?.UploadSSR?.upload}
          />
          <Typography fontFamily={Fonts.Inter_Medium} size={16} lineHeight={22}>
            {localization?.UploadSSR?.document}
          </Typography>
          <View style={styles.container}>
            <View style={styles.dot} />
            <Typography style={{marginLeft: 15}} lineHeight={22}>
              {localization?.UploadSSR?.mie}
            </Typography>
          </View>
          <View style={styles.container}>
            <View style={styles.dot} />
            <Typography style={{marginLeft: 15}} lineHeight={22}>
              {localization?.UploadSSR?.afis}
            </Typography>
          </View>
          <View style={styles.container}>
            <View style={styles.dot} />
            <Typography style={{marginLeft: 15}} lineHeight={22}>
              {localization?.UploadSSR?.huru}
            </Typography>
          </View>
          <View
            style={{
              justifyContent: 'center',
              alignSelf: 'center',
              marginBottom: 30,
              marginTop: 20,
            }}>
            {!getImage && !photo?.uri ? (
              <Image
                source={Images.defaultUser}
                style={{height: 160, width: 260}}
              />
            ) : (
              <Image
                source={{uri: photo?.uri || getImage}}
                style={{
                  width: 260, // Set your desired width
                  height: undefined, // Let height adjust automatically
                  aspectRatio: 1, // Adjust based on your image ratio (or dynamically fetched)
                  resizeMode: 'contain',
                }}
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
                }}>
                <Typography textAlign={'center'} color={'white'}>
                  {localization?.addNew?.Click_Here}
                </Typography>
              </Press>
            </View>
          </View>
          {!!error?.photo && <ErrorBox message={error?.photo} />}
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
          <Date_Picker
            title={localization?.UploadSSR?.date}
            allowFutureDates={true}
            disablePastDates={true}
            onChange={d => {
              setLicenseExpiryDate(d);
            }}
            selected_date={licensExpiryDate}
            onConfirm={d => {
              setLicenseExpiryDate(d);
            }}
            error={error?.licensExpiryDate}
          />
          <Typography
            color={Colors.red}
            fontFamily={Fonts.Inter_SemiBold}
            style={{marginTop: 20}}>
            {localization?.UploadSSR?.do_not}
          </Typography>
          <WarningComponent
            title={localization?.UploadSSR?.important}
            sub_title={localization?.UploadSSR?.sure}
          />
        </ScrollView>
      )}
      <Button
        title={localization?.UpdateTemporary?.btn}
        onPress={() => {
          onSubmit('safety-screening-expiry');
        }}
        style_button={{backgroundColor: Colors?.Black}}
      />
    </ContainerView>
  );
};

export default UpdateSSR;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  dot: {
    height: 6,
    width: 6,
    backgroundColor: Colors.darkGrey,
    borderRadius: 50,
    alignSelf: 'center',
  },
});
