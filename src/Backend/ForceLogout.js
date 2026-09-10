import { ToastMsg } from '../Component/ToastMsg';
import { setToken, setUserData } from '../Constants/AsyncStorage';
import { Id, isAuth, Token, updateAuthData } from '../Redux/action';
import { store } from '../Redux/store';

const FORCE_LOGOUT_TYPES = new Set([
  'account_deactivated',
  'account_deleted',
  'driver_deactivated',
  'driver_deleted',
  'force_logout',
  'admin_force_logout',
  'deactivate_account',
  'delete_account',
]);

export const FORCE_LOGOUT_SOCKET_EVENTS = [
  'forceLogout',
  'force_logout',
  'driverDeactivated',
  'driver_deactivated',
  'accountDeleted',
  'account_deleted',
  'driverAccountDeactivated',
  'driver_account_deactivated',
];

const DEACTIVATION_MSG_PATTERNS = [
  /deactivat/i,
  /account.*deleted/i,
  /deleted.*account/i,
  /suspend/i,
  /blocked.*account/i,
  /no longer.*active/i,
];

const isTruthyFlag = value =>
  value === true || value === 1 || value === '1';

const normalizeType = value =>
  String(value ?? '')
    .trim()
    .toLowerCase();

export const isDeactivatedDriverProfile = data => {
  if (!data || typeof data !== 'object') {
    return false;
  }

  if (isTruthyFlag(data.is_deleted) || isTruthyFlag(data.is_deactivated)) {
    return true;
  }

  if (data.is_active === 0 || data.is_active === '0') {
    return true;
  }

  const status = normalizeType(
    data.status ?? data.account_status ?? data.driver_status,
  );

  return ['deleted', 'deactivated', 'inactive', 'suspended', 'blocked'].includes(
    status,
  );
};

export const isForceLogoutNotification = payload => {
  if (!payload || typeof payload !== 'object') {
    return false;
  }

  const type = normalizeType(
    payload.type ??
      payload.notification_type ??
      payload.NotificationType ??
      payload.message_type,
  );

  return FORCE_LOGOUT_TYPES.has(type);
};

export const isForceLogoutResponse = (body, httpStatus) => {
  if (httpStatus === 401 || httpStatus === 403) {
    return true;
  }

  if (!body || typeof body !== 'object') {
    return false;
  }

  const code = normalizeType(body.code ?? body.error_code);
  const type = normalizeType(
    body.type ?? body.notification_type ?? body.message_type,
  );

  if (FORCE_LOGOUT_TYPES.has(code) || FORCE_LOGOUT_TYPES.has(type)) {
    return true;
  }

  if (isDeactivatedDriverProfile(body.data ?? body)) {
    return true;
  }

  if (String(body.status ?? '').toLowerCase() === 'error') {
    const msg = String(body.msg ?? body.message ?? '');
    if (DEACTIVATION_MSG_PATTERNS.some(pattern => pattern.test(msg))) {
      return true;
    }
  }

  return false;
};

let forceLogoutInProgress = false;

export const handleForceLogout = async message => {
  if (forceLogoutInProgress) {
    return;
  }

  forceLogoutInProgress = true;
  try {
    const text = message != null ? String(message).trim() : '';
    if (text) {
      ToastMsg(text);
    }
    if (typeof global.LogoutHandle === 'function') {
      await global.LogoutHandle();
    } else {
      await setToken('');
      await setUserData('');
      store.dispatch(isAuth(false));
      store.dispatch(Token({ token: '' }));
      store.dispatch(updateAuthData({}));
      store.dispatch(Id(''));
    }
  } finally {
    forceLogoutInProgress = false;
  }
};

export const checkAndForceLogout = async (body, httpStatus) => {
  if (!isForceLogoutResponse(body, httpStatus)) {
    return false;
  }

  const message = body?.msg ?? body?.message;
  await handleForceLogout(message);
  return true;
};
