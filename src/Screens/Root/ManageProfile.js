import {
  StyleSheet,
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  ToastAndroid,
  KeyboardAvoidingView,
  Platform,
  KeyboardAvoidingViewBase,
} from 'react-native';
import {useState, useEffect} from 'react';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import HeaderWithBack from '../../Component/HeaderWithBack';
import {Typography} from '../../Component/Typography';
import Input from '../../Component/Input';
import ErrorBox from '../../Component/ErrorBox';
import Button from '../../Component/Button';
import ContainerView from '../../Component/ContainerView';
import {DRIVER_REQUEST, GET_DRIVER_PROFILE} from '../../Backend/ApiRoutes';
import {GET_WITH_TOKEN, POST_FORMDATA_WITH_TOKEN} from '../../Backend/Backend';
import {updateAuthData} from '../../Redux/action';
import {validators} from '../../Backend/Validator';
import {isValidForm} from '../../Backend/Utility';
import {Images} from '../../Constants/Images';
import {Colors} from '../../Constants/Colors';
import {Fonts} from '../../Constants/Fonts';
import localization from '../../Constants/localization';
import WarningComponent from '../../Component/WarningComponent';
import {ToastMsg} from '../../Component/ToastMsg';
import {FULL_HEIGHT} from '../../Constants/Layout';
import UploadDoc from '../../Component/UploadDoc';
import FormContainer from '../../Component/UI/FormContainer';

