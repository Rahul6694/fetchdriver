import {Alert, Image, ScrollView, StyleSheet, View} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import {Header, MainTitle} from '../../../Component/HeaderContent';
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
import {useDispatch, useSelector} from 'react-redux';
import {checkBox, personalData} from '../../../Redux/action';
import ErrorBox from '../../../Component/ErrorBox';
import {validators} from '../../../Backend/Validator';
import {isValidForm} from '../../../Backend/Utility';
import HeaderWithBack from '../../../Component/HeaderWithBack';
import ContainerView from '../../../Component/ContainerView';
import localization from '../../../Constants/localization';
import { FULL_HEIGHT } from '../../../Constants/Layout';

const TemporaryPrDP = ({navigation, route}) => {
  const mySheetRef = useRef(false);
  const token = route?.params?.token;
  const personal_Data = useSelector(store => store.personalData);
  const dispatch = useDispatch();

  const [licensExpiryDate, setLicenseExpiryDate] = useState(
    personal_Data?.RSAExpiry,
  );
  const [photo, setPhoto] = useState(personal_Data?.RSAPhoto);
  const [error, setError] = useState('');
  const [openCamera, setOpenCamera] = useState(false);
  const check_Box = useSelector(store => store.check_box);


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
        // Fallback to previous state if 'v' is not provided
        RSAPhoto: photo || personal_Data?.RSAPhoto, // Fallback to previous state if 'photo' is not provided
        RSAExpiry: licensExpiryDate || personal_Data?.RSAExpiry, // Fallback to previous state if 'licensExpiryDate' is not provided
      };
      // const combinedData = {
      //   ...personal_Data, // Include existing personal data
      //   RSAPhoto: photo,
      //   RSAExpiry: licensExpiryDate,
      // };
      dispatch(personalData(combinedData));
      navigation.goBack();
      // dispatch(checkBox(mydata));
      // navigation.navigate('SetupAccount', {token: token});
    }
  };

  return (
    <ContainerView adjust={10}>
      <HeaderWithBack
        style={{paddingHorizontal: 10}}
        source={Images.Back}
        headerHelp={true}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{marginHorizontal: 10}}>
          <MainTitle
            back={true}
            boldTitle={true}
            toptitle={localization?.TemporaryPrDP?.header}
            subTitleStyle={{marginTop: 16}}
            subTitle={localization?.TemporaryPrDP?.sub_header}
          />
        </View>
        <View style={{paddingHorizontal: 10}}>
          <WarningComponent
            title={localization?.TemporaryPrDP?.not}
            sub_title={localization?.TemporaryPrDP?.upload}
          />
          <View
            style={{
              justifyContent: 'center',
              alignSelf: 'center',
              marginBottom: 30,
              // marginTop:38
            }}>
            {console.log('4444 --> 666', photo)}
            {/* <Image
              source={photo?.path ? {uri: photo?.path} : Images?.DocumentImg}
              style={{height: 160, width: 260}}
            /> */}
            {photo?.path ? (
              <Image
                source={{uri: photo?.path}}
                style={{height: 180, width: 250}}
              />
            ) : photo ? (
              <Image
                source={{uri: photo}}
                style={{
                  height: 180,
                  width: 250,
                  resizeMode: 'contain',
                }}
              />
            ) : (
              <Image
                source={Images?.DocumentImg}
                style={{
                  height: 150,
                  width: 250,
                  resizeMode: 'contain',
                }}
              />
            )}
          </View>
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
              }}
      
             >
              <Typography textAlign={'center'} color={'white'} >
                {localization?.addNew?.Click_Here}
              </Typography>
            </Press>
           
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
          {/* <Typography
            fontFamily={Fonts.Inter_Medium}
            size={16}
            style={{marginTop: 5}}>
            {localization?.TemporaryPrDP?.document}
          </Typography>
          <View style={styles.container}>
            <View style={styles.dot} />
            <Typography style={{marginLeft: 15}}>
              {localization?.TemporaryPrDP?.Card}
            </Typography>
          </View>
          <View style={styles.container}>
            <View style={styles.dot} />
            <Typography style={{marginLeft: 15}}>
              {localization?.TemporaryPrDP?.License}
            </Typography>
          </View> */}
          <Date_Picker
            disablePastDates={true}
            title={localization?.TemporaryPrDP?.Date}
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
            title={localization?.TemporaryPrDP?.imp}
            sub_title={localization?.TemporaryPrDP?.clear}
          />
        </View>
      </ScrollView>
      <Button
        title={localization?.carDetails?.submit}
        onPress={() => {
          onSubmit();
        }}
        style_button={{backgroundColor: Colors?.Black, marginHorizontal: 20}}
      />
    </ContainerView>
  );
};

export default TemporaryPrDP;

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
