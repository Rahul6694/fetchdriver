import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, Image, StyleSheet } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
} from 'react-native-reanimated';

import Typography from './UI/Typography';
import { Colors } from '../Constants/Colors';
import { Fonts } from '../Constants/Fonts';
import { Images } from '../Constants/Images';

const AnimatedCancelButton = ({ visible, onPress, label }) => {
    const opacity = useSharedValue(visible ? 1 : 0);
    const height = useSharedValue(visible ? 45 : 0);
    const previousVisible = useRef(null);

    useEffect(() => {

        if (previousVisible.current !== null && previousVisible.current === visible) return;

        if (visible) {
            opacity.value = withTiming(1, { duration: 300 });
            height.value = withTiming(45, { duration: 300 });
        } else {
            opacity.value = withTiming(0, { duration: 300 });
            height.value = withTiming(0, { duration: 300 });
        }

        previousVisible.current = visible;
    }, [visible]);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        height: height.value,
        overflow: 'hidden',
    }));

    return (
        <Animated.View style={[styles.animatedContainer, animatedStyle]}>
            <TouchableOpacity style={styles.itemContainer} onPress={onPress}>
                <Image source={Images.close} style={styles.itemImage} />
                <Typography
                    size={14}
                    fontFamily={Fonts.Inter_Medium}
                    color={Colors.Black}
                    numberOfLines={1}
                >
                    {label}
                </Typography>
            </TouchableOpacity>
        </Animated.View>
    );
};

export default AnimatedCancelButton;

const styles = StyleSheet.create({
    animatedContainer: {
        overflow: 'hidden',
    },
    itemContainer: {

        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-end',
        paddingVertical: 10,
        paddingHorizontal: 8,
        borderWidth: 1,
        borderColor: '#ECECEC',
        borderRadius: 10,
        backgroundColor: Colors.white,
        // elevation: 2,
        // shadowColor: '#485C44',
        // shadowOffset: { width: 0, height: 2 },
        // shadowOpacity: 0.3,
        // shadowRadius: 4,
        // marginBottom: 10,
        zIndex: 999,
        marginHorizontal: 3,


    },
    itemImage: {
        width: 20,
        height: 20,
        marginRight: 8,
        resizeMode: 'contain',
    },
});
