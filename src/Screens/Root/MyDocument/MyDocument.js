import {
  StyleSheet,
  TouchableOpacity,
  View,
  Image,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useSelector} from 'react-redux';
import {useIsFocused} from '@react-navigation/native';
import moment from 'moment';
import ContainerView from '../../../Component/ContainerView';
import HeaderWithBack from '../../../Component/HeaderWithBack';
import {Images} from '../../../Constants/Images';
import {
  GET_WITH_TOKEN,
  POST_FORMDATA_WITH_TOKEN,
} from '../../../Backend/Backend';
import {GET_DRIVER_PROFILE, UPDATE_DOCUMENT} from '../../../Backend/ApiRoutes';

import {ToastMsg} from '../../../Component/ToastMsg';
import {FULL_HEIGHT} from '../../../Constants/Layout';
import {windowWidth} from '../../../Constants/Dimensions';
import {Colors} from '../../../Constants/Colors';
import Typography from '../../../Component/UI/Typography';
import {Fonts} from '../../../Constants/Fonts';
import CommonModal from '../../../Component/UI/CommonModal';
import TextInputModal from '../../../Component/UI/TextInputModal';
import localization from '../../../Constants/localization';

const SetupAccount = ({navigation, route}) => {
  const isFocus = useIsFocused();
  const [loading, setLoading] = useState(false);
  const [singleData, setSinglsingleData] = useState('');
  const [TextOpen, setTextOpen] = useState(false);
  const [apiLoading, setApiLoading] = useState(false);

  const masterData = useSelector(store => store.master_data);
  console.log('74444 888 ', singleData);

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
        console.log('444444 KKKKKKK 3344', response?.data);
        setSinglsingleData(response?.data);
        setLoading(false);
      },
      s => {
        setLoading(false);
      },
      s => {
        setLoading(false);
      },
    );
  };

  const getDate = (value, DocumentData = [], valueHere) => {
    console.log('777777 33 555 333', DocumentData, valueHere);

    // If value is null or undefined, return an inactive status
    const documentCheck = DocumentData?.find(
      doc => doc?.expiry_date_key === valueHere,
    );
    const expiryKey1 = documentCheck?.expiry_date_key;
    const expiryValue1 = documentCheck?.expiry_date_value;
    const status = documentCheck?.status;
    console.log("8888888888",expiryKey1)

    if (expiryKey1 === valueHere && status === 'waiting_for_approval') {

      return {
        subtitle: localization.MyDocument.Waiting, // Show waiting status if the document is waiting for approval
        isActive: false, // Inactive status for waiting approval
      };
    } else {
 
        if (value === null || value === undefined) {
          return {
            subtitle: '', // No date available
            isActive: true,
          };
        }
      
    }

    
    
  

    const inputDate = moment(value);
    const today = moment();
    const remainingDays = inputDate.diff(today, 'days');

    // Loop through DocumentData to check for matching expiry_date_key
    console.log('Value here ==>', valueHere);
    const document = DocumentData?.find(
      doc => doc?.expiry_date_key === valueHere,
    );
    console.log('55555555555555', document);

    if (document) {
      const expiryKey = document?.expiry_date_key;
      const expiryValue = document?.expiry_date_value;
      const status = document?.status;

      console.log('4444444++++99', expiryKey);
      console.log('4444444++++', expiryValue);

      // Check if the expiry_key matches the valueHere and status is "waiting_for_approval"
      if (expiryKey === valueHere && status === 'waiting_for_approval') {
        return {
          subtitle: 'Waiting for approval', // Show waiting status if the document is waiting for approval
          isActive: false, // Inactive status for waiting approval
        };
      }

      // Otherwise, check expiry date value if it exists
      if (expiryValue) {
        const expiryDate = moment(expiryValue);
        const expiryRemainingDays = expiryDate.diff(today, 'days');

        if (expiryRemainingDays <= masterData?.document_expiry_reminder) {
          return {
            subtitle: `${localization.MyDocument.Expired} ${expiryDate.format(
              'D MMMM YYYY',
            )}`,
            isActive: true, // Expired and active if within 10 days
          };
        } else {
          return {
            subtitle: `${expiryDate.format('D MMMM YYYY')}`,
            isActive: false, // Not within 10 days, inactive
          };
        }
      }
    }

    // Check expiry based on the main value if the document array does not match the specific key
    const inputExpiryDate = moment(value);
    const inputRemainingDays = inputExpiryDate.diff(today, 'days');

    if (inputRemainingDays <= 10) {
      return {
        subtitle: `${localization.MyDocument.Expired} ${inputExpiryDate.format(
          'D MMMM YYYY',
        )}`,
        isActive: true, // Active if within 10 days
      };
    } else {
      return {
        subtitle: `${inputExpiryDate.format('D MMMM YYYY')}`, // Show the date
        isActive: false, // Inactive if beyond 10 days
      };
    }
  };

  const onSubmit = type => {
    // const error = {
    //   photo: validators.checkRequire('Photo', photo?.uri || getImage),
    //   licensExpiryDate: validators.checkExpiryDate(
    //     'Business Expiry Date',
    //     licensExpiryDate,
    //   ),
    // };
    let formdata = new FormData();
    // formdata.append('expiry_date', formatDateWithDashes(licensExpiryDate));
    // if (photo?.uri && photo?.type && photo?.name) {
    //   formdata.append('image', {
    //     uri: photo.uri,
    //     type: photo.type,
    //     name: photo.name,
    //   });
    // }
    formdata.append('trn', type);
    console.log('Form data  ==>33', formdata);
    let route = `${UPDATE_DOCUMENT}${'south_african_id'}`;
    setApiLoading(true);
    POST_FORMDATA_WITH_TOKEN(
      route,
      formdata,
      success => {
        setApiLoading(false);
        if (success?.success == true) {
          ToastMsg(success?.message);
          console.log('4444444 ==>', success?.message);
          navigation.goBack();
        }
      },
      error => {
        setApiLoading(false);
      },
      fail => {
        setApiLoading(false);
      },
    );
  };
  const data = [
    {
      key: '1',
      icon: Images?.TermsandConditions,
      name: localization.personalInfo.idNumber,
      navigate: 'DriverLicenceCard',
      check_icon: Images?.ic_upload_doc,

      // ...getDate(singleData?.driver_details?.license_expiry_date),
      type: 'license-expiry-date',
    },
    {
      key: '2',
      icon: Images?.TermsandConditions,
      name: localization.MyDocument.nameL,
      navigate: 'DriverLicenceCard',
      check_icon: Images?.ic_upload_doc,
      ...getDate(
        singleData?.driver_details?.license_expiry_date,
        singleData?.driver_documents,
        'license_expiry_date',
      ),
      type: 'license-expiry-date',
    },
    {
      key: '3',
      icon: Images?.TermsandConditions,
      name: localization.carDetails.vehicleInspectionReport,
      navigate: 'UpdateVIR',
      check_icon: Images?.ic_upload_doc,
      ...getDate(
        singleData?.driver_details?.vehicle_inspection_expiry_date,
        singleData?.driver_documents,
        'vehicle_inspection_expiry_date',
      ),
      type: 'vehicle-inspection-expiry-date',
    },
    {
      key: '4',
      icon: Images?.ic_passportImg,
      name: localization.MyDocument.nameRsa,
      navigate: 'UpdateTemporaryPrDp',
      check_icon: Images?.ic_upload_doc,
      ...getDate(
        singleData?.driver_details?.rsa_prdp_card_expiry,
        singleData?.driver_documents,
        'rsa_prdp_card_expiry',
      ),
      type: 'rsa-prdp-card-expiry',
    },
    {
      key: '6',
      icon: Images?.ic_security,
      name: localization.setUpAccount.safety,
      navigate: 'UpdateSSR',
      check_icon: Images?.ic_upload_doc,
      ...getDate(
        singleData?.driver_details?.safety_screening_expiry,
        singleData?.driver_documents,
        'safety_screening_expiry',
      ),
      type: 'safety-screening-expiry',
    },
    {
      key: '7',
      icon: Images?.TermsandConditions,
      name: localization.setUpAccount.driving,
      navigate: 'UpdateDER',
      check_icon: Images?.ic_upload_doc,
      ...getDate(
        singleData?.driver_details?.driving_evalution_report_expiry,
        singleData?.driver_documents,
        'driving_evalution_report_expiry',
      ),
      type: 'driving-evalution-report-expiry',
    },
    {
      key: '8',
      icon: Images?.TermsandConditions,
      name: localization.MyDocument.nameB,
      navigate: 'UpdateBusinessInsurence',
      check_icon: Images?.ic_upload_doc,
      ...getDate(
        singleData?.driver_details?.business_insurance_expiry_date,
        singleData?.driver_documents,
        'business_insurance_expiry_date',
      ),
      type: 'business-insurance',
    },
    {
      key: '9',
      icon: Images?.TermsandConditions,
      name: localization.MyDocument.namePLc,
      active: false, // This is hardcoded since no date logic is provided
      navigate: 'UpdateLibality',
      check_icon: Images?.ic_upload_doc,
      ...getDate(
        singleData?.driver_details?.personal_liability_cover_expiry_date,
        singleData?.driver_documents,
        'personal_liability_cover_expiry_date',
      ),
      type: 'personal-liability-cover',
    },
  ];

  // const OnAPICALL = type => {
  //   let formdata = new FormData();
  //   if (type == 'rsa-prdp-card-expiry') {
  //     formdata.append(
  //       'expiry_date',
  //       formatDateWithDashes(get_detail?.rsa_prdp_card_expiry),
  //     );
  //     formdata.append(
  //       'image',
  //       get_detail?.rsa_prdp_card && {
  //         uri: get_detail?.rsa_prdp_card?.path,
  //         type: get_detail?.rsa_prdp_card?.type,
  //         name: get_detail?.rsa_prdp_card?.name,
  //       },
  //     );
  //   }

  //   let route = `${UPDATE_DOCUMENT}${type}`;
  //   console.log('route Here', route);
  //   POST_FORMDATA_WITH_TOKEN(
  //     route,
  //     formdata,
  //     success => {
  //       console.log('sccess', success);
  //       if (success?.success == true) {
  //         ToastMsg(success?.message);
  //       }
  //     },
  //     error => {
  //       console.log('error', error);
  //     },
  //     fail => {
  //       console.log('fail', fail);
  //     },
  //   );
  // };

  return (
    <ContainerView>
      <HeaderWithBack
        title={localization.MyDocument.My_Document}
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
          keyExtractor={item => item.key}
          showsVerticalScrollIndicator={false}
          renderItem={({item}) => {
            const isDisabled = item.key === '1';
            const isActive = item?.isActive ?? item?.active; // handle both cases

            const handlePress = () => {
              if (isDisabled) {
                setTextOpen(true); // only for key '1'
                return;
              }

              if (isActive) {
                navigation.navigate(item.navigate);
              }
            };

            return (
              <View>
                <TouchableOpacity
                  style={[styles.menuButton, isDisabled && {opacity: 0.5}]}
                  disabled={isDisabled}
                  onPress={handlePress}>
                  {/* LEFT SECTION */}
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

                      {/* SUBTITLE */}
                      {item.subtitle && (
                        <Typography
                          size={12}
                          style={{marginVertical: 5}}
                          color={
                            item.subtitle === localization.MyDocument.Waiting
                              ? Colors.yellow
                              : item.subtitle ===
                                  localization.MyDocument.Expired ||
                                item.subtitle ===
                                  localization.MyDocument.Rejected
                              ? Colors.red
                              : Colors.black
                          }>
                          {item.subtitle}
                        </Typography>
                      )}

                      {/* EXTRA TEXT FOR KEY 1 */}
                      {item.key === '1' && (
                        <Typography
                          size={12}
                          numberOfLines={2}
                          style={{marginVertical: 5}}
                          color={Colors.black}>
                          {singleData?.driver_details?.trn}
                        </Typography>
                      )}
                    </View>
                  </View>

                  {/* RIGHT ICON BUTTON */}
                  <TouchableOpacity
                    disabled={isDisabled}
                    onPress={handlePress}
                    style={{
                      alignItems: 'center',
                      height: 50,
                      width: 50,
                      justifyContent: 'center',
                      opacity: isDisabled ? 0.5 : 1,
                    }}>
                    {isActive && (
                      <Image
                        source={item.check_icon}
                        style={{
                          height: 26,
                          width: 26,
                          resizeMode: 'contain',
                        }}
                      />
                    )}
                  </TouchableOpacity>
                </TouchableOpacity>
              </View>
            );
          }}
        />
      )}
      <TextInputModal
        visible={TextOpen}
        close={() => {
          setTextOpen(false);
          // dispatch(isAuth(true));
          // navigation?.navigate('Login');
        }}
        valueset={singleData?.driver_details?.trn}
        ButtonLoading={apiLoading}
        onSubmit={value => {
          onSubmit(value);
        }}></TextInputModal>
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
