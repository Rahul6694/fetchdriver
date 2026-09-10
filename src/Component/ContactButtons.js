import React from 'react';
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Typography } from './Typography';
import { Images } from '../Constants/Images';
import { Colors } from '../Constants/Colors';
import { windowWidth } from '../Constants/Dimensions';
import { Fonts } from '../Constants/Fonts';
import localization from '../Constants/localization';

const ContactButtons = ({ onChatPress, onCallPress, onMorePress }) => {
    return (
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.callButton} onPress={onCallPress}>
          <Image source={Images.call} style={styles.buttonIcon} />
          <Typography style={styles.callButtonText}>
            {localization.driverFlow.call}
          </Typography>
        </TouchableOpacity>
        <TouchableOpacity style={styles.chatButton} onPress={onChatPress}>
          <Image source={Images.message} style={styles.buttonIcon} />
          <Typography style={styles.buttonText}>
            {localization.driverFlow.chat}
          </Typography>
        </TouchableOpacity>

        <TouchableOpacity style={styles.dotButton} onPress={onMorePress}>
          <Image source={Images.dot} style={styles.buttonIcon} />
        </TouchableOpacity>
      </View>
    );
};

const styles = StyleSheet.create({
    buttonContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: Colors.borderColor,
        borderRadius: 10,
        // paddingHorizontal: 10,
        marginVertical: 16,

    },
    chatButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        paddingVertical: 15,
    },
    callButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        borderLeftWidth: 1,
        borderColor: Colors.borderColor,
        paddingVertical: 15,
    },
    callButtonText: {
        color: Colors.Black,
        marginLeft: 5,
        fontFamily: Fonts.Inter_Bold
    },
    dotButton: {
        width: windowWidth / 7,
        paddingVertical: 15,
        alignItems: 'center',
        justifyContent: 'center',
        borderLeftWidth: 1,
        borderColor: Colors.borderColor,
        // borderRadius: 5,
        backgroundColor: Colors.backViewColor,
    },
    buttonIcon: {
        width: 20,
        height: 20,
        marginRight: 5,
        tintColor: Colors.Black,
    },
    buttonText: {
        color: Colors.Black,
        fontFamily: Fonts.Inter_Bold
    },
});

export default ContactButtons;
