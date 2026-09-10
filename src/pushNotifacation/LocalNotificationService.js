import PushNotification from 'react-native-push-notification';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import { Platform } from 'react-native';
import Sound from 'react-native-sound';
import { notificationOpen } from './notificationAction';
import { notificationBadgeService } from './NotificationBadgeService';
import { store } from '../Redux/store';

class LocalNotificationService {
  // Reference to the sound object to stop it manually
  currentSound = null;

  /** PushNotification.configure stacks callbacks if called more than once. */
  configured = false;

  /** Skip duplicate alerts for the same payload within this window (ms). */
  dedupeWindowMs = 8000;
  lastShownKeys = new Map();

  configure = () => {
    if (this.configured) {
      return;
    }
    this.configured = true;
    this.createChannel();
    this.configureNotification();
  };

  /**
   * Maps any string to a stable 32-bit int string for Android notification `id`.
   * (Native parses Integer — UUID message ids must not fall back to random each time.)
   */
  stableAndroidIdFromString = value => {
    const s = String(value ?? '');
    let h = 5381;
    for (let i = 0; i < s.length; i++) {
      h = ((h << 5) + h + s.charCodeAt(i)) | 0;
    }
    const n = Math.abs(h % 2147483647);
    return String(n === 0 ? 1 : n);
  };

  buildDedupeKey = ({ notification, data, fcmMessageId }) => {
    const d = data || {};
    const messageType = this.normalizeMessageType(d);
    // Each FCM delivery has a unique messageId — same ride re-offered is a new message → new sound.
    if (fcmMessageId) {
      return `${messageType}:${fcmMessageId}`;
    }
    const msgId = [d.message_id, d.chat_message_id]
      .map(x => (x != null ? String(x).trim() : ''))
      .find(Boolean);
    const bookingId = d.booking_id != null ? String(d.booking_id).trim() : '';
    const title = notification?.title != null ? String(notification.title) : '';
    const body = notification?.body != null ? String(notification.body) : '';
    if (msgId) {
      return `${messageType}:${msgId}`;
    }
    return `${messageType}:${bookingId}:${title}:${body}`;
  };

  shouldSkipDuplicate = key => {
    const now = Date.now();
    for (const [k, t] of this.lastShownKeys) {
      if (now - t > this.dedupeWindowMs) {
        this.lastShownKeys.delete(k);
      }
    }
    const last = this.lastShownKeys.get(key);
    if (last != null && now - last < this.dedupeWindowMs) {
      return true;
    }
    this.lastShownKeys.set(key, now);
    return false;
  };

  createChannel = () => {
    PushNotification.createChannel(
      {
        channelId: 'channel-id',
        channelName: 'Booking Channel',
        channelDescription: 'Booking notifications',
        playSound: true,
        soundName: 'mysound', // Android: sound file in res/raw
        importance: 4,
        vibrate: true,
      },
      created => {},
    );

    PushNotification.createChannel(
      {
        channelId: 'booking-default-channel',
        channelName: 'Booking updates',
        channelDescription: 'Ride updates, cancellations (system default sound)',
        playSound: true,
        soundName: 'default',
        importance: 4,
        vibrate: true,
      },
      created => {},
    );

    PushNotification.createChannel(
      {
        channelId: 'default-message-channel',
        channelName: 'Message Channel',
        channelDescription: 'Message notifications',
        playSound: true,
        soundName: 'default',
        importance: 4,
        vibrate: true,
      },
      created => {},
    );
  };

  /** Alternate keys / spellings backends use for FCM data payload. */
  normalizeMessageType = data => {
    const d = data || {};
    const raw =
      d.type ??
      d.notification_type ??
      d.NotificationType ??
      d.message_type ??
      '';
    return String(raw).trim().toLowerCase();
  };

  /** UNNotification userInfo must be plist-safe (strings/numbers); avoid nested objects. */
  sanitizeIosUserInfo = data => {
    const d = data || {};
    const out = {};
    for (const key of Object.keys(d)) {
      const v = d[key];
      if (v === undefined || v === null) {
        continue;
      }
      const k = String(key);
      if (typeof v === 'object') {
        try {
          out[k] = JSON.stringify(v);
        } catch {
          out[k] = String(v);
        }
      } else if (typeof v === 'boolean' || typeof v === 'number') {
        out[k] = v;
      } else {
        out[k] = String(v);
      }
    }
    return out;
  };

