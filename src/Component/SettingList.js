import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useState } from 'react';
// import Typography from './UI/Typography';
// import SwitchButton from './UI/SwitchButton';
// import { Colors } from '../Constants/Colors';
// import { Font } from '../Constants/Font';
Typography
import { windowWidth } from '../Constants/Dimensions';
import CustomSwitch from './UI/SwitchButton';
import { Colors } from '../Constants/Colors';
import { Images } from '../Constants/Images';
import { Fonts } from '../Constants/Fonts';
import Typography from './UI/Typography';

const SettingList = ({
    showImage,
    showSwitchButton,
    showNavigationOption,
    container_style,
    title,
    source,
    source_icon,
    sub_title,
    isTouchable = false,
    onPress,
    isSwitch = false,
    handleSwitchChange=()=>{},
}) => {
    const ContainerComponent = isTouchable ? TouchableOpacity : View;



    return (
        <ContainerComponent
            style={[styles.container, container_style]}
            onPress={isTouchable ? onPress : null}
        >
            <View style={{ flexDirection: "row", }}>
                {showImage && (
                    <View style={styles.iconContainer}>
                        <Image source={source} style={styles.icon} />
                    </View>)}
                <View style={{ width: windowWidth / 2 + 10, justifyContent: "center" }}>
                    <Typography color={Colors.Black} size={16} fontFamily={Fonts.Inter_Medium}>
                        {title}
                    </Typography>
                </View>

            </View>
            <View style={{alignItems:"center", justifyContent:"center"}}>
                {showSwitchButton && (
                    <CustomSwitch
                        activateColor={Colors.selectedBorderColor}
                        value={isSwitch}
                    onValueChange={handleSwitchChange}
                    />
                )}
                {showNavigationOption && (
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <Image source={source_icon} style={{ height: 13, width: 8, marginLeft: 10 }} />
                    </View>
                )}
            </View>
        </ContainerComponent>
    );
}

export default SettingList;

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        paddingVertical: 15,
        borderRadius: 11,
        justifyContent: "space-between",
        borderTopWidth: 1,
        borderTopColor: Colors.borderColor
    },
    iconContainer: {
        width: 56,
        height: 56,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 30,
        backgroundColor: Colors.bg_grey,
        marginRight: 15
    },
    icon: {
        width: 24,
        height: 24,
        tintColor: Colors.Black,
    },
});
