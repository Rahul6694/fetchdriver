import AsyncStorage from '@react-native-async-storage/async-storage';

//Setters
export const setToken = async userToken => {
  return await AsyncStorage.setItem('TOKEN', userToken)
    .then(res => res)
    .catch(e => e);
};
export const setOTPToken = async otpToken => {
  return await AsyncStorage.setItem('OTPTOKEN', otpToken)
    .then(res => res)
    .catch(e => e);
};
export const setUserData = async userData => {
  return await AsyncStorage.setItem('USERDATA', userData)
    .then(res => res)
    .catch(e => e);
};

export const setLanguage = async lang => {
  return await AsyncStorage.setItem('LANGUAGE', lang)
    .then(res => res)
    .catch(e => e);
};

// Getters
export const getOTPToken = async otpToken => {
  return await AsyncStorage.getItem('OTPTOKEN', otpToken)
    .then(res => res)
    .catch(e => e);
};

export const getToken = async () => {
  const token = await AsyncStorage.getItem('TOKEN');
  return token;
};
export const getLanguage = async () => {
  const language = await AsyncStorage.getItem('LANGUAGE');

  return language;
};
