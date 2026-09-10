import { navigationRef } from '../Navigation/MainNavigation';
import { store } from '../Redux/store';
import { incomingBooking } from '../Redux/action';

function normalizeNotificationPayload(raw) {
  if (!raw || typeof raw !== 'object') {
    return {};
  }
  if (raw.data && typeof raw.data === 'object' && !Array.isArray(raw.data)) {
    return { ...raw.data };
  }
  return { ...raw };
}

function isChatNotificationPayload(payload) {
  const t = String(payload?.type ?? '')
    .trim()
    .toLowerCase();
  return t === 'new_message';
}

function isBookingNotificationPayload(payload) {
  const t = String(
    payload?.type ??
    payload?.notification_type ??
    payload?.NotificationType ??
    payload?.message_type ??
    ''
  )
    .trim()
    .toLowerCase();

  const bookingTypes = new Set([
    'new_booking_request',
    'new_booking',
    'booking_request',
    'incoming_booking',
    'ride_request',
  ]);

  return bookingTypes.has(t) || payload?.booking_id != null;
}

function navigateToHomeOpenChat() {
  const tryNav = (attempt = 0) => {
    if (!navigationRef.isReady()) {
      if (attempt < 50) {
        setTimeout(() => tryNav(attempt + 1), 100);
      }
      return;
    }
    navigationRef.navigate('DrawerNavigation', {
      screen: 'DrawerStack',
      params: {
        screen: 'Home',
        params: {
          screen: 'HomeScreen',
          params: { openChatFromNotification: true },
        },
      },
    });
  };
  tryNav();
}

function navigateToHomeBooking() {
  const tryNav = (attempt = 0) => {
    if (!navigationRef.isReady()) {
      if (attempt < 50) {
        setTimeout(() => tryNav(attempt + 1), 100);
      }
      return;
    }
    store.dispatch(incomingBooking(true));
    navigationRef.navigate('DrawerNavigation', {
      screen: 'DrawerStack',
      params: {
        screen: 'Home',
        params: {
          screen: 'HomeScreen',
          params: { openBookingFromNotification: true },
        },
      },
    });
  };
  tryNav();
}

export const notificationOpen = async notification => {
  const payload = normalizeNotificationPayload(notification);
  if (isChatNotificationPayload(payload)) {
    navigateToHomeOpenChat();
    return;
  }
  if (isBookingNotificationPayload(payload)) {
    navigateToHomeBooking();
    return;
  }
};

