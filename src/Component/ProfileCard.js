import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Typography } from './Typography';
import { Images } from '../Constants/Images';
import { Colors } from '../Constants/Colors';
import { Fonts } from '../Constants/Fonts';
import localization from '../Constants/localization';


const ProfileCard = ({ name, rating, reviews, price, distance, image, bookingData }) => {
    return (
        <>
            <View style={styles.container}>
                {/* <Image
                    source={
                        image
                            ? { uri: image }
                            : Images.DriverProfile
                    }
                    style={styles.profileImage}
                /> */}
                {/* Left Side - Name & Reviews */}
                <View style={styles.leftContainer}>
                    <Typography size={20} fontFamily={Fonts.Inter_SemiBold} color={Colors.Black}>
                        {name}
                    </Typography>
                    {!(
                        bookingData?.get_booking_for ||
                        bookingData?.booking_for ||
                        bookingData?.customer_name
                    ) && (
                        <View style={styles.reviewContainer}>
                            <Image source={Images.single_star} style={styles.starIcon} />
                            <Typography size={16} textAlign={'left'} color={Colors.inputtitle} fontFamily={Fonts.Inter_Regular} style={styles.reviewText}>
                                ({Number(rating).toFixed(1)}) {reviews} {localization.driverFlow.reviews}
                            </Typography>
                        </View>
                    )}
                </View>

                {/* Right Side - Price & Distance */}
                {price && distance && <View style={styles.rightContainer}>
                    <Typography size={22} fontFamily={Fonts.Inter_Bold} textAlign={'right'}>
                        {price}
                    </Typography>
                    <Typography size={14} fontFamily={Fonts.Inter_SemiBold} textAlign={'right'}>
                        {distance}
                    </Typography>
                </View>}
            </View>

        </>

    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    leftContainer: {
        flex: 1,
    },
    reviewContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    starIcon: {
        width: 16,
        height: 16,
        resizeMode: 'contain',
    },
    reviewText: {
        marginLeft: 4,
    },
    rightContainer: {
        alignItems: 'flex-end',
    },
    languageButton: {
        marginVertical: 16,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 5,
        borderWidth: 1,
        backgroundColor: Colors.backViewColor,
        borderColor: Colors.borderColor,
        marginBottom: 15,
    },
    profileImage: {
        height: 56,
        width: 56, borderRadius: 10,
        marginRight: 12
    }
});

export default ProfileCard;
