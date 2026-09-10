import {
  AUTH,
  TOKEN,
  LOG_OUT,
  LANGUAGE_CODE,
  SET_USER,
  SKIP,
  DROP_DATA,
  SELECTCOMP,
  CHOOSELANGUAGE,
  ID,
  AUTH_DATA,
  MASTER_DATA,
  CHECK_BOX,
  PERSONAL_DATA,
  SOCIAL_DATA,
  EXPIRED_DOC_DETAILS,
  INCOMING_BOOKING,
  CLEAR_INCOMING_BOOKING
} from './constant';

export const isAuth = status => ({
  type: AUTH,
  payload: {
    isAuth: status,
    userDetails: {},
  },
});

export const isChooseLanguage = status => ({
  type: CHOOSELANGUAGE,
  payload: {
    isChooseLanguage: status,
    userDetails: {},
  },
});
export const userDetails = status => ({
  type: SET_USER,
  payload: {
    userDetails: status,
  },
});
export const Id = status => ({
  type: ID,
  payload: {
    Id: status,
  },
});
export const updateAuthData = status => ({
  type: AUTH_DATA,
  payload: {
    updateAuthData: status,
  },
});
export const Token = status => ({
  type: TOKEN,
  payload: {
    Token: status,
  },
});

export const langCode = data => ({
  type: LANGUAGE_CODE,
  payload: {
    language_code: data,
  },
});

export const is_skip = data => ({
  type: SKIP,
  payload: {
    skip_intro: data,
  },
});

export const logOut = () => ({
  type: LOG_OUT,
  payload: {
    isAuth: false,
    userDetails: {},
  },
});
export const selectComp = status => ({
  type: SELECTCOMP,
  payload: {
    selectComp: {},
  },
});
export const masterData = status => ({
  type: MASTER_DATA,
  payload: {
    master_data: status,
  },
});
export const checkBox = status => ({
  type: CHECK_BOX,
  payload: {
    check_box: status,
  },
});
export const personalData = status => ({
  type: PERSONAL_DATA,
  payload: {
    personalData: status,
  },
});

export const expiredDocDetails = (expiredData, status) => ({
  type: EXPIRED_DOC_DETAILS,
  payload: {
    expiredDocDetails: expiredData,
    isDocExpired: status
  },
});

export const socialdata = status => ({
  type: SOCIAL_DATA,
  payload: {
    socialdata : status,
  },
});

export const incomingBooking = booking => ({
  type: INCOMING_BOOKING,
  payload: booking,
});

export const clearIncomingBooking = () => ({
  type: CLEAR_INCOMING_BOOKING,
});