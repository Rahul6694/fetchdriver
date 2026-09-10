import React from 'react';
import { View, StyleSheet } from 'react-native';
import Typography from './UI/Typography';
import { Fonts } from '../Constants/Fonts';
import { Colors } from '../Constants/Colors';
import { windowHeight, windowWidth } from '../Constants/Dimensions';


const VerificationHeader = ({ title, description, phoneNumber, style, titleStyle, descriptionStyle, phoneNumberStyle }) => {
    return (
        <View style={[styles.header, style]}>
            <Typography
                fontFamily={Fonts.Inter_Bold}
                size={26}
                style={[styles.title, titleStyle]}
                color={Colors.Black}
            >
                {title}
            </Typography>

            <View style={{ flexDirection: "row", alignItems: "center", }}>


                <Typography
                    fontFamily={Fonts.Inter_Regular}
                    size={16}
                    style={[descriptionStyle]}
                    color={Colors.textColor}
                >
                    {description}{" "}


                    <Typography
                        top={5}
                        fontFamily={Fonts.Inter_Bold}
                        size={16}
                        style={[styles.subTitle, phoneNumberStyle,]}
                        color={Colors.Black}
                    >
                        {phoneNumber}
                    </Typography>

                </Typography>
            </View>
        </View>

    );
};

export default VerificationHeader;

const styles = StyleSheet.create({
    header: {
        marginBottom: 43,
        marginTop: 30,
    },
   
    subTitle: {
        marginTop: 10,

    },
});
