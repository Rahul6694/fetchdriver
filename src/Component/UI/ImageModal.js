import {
  StyleSheet,
  Modal,
  View,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import React from 'react';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';

import DocumentPicker from 'react-native-document-picker';
import {request, check, PERMISSIONS, RESULTS} from 'react-native-permissions';
import SimpleToast from 'react-native-simple-toast';
import {Typography} from '../Typography';
import {Images} from '../../Constants/Images';
import {Colors} from '../../Constants/Colors';
import {Fonts} from '../../Constants/Fonts';
import localization from '../../Constants/localization';
import {windowHeight} from '../../Constants/Dimensions';

const ImageModal = ({
  showModal,
  documents = false,
  document,
  close = () => {},
  selected = () => {},
  TimeVal,
  deleteImage = false,
}) => {
  const OsVer = Platform.constants['Release'];

  const getCameraPermission = () =>
    Platform.OS === 'ios' ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA;

  const getPhotoPermission = () =>
    Platform.OS === 'ios'
      ? PERMISSIONS.IOS.PHOTO_LIBRARY
      : OsVer > 12
      ? PERMISSIONS.ANDROID.READ_MEDIA_IMAGES
      : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;

  const handlePermission = async (permission, action) => {
    try {
      const result = await check(permission);

      if (result === RESULTS.GRANTED) {
        action();
      } else if (result === RESULTS.DENIED || result === RESULTS.LIMITED) {
        const requestResult = await request(permission);

        if (requestResult === RESULTS.GRANTED) {
          action();
        } else {
          SimpleToast.show(localization?.SimpleToast?.permission_denied);
        }
      } else if (result === RESULTS.BLOCKED) {
        SimpleToast.show(localization?.SimpleToast?.blocked);
      } else {
        SimpleToast.show(localization?.SimpleToast?.unknown);
      }
    } catch (error) {
      SimpleToast.show(localization?.SimpleToast?.occurred);
    }
  };

  const OpenCamera = async () => {
    await handlePermission(getCameraPermission(), () => {
      launchCamera(
        {
          mediaType: 'photo',
          maxWidth: 500,
          maxHeight: 500,
          quality: 0.7,
        },
        response => {
          if (!response.didCancel) {
            selected(response.assets, 'camera');
            close();
          }
        },
      );
    });
  };

  const OpenGallery = async () => {
    // Check and request permission for photo library
    await handlePermission(getPhotoPermission(), () => {
      // Launch the image picker after permission is granted
      launchImageLibrary(
        {
          mediaType: 'photo',
          maxWidth: 500,
          maxHeight: 500,
          quality: 0.7,
        },
        response => {
          if (!response.didCancel) {
            selected(response.assets, 'gallery');
            close();
          }
        },
      );
    });
  };

  const OpenDocumentPicker = async () => {
    try {
      const response = await DocumentPicker.pick({
        type: [
          DocumentPicker.types.pdf,
          DocumentPicker.types.doc,
          DocumentPicker.types.docx,
        ],
      });
      selected(response, 'document');
      close();
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
      } else {
        console.error(err);
      }
    }
  };

  return (
    <Modal
      statusBarTranslucent
      onRequestClose={() => close()}
      transparent={true}
      visible={showModal}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => close()}>
              <Image source={Images.close} style={{height: 20, width: 20}} />
            </TouchableOpacity>
          </View>
          <View
            style={[
              styles.modalView,
              {height: documents || deleteImage ? 220 : 200},
            ]}>
            <TouchableOpacity style={styles.checkView} onPress={OpenCamera}>
              <View style={styles.iconContainer}>
                <Image
                  style={styles.icon}
                  source={{
                    uri: 'https://cdn-icons-png.flaticon.com/128/685/685655.png',
                  }}
                />
              </View>
              <Typography
                size={16}
                color={Colors.black}
                style={{marginLeft: 15}}
                fontFamily={Fonts.Inter_Medium}>
                {localization?.imagemodal?.photo}
              </Typography>
            </TouchableOpacity>

            <TouchableOpacity style={styles.checkView} onPress={OpenGallery}>
              <View style={styles.iconContainer}>
                <Image
                  style={styles.icon}
                  source={{
                    uri: 'https://cdn-icons-png.flaticon.com/128/16025/16025439.png',
                  }}
                />
              </View>
              <Typography
                size={16}
                fontFamily={Fonts.Inter_Medium}
                color={Colors.black}
                style={{marginLeft: 15}}>
                {localization?.imagemodal?.gallery}
              </Typography>
            </TouchableOpacity>

            {document && (
              <TouchableOpacity
                style={styles.checkView}
                onPress={OpenDocumentPicker}>
                <View style={styles.iconContainer}>
                  <Image
                    style={styles.icon}
                    source={{
                      uri: 'https://cdn-icons-png.flaticon.com/128/2991/2991112.png',
                    }}
                  />
                </View>
                <Typography
                  size={16}
                  color={Colors.black}
                  fontFamily={Fonts.Inter_Medium}
                  style={{marginLeft: 15}}>
                  {localization?.imagemodal?.documents}
                </Typography>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ImageModal;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: Colors.black + '80',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    height: windowHeight / 4,
    ...Platform.select({
      ios: {
        shadowColor: 'black',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 15,
      },
    }),
  },
  modalHeader: {
    padding: 8,
    alignItems: 'flex-end',
    borderBottomWidth: 1,
    borderBottomColor: Colors.black,
    paddingHorizontal: 10,
  },
  checkView: {
    alignItems: 'center',
    flexDirection: 'row',
    width: '100%',
    marginBottom: 10,
  },
  modalView: {
    paddingHorizontal: 10,
    borderRadius: 10,
    marginTop: 20,
  },
  iconContainer: {
    borderRadius: 50,
    backgroundColor: Colors.bg_grey,
    height: 45,
    width: 45,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    height: 25,
    width: 25,
  },
});
