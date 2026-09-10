import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import React, { useState } from 'react';
import ContainerView from '../../Component/ContainerView';
import HeaderWithBack from '../../Component/HeaderWithBack';
import { Images } from '../../Constants/Images';
import Typography from '../../Component/UI/Typography';
import { Fonts } from '../../Constants/Fonts';
import { Colors } from '../../Constants/Colors';
import Button from '../../Component/Button';
import DropdownComponent from '../../Component/DropdownComponent';
import { isValidForm } from '../../Backend/Utility';
import { validators } from '../../Backend/Validator';
import Input from '../../Component/Input';
import { useDispatch, useSelector } from 'react-redux';
import { GlobalStyle } from '../../Constants/GlobalStyle';
import Date_Picker from '../../Component/DatePicker';
import UploadDoc from '../../Component/UploadDoc';
import ErrorBox from '../../Component/ErrorBox';
import { SIGN_UPDATE, SIGNUP_STEP_3 } from '../../Backend/ApiRoutes';
import { POST_FORM_DATA } from '../../Backend/Backend';
import { Header, MainTitle } from '../../Component/HeaderContent';
import { personalData } from '../../Redux/action';
import { useIsFocused } from '@react-navigation/native';
import localization from '../../Constants/localization';
import Press from '../../Component/UI/Press';
import CarColorDropDown from '../../Component/CarColorDropDown';

