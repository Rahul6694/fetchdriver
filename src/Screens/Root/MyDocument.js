import {
  StyleSheet,
  TouchableOpacity,
  View,
  Image,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import ContainerView from '../../Component/ContainerView';
import HeaderWithBack from '../../Component/HeaderWithBack';
import {Images} from '../../Constants/Images';
import Typography from '../../Component/UI/Typography';
import {Fonts} from '../../Constants/Fonts';
import {Colors} from '../../Constants/Colors';
import {windowWidth} from '../../Constants/Dimensions';
import {useDispatch, useSelector} from 'react-redux';
import {
  isAuth,
  personalData,
  updateAuthData,
  userDetails,
} from '../../Redux/action';
import {GET_WITH_TOKEN, POST_FORM_DATA} from '../../Backend/Backend';
import {GET_DRIVER_PROFILE, SIGNUP_STEP_4} from '../../Backend/ApiRoutes';
import {useIsFocused} from '@react-navigation/native';
import CommonModal from '../../Component/UI/CommonModal';
import {MainTitle} from '../../Component/HeaderContent';
import {ToastMsg} from '../../Component/ToastMsg';
import {setOTPToken, setToken} from '../../Constants/AsyncStorage';
import {FULL_HEIGHT} from '../../Constants/Layout';
import moment from 'moment';

const PHOTO_PICKER_SCREENS = [
  'ProfilePhotoUpload',
  'TemporaryPrDP',
  'UploadSSR',
  'UploadDER',
];

const SetupAccount = ({navigation, route}) => {
  const navigateToItem = screen => {
    if (!screen) {
      return;
    }
    if (PHOTO_PICKER_SCREENS.includes(screen)) {
      navigation.navigate(screen, {autoOpenPicker: true});
    } else {
      navigation.navigate(screen);
    }
  };
  const personal_Data = useSelector(store => store.personalData);

  const token = route?.params?.token;
  const dispatch = useDispatch();
  const isFocus = useIsFocused();
  const [loading, setLoading] = useState(false);
  const check_Box = useSelector(store => store.check_box);
  const [singleData, setSinglsingleData] = useState('');

  const [btnloader, setbtnloader] = useState(false);
  const [modal, setModal] = useState(false);
  useEffect(() => {
    if (isFocus) {
      GET_PROFILE();
    }
  }, [isFocus]);
  const GET_PROFILE = () => {
    setLoading(true);
    GET_WITH_TOKEN(
      GET_DRIVER_PROFILE,
      response => {
        setSinglsingleData(response?.data);
        setLoading(false);

        // dispatch(updateAuthData(response?.data));
      },
      s => {
        setLoading(false);
      },
      s => {
        setLoading(false);
      },
    );
  };

  const data = [
    {
      key: '1',
      icon: Images?.TermsandConditions,
      name: 'Driver Licence Card',
      active: personal_Data?.terms ? true : false,
      navigate: 'Terms_Condition',
      check_icon: personal_Data?.terms
        ? Images?.circle_checkbox
        : Images.checkbox,
      subtitle: `Expiry ${moment(
        singleData?.driver_details?.license_expiry_date,
      ).format('DD MMMM YYYY')}`,
    },
    {
      key: '2',
      icon: Images?.TermsandConditions,
      active: personal_Data?.photoForth ? true : false,
      name: 'Licence Disc',
      navigate: 'ProfilePhotoUpload',
      check_icon: personal_Data?.photoForth
        ? Images?.circle_checkbox
        : Images.checkbox,
      subtitle: 'Expiry 12 march 2028',
    },
    {
      key: '3',
      icon: Images?.TermsandConditions,
      name: 'Vehicle Inspection Report',
      navigate: 'TemporaryPrDP',
      subtitle: `Expiry ${moment(
        singleData?.driver_details?.vehicle_inspection_expiry_date,
      ).format('DD MMMM YYYY')}`,
      active: personal_Data?.RSAPhoto ? true : false,
      check_icon: Images?.ic_upload_doc,
      // check_icon: personal_Data?.RSAPhoto
      //   ? Images?.circle_checkbox
      //   : Images.checkbox,
    },
    {
      key: '4',
      icon: Images?.ic_passportImg,
      name: 'RSA PrDP Card or Temperory PrDP Card',
      navigate: 'UploadSSR',
      subtitle: `Expiry ${moment(
        singleData?.driver_details?.rsa_prdp_card_expiry,
      ).format('DD MMMM YYYY')}`,
      active: personal_Data?.SSRPhoto ? true : false,
      check_icon: personal_Data?.SSRPhoto
        ? Images?.circle_checkbox
        : Images.checkbox,
    },
    {
      key: '6',
      icon: Images?.ic_security,
      name: 'Safety Screening Result',
      subtitle: `Expiry ${moment(
        singleData?.driver_details?.safety_screening_expiry,
      ).format('DD MMMM YYYY')}`,
      navigate: 'UploadDER',
      active: personal_Data?.SSRPhoto ? true : false,
      active: personal_Data?.DERPhoto ? true : false,
      check_icon: personal_Data?.DERPhoto
        ? Images?.circle_checkbox
        : Images.checkbox,
    },
    {
      key: '7',
      icon: Images?.TermsandConditions,
      name: 'Driving evaluation report',
      subtitle: 'Expiry 12 march 2028',
      active: personal_Data?.VISTerms ? true : false,
      navigate: '',
      check_icon: personal_Data?.VISTerms
        ? Images.squre_checkbox
        : Images.checkbox,
    },
    {
      key: '8',
      icon: Images?.TermsandConditions,
      name: 'Business Insurance',
      subtitle: 'Expiry 12 march 2028',
      active: personal_Data?.VISTerms ? true : false,
      navigate: '',
      check_icon: personal_Data?.VISTerms
        ? Images.squre_checkbox
        : Images.checkbox,
    },
    {
      key: '9',
      icon: Images?.TermsandConditions,
      name: 'Personal Liability Cover',
      subtitle: 'Expiry 12 march 2028',
      active: personal_Data?.VISTerms ? true : false,
      navigate: '',
      check_icon: personal_Data?.VISTerms
        ? Images.squre_checkbox
        : Images.checkbox,
    },
  ];

  const formatDateWithDashes = dateString => {
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString('en-GB');
    return formattedDate.replace(/\//g, '-');
  };
  const SetupAccount = async () => {
    setbtnloader(true);
    const formdata = new FormData();
    formdata.append(
      'profile_photo',
      personal_Data?.photoForth && {
        uri: personal_Data?.photoForth?.path,
        type: personal_Data?.photoForth?.type,
        name: personal_Data?.photoForth?.name,
      },
    );
    formdata.append(
      'rsa_prdp_card',
      personal_Data?.RSAPhoto && {
        uri: personal_Data?.RSAPhoto?.path,
        type: personal_Data?.RSAPhoto?.type,
        name: personal_Data?.RSAPhoto?.name,
      },
    );
    formdata.append(
      'rsa_prdp_card_expiry',
      formatDateWithDashes(personal_Data?.RSAExpiry),
    ); //date
    formdata.append(
      'safety_screening',
      personal_Data?.SSRPhoto && {
        uri: personal_Data?.SSRPhoto?.path,
        type: personal_Data?.SSRPhoto?.type,
        name: personal_Data?.SSRPhoto?.name,
      },
    );
    formdata.append(
      'safety_screening_expiry',
      formatDateWithDashes(personal_Data?.SSRExpiry),
    ); //date
    formdata.append(
      'driving_evalution_report',
      personal_Data?.DERPhoto && {
        uri: personal_Data?.DERPhoto?.path,
        type: personal_Data?.DERPhoto?.type,
        name: personal_Data?.DERPhoto?.name,
      },
    );
    formdata.append(
      'driving_evalution_report_expiry',
      formatDateWithDashes(personal_Data?.DERExpiry),
    ); //date

    POST_FORM_DATA(
      `${SIGNUP_STEP_4}${personal_Data?.verify_token}`,
      formdata,
      async success => {
        if (success?.status == 'success') {
          setbtnloader(false);

          setModal(true);
          setOTPToken(success?.data?.verify_token);
          setToken(success?.token);
          dispatch(personalData({}));
          setTimeout(() => {
            setModal(false);
            dispatch(userDetails(success?.data));
            dispatch(updateAuthData(success?.data));
            dispatch(isAuth(true));
          }, 7000);
        } else {
          setbtnloader(false);
          // SimpleToast.show(success?.msg);
        }
        // SimpleToast.show(success?.msg);
        setbtnloader(false);
      },
      error => {
        setbtnloader(false);
        // SimpleToast.show(error?.msg);
      },
      fail => {
        setbtnloader(false);
      },
    );
  };

  const OnAPICALL = () => {
    let inactiveItems = []; // Array to collect names of inactive items

    // Check items one by one
    data.forEach(item => {
      if (!item?.active) {
        if (item?.name === 'Virtual Information Session') {
          // Automatically activate "Virtual Information Session"
          item.active = true;
        } else if (
          item?.name === 'Terms and Conditions' ||
          item?.name === 'Profile Photo' ||
          item?.name === 'RSA PrDP Card or Temporary PrDP' ||
          item?.name === 'Safety Screening Results' ||
          item?.name === 'Driving Evaluation Report'
        ) {
          // Add specific inactive items to the list
          inactiveItems.push(item?.name);
        }
      }
    });

    // Function to handle sequential acceptance
    const checkNextCondition = index => {
      if (index < inactiveItems.length) {
        const currentCondition = inactiveItems[index];
        ToastMsg(`Please complete or accept: ${currentCondition}`, {
          action: {
            label: 'Accept',
            onPress: () => {
              // Mark the current item as active
              const itemIndex = data.findIndex(
                i => i.name === currentCondition,
              );
              if (itemIndex > -1) {
                data[itemIndex].active = true;
              }
              // Check the next condition
              checkNextCondition(index + 1);
            },
          },
        });
      } else {
        // If all items are accepted, proceed with the final steps
        const combinedData = {
          ...personal_Data, // Include existing personal data
          VISTerms: true, // Add or update the VISTerms property
        };

        // Dispatch the updated data
        dispatch(personalData(combinedData));
        SetupAccount();
      }
    };

    // Start checking conditions one by one
    if (inactiveItems.length > 0) {
      checkNextCondition(0);
    } else {
      // If no inactive items, proceed with dispatch
      const combinedData = {
        ...personal_Data, // Include existing personal data
        VISTerms: true, // Add or update the VISTerms property
      };

      // Dispatch the updated data
      dispatch(personalData(combinedData));
      SetupAccount();
    }
  };

  return (
    <ContainerView>
      <HeaderWithBack
        title={'My Document'}
        source={Images.Back}
        headerHelp={false}
        showSpace={false}
      />
      {/* <MainTitle
          subHeader={true}
          boldTitle={true}
          // mainPadding={0}
          stepImg={Images?.Step4}
          toptitle={'Welcome, John Smith'}
          subTitle={'Here’s what you need to do to set up your account.'}
          help={true}
        /> */}
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
        <FlatList
          data={data}
          showsVerticalScrollIndicator={false}
          renderItem={({item}) => {
            return (
              <View>
                <TouchableOpacity
                  style={styles.menuButton}
                  onPress={() => {
                    if (item?.name != 'Virtual Information Session') {
                      navigateToItem(item?.navigate);
                    }
                  }}>
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <View style={styles.iconContainer}>
                      <Image source={item.icon} style={styles.icon} />
                    </View>
                    <View style={{width: windowWidth / 2 + 40}}>
                      <Typography
                        size={16}
                        lineHeight={19}
                        fontFamily={Fonts.Inter_Medium}
                        color={Colors.Black}>
                        {item?.name}
                      </Typography>
                      {item.subtitle && (
                        <Typography
                          size={12}
                          color={
                            item.name === 'Terms and Conditions'
                              ? Colors.blue
                              : Colors.Black
                          }
                          style={{marginVertical: 5}}>
                          {item.subtitle}
                        </Typography>
                      )}
                    </View>
                  </View>
                  {/* <TouchableOpacity
                    onPress={() => {
                      OnAPICALL(data);
                    }}>
                    <Image
                      source={item.check_icon}
                      style={{height: 26, width: 26}}
                    />
                  </TouchableOpacity> */}
                </TouchableOpacity>
              </View>
            );
          }}
        />
      )}
      <CommonModal
        visible={modal}
        close={() => {
          setModal(false);
          dispatch(isAuth(true));
          // navigation?.navigate('Login');
        }}
        button
        noBtn
        yesBtn></CommonModal>
    </ContainerView>
  );
};

export default SetupAccount;

const styles = StyleSheet.create({
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderColor,
  },
  iconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
    backgroundColor: '#E7E9E766',
    marginRight: 16,
  },
  icon: {
    width: 14.5,
    height: 15,
    tintColor: Colors.Black,
  },
  separator: {
    alignItems: 'center',
    borderColor: '#ECECEC',
    borderWidth: 0.5,
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
  },
  image_Container: {
    flexDirection: 'row',
    width: 150,
    justifyContent: 'space-between',
  },
  image: {
    height: 30,
    width: 30,
  },
});
