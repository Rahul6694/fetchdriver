import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
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
import CameraPicker from '../../../Component/CameraPicker';
import {isValidForm} from '../../../Backend/Utility';
import UploadDoc from '../../../Component/UploadDoc';
import {FULL_HEIGHT} from '../../../Constants/Layout';
import {
  GET_WITH_TOKEN,
  POST_FORMDATA_WITH_TOKEN,
} from '../../../Backend/Backend';
import {GET_DRIVER_PROFILE, UPDATE_DOCUMENT} from '../../../Backend/ApiRoutes';
import {useIsFocused} from '@react-navigation/native';
import {ToastMsg} from '../../../Component/ToastMsg';
import localization from '../../../Constants/localization';

const UpdateBusinessInsurence = ({navigation, route}) => {
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
    }
  }, [isFocus]);

  const GET_PROFILE = () => {
    setLoading(true);
    GET_WITH_TOKEN(
      GET_DRIVER_PROFILE,
      response => {
        console.log(response?.data, 'RESPOOOOOOO 999');
        setSinglsingleData(response?.data);
        setLoading(false);
        setGetImage(response?.data?.driver_details?.business_insurance);
        setLicenseExpiryDate(
          response?.data?.driver_details?.business_insurance_expiry_date,
        );
      },
      s => {
        console.log('🚀 ~ ManageProfile ~ s: 33', s);
        setLoading(false);
      },
      s => {
        Preference_to_contact: console.log('🚀 ~ ManageProfile ~ s:44', s);
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
      photo: validators.checkRequire(
        localization?.UploadDER?.photo,
        photo?.uri || getImage,
      ),
      licensExpiryDate: validators.checkExpiryDate(
        localization?.UploadDER?.license,
        licensExpiryDate,
      ),
    };
    console.log('MMMM 666', photo);
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

    console.log('Form data  ==>', formdata);
    let route = `${UPDATE_DOCUMENT}${type}`;
    console.log('route Here', route);
    if (isValidForm(error)) {
      setLoading(true);
      POST_FORMDATA_WITH_TOKEN(
        route,
        formdata,
        success => {
          console.log('sccess', success);
          setLoading(false);
          if (success?.success == true) {
            ToastMsg(success?.message);
            navigation.goBack();
          }
        },
        error => {
          console.log('error', error);
          setLoading(false);
        },
        fail => {
          console.log('fail', fail);
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
            {localization?.UpdateBusinessInsurence?.header}
          </Typography>
          <Typography
            color={Colors.lableColor}
            style={{marginVertical: 10}}
            lineHeight={22}>
            {localization?.UpdateBusinessInsurence?.make}
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
                alignSelf: 'center',
                marginTop: 20,
              }}>
              {!getImage && !photo?.uri ? (
                <Image
                  source={Images.insurance}
                  style={{height: 160, width: 260, resizeMode: 'contain'}}
                />
              ) : (
                <Image
                  source={{uri: photo?.uri || getImage}}
                  style={{height: 160, width: 260}}
                />
              )}

              <View
                style={{
                  padding: 10,
                  backgroundColor: 'rgba(43, 47, 47, 1)',
                  borderRadius: 50,
                  elevation: 2,
                  marginTop: 10,
                  justifyContent: 'center',
                  alignItems: 'center',
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
      )}
      <Button
        title={localization?.UpdateTemporary?.btn}
        onPress={() => {
          onSubmit('business-insurance');
        }}
        style_button={{backgroundColor: Colors?.Black}}
      />
    </ContainerView>
  );
};

export default UpdateBusinessInsurence;

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

// import {
//   ActivityIndicator,
//   Alert,
//   Image,
//   ScrollView,
//   StyleSheet,
//   Text,
//   View,
// } from 'react-native';
// import React, {useEffect, useRef, useState} from 'react';
// import {Header} from '../../../Component/HeaderContent';
// import {Colors} from '../../../Constants/Colors';
// import {Typography} from '../../../Component/Typography';
// import Button from '../../../Component/Button';
// import {Images} from '../../../Constants/Images';
// import SvgIcon from '../../../Component/UI/svg';
// import Press from '../../../Component/UI/Press';
// import {Fonts} from '../../../Constants/Fonts';
// import Date_Picker from '../../../Component/DatePicker';
// import WarningComponent from '../../../Component/WarningComponent';
// import ContainerView from '../../../Component/ContainerView';
// import HeaderWithBack from '../../../Component/HeaderWithBack';
// import {windowWidth} from '../../../Constants/Dimensions';
// import {useDispatch, useSelector} from 'react-redux';
// import {validators} from '../../../Backend/Validator';
// import {checkBox, personalData} from '../../../Redux/action';
// import ErrorBox from '../../../Component/ErrorBox';
// import CameraPicker from '../../../Component/CameraPicker';
// import {isValidForm} from '../../../Backend/Utility';
// import UploadDoc from '../../../Component/UploadDoc';
// import {useIsFocused} from '@react-navigation/native';
// import {
//   GET_WITH_TOKEN,
//   POST_FORMDATA_WITH_TOKEN,
// } from '../../../Backend/Backend';
// import {ToastMsg} from '../../../Component/ToastMsg';
// import {GET_DRIVER_PROFILE, UPDATE_DOCUMENT} from '../../../Backend/ApiRoutes';
// import {FULL_HEIGHT} from '../../../Constants/Layout';
// import localization from '../../../Constants/localization';

// const UpdateBusinessInsurence = ({navigation, route}) => {
//   const [loading, setLoading] = useState(false);
//   const [singleData, setSinglsingleData] = useState('');
//   const [licensExpiryDate, setLicenseExpiryDate] = useState('');
//   const [photo, setPhoto] = useState({});
//   const [error, setError] = useState('');
//   const [openCamera, setOpenCamera] = useState(false);
//   const [getImage, setGetImage] = React.useState('');
//   const isFocus = useIsFocused();

//   React.useEffect(() => {
//     if (isFocus) {
//       GET_PROFILE();
//       // setPhoto(singleData?.driver_details?.)
//     }
//   }, [isFocus]);

//   const GET_PROFILE = () => {
//     setLoading(true);
//     GET_WITH_TOKEN(
//       GET_DRIVER_PROFILE,
//       response => {
//         setSinglsingleData(response?.data);
//         setLoading(false);
//         setGetImage(response?.data?.driver_details?.business_insurance);
//         setLicenseExpiryDate(
//           response?.data?.driver_details?.business_insurance_expiry_date,
//         );
//         console.log("44444 =====4",response?.data?.driver_details?.business_insurance_expiry_date)
//       },
//       s => {
//         setLoading(false);
//       },
//       s => {
//         setLoading(false);
//       },
//     );
//   };

//   const formatDateWithDashes = dateString => {
//     const date = new Date(dateString);
//     const formattedDate = date.toLocaleDateString('en-GB');
//     return formattedDate.replace(/\//g, '-');
//   };

//   const onSubmit = type => {
//     const error = {
//       photo: validators.checkRequire(localization?.UploadDER?.photo, photo?.uri || getImage),
//       licensExpiryDate: validators.checkExpiryDate(
//         localization?.UploadDER?.license,
//         licensExpiryDate,
//       ),
//     };
//     let formdata = new FormData();
//     formdata.append('expiry_date', formatDateWithDashes(licensExpiryDate));
//     if (photo?.uri && photo?.type && photo?.name) {
//       formdata.append('image', {
//         uri: photo.uri,
//         type: photo.type,
//         name: photo.name,
//       });
//     }

//     setError(error);
//     console.log("444444+++ ==>",error)

//     console.log('Form data  ==>33', formdata);
//     let route = `${UPDATE_DOCUMENT}${type}`;
//     if (isValidForm(error)) {
//       setLoading(true);
//       POST_FORMDATA_WITH_TOKEN(
//         route,
//         formdata,
//         success => {
//           setLoading(false);
//           if (success?.success == true) {
//             ToastMsg(success?.message);
//             navigation.goBack();
//           }
//         },
//         error => {
//           setLoading(false);
//           console.log("my error",error)
//         },
//         fail => {
//           setLoading(false);
//           console.log("my error",fail)

//         },
//       );
//     }
//   };
//   return (
//     <ContainerView>
//       <HeaderWithBack source={Images.Back} headerHelp={true} />
//       {loading ? (
//         <View
//           style={{
//             height: FULL_HEIGHT,
//             justifyContent: 'center',
//             alignItems: 'center',
//             backgroundColor: 'white',
//           }}>
//           <ActivityIndicator
//             size="large"
//             color={Colors.Black}
//             style={styles.loader}
//           />
//         </View>
//       ) : (
//         <ScrollView showsVerticalScrollIndicator={false}>
//           <Typography
//             size={26}
//             fontFamily={Fonts.Inter_Bold}
//             color={Colors.Black}
//             style={{marginTop: 15}}>
//             {localization?.UpdateBusinessInsurence?.header}
//           </Typography>
//           <WarningComponent
//               title={localization?.DriverLicenceCard?.not}
//               sub_title={
//                 localization?.DriverLicenceCard?.upload
//               }
//             />
//             <View style={{flexDirection: 'row'}}>
//               <Typography size={16} lineHeight={22}>
//                 {localization?.UploadDER?.title}{' '}
//                 <Text style={{fontFamily: Fonts.Inter_Bold}}>
//                   {localization?.UploadDER?.sub_title}
//                 </Text>
//               </Typography>
//             </View>
//           <View style={{marginVertical: 30}}>
//             <View
//               style={{
//                 justifyContent: 'center',
//                 alignSelf: 'center',
//                 marginTop: 20,
//               }}>
//               {!getImage && !photo?.uri ? (
//                 <Image
//                   source={Images.Passport}
//                   style={{height: 160, width: 260, resizeMode: 'contain'}}
//                 />
//               ) : (
//                 <Image
//                   source={{uri: photo?.uri || getImage}}
//                   style={{height: 160, width: 260}}
//                 />
//               )}

//               <Press
//                 onPress={() => {
//                   setOpenCamera(true);
//                 }}>
//                 <Typography
//                   textAlign={'center'}
//                   color={Colors?.selectedBorderColor}>
//                  {localization?.UploadDER?.click}
//                 </Typography>
//               </Press>
//             </View>

//             {!!error?.photo && (
//               <ErrorBox message={error?.photo} style={{marginTop: 6}} />
//             )}

//             <UploadDoc
//               showModal={openCamera}
//               fileUpload={false}
//               close={() => {
//                 setOpenCamera(false);
//               }}
//               selected={(img, type) => {
//                 if (type === 'camera') {
//                   const camUpload = img?.map(item => ({
//                     camUri: item?.path,
//                     camType: item?.mime,
//                     camName: item?.path,
//                   }));

//                   setPhoto({
//                     uri: camUpload[0]?.camUri,
//                     type: camUpload[0]?.camType,
//                     name: camUpload[0]?.camName,
//                   });
//                 } else {
//                   setPhoto({
//                     uri: img?.path || img?.uri,
//                     type: img?.mime || img?.type,
//                     name: img?.name || 'image_name.png',
//                   });
//                 }
//                 setError({...error, photo: ''});
//               }}
//             />

//             <View style={{marginVertical: 30}}>

//               <UploadDoc
//                 showModal={openCamera}
//                 fileUpload={false}
//                 close={() => {
//                   setOpenCamera(false);
//                 }}
//                 selected={(img, type) => {
//                   if (type === 'camera') {
//                     const camUpload = img?.map(item => ({
//                       camUri: item?.path,
//                       camType: item?.mime,
//                       camName: item?.path,
//                     }));

//                     setPhoto({
//                       uri: camUpload[0]?.camUri,
//                       type: camUpload[0]?.camType,
//                       name: camUpload[0]?.camName,
//                     });
//                   } else {
//                     setPhoto({
//                       uri: img?.path || img?.uri,
//                       type: img?.mime || img?.type,
//                       name: img?.name || 'image_name.png',
//                     });
//                   }
//                   setError({...error, photo: ''});
//                 }}
//               />
//               {/* <Press
//             style={{
//               flexDirection: 'row',
//               alignItems: 'center',
//               marginTop: 9,
//               alignSelf: 'center',
//             }}>
//             <SvgIcon name="mGlass" />
//             <Typography style={{marginHorizontal: 7}} color="#7B7A77">
//               Zoom
//             </Typography>
//           </Press> */}
//             </View>

//             <Date_Picker
//               title={localization?.UploadSSR?.date}
//               allowFutureDates={true}
//               disablePastDates={true}
//               onChange={d => {
//                 setLicenseExpiryDate(d);
//               }}
//               selected_date={licensExpiryDate}
//               onConfirm={d => {
//                 setLicenseExpiryDate(d);
//               }}
//               error={error?.licensExpiryDate}
//             />
//             <WarningComponent
//               title={localization?.UploadSSR?.important}
//               sub_title={
//                 localization?.UploadSSR?.sure
//               }
//             />
//           </View>
//         </ScrollView>
//       )}
//       <Button
//         title={localization?.UpdateTemporary?.btn}
//         onPress={() => {
//           onSubmit('business-insurance');
//         }}
//         style_button={{backgroundColor: Colors?.Black}}
//       />
//     </ContainerView>
//   );
// };

// export default UpdateBusinessInsurence;

// const styles = StyleSheet.create({
//   container: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 10,
//   },
//   dot: {
//     height: 6,
//     width: 6,
//     backgroundColor: Colors.darkGrey,
//     borderRadius: 50,
//     alignSelf: 'center',
//   },
//   signUpContainer: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'red',
//     width: windowWidth / 2 + 80,
//   },
//   signUpText: {
//     marginLeft: 5,
//   },
// });