  bookingTypesThatUseMysound = new Set([
    'new_booking_request',
    'new_booking',
    'booking_request',
    'incoming_booking',
    'ride_request',
  ]);

  /**
   * Rider cancel sometimes arrives with type still set like a booking ping, or only title/body.
   * Never treat these as the urgent "new booking" sound.
   * Avoid matching substrings like "cancellation" inside unrelated titles — use word boundaries.
   */
  looksLikeRideCancelNotification = (notification, data) => {
    const type = this.normalizeMessageType(data);
    if (
      type &&
      !this.bookingTypesThatUseMysound.has(type) &&
      /cancel/.test(type)
    ) {
      return true;
    }
    const title = String(notification?.title ?? data?.title ?? '');
    return (
      /\b(canceled|cancelled)\b/i.test(title) ||
      /\bcancel\s+(ride|booking|trip|request)\b/i.test(title) ||
      /^cancel\b/i.test(title.trim())
    );
  };

  configureNotification = () => {
    let config = {
      onRegister: function (token) {},
      onNotification: function (notification) {
        if (notification.userInteraction) {
          const payload =
            Platform.OS === 'android'
              ? notification.data
              : notification.userInfo;

          notificationOpen(payload);
        }

        if (
          notification?.title?.includes('Canceled') ||
          notification?.data?.booking_id
        ) {
          store.dispatch({ type: 'RIDE_CANCELLED' });
        }

        if (Platform.OS === 'ios') {
          notification.finish(PushNotificationIOS.FetchResult.NoData);
        }
      },
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
      popInitialNotification: true,
      requestPermissions: true,
    };

    PushNotification.configure(config);
  };

  unRegister = () => {
    PushNotification.unregister();
  };

  showlocalNotification = async remoteMessage => {
    const notification = remoteMessage?.notification;
    const data = remoteMessage?.data || {};
    const fcmMessageId = remoteMessage?.messageId;
    console.log('remoteMessage',remoteMessage);
    

    const dedupeKey = this.buildDedupeKey({
      notification,
      data,
      fcmMessageId,
    });
    if (this.shouldSkipDuplicate(dedupeKey)) {
      return;
    }

    // FCM data values are often strings; normalize for robust matching.
    const messageType = this.normalizeMessageType(data);
    const isChatMessage = messageType === 'new_message';

    const useMysoundForNewBookingOnly =
      this.bookingTypesThatUseMysound.has(messageType) &&
      !this.looksLikeRideCancelNotification(notification, data);

    const titleText =
      notification?.title ?? data?.title ?? 'New Notification';
    const bodyText = notification?.body ?? data?.body ?? '';

    // Android native uses Integer.parseInt(id) — only valid 32-bit ints; timestamps
    // and `Date.now()-…` strings throw and the notification is dropped.
    const androidValidNotificationId = (preferred, stableSeed) => {
      if (preferred != null && String(preferred).length) {
        const t = String(preferred).trim();
        const m = t.match(/^(-?\d+)$/);
        if (m) {
          const n = parseInt(m[1], 10);
          if (n >= -2147483648 && n <= 2147483647) {
            return String(n);
          }
        }
        // UUID / non-numeric ids: stable hash so the same message replaces instead of stacking.
        return this.stableAndroidIdFromString(`${stableSeed}:${t}`);
      }
      return this.stableAndroidIdFromString(String(stableSeed));
    };

    const chatStableSeed =
      data?.booking_id != null
        ? `chat:${data.booking_id}`
        : `chat:${dedupeKey}`;

    const notificationId =
      Platform.OS === 'android'
        ? isChatMessage
          ? androidValidNotificationId(
              data?.message_id ?? data?.chat_message_id,
              chatStableSeed,
            )
          : useMysoundForNewBookingOnly
            ? androidValidNotificationId(
                null,
                `newbooking:${fcmMessageId ?? Date.now()}:${dedupeKey}`,
              )
            : androidValidNotificationId(
                data?.booking_id,
                data?.booking_id ?? dedupeKey,
              )
        : String(
            isChatMessage
              ? data?.message_id ||
                data?.chat_message_id ||
                `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
              : useMysoundForNewBookingOnly
                ? `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
                : data?.booking_id || Date.now(),
          );

    if (Platform.OS === 'ios') {
      // react-native-push-notification maps soundName "default" to
      // UNNotificationSound.soundNamed(@"default") (file not found). Omit `sound` so
      // RCTConvert uses UNNotificationSound.defaultSound unless silent/custom.
      const iosId = String(notificationId || `n-${Date.now()}`);
      const badge = await notificationBadgeService.onPushReceived(remoteMessage);
      const iosRequest = {
        id: iosId,
        title: titleText,
        body: bodyText,
        badge,
        userInfo: this.sanitizeIosUserInfo(data),
      };
      if (useMysoundForNewBookingOnly) {
        iosRequest.isSilent = true;
        this.playSpeakerSound('mysound.wav');
      }
      PushNotificationIOS.addNotificationRequest(iosRequest);
      return;
    }

    let config = {
      id: notificationId,
      title: titleText,
      message: bodyText,
      userInfo: data,
      playSound: true,
      // Repeat ride requests must alert + sound every time (same booking_id can be re-sent).
      onlyAlertOnce: !(isChatMessage || useMysoundForNewBookingOnly),
      importance: 4,
    };

    // Android 8+: channel sound wins over per-notification soundName. Keep mysound
    // only on channel-id; everything else uses booking-default-channel.
    if (messageType === 'new_message') {
      config.channelId = 'default-message-channel';
    } else if (useMysoundForNewBookingOnly) {
      config.channelId = 'channel-id';
    } else {
      config.channelId = 'booking-default-channel';
    }
    config.data = data;
    config.soundName = useMysoundForNewBookingOnly ? 'mysound' : 'default';

    PushNotification.localNotification(config);
    await notificationBadgeService.onPushReceived(remoteMessage);
  };