const ManageProfile = () => {
  const navigation = useNavigation();
  const get_detail = useSelector(store => store.updateAuthData);

  const [first_name, setFirst_name] = useState('');
  const [last_name, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [singleData, setSinglsingleData] = useState('');

  const [message, setMessage] = useState(
    get_detail?.profile_request?.description,
  );
  const dispatch = useDispatch();
  useEffect(() => {
    if (get_detail) {
      setEmail(get_detail?.email);
      setFirst_name(get_detail?.first_name);
      setLastName(get_detail?.last_name);
      setMessage(get_detail?.profile_request?.description);
      setProfileImage(get_detail?.image);
    }
  }, [get_detail]);
  const [modalVisible, setModalVisible] = useState(false);
  const [profileImage, setProfileImage] = useState(get_detail?.image);
  const [loading, setLoading] = useState(false);
  const IsFocuse = useIsFocused();

  useEffect(() => {
    if (IsFocuse) {
      GET_PROFILE();
    }
  }, [IsFocuse]);

  const [error, setError] = useState({
    email: '',
    name: '',
    message: '',
  });

  const handleSubmit = () => {
    let error = {
      firstName: validators.checkRequire(
        localization.personalInfo.firstName,
        first_name,
      ),
      lastname: validators.checkRequire(
        localization.personalInfo.lastName,
        last_name,
      ),
      email: validators.checkEmail(localization.Sign_up?.email, email),
      message: validators.checkRequire(
        localization?.ContactUs?.message,
        message,
      ),
    };

    setError(error);

    const formdata = new FormData();
    formdata.append('first_name', first_name);
    formdata.append('last_name', last_name);
    formdata.append('email', email);
    formdata.append('description', message);
    if (profileImage?.uri) {
      formdata.append('image', profileImage);
    }
    if (isValidForm(error)) {
      setLoading(true);
      POST_FORMDATA_WITH_TOKEN(
        DRIVER_REQUEST,
        formdata,
        response => {
          setLoading(false);
          setLoading(false);
          ToastMsg(response.msg);
          GET_PROFILE();
          navigation.goBack();
          // ToastAndroid.show(response.msg, ToastAndroid.SHORT);
        },
        error => {
          setLoading(false);
          ToastMsg(error?.message || 'An error occurred');
        },
        fail => {
          setLoading(false);
          ToastMsg(error?.message || 'An error occurred');
        },
      );
    } else {
    }
  };
  const GET_PROFILE = () => {
    GET_WITH_TOKEN(
      GET_DRIVER_PROFILE,
      response => {
        console.log('44444444444Here', response?.data);
        setSinglsingleData(response?.data);

        dispatch(updateAuthData(response?.data));
        // navigation.goBack();
      },
      s => {},
      s => {},
    );
  };
  // const handleMediaSelected = (media, type, uri) => {
  //   if (media && media.length > 0) {
  //     const selectedImage = {
  //       uri: media[0]?.uri,
  //       type: media[0]?.type || 'image/jpeg',
  //       name: uri || media[0]?.fileName || 'file.jpg',
  //     };
  //     setProfileImage(selectedImage);
  //   }
  // };

  return (
    <View style={styles.container}>
      <HeaderWithBack
        source={Images.Back}
        title={localization.changeProfileRequest.changeProfileRequest}
      />
      {/* <KeyboardAvoidingViewBase
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
  
      > */}
      <View>
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
          <FormContainer behavior={Platform.OS == 'ios' ? 'padding' : 'height'}>
            <View style={styles.profileImageContainer}>
              <Image
                source={
                  profileImage?.uri
                    ? {uri: profileImage.uri}
                    : profileImage
                    ? {uri: profileImage}
                    : Images?.DriverProfile
                }
                style={styles.profileImage}
              />
              <TouchableOpacity
                style={styles.editIconContainer}
                onPress={() => setModalVisible(true)}>
                <Image source={Images.edit} style={styles.editIcon} />
              </TouchableOpacity>
            </View>
            <Typography
              fontFamily={Fonts.Inter_Bold}
              size={22}
              lineHeight={35}
              color={Colors.Black}
              style={styles.profileName}>
              {get_detail?.name}
            </Typography>
            <Input
              title={localization.ManageProfile.firstName}
              style_inputContainer={styles.input}
              value={first_name}
              onChange={e => {
                setFirst_name(e);
                setError({...error, first_name: ''});
              }}
            />
            <ErrorBox message={error?.first_name} />
            <Input
              title={localization.ManageProfile.lastName}
              style_inputContainer={styles.input}
              value={last_name}
              onChange={e => {
                setLastName(e);
                setError({...error, last_name: ''});
              }}
            />
            <ErrorBox message={error?.last_name} />
            <Input
              title={localization.Sign_up?.email}
              style_inputContainer={styles.input}
              keyboardType={'email-address'}
              value={email}
              onChange={e => {
                setEmail(e);
                setError({...error, email: ''});
              }}
            />
            <ErrorBox message={error?.email} />
            <Input
              title={localization.changeProfileRequest.requestDescription}
              style_input={{
                justifyContent: 'flex-start',
                height: 150,
              }}
              height={150}
              style_inputContainer={{
                // height: 300,
                borderRadius: 9,
                borderWidth: 1,
                borderColor: Colors.borderColor,
                marginBottom: 10,
                paddingHorizontal: 10,
                marginBottom: 5,
              }}
              numberOfLines={3}
              value={message}
              onChange={e => {
                setMessage(e);
                setError({...error, message: ''});
              }}
              multiline={true}
              placeholder={localization.changeProfileRequest.typeHere}
              placeholderTextColor={Colors.textColor}
            />
            {/* <Input
              title={localization.changeProfileRequest.requestDescription}
              style_inputContainer={styles.inputMag}
              value={message}
              onChange={e => {
                setMessage(e);
                setError({...error, message: ''});
              }}
              placeholder={localization.changeProfileRequest.typeHere}
              placeholderTextColor={Colors.textColor}
            /> */}
            <ErrorBox message={error?.message} />

            <WarningComponent
              title={localization.changeProfileRequest.note}
              sub_title={localization.changeProfileRequest.profileUpdateNote}
            />

            <Button
              title={
                loading ? (
                  <ActivityIndicator
                    size="small"
                    color={Colors.white}
                    // style={styles.loader}
                  />
                ) : (
                  localization.ManageProfile.save
                )
              }
              onPress={() => handleSubmit()}
              style_button={{
                backgroundColor: Colors?.Black,
                marginHorizontal: 20,
              }}
            />
            <View style={{height: 150}} />
          </FormContainer>
        )}

        {/* <ImageModal
        showModal={modalVisible}
        close={() => setModalVisible(false)}
        selected={(media, type, uri) => {
          handleMediaSelected(media, type, uri);
        }}
      /> */}
        <UploadDoc
          showModal={modalVisible}
          fileUpload={false}
          width={300}
          height={300}
          cropping={true}
          close={() => {
            setModalVisible(false);
          }}
          selected={(files, type) => {
            if (!Array.isArray(files) || files.length === 0) return;

            const file = files[0]; // ✅ ALWAYS TAKE FIRST

            setProfileImage({
              uri: file.uri || file.path, // ✅ STRING ONLY
              type: file.mime || 'image/jpeg',
              name:
                file.filename ||
                file.name ||
                file.path?.split('/').pop() ||
                'image.jpg',
            });
          }}
        />

        {/* </KeyboardAvoidingViewBase> */}
      </View>
    </View>
  );
};

export default ManageProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },
  profileImageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginTop: 33,
  },
  profileImage: {
    width: 102,
    height: 102,
    borderRadius: 10,
  },
  editIconContainer: {
    backgroundColor: Colors.selectedBorderColor,
    marginTop: -20,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    height: 36,
    width: 36,
  },
  editIcon: {
    height: 24,
    width: 24,
    tintColor: Colors.white,
  },
  profileName: {
    marginTop: 16,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  input: {
    height: 52,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    marginBottom: 10,
    paddingHorizontal: 10,
    marginBottom: 5,
  },
  checkContainer: {
    flexDirection: 'row',
    marginVertical: 10,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  iconContainer: {
    height: 18,
    width: 18,
    borderWidth: 1,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  icon: {
    height: 17,
    width: 17,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addIcon: {
    backgroundColor: Colors.Black,
    height: 52,
    width: 52,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    marginTop: 10,
    marginLeft: 16,
  },
  inputMag: {
    borderWidth: 1,
    borderRadius: 10,
    borderColor: Colors.borderColor,
    height: 146,
    alignItems: 'flex-start',
    marginBottom: 5,
  },
});
