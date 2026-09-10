import NetInfo from '@react-native-community/netinfo';
import { GET_WITH_TOKEN, NETWORK_OFFLINE_RESPONSE } from './Backend';
import { CURRENT_RIDE } from './ApiRoutes';
import { isActiveRideStatus } from '../Constants/RideStatus';
import { ToastMsg } from '../Component/ToastMsg';

export const fetchCurrentRideData = () =>
  new Promise((resolve, reject) => {
    GET_WITH_TOKEN(
      CURRENT_RIDE,
      res => {
        if (res?.status === 'success') {
          resolve(res?.data ?? null);
          return;
        }
        reject(res);
      },
      err => reject(err),
      fail => reject(fail),
    );
  });

/**
 * Blocks booking-style actions when offline or when current-ride already has an active booking.
 * Driver app: active ride is shown on Home (passenger screens use RideConfirmedPin).
 */
export const guardBeforeBookRide = async ({
  navigation,
  onProceed,
  activeRideRoute = 'Home',
}) => {
  const state = await NetInfo.fetch();
  const online =
    state.isConnected && state.isInternetReachable !== false;

  if (!online) {
    ToastMsg(NETWORK_OFFLINE_RESPONSE.msg);
    return { blocked: true, reason: 'offline' };
  }

  try {
    const ride = await fetchCurrentRideData();
    if (ride?.id && isActiveRideStatus(ride.status_id)) {
      if (navigation?.navigate) {
        navigation.navigate(activeRideRoute);
      }
      return { blocked: true, reason: 'active_ride', ride };
    }
    if (onProceed) {
      await onProceed();
    }
    return { blocked: false };
  } catch {
    ToastMsg(NETWORK_OFFLINE_RESPONSE.msg);
    return { blocked: true, reason: 'api_error' };
  }
};
