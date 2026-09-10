import { Image, StyleSheet, Text, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { CommonView } from '../../../Component/CommonView';
import HeaderWithBack from '../../../Component/HeaderWithBack';
import { Images } from '../../../Constants/Images';
import Typography from '../../../Component/UI/Typography';
import { Colors } from '../../../Constants/Colors';
import { Fonts } from '../../../Constants/Fonts';
import { useNavigation } from '@react-navigation/native';
import ContainerView from '../../../Component/ContainerView';
import Button from '../../../Component/Button';
import UploadDoc from '../../../Component/UploadDoc';
import Press from '../../../Component/UI/Press';
import { useDispatch, useSelector } from 'react-redux';
import { checkBox, personalData } from '../../../Redux/action';
import { isValidForm } from '../../../Backend/Utility';
import { validators } from '../../../Backend/Validator';
import ErrorBox from '../../../Component/ErrorBox';
import localization from '../../../Constants/localization';

const ProfilePhotoUpload = ({ navigation, route }) => {
  const personal_Data = useSelector(store => store.personalData);
  const [photo, setPhoto] = useState(personal_Data?.photoForth);
  const [error, setError] = useState('');
  const [pickerModal, setPickerModal] = useState(false);

  const dispatch = useDispatch();

  // useEffect(() => {
  //   if (route?.params?.autoOpenPicker) {
  //     setPickerModal(true);
  //     navigation.setParams({ autoOpenPicker: false });
  //   }
  // }, [route?.params?.autoOpenPicker]);

  return (
    <ContainerView>
      <HeaderWithBack
        onBackPress={() => navigation.goBack()}
        source={Images.Back}
        headerHelp
      />
      <View style={styles.container}>
 <View style={styles.textContainer}>
          <Typography
            size={26}
            fontFamily={Fonts.Inter_Bold}
            color={Colors.Black}
            style={styles.title}
            textAlign="center">
            {localization?.ProfilePhotoUpload?.upload}
          </Typography>
          <Typography
            color={Colors?.lableColor}
            style={styles.description}
            textAlign="center">
            {localization?.ProfilePhotoUpload?.text}
          </Typography>
        </View>


        <View
          style={{
            height: 250,
            width: 250,
            // borderWidth: 0.5,
            justifyContent: 'center',
            alignSelf: 'center',
          }}>
          {photo?.path || photo?.uri ? (
            <Image
              source={{ uri: photo?.path || photo?.uri }}
              style={{ height: 250, width: 250 }}
            />
          ) : photo ? (
            <Image
              source={{ uri: photo }}
              style={{
                height: 250,
                width: 250,
                resizeMode: 'contain',
              }}
            />
          ) : (
            <Image
              source={Images?.Passport}
              style={{
                height: 250,
                width: 250,
                resizeMode: 'contain',
              }}
            />
          )}
          {/* {photo?.path ? (
            <Image
              source={{uri: photo?.path}}
              style={{height: 250, width: 250}}
            />
          ) : (
            <Image
              source={Images.Passport}
              style={{height: 250, width: 250, resizeMode: 'contain'}}
            />
          )} */}
        </View>
        {!!error?.photo && (
          <ErrorBox message={error?.photo} style={{ marginTop: 5 }} />
        )}
       
      </View>
      <UploadDoc
        showModal={pickerModal}
        fileUpload={false}
        close={() => {
          setPickerModal(false);
        }}
        selected={(img, type) => {
          const selectedImage = Array.isArray(img) ? img[0] : img;
          if (!selectedImage) {
            return;
          }
          const filePath = selectedImage?.path || selectedImage?.uri;
          const v = {
            path: filePath,
            uri: filePath,
            type: selectedImage?.type || selectedImage?.mime,
            name:
              selectedImage?.name ||
              selectedImage?.filename ||
              (typeof filePath === 'string' ? filePath.split('/').pop() : null) ||
              'image_name.jpg',
          };
          setPhoto(v);
          const combinedData = {
            ...personal_Data,
            photoForth: v,
          };
          dispatch(personalData(combinedData));
          // navigation.goBack();
        }}
      />
      <Button
        onPress={() => {
          setPickerModal(true);
        }}
        title={localization?.takeProfilePhoto?.takePhoto}
        style_button={{ backgroundColor: Colors?.Black }}
      />
       {  photo &&( <Button
              title={localization.carDetails?.submit}
              onPress={() => {
                navigation.goBack();
              }}
              style_button={{ backgroundColor: Colors?.Black,marginTop:-10 }}
            />)}
    </ContainerView>
  );
};

export default ProfilePhotoUpload;

const styles = StyleSheet.create({
  container: {
    // alignItems: 'center',
    // justifyContent: 'center',
    flex: 1,
  },
  image: {
    height: 250,
    width: 250,
    marginTop: 50,
  },
  textContainer: {
    marginVertical: 15,
    paddingHorizontal: 20,

  },
  title: {
    marginTop: 15,
  },
  description: {
    marginVertical: 10,
  },
});
