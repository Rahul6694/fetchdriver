import React, {useEffect, useRef, useState} from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import {BottomSheetTextInput, BottomSheetView} from '@gorhom/bottom-sheet';
import {Images} from '../../Constants/Images';
import {Typography} from '../../Component/Typography';
import {Fonts} from '../../Constants/Fonts';
import {FULL_HEIGHT, FULL_WIDTH} from '../../Constants/Layout';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useSelector} from 'react-redux';
import {CHAT_API, GET_WITH_TOKEN_CHAT} from '../../Backend/Backend';
import {CHAT_LIST} from '../../Backend/ApiRoutes';

const Chat = ({
  onCloseChat,
  title,
  actionText,
  flatListRef: flatListRefProp,
  socket,
  bookingData,
  isKeyboard = false,
}) => {
  const localListRef = useRef(null);
  const flatListRef = flatListRefProp ?? localListRef;

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loader, setLoader] = useState(false);

  const get_detail = useSelector(store => store.updateAuthData);
  const insets = useSafeAreaInsets();
  const {height: windowHeight} = useWindowDimensions();
  /** Fits inside ~70% bottom sheet after header; avoids flex collapse hiding the composer. */
  const chatBodyHeight = Math.max(280, Math.round(FULL_HEIGHT * 0.82));

  /* =======================
     FETCH CHAT HISTORY
  ======================== */
  const GET_API = () => {
    if (!bookingData?.booking_other_information?.booking_id) return;

    setLoader(true);

    GET_WITH_TOKEN_CHAT(
      `${CHAT_API}${CHAT_LIST}/${bookingData.booking_other_information.booking_id}`,
      SUCCESS => {
        setLoader(false);

        const normalizedMessages = Array.isArray(SUCCESS?.messages)
          ? SUCCESS.messages
              .map(item => ({
                ...item,
                id: item.id ?? `${item.sender_id}-${item.created_at}`,
              }))
              .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
          : [];

        setMessages(normalizedMessages);
      },
      () => setLoader(false),
      () => setLoader(false),
    );
  };

  /* =======================
     SOCKET LISTENER
  ======================== */
  useEffect(() => {
    if (!socket) return;

    const handleMessage = data => {
      const messageId =
        data.id ?? `${data.sender_id}-${data.created_at || Date.now()}`;

      setMessages(prev => {
        const exists = prev.some(msg => msg.id === messageId);
        if (exists) return prev;

        return [
          ...prev,
          {
            ...data,
            id: messageId,
            created_at: data.created_at ?? new Date(),
          },
        ];
      });
    };

    socket.on('sendEmitMessageResponce', handleMessage);

    return () => {
      socket.off('sendEmitMessageResponce', handleMessage);
    };
  }, [socket]);

  /* =======================
     INITIAL LOAD
  ======================== */
  useEffect(() => {
    GET_API();
  }, [bookingData]);

  /* =======================
     AUTO SCROLL
  ======================== */
  useEffect(() => {
    if (!flatListRef?.current) return;

    requestAnimationFrame(() => {
      flatListRef?.current?.scrollToEnd({animated: true});
    });
  }, [messages.length, flatListRef]);

  useEffect(() => {
    if (!isKeyboard || !flatListRef?.current) return;

    const t = setTimeout(() => {
      flatListRef.current?.scrollToEnd({animated: true});
    }, 100);

    return () => clearTimeout(t);
  }, [isKeyboard, flatListRef]);

  /* =======================
     SEND MESSAGE
  ======================== */
  const onSendMessage = () => {
    if (!input.trim()) return;

    const socketdata = {
      booking_id: bookingData?.booking_other_information?.booking_id || bookingData?.id,
      sender_type: 'driver',
      sender_id: bookingData?.driver_id,
      receiver_type: 'customer',
      receiver_id: bookingData?.customer_id,
      message: input,
    };

    socket.emit('sendEmitMessage', socketdata);

    const localMessage = {
      id: `local-${Date.now()}`,
      ...socketdata,
      created_at: new Date(),
    };

    setMessages(prev => [...prev, localMessage]);
    setInput('');
  };

  /* =======================
     RENDER MESSAGE
  ======================== */
  const renderMessage = ({item}) => (
    <View
      style={{
        alignSelf:
          item?.sender_id == bookingData?.driver_id ? 'flex-end' : 'flex-start',
      }}>




      <View
        style={[
          styles.messageBubble,
          item?.sender_id == bookingData?.driver_id
            ? styles.userBubble
            : styles.otherBubble,
        ]}>
        <Typography size={16} lineHeight={26} color="#000">
          {item.text || item.message}
        </Typography>
      </View>

      <Typography
        size={12}
        lineHeight={24}
        color="#000"
        style={{
          alignSelf:
            item?.sender_id == bookingData?.driver_id
              ? 'flex-end'
              : 'flex-start',
        }}>
        {item.created_at
          ? new Date(item.created_at)
              .toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
              })
              .toUpperCase()
          : ''}
      </Typography>
    </View>
  );

  /* =======================
     UI
  ======================== */
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Typography size={18} fontFamily={Fonts.Inter_SemiBold} color="#000">
          {title}
        </Typography>
        <TouchableOpacity
          onPress={onCloseChat}
          style={{zIndex: 999, justifyContent: 'center'}}>
          <Typography
            style={{textDecorationLine: 'underline'}}
            size={18}
            fontFamily={Fonts.Inter_SemiBold}
            color="#000000">
            {actionText}
          </Typography>
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      <BottomSheetView
        style={{
          height:
            Platform.OS === 'android'
              ? FULL_HEIGHT * 0.7
              : FULL_HEIGHT * (!isKeyboard ? 0.7 : 0.95),
          paddingBottom: isKeyboard ? 0 : 210,
        }}>
        <KeyboardAvoidingView
          // enabled={Platform.OS === 'ios'}
          // behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          // keyboardVerticalOffset={Platform.OS === 'ios' ? 140 : 0}
          style={{flex: 1}}>
          {loader ? (
            <ActivityIndicator size="large" color="#000" />
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={item => item.id}
              renderItem={renderMessage}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
            />
          )}

          <View
            style={[
              styles.inputWrapper,
              {
                marginBottom:
                  bookingData?.status_id == 'On The Spot'
                    ? Platform.OS === 'ios'
                      ? isKeyboard 
                        ? FULL_HEIGHT * 0.69
                        : FULL_HEIGHT * 0.18
                      : isKeyboard
                      ? FULL_HEIGHT * 0.33
                      : FULL_HEIGHT * 0.14
                    : Platform.OS === 'android'
                    ? isKeyboard
                      ? FULL_HEIGHT * 0.285
                      : FULL_HEIGHT * 0.09
                    : isKeyboard
                    ? FULL_HEIGHT * 0.64
                    : FULL_HEIGHT * 0.13,
              },
            ]}>
            <View style={styles.inputContainer}>
              <BottomSheetTextInput
                placeholder="Type message..."
                value={input}
                onChangeText={setInput}
                style={styles.textInput}
                placeholderTextColor="#999"
                onSubmitEditing={onSendMessage}
                blurOnSubmit={false}
              />
              <TouchableOpacity
                style={styles.sendButton}
                onPress={onSendMessage}>
                <Image
                  source={Images.send_icon}
                  style={{width: 20, height: 20, tintColor: '#fff'}}
                />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </BottomSheetView>
    </View>
  );
};

export default Chat;

/* =======================
   STYLES (UNCHANGED)
======================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    width: FULL_WIDTH,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#ECECEC',
    marginBottom: 8,
  },
  sheetBody: {
    width: '100%',
  },
  loaderFill: {
    flex: 1,
    minHeight: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardColumn: {
    flex: 1,
    minHeight: 0,
    flexDirection: 'column',
  },
  listFill: {
    flex: 1,
    minHeight: 0,
  },
  list: {
    flex: 1,
  },
  messageBubble: {
    maxWidth: '75%',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginVertical: 6,
    marginHorizontal: 8,
  },
  userBubble: {
    backgroundColor: '#E7E9E766',
    borderBottomRightRadius: 0,
  },
  otherBubble: {
    backgroundColor: '#00DB461F',
    borderBottomLeftRadius: 0,
  },
  inputWrapper: {
    flexShrink: 0,
    paddingVertical: 20,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f7f7f7',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: Platform.OS === 'ios' ? 10 : 10,
    minHeight: Platform.OS === 'ios' ? 45 : 55,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
    minHeight: 48,
    color: '#000',
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: '#000',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
