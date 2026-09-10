import axios from 'axios';
import { Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import Variables from './Variables';
import { ToastMsg } from '../Component/ToastMsg';
import localization from '../Constants/localization';
import { getLanguage, getToken } from '../Constants/AsyncStorage';
import { checkAndForceLogout } from './ForceLogout';

axios.defaults.timeout = 30000;

export const NETWORK_OFFLINE_RESPONSE = Object.freeze({
  data: null,
  msg: 'Check Network, Try Again.',
  status: 'error',
});

export const isNetworkAvailable = async () => {
  try {
    const state = await NetInfo.fetch();
    if (!state.isConnected) {
      return false;
    }
    if (state.isInternetReachable === false) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
};

const guardNetwork = async onFail => {
  const online = await isNetworkAvailable();
  if (!online) {
    const payload = { ...NETWORK_OFFLINE_RESPONSE };
    ToastMsg(payload.msg);
    onFail(payload);
    return false;
  }
  return true;
};

const handleTokenApiResponse = async (res, onSuccess, onError) => {
  if (await checkAndForceLogout(res?.data, res?.status)) {
    onError(res?.data ?? res);
    return res?.data ?? res;
  }

  if (res?.status == 201 || res?.status == 200) {
    onSuccess(res?.data);
    return res?.data;
  }

  onError(res);
  return res;
};

const handlePostBodyResponse = async (res, onSuccess, onError) => {
  if (await checkAndForceLogout(res?.data, res?.status)) {
    onError(res?.data ?? res);
    return res?.data ?? res;
  }

  if (res?.data?.status == 'success') {
    onSuccess(res?.data);
    return res?.data;
  }

  onError(res?.data);
  return res?.data;
};

const errorHandling = {
  validateStatus: function (status) {
    return status >= 200 && status < 501; // default
  },
};

// Local dev backend: Android emulator can't reach the Mac via "localhost", it needs the
// special 10.0.2.2 alias; iOS simulator can use localhost directly. For a physical device,
// replace this with your Mac's LAN IP (e.g. 192.168.x.x) and make sure the phone is on the
// same network as the backend (npm run dev in fetch-backend/, listening on port 4000).
const LOCAL_HOST = Platform.OS === 'android' ? '13.60.94.26' : '13.60.94.26';

// The backend always returns absolute media URLs (photos, documents) built from its own
// localhost, since it doesn't know which client is asking (the admin web panel and iOS
// Simulator can reach "localhost" directly). Only the Android emulator needs those rewritten
// to 10.0.2.2, so we do it here rather than breaking every other consumer of the API.
const rewriteMediaHost = value => {
  if (LOCAL_HOST === 'localhost') return value;
  if (typeof value === 'string') {
    return value.replace(
      /^(https?:\/\/)localhost(:\d+)?/i,
      (_, protocol, port) => `${protocol}${LOCAL_HOST}${port || ''}`,
    );
  }
  if (Array.isArray(value)) return value.map(rewriteMediaHost);
  if (value && typeof value === 'object') {
    Object.keys(value).forEach(key => {
      value[key] = rewriteMediaHost(value[key]);
    });
    return value;
  }
  return value;
};

axios.interceptors.response.use(res => {
  if (res?.data) res.data = rewriteMediaHost(res.data);
  return res;
});

//Local server
export const API = `http://${LOCAL_HOST}:4000/api/driver/v1/`; //LOCAL
// export const API = 'https://fetchtaxi.dev.obdemo.com/api/driver/v1/'; //LOCALy
// export const API = 'https://fetchtaxi.stage04.obdemo.com/api/driver/v1/'; //STAGE
// export const API = 'https://www.getfetch.co.za/api/driver/v1/'; //Live




export const CHAT_API = `http://${LOCAL_HOST}:4000/api/`; //LOCAL
// export const CHAT_API = 'https://fetchtaxi.dev.obdemo.com/api/'; //LOCALy
// export const CHAT_API = 'https://fetchtaxi.stage04.obdemo.com/api/'; //STAGE
// export const CHAT_API = 'https://www.getfetch.co.za/api/'; //Live





export const Socket_URL = `http://${LOCAL_HOST}:4000`; //LOCAL
// export const Socket_URL = "https://fetchtaxins.dev.obdemo.com"; //LOCALy
// export const Socket_URL = "https://fetchtaxins.stage04.obdemo.com"; //STAGE
// export const Socket_URL = 'https://ns.getfetch.co.za'; //Live




export const GEOCODE_URL = 'https://maps.googleapis.com/maps/api/geocode/json?address=';

// export const myApiKey = 'AIzaSyCt8jw_uRbRfr9_8CBRdauiHY8rWCjV6WU'; // Google api

export const myApiKey = 'AIzaSyA2dTyxqYpbQ_vLV50NRDBR36RjmwSn9wI';
export const DISTANCE_MATRIX_URL = "https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=";
export const statusMessage = {
  400: 'Invalid request format.',
  401: 'Invalid API Key.',
  403: 'The request is forbidden.',
  404: 'The specified resource could not be found.',
  405: 'You tried to access the resource with an invalid method.',
  500: 'We had a problem with our server. Try again later.',
  503: "We're temporarily offline for maintenance. Please try again later.",
};

const responseBack = (data, msg, status) => {
  return {
    data,
    msg,
    status,
  };
};

export const logoutHandler = async () => {
  await removeAsyncStorage(Variables.AUTH_TOKEN);
  return true;
};

const printAPIDetails = (token, url, body) => {
  print('TOKEN : ', token);
  print('URL : ', url);
  print('BODY : ', body);
  return;
};

export const POST_FORM_DATA = async (
  route,
  body,
  onSuccess = () => { },
  onError = () => { },
  onFail = () => {
    ToastMsg(NETWORK_OFFLINE_RESPONSE.msg);
  },
  headers = {},
) => {
  if (!(await guardNetwork(onFail))) {
    return { ...NETWORK_OFFLINE_RESPONSE };
  }
  // const token = await getToken();
  console.log(`${API}${route}`, 'MYRIUTTTT::::');
  try {
    axios({
      method: 'post',
      url: `${API}${route}`,
      data: body,
      headers: {
        'Content-Type': 'multipart/form-data',
        Accept: 'application/json',
        // authorization: `Bearer ${token}`,
        // 'Accept-Language': await localization?.getLanguage(),
        'Accept-Language': localization?.getLanguage(),

        ...headers,
      },
      ...errorHandling,
    })
      .then(res => {
        console.log("4444444 ==>", res)
        if (
          res?.status == 200 ||
          res?.status == 201 ||
          res?.status == 'success'
        ) {
          onSuccess(res?.data);
        } else {
          console.log('222222222222', res);
          if (res?.status == 401) {
            // updateUnAuthorizedError();
            ToastMsg('server error!! please login again');
          }
          onError(res);
          console.log(res);
        }
      })
      .catch(err => {
        console.log(err);
        onError(err);
      });
  } catch (error) {
    console.log(error);

    print('FAIL', error);
    onFail({ data: null, msg: 'Network Error', status: 'error' });
    return { data: null, msg: 'Network Error', status: 'error' };
  }
};

export const POST = async (
  route,
  body = {},
  onSuccess = () => { },
  onError = () => { },
  onFail = () => {
    ToastMsg(NETWORK_OFFLINE_RESPONSE.msg);
  },
  headers = {},
) => {
  if (!(await guardNetwork(onFail))) {
    return { ...NETWORK_OFFLINE_RESPONSE };
  }
  const language = await getLanguage();

  try {
    axios({
      method: 'post',
      url: `${API}${route}`,
      data: body,
      headers: {
        // 'Content-Type': 'application/json',
        'Content-Type': 'multipart/form-data',
        'Accept-Language': localization?.getLanguage(),
        ...headers,
      },
      ...errorHandling,
      validateStatus: function (status) {
        return status >= 200 && status < 501; // default
      },
    })
      // .then(res => {
      //   console.log(res, 'myRESSSSSSS');
      //   console.log(res?.data?.status, 'res?.data?.status', res?.data);
      //   if (
      //     res?.status == 200 ||
      //     res?.status == 201 ||
      //     res?.data?.status === 'success'
      //   ) {
      //     onSuccess(res?.data);
      //     console.log('HERE', res?.data);
      //     return res?.data;
      //   } else {
      //     console.log('222222222222', res);
      //     if (res?.status == 401) {
      //       // updateUnAuthorizedError();
      //     }

      //     onError(res);
      //     return res;
      //   }
      // })
      .then(async res => handlePostBodyResponse(res, onSuccess, onError))
      .catch(err => {
        onError(err);
        return err;
      });
  } catch (error) {
    onFail({ data: null, msg: 'Network Error', status: 'error' });
    return { data: null, msg: 'Network Error', status: 'error' };
  }
};
export const POST_WITH_APPLICATION_JSON = async (
  route,
  body = {},
  onSuccess = () => { },
  onError = () => { },
  onFail = () => {
    ToastMsg(NETWORK_OFFLINE_RESPONSE.msg);
  },
  headers = {},
) => {
  if (!(await guardNetwork(onFail))) {
    return { ...NETWORK_OFFLINE_RESPONSE };
  }
  const token = await getToken();
  // const language = await getLanguage();

  try {
    axios({
      method: 'post',
      url: `${API}${route}`,
      data: body,
      headers: {
        Authorization: `${token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept-Language': localization?.getLanguage(),
        ...headers,
      },
      ...errorHandling,
    })
      .then(async res => handleTokenApiResponse(res, onSuccess, onError))
      .catch(err => {
        onError(err);
      });
  } catch (error) {
    onFail({ data: null, msg: 'Network Error', status: 'error' });
    return { data: null, msg: 'Network Error', status: 'error' };
  }
};

export const POST_WITHOUT_TOKEN = async (
  route,
  body = {},
  onSuccess = () => { },
  onError = () => { },
  onFail = () => {
    ToastMsg(NETWORK_OFFLINE_RESPONSE.msg);
  },
  headers = {},
) => {
  if (!(await guardNetwork(onFail))) {
    return { ...NETWORK_OFFLINE_RESPONSE };
  }
  // const language = await getLanguage();

  try {
    axios({
      method: 'post',
      url: `${API}${route}`,
      data: body,
      headers: {
        'Content-Type': 'application/form-data',
        'Accept-Language': localization?.getLanguage(),
        ...headers,
      },
      ...errorHandling,
      validateStatus: function (status) {
        return status >= '200' && status < '501'; // default
      },
    })
      .then(res => {
        console.log(res);
        if (
          res?.status == '200' ||
          res?.status == '201' ||
          res?.status == 'success'
        ) {
          onSuccess(res?.data);
          console.log(res.status);

          return res?.data;
        } else {
          if (res?.status == 401) {
            // updateUnAuthorizedError();
          }

          onError(res);
          return res;
        }
      })
      .catch(err => {
        onError(err);
        return err;
      });
  } catch (error) {
    onFail({ data: null, msg: 'Network Error', status: 'error' });
    return { data: null, msg: 'Network Error', status: 'error' };
  }
};



export const GetNew = async (
  route,
  onSuccess = () => { },
  onError = () => { },
  headers = {},
  onFail = () => {
    ToastMsg(NETWORK_OFFLINE_RESPONSE.msg);
  }
) => {
  if (!(await guardNetwork(onFail))) {
    return { ...NETWORK_OFFLINE_RESPONSE };
  }
  const lang = localization.getLanguage(); // Assuming localization is initialized
  const requestOptions = {
    method: "GET",
    headers: {
      ...headers,
      'Accept-Language': lang,
    },
    redirect: "follow",
  };

  try {
    const response = await fetch(`${API}${route}`, requestOptions);

    const result = await response.json();

    if (await checkAndForceLogout(result, response.status)) {
      onError(result);
      return;
    }

    if (response.ok) {
      if (result?.status === 'success') {
        onSuccess(result);
      } else {
        onError(result);
      }
    } else {
      onError(result);
    }
  } catch (error) {
    console.error("Fetch error:", error);
    onFail({ data: null, msg: 'Network Error', status: 'error' });
  }
};



export const GET = async (
  route,
  onSuccess = () => { },
  onError = () => { },
  headers = {},
  onFail = () => {
    ToastMsg(NETWORK_OFFLINE_RESPONSE.msg);
  },
) => {
  if (!(await guardNetwork(onFail))) {
    return { ...NETWORK_OFFLINE_RESPONSE };
  }
  // const token = await getToken();
  // const id = body?.User;
  // const pwd = body?.PWD;
  // printAPIDetails('NO TOKEN', route, 'No Body');
  console.log(`${API}${route}`);
  const lang = localization.getLanguage();
  try {
    axios({
      method: 'GET',
      url: `${API}${route}`,
      headers: {},
      "Accept-language": lang,
      ...errorHandling,
    })
      .then(res => {
        // console.log(res);

        if (res?.status == 200 || res?.data.status == 'success') {
          onSuccess(res?.data);
        } else {
          onError(res.data);
        }
      })
      .catch(err => {
        onError(err);
      });
  } catch (error) {
    onFail({ data: null, msg: 'Network Error', status: 'error' });
    return { data: null, msg: 'Network Error', status: 'error' };
  }
};

export const POST_WITH_TOKEN = async (
  route,
  body = {},
  onSuccess = () => { },
  onError = () => { },
  onFail = () => {
    ToastMsg(NETWORK_OFFLINE_RESPONSE.msg);
  },
  headers = {},
) => {
  if (!(await guardNetwork(onFail))) {
    return { ...NETWORK_OFFLINE_RESPONSE };
  }
  const token = await getToken();
  // const language = await getLanguage();

  try {
    axios({
      method: 'post',
      url: `${API}${route}`,
      data: body,
      headers: {
        Authorization: `${token}`,
        'Content-Type': 'multipart/form-data',
        'Accept-language': localization?.getLanguage(),
        ...headers,
      },
      ...errorHandling,
    })
      .then(async res => handleTokenApiResponse(res, onSuccess, onError))
      .catch(err => {
        onError(err);
      });
  } catch (error) {
    // console.warn("LMMMMMMM",error);
    onFail({ data: null, msg: 'Network Error', status: 'error' });
    return { data: null, msg: 'Network Error', status: 'error' };
  }
};
export const POST_WITH_TOKEN_WITHOUT_MULTIPART = async (
  route,
  body = {},
  onSuccess = () => { },
  onError = () => { },
  onFail = () => {
    ToastMsg(NETWORK_OFFLINE_RESPONSE.msg);
  },
  headers = {},
) => {
  if (!(await guardNetwork(onFail))) {
    return { ...NETWORK_OFFLINE_RESPONSE };
  }
  const token = await getToken();
  const language = await localization?.getLanguage();

  try {
    axios({
      method: 'post',
      url: `${API}${route}`,
      data: body,
      headers: {
        Authorization: `${token}`,
        // 'Content-Type': 'multipart/form-data',
        'Accept-language': language,
        ...headers,
      },
      ...errorHandling,
    })
      .then(async res => handleTokenApiResponse(res, onSuccess, onError))
      .catch(err => {
        onError(err);
      });
  } catch (error) {
    onFail({ data: null, msg: 'Network Error', status: 'error' });
    return { data: null, msg: 'Network Error', status: 'error' };
  }
};

export const POST_FORMDATA_WITH_TOKEN = async (
  route,
  body,
  onSuccess = () => { },
  onError = () => { },
  onFail = () => {
    ToastMsg(NETWORK_OFFLINE_RESPONSE.msg);
  },
  headers = {},
) => {
  if (!(await guardNetwork(onFail))) {
    return { ...NETWORK_OFFLINE_RESPONSE };
  }
  const token = await getToken();
  const language = await localization?.getLanguage();
  console.log('Token here ==>', token);

  try {
    axios({
      method: 'post',
      url: `${API}${route}`,
      data: body,
      headers: {
        'Content-Type': 'multipart/form-data',
        Accept: 'application/json',
        authorization: `Bearer ${token}`,
        'Accept-Language': language,
        ...headers,
      },
      ...errorHandling,
    })
      .then(async res => handleTokenApiResponse(res, onSuccess, onError))
      .catch(err => {
        onError(err);
      });
  } catch (error) {
    print('FAIL', error);
    onFail({ data: null, msg: 'Network Error', status: 'error' });
    return { data: null, msg: 'Network Error', status: 'error' };
  }
};

export const GET_WITH_TOKEN = async (
  route,
  onSuccess = () => { },
  onError = () => { },
  onFail = () => {
    ToastMsg(NETWORK_OFFLINE_RESPONSE.msg);
  },
  headers = {},
  status = () => { },
) => {
  if (!(await guardNetwork(onFail))) {
    return { ...NETWORK_OFFLINE_RESPONSE };
  }
  const token = await getToken();
  const language = await getLanguage();
  console.log('My Token is here ==>', token);
  console.log('------------>>>>>>', localization?.getLanguage());
  try {
    console.log('url here ==>', `${API}${route}`);
    
    axios({
      method: 'GET',
      url: `${API}${route}`,
      headers: {
        authorization: `Bearer ${token}`,
        'Accept-Language': localization?.getLanguage()
        ,
        ...headers,
      },
      ...errorHandling,
    })
      .then(async res => handleTokenApiResponse(res, onSuccess, onError))
      .catch(err => {
        onError(err);
        return err;
      });
  } catch (error) {
    onFail({ data: null, msg: 'Network Error', status: 'error', error });
    return { data: null, msg: 'Network Error', status: 'error' };
  }
};

export const GET_WITH_TOKEN_CHAT = async (
  route,
  onSuccess = () => { },
  onError = () => { },
  onFail = () => {
    ToastMsg(NETWORK_OFFLINE_RESPONSE.msg);
  },
  headers = {},
  status = () => { },
) => {
  if (!(await guardNetwork(onFail))) {
    return { ...NETWORK_OFFLINE_RESPONSE };
  }
  const token = await getToken();
  const language = await getLanguage();
  console.log('My Token is here ==>', token);
  console.log('------------>>>>>>', localization?.getLanguage());
  try {
    axios({
      method: 'GET',
      url: `${route}`,
      headers: {
        authorization: `Bearer ${token}`,
        'Accept-Language': localization?.getLanguage()
        ,
        ...headers,
      },
      ...errorHandling,
    })
      .then(async res => handleTokenApiResponse(res, onSuccess, onError))
      .catch(err => {
        onError(err);
        return err;
      });
  } catch (error) {
    onFail({ data: null, msg: 'Network Error', status: 'error', error });
    return { data: null, msg: 'Network Error', status: 'error' };
  }
};

export const DELETE_WITH_TOKEN = async (
  route,
  onSuccess = () => { },
  onError = () => { },
  onFail = () => {
    ToastMsg(NETWORK_OFFLINE_RESPONSE.msg);
  },
  headers = {},
) => {
  if (!(await guardNetwork(onFail))) {
    return { ...NETWORK_OFFLINE_RESPONSE };
  }
  try {
    const token = await getToken();
    const language = await localization?.getLanguage();

    axios({
      method: 'delete',
      url: `${API}${route}`,
      headers: {
        authorization: `Bearer ${token}`,
        'Accept-Language': language,

        'Content-Type': 'application/json',
        ...headers,
      },
      ...errorHandling,
    })
      .then(async res => handleTokenApiResponse(res, onSuccess, onError))
      .catch(err => {
        onError(err);
      });
  } catch (error) {
    onFail({ data: null, msg: 'Network Error', status: 'error', error });
    return { data: null, msg: 'Network Error', status: 'error' };
  }
};

export const PUT_FORM_DATA = async (
  route,
  body,
  onSuccess = () => { },
  onError = () => { },
  onFail = () => {
    ToastMsg(NETWORK_OFFLINE_RESPONSE.msg);
  },
  headers = {},
) => {
  if (!(await guardNetwork(onFail))) {
    return { ...NETWORK_OFFLINE_RESPONSE };
  }
  const token = await getToken();
  const language = await localization?.getLanguage();

  try {
    axios({
      method: 'put',
      url: `${API}${route}`,
      data: body,
      headers: {
        'Content-Type': 'multipart/form-data',
        authorization: `Bearer ${token}`,
        'Accept-Language': language,
        ...headers,
      },
      ...errorHandling,
    })
      .then(async res => handleTokenApiResponse(res, onSuccess, onError))
      .catch(err => {
        onError(err);
      });
  } catch (error) {
    onFail({ data: null, msg: 'Network Error', status: 'error' });
    return { data: null, msg: 'Network Error', status: 'error' };
  }
};

export const PUT_WITH_TOKEN = async (
  route,
  body = {},
  onSuccess = () => { },
  onError = () => { },
  onFail = () => {
    ToastMsg(NETWORK_OFFLINE_RESPONSE.msg);
  },
  headers = {},
) => {
  if (!(await guardNetwork(onFail))) {
    return { ...NETWORK_OFFLINE_RESPONSE };
  }
  const token = await getToken();
  const language = await localization.getLanguage();

  try {
    axios({
      method: 'put',
      url: `${API}${route}`,
      data: body,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept-Language': language,
        ...headers,
      },
      ...errorHandling,
    })
      .then(async res => handleTokenApiResponse(res, onSuccess, onError))
      .catch(err => {
        onError(err);
      });
  } catch (error) {
    onFail({ data: null, msg: 'Network Error', status: 'error' });
    return { data: null, msg: 'Network Error', status: 'error' };
  }
};

export function onErrorFound(res, onError) {
  const errorResponse = responseBack(null, statusMessage[res.status], 'error');
  onError(errorResponse);
  return errorResponse;
}

export const POST_URLENCODED = async (
  route,
  body = {},
  onSuccess = () => { },
  onError = () => { },
  onFail = () => {
    ToastMsg(NETWORK_OFFLINE_RESPONSE.msg);
  },
) => {
  if (!(await guardNetwork(onFail))) {
    return { ...NETWORK_OFFLINE_RESPONSE };
  }
  try {
    await axios({
      method: 'post',
      url: `${API}${route}`,
      data: body,
      headers: {
        'Content-Type': 'application/json',
        'Accept-Language': localization.getLanguage(),
      },
      // validateStatus: function (status) {
      //   return status >= 200 && status < 501; // default
      // },
    })
      .then(res => {
        if (res?.status == 200 || res?.status == 'success') {
          onSuccess(res?.data);
        } else {
          onError(res.data);
        }
      })
      .catch(err => {
        onError(err);
      });
  } catch (error) {
    onFail({ data: null, msg: 'Network Error', status: 'error' });
    return { data: null, msg: 'Network Error', status: 'error' };
  }
};
