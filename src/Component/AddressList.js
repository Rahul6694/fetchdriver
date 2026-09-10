import React from 'react';
import { FlatList, TouchableOpacity, View, Image, ImageBackground, StyleSheet } from 'react-native';
import { Images } from '../Constants/Images';
import { Colors } from '../Constants/Colors';
import Typography from './UI/Typography';
import { windowWidth } from '../Constants/Dimensions';
import { shadow } from '../Constants/Shadow';
import { Fonts } from '../Constants/Fonts';
import Input from './Input';


const AddressList = ({ data, setShowPickupDest }) => {
    console.log("🚀 ~ AddressList ~ data:", data)
    const DashedLine = () => (
        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <View
                style={{ flexDirection: 'column', alignItems: 'center', marginTop: 4 }}>
                {Array.from({ length: 4 }).map((_, index) => (
                    <View
                        key={index}
                        style={{
                            width: 2, // Line width
                            height: 5, // Height of each dash
                            backgroundColor: '#000', // Color of dashes
                            marginVertical: 2, // Space between dashes
                        }}
                    />
                ))}
            </View>
        </View>
    );

    return (
        <TouchableOpacity
            activeOpacity={1}
            style={[styles.addressContainer, shadow[2],]}
            onPress={() => setShowPickupDest && setShowPickupDest(false)}

        >
            <FlatList

                data={data}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item, index }) => (
                    <View style={{ flexDirection: 'row', marginVertical: 10 }}>
                        <View style={{ justifyContent: 'center' }}>
                            <View style={{ height: 15 }}>
                                {index === 0 ? (
                                    <>
                                        <View style={styles.green_container}>
                                            <View style={styles.circle}></View>
                                        </View>
                                        {/* <View style={{ justifyContent: 'center', alignItems: 'center' }}> */}
                                        <DashedLine />
                                        {/* </View> */}
                                    </>
                                ) : index === data.length - 1 ? (
                                    <View style={{ height: 10, justifyContent: 'center' }}>
                                        <Image source={Images.Rectangle} style={styles.endIcon} />
                                    </View>
                                ) : (
                                    <>
                                        <View style={styles.black_container}>
                                            <Typography color="#fff">{index}</Typography>
                                        </View>
                                        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                            <View style={styles.dashedLine} />
                                        </View>
                                    </>
                                )}
                            </View>
                        </View>

                        <View style={styles.inputWrapper}>
                            <View style={[styles.inputContainer, { flexDirection: 'row' }]}>
                                <Typography fontFamily={Fonts.Inter_Medium} textAlign={"left"} numberOfLines={1} color={Colors.black} size={14}>
                                    {item.value}
                                </Typography>
                            </View>
                        </View>
                    </View>

                )}
            />
        </TouchableOpacity>
    );
};

export default AddressList;
const styles = StyleSheet.create({
    locationContainer: {
        borderWidth: 1.5,
        borderColor: Colors.black,
        borderRadius: 10,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignSelf: 'flex-start',
        width: '100%',
        marginTop: 15,
        paddingRight: 10,
        paddingLeft: 17,
        marginHorizontal: 20

    },
    addressContainer: {
        width: windowWidth - 40,
        padding: 10,
        marginVertical: 10,
        flexDirection: "row",
        backgroundColor: Colors.white,
        borderRadius: 14,
        marginHorizontal: 20
    },
    green_container: {
        height: 19,
        width: 20,
        borderRadius: 50,
        backgroundColor: '#b4ffcc',
        alignItems: 'center',
        justifyContent: 'center',
    },
    circle: {
        height: 12,
        width: 12,
        backgroundColor: Colors.selectedBorderColor,
        borderRadius: 50,
    },
    black_container: {
        height: 20,
        width: 20,
        // borderRadius: 50,
        backgroundColor: '#000',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 4
    },
    container: {
        backgroundColor: Colors.white,
        paddingTop: 10,
        alignItems: 'center',
        justifyContent: 'center',

        marginBottom: 20

    },
    locationContainer: {
        borderRadius: 10,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignSelf: 'flex-start',
        width: '100%',
        marginTop: 15,
        paddingRight: 10,
        paddingLeft: 17,
        backgroundColor: Colors.white,
    },
    inputWrapper: {
        width: '100%',
        justifyContent: 'center',
        // alignItems: 'center',
        marginLeft: 20
    },
    inputContainer: {
        // marginHorizontal: -20,
        // marginVertical: -10,
    },
    green_container: {
        height: 19,
        width: 20,
        borderRadius: 50,
        backgroundColor: '#b4ffcc',
        alignItems: 'center',
        justifyContent: 'center',
    },
    circle: {
        height: 12,
        width: 12,
        backgroundColor: Colors.selectedBorderColor,
        borderRadius: 50,
    },
    black_container: {
        height: 20,
        width: 20,
        backgroundColor: '#000',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 4,
    },
    dashedLine: {
        borderRightWidth: 1,
        height: 25,
        width: 2,
        borderStyle: 'dashed',
        marginTop: 7,
    },
    endIcon: {
        width: 20,
        height: 20,

    },

    listContainer: {
        paddingVertical: 10,
        paddingHorizontal: 4,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    icon: {
        width: 24,
        height: 24,
        marginRight: 10,
        tintColor: Colors.primary,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        color: Colors.Black,
    },

});
