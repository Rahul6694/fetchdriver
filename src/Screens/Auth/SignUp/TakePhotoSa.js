import { Image, ScrollView, StyleSheet, View } from 'react-native';
import React, { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../../Constants/Colors';
import { Typography } from '../../../Component/Typography';
import Button from '../../../Component/Button';
import { Images } from '../../../Constants/Images';
import UploadDoc from '../../../Component/UploadDoc';
import Press from '../../../Component/UI/Press';
import { useDispatch, useSelector } from 'react-redux';
import { personalData } from '../../../Redux/action';
import localization from '../../../Constants/localization';
import HeaderWithBack from '../../../Component/HeaderWithBack';
import ContainerView from '../../../Component/ContainerView';
import { Fonts } from '../../../Constants/Fonts';


const TakePhotoSa = ({ navigation }) => {
  const dispatch = useDispatch();
  const personal_Data = useSelector(store => store.personalData);
  const insets = useSafeAreaInsets();

  const [photo, setPhoto] = useState(personal_Data?.trnDoc);
  const [pickerModal, setPickerModal] = useState(false);

  const normalizePhoto = selectedImage => {
    const filePath = selectedImage?.path || selectedImage?.uri;
    return {
      path: filePath,
      uri: filePath,
      type: selectedImage?.type || selectedImage?.mime,
      name:
        selectedImage?.name ||
        selectedImage?.filename ||
        (typeof filePath === 'string' ? filePath.split('/').pop() : null) ||
        'image_name.jpg',
    };
  };

  return (
    <ContainerView>
      <HeaderWithBack source={Images.Back} headerHelp={true} />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ backgroundColor: Colors?.Primary }}>
          <Typography
            size={26}
            fontFamily={Fonts.Inter_Bold}
            color={Colors.Black}
            style={{ marginTop: 15 }}>
            {localization.takeProfilePhoto.takeProfilePhoto1}
          </Typography>
          <Typography
            color={Colors?.lableColor}
            style={{ marginVertical: 10 }}
            lineHeight={22}>
            {localization.takeProfilePhoto.photoNote}
          </Typography>
          <Instruction
            title={localization.takeProfilePhoto.photoGuidelines[0]}
          />
          <Instruction
            title={localization.takeProfilePhoto.photoGuidelines[1]}
          />
          <Instruction
            title={localization.takeProfilePhoto.photoGuidelines[2]}
          />
          <View
            style={{
              alignItems: 'center',
              alignSelf: 'center',
              justifyContent: 'center',
              height: 250,
              width: 250,
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
                source={Images?.from1}
                style={{
                  height: 250,
                  width: 250,
                  resizeMode: 'contain',
                }}
              />
            )}
          </View>
          {/* {photo?.path && (
            <Press
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
            </Press>
          )} */}
          <View
            style={{
              paddingHorizontal: 20,
              paddingVertical: 16,
            }}>
            <Typography color={Colors?.textColor}>
              {localization.takeProfilePhoto.fetchNote}
              <Press
                onPress={() => {
                  navigation?.navigate('TermsAndConditions', {
                    slug: 'take-photo-signup',
                    name: 'Learn more',
                  });
                }}>
                <Typography
                  color={Colors?.selectGreen}
                  style={{ textDecorationLine: 'underline' }}>
                  {' '}
                  {localization.takeProfilePhoto.learnMore}
                </Typography>
              </Press>
            </Typography>
          </View>
        </View>
      </ScrollView>

      <View
        style={{
          paddingHorizontal: 20,
          paddingBottom: Math.max(insets.bottom, 20),
        }}>
        <Button
          title={localization.takeProfilePhoto.takePhoto}
          onPress={() => {
            setPickerModal(true);
          }}
          style_button={{ backgroundColor: Colors?.Black }}
        />

        {photo && (
          <Button
            title={localization.carDetails?.submit}
            onPress={() => {
              navigation.goBack();
            }}
            style_button={{ backgroundColor: Colors?.Black, marginTop: 12 }}
          />
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
          const v = normalizePhoto(selectedImage);
          setPhoto(v);
          const combinedData = {
            ...personal_Data,
            trnDoc: v,
          };
          dispatch(personalData(combinedData));
        }}
      />
    </ContainerView>
  );
};

export default TakePhotoSa;
export const Instruction = ({ title }) => {
  return (
    <View style={{ marginVertical: 12 }}>
      <Typography color={Colors?.textColor}>{title}</Typography>
    </View>
  );
};
const styles = StyleSheet.create({});
