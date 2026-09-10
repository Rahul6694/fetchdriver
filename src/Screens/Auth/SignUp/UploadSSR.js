import {Alert, Image, ScrollView, StyleSheet, View} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import {Header} from '../../../Component/HeaderContent';
import {Colors} from '../../../Constants/Colors';
import {Typography} from '../../../Component/Typography';
import Button from '../../../Component/Button';
import {Images} from '../../../Constants/Images';
import UploadDoc from '../../../Component/UploadDoc';
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
import localization from '../../../Constants/localization';

const UploadSSR = ({navigation, route}) => {
  const mySheetRef = useRef(false);
  const personal_Data = useSelector(store => store.personalData);
  const dispatch = useDispatch();
  const [licensExpiryDate, setLicenseExpiryDate] = useState(
    personal_Data?.SSRExpiry,
  );
  const [photo, setPhoto] = useState(personal_Data?.SSRPhoto || '');
  const [error, setError] = useState('');
  const [openCamera, setOpenCamera] = useState(false);

  // useEffect(() => {
  //   if (route?.params?.autoOpenPicker) {
  //     setOpenCamera(true);
  //     navigation.setParams({ autoOpenPicker: false });
  //   }
  // }, [route?.params?.autoOpenPicker]);

  const onSubmit = () => {
    const error = {
      photo: validators.checkRequire(
        localization?.UploadDER?.photo,
        photo?.path || photo,
      ),
      licensExpiryDate: validators.checkExpiryDate(
        localization?.UploadDER?.license,
        licensExpiryDate,
      ),
    };
    setError(error);
    if (isValidForm(error)) {
      const combinedData = {
        ...personal_Data, // Include existing personal data
        SSRPhoto: photo || personal_Data?.SSRPhoto, // Fallback to previous state if 'photo' is not provided
        SSRExpiry: licensExpiryDate || personal_Data?.SSRExpiry,
      };
      dispatch(personalData(combinedData));
      navigation.goBack();
      // dispatch(checkBox(mydata));
      // navigation.navigate('SetupAccount', {token: token});
    }
  };

  return (
    <ContainerView>
      <HeaderWithBack source={Images.Back} headerHelp={true} />
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
            alignItems: 'center',
            marginBottom: 30,
            marginTop: 20,
          }}>
          {/* <Image
            source={photo?.path ? {uri: photo?.path} : Images?.SSR_img}
            style={{height: 208, width: 273}}
          /> */}
          {photo?.path ? (
            <Image
              source={{uri: photo?.path}}
              style={{height: 250, width: 250}}
            />
          ) : photo ? (
            <Image
              source={{uri: photo}}
              style={{
                height: 250,
                width: 250,
                resizeMode: 'contain',
              }}
            />
          ) : (
            <Image
              source={Images?.SSR_img}
              style={{
                height: 250,
                width: 250,
                resizeMode: 'contain',
              }}
            />
          )}
          <View
            style={{
             padding:10,
              backgroundColor: 'rgba(43, 47, 47, 1)',
              borderRadius: 50,
              elevation: 2,
              marginTop: 10,
              justifyContent:"center",
              alignItems:"center",
            }}>
            <Press
              onPress={() => {
                setOpenCamera(true);
              }}>
              <Typography textAlign={'center'} color={'white'}>
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
            const filePath = selectedImage?.path || selectedImage?.uri;
            setPhoto({
              path: filePath,
              uri: filePath,
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
      <Button
        title={localization?.carDetails?.submit}
        onPress={() => {
          onSubmit();
        }}
        style_button={{backgroundColor: Colors?.Black}}
      />
    </ContainerView>
  );
};

export default UploadSSR;

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
