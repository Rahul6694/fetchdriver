import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Image, TouchableWithoutFeedback } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    runOnJS,
} from 'react-native-reanimated';

import { Images } from '../Constants/Images';
import Typography from './UI/Typography';
import { Fonts } from '../Constants/Fonts';

const SWIPE_THRESHOLD = -100;

const MessageCard = ({ avatar, sender, message, top = 100, visible, setVisible, onPress = () => { } }) => {

    const translateX = useSharedValue(0);
    const opacity = useSharedValue(1);
    const height = useSharedValue(80);
    const timerRef = useRef(null);


    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
        opacity: opacity.value,
        height: height.value,
        marginBottom: height.value > 0 ? 10 : 0,
    }));


    const hideCard = () => {
        setVisible(false);
    };


    const dismiss = () => {
        'worklet';
        translateX.value = withTiming(-500);
        opacity.value = withTiming(0);
        height.value = withTiming(0, {}, () => {
            runOnJS(hideCard)();
        });
    };


    const panGesture = Gesture.Pan()
        .onUpdate((e) => {
            if (e.translationX < 0) {
                translateX.value = e.translationX;
            }
        })
        .onEnd(() => {
            if (translateX.value < SWIPE_THRESHOLD) {
                dismiss();
            } else {
                translateX.value = withSpring(0);
            }
        });


    useEffect(() => {
        if (visible) {
            translateX.value = 0;
            opacity.value = withTiming(1);
            height.value = withTiming(80);

            if (timerRef.current) clearTimeout(timerRef.current);
            timerRef.current = setTimeout(() => {
                hideCardWithAnimation();
            }, 10000);
        } else {

            translateX.value = withTiming(-100);
            opacity.value = withTiming(0);
            height.value = withTiming(0);
        }

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [visible, message]);


    const hideCardWithAnimation = () => {
        dismiss();
    };

    return (
        <GestureDetector gesture={panGesture}>
            <TouchableWithoutFeedback onPress={() => {
                console.log('MessageCard pressed');
                if (onPress) onPress();
                runOnJS(dismiss)();
            }}>
                <Animated.View style={[styles.card, { top }, animatedStyle]}>
                    {/* <Image source={avatar} style={styles.avatarImage} /> */}

                    <View style={styles.messageContent}>
                        <Typography style={styles.senderName} fontFamily={Fonts.Inter_Medium} size={16}>
                            {sender}
                        </Typography>
                        <Typography
                            fontFamily={Fonts.Inter_Medium}
                            style={styles.messageText}
                            numberOfLines={2}
                            size={14}
                        >
                            {message}
                        </Typography>
                    </View>

                    <Image source={Images.down} style={styles.chevron} />
                </Animated.View>
            </TouchableWithoutFeedback>
        </GestureDetector>
    );
};

export default MessageCard;


const styles = StyleSheet.create({
    card: {
        position: 'absolute',
        left: 20,
        right: 20,
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 10,
        elevation: 2,
        zIndex: 999,
    },
    avatarImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F0F0F0',
        marginRight: 12,
    },
    messageContent: {
        flex: 1,
        justifyContent: 'center',
    },
    senderName: {
        color: '#4A4A4A',
        fontSize: 12,
        marginBottom: 2,
    },
    messageText: {
        color: '#000',
        width: "80%",

    },
    chevron: {
        height: 15,
        width: 15,
        resizeMode: 'contain',
        marginLeft: 8,
        transform: [{ rotate: '-90deg' }],
    },
});
