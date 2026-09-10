import React, {useEffect} from 'react';
import {Platform} from 'react-native';
import {PERMISSIONS, RESULTS, check, request} from 'react-native-permissions';
import ImagePicker from 'react-native-image-crop-picker';
import localization from '../Constants/localization';
import SimpleToast from 'react-native-simple-toast';

const CameraPicker = ({onSelect, sheetRef, open, size, onClose,cropping = false,height,useFrontCamera = false}) => {
  const isIos = Platform.OS === 'ios';
  const imagePickerOptions = {
    // width: size ? size : 500, // Width of the image in pixels
    // height: height ? height : 500, // Height of the image in pixels
    cropping: cropping, // Enables cropping after the image is taken
    cropperCircleOverlay: false, // Circular crop option, if enabled
    compressImageQuality: 0.4, // Compress image to a percentage (0-1)
    includeBase64: true, // Returns base64 data of the image
    mediaType: 'photo', // Could be 'photo' or 'video'
    includeExif: true, // Includes EXIF data (e.g., GPS, orientation)
    useBackCamera: true,
    useFrontCamera: useFrontCamera,
  cropperRotateButtonsHidden: true, // iOS only
  enableRotationGesture: false,     // Android: disables rotate gesture only
  hideBottomControls: false, 
  };
  const mediaType = 'photo';
  // Function to check the camera permission
  const checkCameraPermission = () => {
    check(!isIos ? PERMISSIONS.ANDROID.CAMERA : PERMISSIONS.IOS.CAMERA)
      .then(result => {
        switch (result) {
          case RESULTS.UNAVAILABLE:
            requestCameraPermission();
            SimpleToast.show(
              localization?.SimpleToast?.not_available
            );

            break;
          case RESULTS.DENIED:
            requestCameraPermission();
            break;
          case RESULTS.LIMITED:
            requestCameraPermission();
            break;
          case RESULTS.GRANTED:
            cameraClick();
            break;
          case RESULTS.BLOCKED:
            SimpleToast.show(
              localization?.SimpleToast?.permission
            );
            break;
        }
      })
      .catch(error => {
        SimpleToast.show(
          localization?.SimpleToast?.permission
        );
      });
  };

  const requestCameraPermission = () => {
    request(isIos ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA)
      .then(result => {
        if (result == 'blocked') {
          SimpleToast.show(
            localization?.SimpleToast?.not_available
          );
          onClose();
        }
        if (result === 'granted') cameraClick();
        else if (result === 'denied') checkCameraPermission();
      })
      .catch(e => console.warn(e, '=sd'));
  };
  const cameraClick = async () => {
    try {
      const image = await ImagePicker.openCamera(imagePickerOptions);
      const data = {name: image.path, path: image.path, type: image.mime};
      onSelect(data);
    } catch (error) {
      onSelect();
    }
  };
  // const cameraClick = () => {

  //   setTimeout(() => {
  //     openCamera({
  //       mediaType: mediaType,
  //       width: 500,
  //       height: 500,
  //       cropping: mediaType != 'video',
  //       forceJpg: true,
  //     })
  //       .then(async response => {
  //         // let arr = [];
  //         // arr?.push(response);
  //         onSelect(response);
  //         onClose();
  //       })
  //       .catch(err => {
  //         onClose();
  //       });
  //   }, 200);
  // };

  useEffect(() => {
    if (open) {
      checkCameraPermission();
    }
  }, [open]);

  return null;
};

export default CameraPicker;
