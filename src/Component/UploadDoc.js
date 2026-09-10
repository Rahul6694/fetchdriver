import React, {useRef, useState} from 'react';
import {View, StyleSheet, Modal, Platform, Linking, Alert} from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import ImageCropPicker from 'react-native-image-crop-picker';
import {PERMISSIONS, RESULTS, check, request} from 'react-native-permissions';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import SvgIcon from './UI/svg';
import Press from './UI/Press';
import {Typography} from './Typography';
import {Fonts} from '../Constants/Fonts';
import {Colors} from '../Constants/Colors';
import SimpleToast from 'react-native-simple-toast';
import {FULL_WIDTH} from '../Constants/Layout';
import localization from '../Constants/localization';

const UploadDoc = ({
  multiple = false,
  showModal,
  close = () => {},
  selected = () => {},
  mediaType = 'photo',
  fileUpload = false,
  SelectMultiple = false,
  width = 600,
  height = 600,
  cropping = false,
}) => {
  const [isFileDisabled, setIsFileDisabled] = useState(false);
  const pendingAfterDismissRef = useRef(null);
  const insets = useSafeAreaInsets();
  const getCameraPermission = () =>
    Platform.OS === 'ios' ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA;

  const getPhotoPermission = () =>
    Platform.OS === 'ios' ? PERMISSIONS.IOS.PHOTO_LIBRARY : null; // Android no longer needs runtime permission for photo picker (uses PICK intent)

  const normalizePickerResult = result => {
    if (!result) return [];
    return Array.isArray(result) ? result : [result];
  };
  const normalizeForImageView = (files = []) => {
  return files.map(file => {
    let uri =
      Platform.OS === 'android'
        ? file.path || file.uri
        : file.path || file.sourceURL || file.uri;

    if (Platform.OS === 'ios' && uri && typeof uri === 'string') {
      if (uri.startsWith('file://')) {
        // already valid
      } else if (uri.startsWith('/')) {
        uri = `file://${uri}`;
      }
    }
    
    const filename =
      file.filename ||
      (typeof uri === 'string' ? uri.split('/').pop() : null) ||
      `image_${Date.now()}.jpg`;
    
    return {
      ...file,
      uri,
      type: file.mime || file.type || 'image/jpeg',
      name: filename,
    };
  });
};

  const runAfterModalDismissed = onReady => {
    // Dismiss the RN Modal before presenting the native picker (iOS rejects nested
    // presentation). On iOS, a fixed setTimeout is unreliable: the delay can fire
    // before UIKit finishes dismissing, so the picker never appears. Use Modal's
    // onDismiss instead (see below). Android keeps a short post-close delay.
    pendingAfterDismissRef.current = onReady;
    close();
    if (Platform.OS !== 'ios') {
      setTimeout(() => {
        const fn = pendingAfterDismissRef.current;
        pendingAfterDismissRef.current = null;
        if (fn) {
          fn();
        }
      }, 150);
    }
  };

  const pickerErrorMessage = error => {
    if (!error || error?.code === 'E_PICKER_CANCELLED') {
      return null;
    }
    return error?.message || error?.localizedDescription || String(error);
  };

 const OpenCamera = async () => {
 
  const permission = getCameraPermission();
  const result = await check(permission);

  if (result === RESULTS.GRANTED) {
    // 2. Dismiss Modal and wait for it to be fully closed
    runAfterModalDismissed(() => {
      ImageCropPicker.openCamera({
        width: 500,
        height: 500,
        cropping: false, // If you want cropping
        mediaType: 'photo',
        // iOS TOCropViewController: same as gallery — hide rotate/reset and clamp controls
        ...(Platform.OS === 'ios' && {cropperRotateButtonsHidden: true}),
      })
        .then(image => {
          const files = normalizePickerResult(image);
          const normalized = normalizeForImageView(files);
          selected(normalized, 'camera');
        })
        .catch(error => {
          const msg = pickerErrorMessage(error);
          if (msg) SimpleToast.show(msg);
        });
    });
  } else {
    // 3. If not granted, request it
    handlePermission(permission, OpenCamera);
  }
};

  const openGalleryPicker = () => {
  ImageCropPicker.openPicker({
    width: 500,
    height: 500,
    cropping: true,
    mediaType: 'photo',
    // iOS TOCropViewController: hides rotate/reset and removes clamp (aspect) controls
    ...(Platform.OS === 'ios' && {cropperRotateButtonsHidden: true}),
  })
    .then(image => {
      const files = normalizePickerResult(image);
      const normalized = normalizeForImageView(files);
      selected(normalized, 'gallery');
    })
    .catch(error => {
      const msg = pickerErrorMessage(error);
      if (msg) SimpleToast.show(msg);
    });
};

  const OpenGallery = async () => {
    const permission = getPhotoPermission();

    // Android no longer needs runtime permission for photo picker (uses PICK intent)
    if (permission === null) {
      runAfterModalDismissed(openGalleryPicker);
    } else {
      await handlePermission(permission, () => {
        runAfterModalDismissed(openGalleryPicker);
      });
    }
  };

  const selectFiles = async () => {
    try {
      const results = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
        allowMultiSelection: SelectMultiple,
      });

      // Check for valid file extensions
      const validExtensions = ['.pdf', '.doc', '.docx'];
      const isValidFile = results.every(file =>
        validExtensions.some(ext => file.name.toLowerCase().endsWith(ext)),
      );

      if (!isValidFile) {
        SimpleToast.show(localization?.SimpleToast?.doc);
        return; // Exit if file type is invalid
      }

      setIsFileDisabled(false); // Enable "File" option after a valid file is selected
      close();
      selected(SelectMultiple ? results : results[0]);
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        SimpleToast.show(localization?.SimpleToast?.file);
      } else {
        SimpleToast.show(localization?.SimpleToast?.error);
      }
    }
  };

  const handlePermission = async (permission, action) => {
    try {
      const result = await check(permission);

      if (result === RESULTS.GRANTED) {
        action();
      } else if (
        result === RESULTS.LIMITED &&
        permission === PERMISSIONS.IOS.PHOTO_LIBRARY
      ) {
        action();
      } else if (result === RESULTS.DENIED) {
        const requestResult = await request(permission);

        if (
          requestResult === RESULTS.GRANTED ||
          requestResult === RESULTS.LIMITED
        ) {
          action();
        } else {
          SimpleToast.show(localization?.ImageModal?.Permission);
          Linking?.openSettings();
        }
      } else if (result === RESULTS.BLOCKED) {
        SimpleToast.show(localization?.ImageModal?.blocked);
        Linking?.openSettings();
      } else {
        SimpleToast.show('Unknown permission status');
      }
    } catch (error) {
      SimpleToast.show('Error checking permission');
    }
  };
  return (
    <>
      <Modal
        statusBarTranslucent={true}
        onRequestClose={() => close()}
        onDismiss={() => {
          if (Platform.OS !== 'ios') {
            return;
          }
          const fn = pendingAfterDismissRef.current;
          pendingAfterDismissRef.current = null;
          if (!fn) {
            return;
          }
          // Defer one tick so the modal window is fully released before present.
          setTimeout(fn, 0);
        }}
        transparent={true}
        style={styles?.mainContainer}
        visible={showModal}
        animationType="fade"
        presentationStyle="overFullScreen">
        <View style={styles.modalContainer}>
          <Press style={styles.TouchArea} onPress={() => close()} />
          <View
            style={[
              styles.bottomModal,
              {paddingBottom: Math.max(insets.bottom, 12)},
            ]}>
            <View style={styles.modalShowSection}>
              <View style={[styles.modalView, {}]}>
                <Press style={styles.checkView} onPress={OpenCamera}>
                  <SvgIcon name="camera" />
                  <Typography
                    color={Colors?.selectGreen}
                    style={{marginTop: 10}}
                    type={Fonts?.Inter_Medium}
                    size={16}>
                    {localization?.imagemodal?.Camera}
                  </Typography>
                </Press>

                <Press style={styles.checkView} onPress={OpenGallery}>
                  <SvgIcon name="Gallery" />
                  <Typography
                    color={Colors?.selectGreen}
                    style={{marginTop: 10}}
                    type={Fonts?.Inter_Medium}
                    size={16}>
                    {localization?.imagemodal?.gal}
                  </Typography>
                </Press>

                {fileUpload && (
                  <Press
                    style={styles.checkView}
                    onPress={selectFiles}
                    disabled={isFileDisabled}>
                    <SvgIcon name="File" />
                    <Typography
                      color={Colors?.selectGreen}
                      style={{marginTop: 10}}
                      type={Fonts?.Inter_Medium}
                      size={16}>
                      {localization?.imagemodal?.file}
                    </Typography>
                  </Press>
                )}
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    height: '100%',
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  TouchArea: {
    height: '50%',
    width: '100%',
    backgroundColor: 'transparent',
  },
  bottomModal: {
    width: FULL_WIDTH * 0.99,
    justifyContent: 'center',
    backgroundColor: 'white',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  modalShowSection: {
    marginHorizontal: 20,
    padding: 20,
  },
  modalView: {
    paddingVertical: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  checkView: {
    alignItems: 'center',
  },
});

export default UploadDoc;
