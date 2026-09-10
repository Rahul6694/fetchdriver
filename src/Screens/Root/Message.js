import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Image, SectionList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Images } from '../../Constants/Images';
import { Fonts } from '../../Constants/Fonts';
import { Colors } from '../../Constants/Colors';
import HeaderWithBack from '../../Component/HeaderWithBack';
import { CLEAR_NOTIFICATIONS, NOTIFICATIONS } from '../../Backend/ApiRoutes';
import { GET_WITH_TOKEN } from '../../Backend/Backend';
import moment from 'moment';
import Typography from '../../Component/UI/Typography';
import localization from '../../Constants/localization';
import { FULL_HEIGHT } from '../../Constants/Layout';
import { localNotificationService } from '../../pushNotifacation/LocalNotificationService';
import {
  extractNotificationTotal,
  notificationBadgeService,
} from '../../pushNotifacation/NotificationBadgeService';

const getPaginationNext = pageData => {
  if (!pageData || typeof pageData !== 'object') {
    return { canLoad: false, next: 1 };
  }
  if (pageData.current_page != null && pageData.last_page != null) {
    return {
      canLoad: Number(pageData.current_page) < Number(pageData.last_page),
      next: (Number(pageData.current_page) || 1) + 1,
    };
  }
  return { canLoad: false, next: 1 };
};

const extractNotificationsPayload = res => {
  if (Array.isArray(res)) {
    return { list: res, pagination: undefined };
  }
  if (res && typeof res === 'object') {
    if (Array.isArray(res.data)) {
      return { list: res.data, pagination: res.pagination };
    }
    if (res.data && Array.isArray(res.data.data)) {
      return { list: res.data.data, pagination: res.data };
    }
  }
  return { list: [], pagination: undefined };
};

const Message = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPagination, setIsPagination] = useState(false);
  const [pageData, setPageData] = useState();



  // const clearAllNotifications = () => {
  //   setLoading(true);
  //   GET_WITH_TOKEN(
  //     `${CLEAR_NOTIFICATIONS}`,
  //     res => {
  //       setNotifications([]);
  //       setPageData(undefined);
  //       localNotificationService.cancelAllLocalNotifications();
  //       getNotifications(1);
  //       console.log('res clear all notifications', res);
  //       setLoading(false);
  //     },
  //     error => {
  //       console.log('error clear all notifications', error);
  //       setLoading(false);
  //     },
  //     fail => {
  //       console.log('fail clear all notifications', fail);
  //       setLoading(false);
  //     },
  //   );
  // };
const clearAllNotifications = () => {
  setLoading(true);

  GET_WITH_TOKEN(
    `${CLEAR_NOTIFICATIONS}`,
    res => {
      setNotifications([]);
      setPageData(undefined);

      localNotificationService.cancelAllLocalNotifications();
      notificationBadgeService.clear();

      getNotifications(1);
      setLoading(false);
    },
    error => {
      setLoading(false);
    },
    fail => {
      setLoading(false);
    },
  );
};

  const getNotifications = (pageNumber = 1) => {
    const slug = `?page=${pageNumber}`;

    if (pageNumber === 1) {
      setLoading(true);
    } else {
      setIsPagination(true);
    }

    GET_WITH_TOKEN(
      `${NOTIFICATIONS}${slug}`,
      res => {
        console.log('res from Message', res);

        const { list: newData, pagination } = extractNotificationsPayload(res);
        setPageData(pagination);
        if (pageNumber === 1) {
          setNotifications(newData);
          const total = extractNotificationTotal(res);
          if (total != null) {
            notificationBadgeService.setCount(total);
          }
        } else {
          setNotifications(prev => [...(prev || []), ...newData]);
        }
        setLoading(false);
        setIsPagination(false);
      },
      error => {
        if (pageNumber === 1) {
          setNotifications([]);
        }
        console.log('Error from message:', error);
        setLoading(false);
        setIsPagination(false);
      },
      fail => {
        console.log('Failed from message:', fail);
        setLoading(false);
        setIsPagination(false);
      },
    );
  };

  // useEffect(() => {
  //   getNotifications(1);
  // }, []);

  //
