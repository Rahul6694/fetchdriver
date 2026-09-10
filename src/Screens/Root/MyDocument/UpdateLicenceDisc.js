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

const UpdateLicenceDisc = ({navigation, route}) => {
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
      photo: validators.checkRequire('Photo', photo?.path),
      licensExpiryDate: validators.checkExpiryDate(
        'License Expiry Date',
        licensExpiryDate,
      ),
    };
    setError(error);
    if (isValidForm(error)) {
      const combinedData = {
        ...personal_Data, // Include existing personal data
        RSAPhoto: photo,
        RSAExpiry: licensExpiryDate,
      };
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
        <MainTitle
          back={true}
          boldTitle={true}
          toptitle={'Take a photo of your RSA PrDP Card or Temporary PrDP'}
          subTitleStyle={{marginTop: 16}}
          subTitle={
            'Please upload your document according to the guidelines below.'
          }
        />
        <View style={{paddingHorizontal: 10}}>
          <WarningComponent
            title={'Do Not'}
            sub_title={
              'Upload irrelevant images (blank photos, selfies, random pictures) - This will delay your account activation'
            }
          />
          <View
            style={{
              justifyContent: 'center',
              alignSelf: 'center',
              marginBottom: 30,
            }}>
            <Image
              source={photo?.path ? {uri: photo?.path} : Images?.DocumentImg}
              style={{height: 160, width: 260}}
            />
            <Press
              onPress={() => {
                setOpenCamera(true);
              }}>
              <Typography
                textAlign={'center'}
                color={Colors?.selectedBorderColor}>
                Click here
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
          <Typography
            fontFamily={Fonts.Inter_Medium}
            size={16}
            style={{marginTop: 5}}>
            We accept the following documents:
          </Typography>
          <View style={styles.container}>
            <View style={styles.dot} />
            <Typography style={{marginLeft: 15}}>
              Driver's Licence Card with PrDP
            </Typography>
          </View>
          <View style={styles.container}>
            <View style={styles.dot} />
            <Typography style={{marginLeft: 15}}>
              Temporary Driver's License with PrDP
            </Typography>
          </View>
          <Date_Picker
            disablePastDates={true}
            title={'Expiry Date'}
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
            title={'IMPORTANT:'}
            sub_title={
              'Make sure that your document is not expired and you upload a clear picture'
            }
          />
        </View>
      </ScrollView>
      <Button
        title={'Take Photo'}
        onPress={() => {
          onSubmit();
        }}
        style_button={{backgroundColor: Colors?.Black, marginHorizontal: 20}}
      />
    </ContainerView>
  );
};

export default UpdateLicenceDisc;

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