  playSpeakerSound = (soundFile) => {
    // Set category to Playback to route to primary speaker
    Sound.setCategory('Playback', true);

    // Tear down any previous instance synchronously. Async callbacks here
    // must NOT reference `this.currentSound`, because by the time they fire
    // it may already point at the next sound (race that silences re-offers).
    if (this.currentSound) {
      const prev = this.currentSound;
      this.currentSound = null;
      try { prev.stop(); } catch (e) {}
      try { prev.release(); } catch (e) {}
    }

    const sound = new Sound(soundFile, Sound.MAIN_BUNDLE, (error) => {
      if (error) {
        console.log('Failed to load sound', error);
        return;
      }
      // If a newer sound replaced us while loading, do not play this one.
      if (this.currentSound !== sound) {
        try { sound.release(); } catch (e) {}
        return;
      }
      sound.setVolume(1.0);
      sound.play(() => {
        try { sound.release(); } catch (e) {}
        if (this.currentSound === sound) {
          this.currentSound = null;
        }
      });
    });
    this.currentSound = sound;
  };

  cancelAllLocalNotifications = () => {
    // 1. Cancel pending/scheduled notifications
    PushNotification.cancelAllLocalNotifications();

    if (Platform.OS === 'ios') {
      // 2. Remove delivered notifications from the tray
      PushNotificationIOS.removeAllDeliveredNotifications();

      // 4. Stop the custom sound immediately. Capture a local ref and clear
      // `this.currentSound` BEFORE the async stop callback runs — otherwise
      // a re-offered ride that calls playSpeakerSound() between stop() and
      // its callback gets its new Sound released here, silencing it.
      if (this.currentSound) {
        const sound = this.currentSound;
        this.currentSound = null;
        sound.stop(() => {
          try { sound.release(); } catch (e) {}
        });
      }
    } else {
      PushNotification.removeAllDeliveredNotifications?.();
    }
  };

  removeAllDeliveredNotificationByID = notificationId => {
    if (Platform.OS === 'ios') {
      PushNotificationIOS.removeDeliveredNotifications([`${notificationId}`]);
    } else {
      PushNotification.cancelLocalNotifications({ id: `${notificationId}` });
    }
  };
}

export const localNotificationService = new LocalNotificationService();