useEffect(() => {
  getNotifications(1);
}, []);

//
  const handleLoadMore = () => {
    const { canLoad, next } = getPaginationNext(pageData);
    if (!canLoad || isPagination || loading) {
      return;
    }
    getNotifications(next);
  };

  const renderFooter = () => {
    if (!isPagination) {
      return null;
    }
    return (
      <View style={styles.loadMoreFooter}>
        <ActivityIndicator size="large" color={Colors.Black} />
      </View>
    );
  };
  const groupNotificationsByDate = notifications => {
    const today = moment().format('YYYY-MM-DD');

    const grouped = [
      {
        title: localization.rideSummary.today,
        data: notifications.filter(item => moment(item.created_at).format('YYYY-MM-DD') === today)
      },
      {
        title: localization.rideSummary.earlier,
        data: notifications.filter(item => moment(item.created_at).format('YYYY-MM-DD') !== today)
      }
    ];

    return grouped;
  };
  const renderItem = ({ item }) => (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        borderTopColor: Colors.borderColor,
        borderTopWidth: 0.5,
        paddingVertical: 12,
        marginTop: 10,
      }}>
      <View
        style={{
          backgroundColor: '#E7E9E7',
          borderRadius: 50,
          width: 50,
          height: 50,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Image
          source={Images.letter}
          style={{ width: 25, height: 25, resizeMode: 'contain' }}
        />
      </View>
      <View style={{ marginLeft: 15, width: '80%' }}>
        <Typography
          size={16}
          fontFamily={Fonts.Inter_SemiBold}
          color={Colors.Black}
          numberOfLines={2}>
          {item?.title}
        </Typography>
        <Typography
          size={14}
          fontFamily={Fonts.Inter_Regular}
          color={'#000'}
        >
          {item.notification_description}
        </Typography>
      </View>
    </View>
  );

  const notificationSections = groupNotificationsByDate(notifications).filter(
    section => section.data.length > 0,
  );

  return (
    <View style={styles.screen}>
      <HeaderWithBack source={Images.Back} title={localization.DrawerScreen.messages} />
      <View style={styles.container}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.Black} />
          </View>
        ) : (
          <View>
            <TouchableOpacity onPress={() => clearAllNotifications()}>
              <Typography size={16}
                fontFamily={Fonts.Inter_SemiBold}
                color={Colors.Black}
                style={styles.clearAll}>
                {localization.message.clearAll}
              </Typography>
            </TouchableOpacity>
            <SectionList
              sections={notificationSections}
              contentContainerStyle={{ paddingBottom: 30 }}
              keyExtractor={item => String(item.id)}
              renderItem={renderItem}
              renderSectionHeader={({ section: { title } }) => (
                <Typography
                  size={16}
                  fontFamily={Fonts.Inter_SemiBold}
                  color={Colors.Black}
                  style={styles.sectionHeader}>
                  {title}
                </Typography>
              )}
              showsVerticalScrollIndicator={false}
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.4}
              ListFooterComponent={renderFooter}
              ListEmptyComponent={() => (
                <View style={styles.emptyContainer}>
                  <Typography
                    fontFamily={Fonts?.Inter_Medium}
                    color={Colors?.Black}
                    size={20}>
                    {localization.rideSummary.noMessage}
                  </Typography>
                </View>
              )}
            />
          </View>
        )}
      </View>
    </View>
  );
};

export default Message;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    width: '100%',
    height: FULL_HEIGHT - 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionHeader: {
    marginTop: 16,
    marginBottom: 4,
  },
  loadMoreFooter: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  comingSoon: {
    fontSize: 18,
    color: '#6c757d',
  },
  indicator: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearAll: {
    alignSelf: 'flex-end',
    // marginBottom: -30,
  },
});
