import {
  StyleSheet,
  TouchableOpacity,
  View,
  Image,
  FlatList,
  Alert,
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
import {POST_FORM_DATA} from '../../Backend/Backend';
import {SIGNUP_STEP_4, SIGN_UPDATE} from '../../Backend/ApiRoutes';
import {useIsFocused} from '@react-navigation/native';
import CommonModal from '../../Component/UI/CommonModal';
import {MainTitle} from '../../Component/HeaderContent';
import {ToastMsg} from '../../Component/ToastMsg';
import {setOTPToken, setToken} from '../../Constants/AsyncStorage';
import {all} from 'axios';
import localization from '../../Constants/localization';
import ErrorBox from '../../Component/ErrorBox';
import Button from '../../Component/Button';

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
  const check_Box = useSelector(store => store.check_box);
  const isFocus = useIsFocused();
  const [error, setError] = useState([]);
  const [btnloader, setbtnloader] = useState(false);
  const [modal, setModal] = useState(false);
  const [lastStep,setLastStep] = useState(false)


  const data = [
    {
      key: '1',
      icon: Images?.TermsandConditions,
      name: localization?.setUpAccount?.terms,
      active: personal_Data?.terms ? true : false,
      navigate: 'Terms_Condition',
      check_icon: personal_Data?.terms
        ? Images?.circle_checkbox
        : Images.checkbox,
      subtitle: localization?.setUpAccount?.recommend,
    },
    {
      key: '2',
      icon: Images?.ic_Profile,
      active: personal_Data?.photoForth ? true : false,
      name: localization?.setUpAccount?.profile,
      navigate: 'ProfilePhotoUpload',
      check_icon: personal_Data?.photoForth
        ? Images?.circle_checkbox
        : Images.checkbox,
    },
    {
      key: '3',
      icon: Images?.TermsandConditions,
      name: localization?.setUpAccount?.rsa,
      navigate: 'TemporaryPrDP',
      active: personal_Data?.RSAPhoto ? true : false,
      check_icon: personal_Data?.RSAPhoto
        ? Images?.circle_checkbox
        : Images.checkbox,
    },
    {
      key: '4',
      icon: Images?.DataProviders,
      name: localization?.setUpAccount?.safety,
      navigate: 'UploadSSR',
      active: personal_Data?.SSRPhoto ? true : false,
      check_icon: personal_Data?.SSRPhoto
        ? Images?.circle_checkbox
        : Images.checkbox,
    },
    {
      key: '6',
      icon: Images?.Ride,
      name: localization?.setUpAccount?.driving,
      navigate: 'UploadDER',
      active: personal_Data?.DERPhoto ? true : false,
      check_icon: personal_Data?.DERPhoto
        ? Images?.circle_checkbox
        : Images.checkbox,
    },
    {
      key: '7',
      icon: Images?.TermsandConditions,
      name: localization?.setUpAccount?.virtual,
      active: personal_Data?.lastStep  ? true : false,
      navigate: '',
      subtitle: localization?.setUpAccount?.subTitle,
      check_icon: personal_Data?.lastStep
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
    formdata.append('terms',1)
    if (personal_Data?.photoForth?.path) {
      formdata.append(
        'profile_photo',
        personal_Data?.photoForth && {
          uri: personal_Data?.photoForth?.path,
          type: personal_Data?.photoForth?.type,
          name: personal_Data?.photoForth?.name,
        },
      );
    }
    if (personal_Data?.RSAPhoto?.path) {
      formdata.append(
        'rsa_prdp_card',
        personal_Data?.RSAPhoto && {
          uri: personal_Data?.RSAPhoto?.path,
          type: personal_Data?.RSAPhoto?.type,
          name: personal_Data?.RSAPhoto?.name,
        },
      );
    }
    formdata.append(
      'rsa_prdp_card_expiry',
      formatDateWithDashes(personal_Data?.RSAExpiry),
    ); 
    if (personal_Data?.SSRPhoto?.path) {
      formdata.append(
        'safety_screening',
        personal_Data?.SSRPhoto && {
          uri: personal_Data?.SSRPhoto?.path,
          type: personal_Data?.SSRPhoto?.type,
          name: personal_Data?.SSRPhoto?.name,
        },
      );
    }
    formdata.append(
      'safety_screening_expiry',
      formatDateWithDashes(personal_Data?.SSRExpiry),
    );
    if (personal_Data?.DERPhoto?.path)
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
    ); 

    console.log('88888888888888888--->', personal_Data?.edit);

    let route =
      personal_Data?.edit == 're_Submit'
        ? `${SIGN_UPDATE}/${'4'}/${personal_Data?.verify_token}`
        : `${SIGNUP_STEP_4}${personal_Data?.verify_token}`;
    console.log('88888888888888888--->111', route);
    POST_FORM_DATA(
      route,
      formdata,
      async success => {
        if (success?.status == 'success') {
          setbtnloader(false);
          setModal(true);
          setOTPToken(success?.data?.verify_token);
          setToken(success?.token);
         
          setTimeout(() => {
            setModal(false);
            // dispatch(isAuth(true));
            navigation.navigate('DrawerNavigation');
            dispatch(userDetails(success?.data));
            dispatch(updateAuthData(success?.data));
            dispatch(personalData({}));
          }, 5000);
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
    data.forEach((item, index) => {
      if (!item?.active) {
         if (
          item?.name === localization?.setUpAccount?.virtual ||
          item?.name === localization?.setUpAccount?.terms ||
          item?.name === localization?.setUpAccount?.profile ||
          item?.name === localization?.setUpAccount?.rsa ||
          item?.name === localization?.setUpAccount?.safety ||
          item?.name === localization?.setUpAccount?.driving
        ) {
          // Add specific inactive items to the list
          inactiveItems.push({name: item?.name, index: index});
        }
      }
    });
    const checkNextCondition = index => {
      if (index < inactiveItems.length) {
        const currentCondition = inactiveItems[index];

        // ToastMsg(`Please complete or accept: ${currentCondition}`, {
        //   action: {
        //     label: 'Accept',
        //     onPress: () => {
        //       // Mark the current item as active
        //       const itemIndex = data.findIndex(
        //         i => i.name === currentCondition,
        //       );
        //       if (itemIndex > -1) {
        //         data[itemIndex].active = true;
        //       }
        //       // Check the next condition
        //       checkNextCondition(index + 1);
        //     },
        //   },
        // });
        setError(inactiveItems);
      } else {
        // If all items are accepted, proceed with the final steps
        const combinedData = {
          ...personal_Data, // Include existing personal data
          VISTerms: true, // Add or update the VISTerms property
        };

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
console.log("dsfsdfsd",personal_Data)
  // console.log("444444AAA",personal_Data)
  return (
    <ContainerView>
      <HeaderWithBack
        title={localization?.setUpAccount?.signup}
        source={Images.Back}
        headerHelp={true}
        showSpace={false}
        onBackPress={() => {
          navigation.navigate('CarDetails');
        }}
      />
      <MainTitle
        subHeader={true}
        boldTitle={true}
        // mainPadding={0}
        stepImg={Images?.Step4}
        toptitle={`${localization?.setUpAccount?.welcome} ${personal_Data?.firstName} ${personal_Data?.lastname}`}
        subTitle={localization?.setUpAccount?.here}
        help={true}
      />

<FlatList
  data={data}
  showsVerticalScrollIndicator={false}
  renderItem={({ item, index }) => {
    const isTermsActive = data.find(tab => tab.key === '1')?.active; // Check if Terms and Conditions is active
    const areAllTabsActive = data.slice(0, -1).every(tab => tab.active); // Check if all tabs except the last are active
    const isTabActive =
      item.key === '1' || (item.key === '7' ? areAllTabsActive : isTermsActive);

    const currentError = error.find(err => err.index === index);

    return (
      <View
        style={{
          borderBottomWidth: index === data?.length - 1 ? 0 : 1,
          paddingVertical: 10,
          borderBottomColor: Colors.borderColor,
        }}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => {
            if (item?.name !== localization?.setUpAccount?.virtual && isTabActive) {
              navigateToItem(item?.navigate);
            }
          }}
          disabled={!isTabActive}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={styles.iconContainer}>
              <Image
                source={isTabActive ? item.icon : Images?.inactiveIcon} // Show inactive icon if tab is disabled
                style={styles.icon}
              />
            </View>
            <View style={{ width: windowWidth / 2 + 40 }}>
              <Typography
                size={16}
                lineHeight={19}
                fontFamily={Fonts.Inter_Medium}
                color={isTabActive ? Colors.Black : Colors.Gray}>
                {item?.name}
              </Typography>
              {item.subtitle && (
                <Typography
                  size={12}
                  color={item.key === '1' ? Colors.blue : Colors.Black}
                  style={{ marginVertical: 5 }}>
                  {item?.subtitle}
                </Typography>
              )}
            </View>
          </View>
          <TouchableOpacity
            disabled={item?.key !== '7' || !isTabActive}
            onPress={() => {
              setLastStep(true)
              const combinedData = {
                ...personal_Data, // Include existing personal data
                lastStep: true, // Add or update the VISTerms property
              };
      
              dispatch(personalData(combinedData));
            }}>
            <Image
              source={isTabActive ? item.check_icon : Images?.inactiveCheckbox}
              style={{ height: 26, width: 26 }}
            />
          </TouchableOpacity>
        </TouchableOpacity>
        {index === data?.length - 1 &&
        <Button
              loading={btnloader}
              title={localization.carDetails?.next}
              onPress={() => {
                if (isTabActive) OnAPICALL(data);
                // dispatch(isAuth(true));
              }}
              style_button={{backgroundColor: Colors?.Black }}
            />
  }
      
      </View>
    );
  }}
/>


      {/* <FlatList
        data={data}
        showsVerticalScrollIndicator={false}
        renderItem={({item, index}) => {
          console.log(item,"item============>");
          const currentError = error.find(err => err.index === index);


          const isTermsActive = data.find(tab => tab.key === '1')?.active; // Check if Terms and Conditions is active
          const isTabActive = isTermsActive || item.key === '1'; // Tabs are active only if Terms is active or it's the Terms tab
          return (
            <View
              style={{
                borderBottomWidth: index == data?.length - 1 ? 0 : 1,
                paddingVertical: 10,
                borderBottomColor: Colors.borderColor,
              }}>
              <TouchableOpacity
                style={styles.menuButton}
                onPress={() => {
                  if (item?.name !== localization?.setUpAccount?.virtual && isTabActive) {
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
                        color={item.key === '1' ? Colors.blue : Colors.Black}
                        style={{marginVertical: 5}}>
                        {item?.subtitle}
                      </Typography>
                    )}
                  </View>
                </View>
                <TouchableOpacity
                  disabled={item?.key !== '7' && true}
                  onPress={() => {
                    OnAPICALL(data);
                  }}>
                  <Image
                    source={item.check_icon}
                    style={{height: 26, width: 26}}
                  />
                </TouchableOpacity>
              </TouchableOpacity>
              
             {
              currentError && 
                  <ErrorBox message={`${currentError?.name} ${localization?.validation?.required}`} />
             }
                
             
         
            </View>
          );
        }}
      /> */}
      <CommonModal
        BackImage={true}
        visible={modal}
        close={() => {
          setModal(false);
          navigation.navigate('DrawerNavigation');
          // dispatch(isAuth(true));
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
    // paddingVertical: 16,
    justifyContent: 'space-between',
    // borderBottomWidth: 1,
    // borderBottomColor: Colors.borderColor,
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
