import {isChooseLanguage, userDetails} from './action';
import {
  AUTH,
  TOKEN,
  LANGUAGE_CODE,
  SET_USER,
  SET_DATA,
  SKIP,
  LOG_OUT,
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
  CLEAR_INCOMING_BOOKING,
} from './constant';

const initialState = {
  isAuth: false,
  isChooseLanguage: true,
  is_skip: true,
  userDetails: {},
  userData: {},
  Token: '',
  drop_data: [],
  selectComp: {},
  Id: '',
  userAuthData: {},
  master_data: [],
  check_box: {},
  language_code: '',
  socialdata: {},
  expiredDocDetails: [],
  isDocExpired: false,
  personalData: {},
};

const todoReducer = (state = initialState, action) => {
  switch (action.type) {
    case AUTH:
      return {
        ...state,
        isAuth: action.payload.isAuth,
        // userDetails: initialState,
      };
    case CHOOSELANGUAGE:
      return {
        ...state,
        isChooseLanguage: action.payload.isChooseLanguage,
        // userDetails: initialState,
      };
    case SET_USER:
      return {
        ...state,
        userDetails: action.payload.userDetails,
      };
    case SET_DATA:
      return {
        ...state,
        userData: action.payload.userData,
      };
    case TOKEN:
      return {
        ...state,
        Token: action.payload.Token,
      };

    case LANGUAGE_CODE:
      return {
        ...state,
        language_code: action.payload.language_code,
      };

    case SKIP: {
      const status = action.payload;
      return {
        ...state,
        skip_intro: status.skip_intro,
      };
    }
    case ID: {
      const status = action.payload;
      return {
        ...state,
        Id: status.Id,
      };
    }
    case AUTH_DATA: {
      const status = action.payload;
      return {
        ...state,
        updateAuthData: status.updateAuthData,
      };
    }
    case SELECTCOMP: {
      const status = action.payload;
      return {
        ...state,
        selectComp: status.selectComp,
      };
    }
    case MASTER_DATA:
      return {
        ...state,
        master_data: action.payload.master_data,
      };
    case CHECK_BOX:
      return {
        ...state,
        check_box: action.payload.check_box,
      };
    case EXPIRED_DOC_DETAILS:
      return {
        ...state,
        expiredDocDetails: action.payload.expiredDocDetails,
        isDocExpired: action.payload.isDocExpired,
      };

    case PERSONAL_DATA:
      return {
        ...state,
        personalData: action.payload.personalData,
      };
    case SOCIAL_DATA:
      return {
        ...state,
        socialdata: action.payload.socialdata,
      };
    case INCOMING_BOOKING:
      return {
        ...state,
        incomingBooking: action.payload,
      };

    case CLEAR_INCOMING_BOOKING:
      return {
        ...state,
        incomingBooking: null,
      };
    case LOG_OUT:
      return initialState;
    default:
      return state;
  }
};

export default todoReducer;
