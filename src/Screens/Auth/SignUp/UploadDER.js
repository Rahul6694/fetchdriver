import {Alert, Image, ScrollView, StyleSheet, Text, View} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import {Header} from '../../../Component/HeaderContent';
import {Colors} from '../../../Constants/Colors';
import {Typography} from '../../../Component/Typography';
import Button from '../../../Component/Button';
import {Images} from '../../../Constants/Images';
import SvgIcon from '../../../Component/UI/svg';
import Press from '../../../Component/UI/Press';
import {Fonts} from '../../../Constants/Fonts';
import Date_Picker from '../../../Component/DatePicker';
import WarningComponent from '../../../Component/WarningComponent';
import ContainerView from '../../../Component/ContainerView';
import HeaderWithBack from '../../../Component/HeaderWithBack';
import {windowWidth} from '../../../Constants/Dimensions';
import {useDispatch, useSelector} from 'react-redux';
import {validators} from '../../../Backend/Validator';
import {checkBox, personalData} from '../../../Redux/action';
import ErrorBox from '../../../Component/ErrorBox';
import UploadDoc from '../../../Component/UploadDoc';
import {isValidForm} from '../../../Backend/Utility';
import localization from '../../../Constants/localization';

const UploadDER = ({navigation, route}) => {
  const mySheetRef = useRef(false);
  const personal_Data = useSelector(store => store.personalData);

  const dispatch = useDispatch();
  const token = route?.params?.token;

  const [licensExpiryDate, setLicenseExpiryDate] = useState(
    personal_Data?.DERExpiry,
  );

  const [photo, setPhoto] = useState(personal_Data?.DERPhoto);
  const [error, setError] = useState('');
  const [openCamera, setOpenCamera] = useState(false);
  const check_Box = useSelector(store => store.check_box);


  const onSubmit = () => {
    const error = {
      photo: validators.checkRequire(localization?.UploadDER?.photo, photo?.path),
      licensExpiryDate: validators.checkExpiryDate(
        localization?.UploadDER?.license,
        licensExpiryDate,
      ),
    };
    setError(error);
    if (isValidForm(error)) {
      const combinedData = {
        ...personal_Data, // Include existing personal data
        DERPhoto: photo  || personal_Data?.DERPhoto,
        DERExpiry: licensExpiryDate || personal_Data?.DERExpiry
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
          {localization?.UploadDER?.header}
        </Typography>
        <Typography
          color={Colors.lableColor}
          style={{marginVertical: 10}}
          lineHeight={22}>
          {localization?.UploadDER?.sub_header}
        </Typography>
        <WarningComponent
          title={localization?.UploadDER?.not}
          sub_title={localization?.UploadDER?.upload}
        />
        <View style={{flexDirection: 'row'}}>
          <Typography size={16} lineHeight={22}>
            {localization?.UploadDER?.title}{' '}
            <Text style={{fontFamily: Fonts.Inter_Bold}}>
              {localization?.UploadDER?.sub_title}
            </Text>
          </Typography>
        </View>

        <View style={{marginVertical: 30}}>
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: 20,
            }}>
            {/* <Image
              source={photo?.path ? {uri: photo?.path} : Images?.DER_img}
              style={{height: 290, width: 206}}
            /> */}
            {photo?.path ? (
              <Image
                source={{uri: photo?.path}}
                style={{height: 250, width: 180}}
              />
            ) : photo ? (
              <Image
                source={{uri: photo}}
                style={{
                  height: 250,
                  width: 180,
                  resizeMode: 'contain',
                }}
              />
            ) : (
              <Image
                source={Images?.DER_img}
                style={{
                  height: 250,
                  width: 180,
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
          {!!error?.photo && (
            <ErrorBox message={error?.photo} style={{marginTop: 6}} />
          )}
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
          {/* <Press
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 9,
              alignSelf: 'center',
            }}>
            <SvgIcon name="mGlass" />
            <Typography style={{marginHorizontal: 7}} color="#7B7A77">
              Zoom
            </Typography>
          </Press> */}
        </View>

        <Date_Picker
          title={localization?.UploadDER?.date}
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
        <WarningComponent
          title={localization?.UploadDER?.important}
          sub_title={localization?.UploadDER?.sure}
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

export default UploadDER;

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
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'red',
    width: windowWidth / 2 + 80,
  },
  signUpText: {
    marginLeft: 5,
  },
});
