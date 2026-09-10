import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { NativeModules, Platform } from 'react-native';
import PushNotification from 'react-native-push-notification';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import { API } from '../Backend/Backend';
import { NOTIFICATIONS } from '../Backend/ApiRoutes';
import { getLanguage, getToken } from '../Constants/AsyncStorage';
import localization from '../Constants/localization';

const BADGE_COUNT_KEY = 'notification_badge_count';
const { NotificationBadgeStorage } = NativeModules;

const pickTotal = (...values) => {
  for (const value of values) {
    if (value == null || value === '') {
      continue;
    }
    const n = Number(value);
    if (!Number.isNaN(n) && n >= 0) {
      return Math.floor(n);
    }
  }
  return null;
};

export const extractNotificationList = res => {
  if (!res || typeof res !== 'object') {
    return [];
  }
  if (Array.isArray(res)) {
    return res;
  }
  if (Array.isArray(res.data)) {
    return res.data;
  }
  if (Array.isArray(res.data?.data)) {
    return res.data.data;
  }
  if (Array.isArray(res.result?.data)) {
    return res.result.data;
  }
  if (Array.isArray(res.result)) {
    return res.result;
  }
  if (Array.isArray(res.notifications)) {
    return res.notifications;
  }
  if (Array.isArray(res.records)) {
    return res.records;
  }
  return [];
};

/** Returns total inbox count from API body, or null when unknown. */
export const extractNotificationTotal = res => {
  if (!res || typeof res !== 'object') {
    return null;
  }

  const pagination =
    res.pagination ??
    res.meta ??
    res.result?.pagination ??
    res.result?.meta ??
    res.data?.pagination ??
    res.data?.meta ??
    (res.data && !Array.isArray(res.data) ? res.data : null) ??
    (res.result && !Array.isArray(res.result) ? res.result : null);

  const explicit = pickTotal(
    pagination?.total,
    pagination?.total_count,
    pagination?.totalCount,
    res.unread_count,
    res.unreadCount,
    res.notification_count,
    res.notificationCount,
    res.total,
    res.total_count,
    res.totalRecords,
    res.count,
    res.result?.total,
    res.result?.total_count,
    res.result?.unread_count,
    res.data?.total,
    res.data?.total_count,
    res.data?.unread_count,
    res.data?.unreadCount,
    res.data?.notification_count,
  );

  if (explicit != null) {
    return explicit;
  }

  const list = extractNotificationList(res);
  const lastPage = Number(pagination?.last_page);
  if (lastPage === 1) {
    return list.length;
  }

  return null;
};

class NotificationBadgeService {
  cachedCount = 0;
  syncInFlight = null;

  persistNativeCount = async count => {
    if (Platform.OS === 'ios' && NotificationBadgeStorage?.setCount) {
      NotificationBadgeStorage.setCount(count);
    }
  };

  applyPlatformBadge = count => {
    const n = Math.max(0, Math.floor(Number(count) || 0));
    if (Platform.OS === 'ios') {
      if (NotificationBadgeStorage?.setCount) {
        NotificationBadgeStorage.setCount(n);
      } else {
        PushNotificationIOS.setApplicationIconBadgeNumber(n);
      }
    } else {
      PushNotification.setApplicationIconBadgeNumber(n);
    }
    return n;
  };

  setCount = async count => {
    const n = this.applyPlatformBadge(count);
    this.cachedCount = n;
    try {
      await AsyncStorage.setItem(BADGE_COUNT_KEY, String(n));
    } catch (e) {}
    return n;
  };

  getCount = () => this.cachedCount;

  clear = () => this.setCount(0);

  readStoredCount = async () => {
    let stored = this.cachedCount;
    try {
      const raw = await AsyncStorage.getItem(BADGE_COUNT_KEY);
      if (raw != null) {
        stored = Math.max(0, Number(raw) || 0);
      }
    } catch (e) {}

    if (Platform.OS === 'ios' && NotificationBadgeStorage?.getCount) {
      try {
        const nativeCount = await NotificationBadgeStorage.getCount();
        stored = Math.max(stored, Number(nativeCount) || 0);
      } catch (e) {}
    }

    return stored;
  };