const CarDetails = ({ navigation, route }) => {
  const masterData = useSelector(store => store.master_data);
  console.log("🚀 ~ CarDetails ~ masterData:", masterData)

  const token = route?.params?.token;
  const [carModel, setCarModel] = useState({});
  const [carYear, setCarYear] = useState({});
  const [carColor, setCarColor] = useState({});
  const [carVin, setCarVin] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [licencePhoto, setlicencePhoto] = useState('');
  const [licenseModal, setlicenseModal] = useState(false);
  const [virPhoto, setVirPhoto] = useState("");
  const [virModal, setVirModal] = useState(false);
  const [licensExpiryDate, setLicenseExpiryDate] = useState();
  const [virExpiry, setVirExpiry] = useState();
  const [error, setError] = useState('');
  const [btnloader, setbtnloader] = useState(false);
  const personal_Data = useSelector(store => store.personalData);
  const dispatch = useDispatch();
  const is_focus = useIsFocused();
  const carModelArray = masterData?.lookups?.car_model?.map(i => ({
    label: i?.lookup_description[0]?.code,
    value: i?.id,
  }));

  const carYearArray = masterData?.lookups?.car_year?.map(i => ({
    label: i?.lookup_description[0]?.code,
    value: i?.id,
  }));

  const carColorArray = masterData?.lookups?.car_color?.map(i => ({
    label: i?.lookup_description[0]?.code,
    value: i?.id,
    type: i?.type
  }));




  React.useEffect(() => {
  const combinedData = {
  ...personal_Data,
  carModel: carModel?.value,
  carYear: carYear?.value,
  carColor: carColor?.value,
  carVin: carVin,
  licensePlate: licensePlate,
  licensExpiryDate: licensExpiryDate,
  virExpiry: virExpiry,
};
    dispatch(personalData(combinedData));
  }, [virPhoto, licencePhoto, virExpiry, carYear, carModel, carColor, carVin, licensePlate]);




  React.useEffect(() => {
    if (is_focus) {
      let CarModal = carModelArray?.filter(res => {
        return res?.value == personal_Data?.carModel; // Return the condition for filtering
      });
      setCarModel({
        label: CarModal[0]?.label,
        value: CarModal[0]?.value,
      });

      let CarYear = carYearArray?.filter(res => {
        return res?.value == personal_Data?.carYear; // Return the condition for filtering
      });
      setCarYear({
        label: CarYear[0]?.label,
        value: CarYear[0]?.value,
      });
      let carColor = carColorArray?.filter(res => {
        return res?.value == personal_Data?.carColor; // Return the condition for filtering
      });
      setCarColor({
        label: carColor[0]?.label,
        value: carColor[0]?.value,
      });
      setCarVin(personal_Data?.carVin);
      setLicensePlate(personal_Data?.licensePlate);
      setlicencePhoto(personal_Data?.licencePhoto);
      // setlicencePhoto(personal_Data?.licencePhoto);
      setVirPhoto(personal_Data?.virPhoto);
      setLicenseExpiryDate(personal_Data?.licensExpiryDate);
      setVirExpiry(personal_Data?.virExpiry);
    }
  }, [is_focus]);





  const handleSubmit = () => {
    const error = {
      carModel: validators.checkRequire(
        localization.carDetails.carModel,
        carModel?.label,
      ),
      carYear: validators.checkRequire(
        localization.carDetails.carYear,
        carYear?.label,
      ),
      carColor: validators.checkRequire(
        localization.carDetails.carColor,
        carColor?.label,
      ),
      carVin: validators.checkVinNumber(localization.carDetails.carVin, carVin),
      licensePlate: validators.checkRequire(
        localization.carDetails.licensePlate,
        licensePlate,
      ),
      licencePhoto: validators.checkRequire(
        localization.carDetails.licensePhoto,
        licencePhoto?.uri || licencePhoto
      ),
      virPhoto: validators.checkRequire(
        localization.carDetails.virPhoto,
        virPhoto?.uri || virPhoto,
      ),
      licensExpiryDate: validators.checkExpiryDate(
        localization?.UploadDER?.license,
        licensExpiryDate,
      ),
      virExpiry: validators.checkExpiryDate(
        localization?.UploadDER?.license,
        virExpiry,
      ),
    };

    setError(error);

    if (isValidForm(error)) {
      ForApi();
    }
  };

  const formatDateWithDashes = dateString => {
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString('en-GB');
    return formattedDate.replace(/\//g, '-');
  };
  const ForApi = async () => {
    setbtnloader(true);
    const formdata = new FormData();
    formdata.append('car_model_lookup_id', carModel?.value);
    formdata.append('car_year_lookup_id', carYear?.value);
    formdata.append('car_color_lookup_id', carColor?.value);
    formdata.append('car_vin_number', carVin);
    formdata.append('license_plate_number', licensePlate);
    if (licensExpiryDate) {
      formdata.append(
        'license_expiry_date',
        formatDateWithDashes(licensExpiryDate),
      );
    }
    if (virExpiry) {
      formdata.append(
        'vehicle_inspection_expiry_date',
        formatDateWithDashes(virExpiry),
      );
    }
    { console.log("55555555", licencePhoto) }
    if (licencePhoto?.uri) {
      formdata.append('license_disc', licencePhoto);
    }
    if (virPhoto?.uri) {
      formdata.append('vehicle_inspection_report', virPhoto);
    }

    console.log('Fom Data ===>33', JSON.stringify(formdata));

    // return;
    let route = personal_Data?.verify_token
      ? `${SIGN_UPDATE}/${'3'}/${personal_Data?.verify_token}`
      : `${SIGNUP_STEP_3}${personal_Data?.verify_token}`;
    console.log("route 4", route)
    POST_FORM_DATA(
      route,
      formdata,
      async success => {
        console.log("success ===>", success)
        if (success?.status == 'success') {
          setbtnloader(false);
          const combinedData = {
            ...personal_Data, // Include existing personal data
            carModel: carModel?.value,
            carYear: carYear?.value,
            carColor: carColor?.value,
            carVin: carVin,
            licensePlate: licensePlate,
            licensExpiryDate: licensExpiryDate,
            virExpiry: virExpiry,
            licencePhoto: licencePhoto,
            virPhoto: virPhoto,
            step: success?.data?.step, // Add step
            verify_token: success?.data?.verify_token, // Add verify_token
          };

          dispatch(personalData(combinedData));
          navigation.navigate('SetupAccount');
        } else {
          setbtnloader(false);
        }
        setbtnloader(false);
      },
      error => {
        console.log("My Data here", error)
        setbtnloader(false);

        // SimpleToast.show(error?.msg);
      },
      fail => {
        setbtnloader(false);
      },
    );
  };

  // const dispatchData = () => {
  //   const combinedData = {
  //     ...personal_Data, // Include existing personal data
  //     carModel: carModel?.value,
  //     carYear: carYear?.value,
  //     carColor: carColor?.value,
  //     carVin: carVin,
  //     licensePlate: licensePlate,
  //     licensExpiryDate: licensExpiryDate,
  //     virExpiry: virExpiry,
  //     licencePhoto: licencePhoto,
  //     virPhoto: virPhoto,
  //   };

  //   dispatch(personalData(combinedData));
  // };
  return (
    <ContainerView>
      <HeaderWithBack
        source={Images.Back}
        title={localization.carDetails.signUp}
        headerHelp={true}
        onBackPress={() => { navigation.navigate("PaymentDetails") }}
        showSpace={false}
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      // keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0} // Adjust offset as needed
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <MainTitle
            subHeader={true}
            boldTitle={true}
            // mainPadding={0}
            stepImg={Images?.Step3}
            toptitle={localization.carDetails.carDetails}
            subTitle={localization.carDetails.unableToFindCarModel + " " + masterData?.contact_email}
          />
          <View style={{ marginTop: 20 }}>
            <DropdownComponent
              data={carModelArray}
              // title={"Car Model*"}
              title={
                <Typography color={Colors.inputtitle}>
                  {localization.carDetails.carModel}
                  <Typography color={Colors.red}>*</Typography>
                </Typography>
              }
              value={carModel}
              placeholder={''}
              onChange={value => {
                setCarModel(value);
                setError({ ...error, carModel: '' });
              }}
              error={error?.carModel}
            />
          </View>
          <DropdownComponent
            data={carYearArray}
            // title={"Car Year*"}
            title={
              <Typography color={Colors.inputtitle}>
                {localization.carDetails.carYear}
                <Typography color={Colors.red}>*</Typography>
              </Typography>
            }
            value={carYear}
            placeholder={''}
            onChange={year => {
              setCarYear(year);
              setError({ ...error, carYear: '' });
            }}
            error={error?.carYear}
          />
          {console.log("555555555 --->", carColorArray)}
          <CarColorDropDown
            data={carColorArray}
            // title={"Car Colour*"}
            title={
              <Typography color={Colors.inputtitle}>
                {localization.carDetails.carColor}
                <Typography color={Colors.red}>*</Typography>
              </Typography>
            }
            value={carColor}
            placeholder={''}
            onChange={c => {
              setCarColor(c);
              setError({ ...error, carColor: '' });
            }}
            error={error?.carColor}
          />

          <Input
            title={localization.carDetails.carVin}
            aesterick={true}
            maxLength={17}
            style_inputContainer={{ borderWidth: 1 }}
            placeholderTextColor={'#B5B5B5'}
            value={carVin}
            onChange={e => {
              setCarVin(e);
              setError({ ...error, carVin: '' });
            }}
            error={error?.carVin}
          />

          <Input
            title={localization.carDetails.licensePlate}
            aesterick={true}
            style_inputContainer={{ borderWidth: 1 }}
            placeholderTextColor={'#B5B5B5'}
            value={licensePlate}
            onChange={e => {
              setLicensePlate(e);
              setError({ ...error, licensePlate: '' });
            }}
            error={error?.licensePlate}
          />
          <View style={{ marginVertical: 20 }}>
            <Typography
              size={16}
              color={Colors.Black}
              fontFamily={Fonts.Inter_Medium}
              style={{ marginBottom: 10 }}>
              {localization.carDetails.licenseDisc}
              <Typography color={Colors.red}>*</Typography>
            </Typography>
            <Typography style={{ marginVertical: 5 }}>
              {localization.carDetails.licenseDiscRequired}
            </Typography>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <Typography>{localization.carDetails.click} </Typography>
              <Press
                onPress={() => {
                  // dispatchData();
                  navigation?.navigate('TermsAndConditions', {
                    slug: 'licence-description',
                    name: 'License Disc',
                  });
                }}>
                <Typography
                  style={styles.text}
                  color={Colors.selectedBorderColor}>
                  {localization.carDetails.here}{" "}
                </Typography>
              </Press>
              <Typography>
                {localization.carDetails.viewFetchCarProcess}
              </Typography>
            </View>
          </View>
          <Button
            title={
              licencePhoto?.uri || licencePhoto ? localization?.multiDropDown?.upload : localization.carDetails.uploadFile
            }
            onPress={() => {
              setlicenseModal(true);
            }}
            textSize={14}
            textColor="black"
            leftIcon={licencePhoto?.uri || licencePhoto ? 'tickMark' : 'upload'}
            style_button={{
              ...GlobalStyle.btnStyle,
              marginBottom: 5,
            }}
          />
          <UploadDoc
            showModal={licenseModal}
            fileUpload={false}
            close={() => {
              setlicenseModal(false);
            }}
            selected={(img, type) => {
                const selectedImage = Array.isArray(img) ? img[0] : img;

                setlicencePhoto({
                  uri: selectedImage?.uri || selectedImage?.path,
                  type: selectedImage?.type || selectedImage?.mime,
                  name:
                    selectedImage?.name ||
                    selectedImage?.filename ||
                    selectedImage?.path?.split('/').pop() ||
                    'image_name.jpg',
                });
          
              setError({ ...error, licencePhoto: '' });
            }}
          />
          {!!error?.licencePhoto && <ErrorBox message={error?.licencePhoto} />}

          <Date_Picker
            allowFutureDates={true}
            disablePastDates={true}
            title={localization.carDetails.expiryDate}
            onChange={d => {
              setLicenseExpiryDate(d);
            }}
            selected_date={licensExpiryDate}
            onConfirm={d => {
              setLicenseExpiryDate(d);
            }}
          />
          {
            error?.licensExpiryDate && <ErrorBox message={error?.licensExpiryDate} />
          }
          <View
            style={{
              marginVertical: 20,
            }}>
            <Typography
              size={16}
              color={Colors.Black}
              fontFamily={Fonts.Inter_Medium}
              style={{ marginBottom: 10 }}>
              {localization.carDetails.vehicleInspectionReport}
              <Typography color={Colors.red}>*</Typography>
            </Typography>
            <Typography style={{ marginVertical: 5 }}>
              {localization.carDetails.dekraReportRequired}
            </Typography>
            <Typography style={{ marginVertical: 5 }}>
              {localization.carDetails.submitInspectionReport}
            </Typography>
            <Typography style={{ marginVertical: 5 }}>
              {localization.carDetails.reportMust}
              <Typography color={Colors.Black} fontFamily={Fonts.Inter_SemiBold}>
                {' '}
                {localization.carDetails.not}
              </Typography>{' '}
              {localization.carDetails.olderThan30Days}{' '}
              <Press
                style={{}}
                onPress={() => {
                  // dispatchData();
                  navigation?.navigate('TermsAndConditions', {
                    slug: 'car-inspection-report',
                    name: 'Car inspection',
                  });
                }}>
                <Typography
                  style={[styles.text, { top: 3 }]}
                  color={Colors.selectedBorderColor}>
                  {localization.carDetails.here}
                </Typography>
              </Press>
            </Typography>
            <Typography style={{ marginVertical: 5 }}>
              {localization.carDetails.carInspectionReport}{' '}
              <Typography color={Colors.Black} fontFamily={Fonts.Inter_SemiBold}>
                {' '}
                {localization.carDetails.not}
              </Typography>{' '}
              {localization.carDetails.requiredInfo}
            </Typography>
          </View>
          <Button
            title={
              virPhoto?.uri || virPhoto ? localization?.multiDropDown?.upload : localization.carDetails.uploadFile
            }
            onPress={() => {
              setVirModal(true);
            }}
            textSize={14}
            textColor="black"
            leftIcon={virPhoto?.uri || virPhoto ? 'tickMark' : 'upload'}
            style_button={{
              ...GlobalStyle.btnStyle,
              marginBottom: 5,
            }}
          />
          <UploadDoc
            showModal={virModal}
            fileUpload={false}
            close={() => {
              setVirModal(false);
            }}
            
            selected={img => {
              const first = Array.isArray(img) ? img[0] : img;
              setVirPhoto({
                uri: first?.uri || first?.path,
                type: first?.type || first?.mime,
                name:
                  first?.name ||
                  first?.filename ||
                  (typeof (first?.path || first?.uri) === 'string'
                    ? (first.path || first.uri).split('/').pop()
                    : null) ||
                  'image_name.jpg',
              });
              setError({ ...error, virPhoto: '' });
            }}
          />
          {!!error?.virPhoto && <ErrorBox message={error?.virPhoto} />}
          <Date_Picker
            allowFutureDates={true}
            disablePastDates={true}
            title={localization.carDetails.expiryDate}
            onChange={d => {
              setVirExpiry(d);
            }}
            selected_date={virExpiry}
            onConfirm={d => {
              setVirExpiry(d);
            }}
          />
          {
            error?.virExpiry && <ErrorBox message={error?.virExpiry} />
          }
        </ScrollView>
        <Button
          loading={btnloader}
          title={localization.carDetails.next}
          style_button={{ backgroundColor: Colors?.Black }}
          onPress={handleSubmit}
        // onPress={() => navigation.navigate('SetupAccount')}
        />
      </KeyboardAvoidingView>
    </ContainerView>
  );
};

export default CarDetails;

const styles = StyleSheet.create({
  text: {
    textDecorationLine: 'underline',
  },
  button: {
    borderWidth: 1,
    borderColor: Colors.Black,
  },
  inputheader: {
    fontSize: 16,
    color: Colors.Black,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.gray,
    paddingLeft: 10,
  },
});