  fetchTotalFromApi = async () => {
    const token = await getToken();
    if (!token) {
      return null;
    }

    const language =
      (typeof localization?.getLanguage === 'function' &&
        localization.getLanguage()) ||
      (await getLanguage()) ||
      'en';

    const response = await axios({
      method: 'GET',
      url: `${API}${NOTIFICATIONS}?page=1`,
      headers: {
        authorization: `Bearer ${token}`,
        'Accept-Language': language,
      },
      timeout: 20000,
      validateStatus: status => status >= 200 && status < 501,
    });

    if (response.status !== 200 && response.status !== 201) {
      return null;
    }

    return extractNotificationTotal(response.data);
  };

  syncFromServer = async (options = {}) => {
    const { delayMs = 0, retries = 2 } = options;

    if (this.syncInFlight) {
      return this.syncInFlight;
    }

    this.syncInFlight = (async () => {
      if (delayMs > 0) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }

      const token = await getToken();
      if (!token) {
        await this.clear();
        return 0;
      }

      for (let attempt = 0; attempt <= retries; attempt += 1) {
        try {
          const total = await this.fetchTotalFromApi();
          if (total != null) {
            await this.setCount(total);
            return total;
          }
        } catch (e) {
          // retry
        }

        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, 500 * (attempt + 1)));
        }
      }

      return this.cachedCount;
    })();

    try {
      return await this.syncInFlight;
    } finally {
      this.syncInFlight = null;
    }
  };

  extractBadgeFromPush = remoteMessage => {
    const data = remoteMessage?.data || {};
    return pickTotal(
      data.badge,
      data.badge_count,
      data.unread_count,
      data.notification_count,
      remoteMessage?.notification?.ios?.badge,
      remoteMessage?.notification?.android?.notificationCount,
    );
  };

  /**
   * New push arrived. On iOS use native UserDefaults increment so APNS badge:1
   * cannot reset 19 → 1. On Android bump cached count + sync from API.
   */
  onPushReceived = async (remoteMessage = null) => {
    const pushBadge = this.extractBadgeFromPush(remoteMessage);
    const stored = await this.readStoredCount();
    const base = Math.max(this.cachedCount, stored);

    if (Platform.OS === 'ios' && NotificationBadgeStorage?.increment) {
      let next = base + 1;
      try {
        let nativeCount = 0;
        if (NotificationBadgeStorage.getCount) {
          nativeCount = Number(await NotificationBadgeStorage.getCount()) || 0;
        }
        const seed = Math.max(base, nativeCount);
        if (NotificationBadgeStorage.setCount) {
          NotificationBadgeStorage.setCount(seed);
        }
        const nativeNext = Number(await NotificationBadgeStorage.increment());
        if (!Number.isNaN(nativeNext) && nativeNext > 0) {
          next = nativeNext;
        }
      } catch (e) {
        await this.setCount(next);
      }

      if (pushBadge != null && pushBadge > next) {
        next = pushBadge;
        await this.setCount(next);
      }

      this.cachedCount = next;
      try {
        await AsyncStorage.setItem(BADGE_COUNT_KEY, String(next));
      } catch (e) {}

      this.syncFromServer({ delayMs: 1500, retries: 2 }).then(synced => {
        if (synced != null && synced >= next) {
          this.setCount(synced);
        }
      });

      return next;
    }

    const next =
      pushBadge != null && pushBadge > base ? pushBadge : base + 1;
    await this.setCount(next);

    this.syncFromServer({ delayMs: 1200, retries: 2 }).then(synced => {
      if (synced != null && synced >= next) {
        this.setCount(synced);
      }
    });

    return next;
  };

  hydrateFromStorage = async () => {
    const stored = await this.readStoredCount();
    if (stored > 0) {
      this.cachedCount = stored;
      this.applyPlatformBadge(stored);
      return stored;
    }
    return 0;
  };
}

export const notificationBadgeService = new NotificationBadgeService();
