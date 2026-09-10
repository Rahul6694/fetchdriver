import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Marker } from 'react-native-maps';
import { Typography } from './Typography';
import { Colors } from '../Constants/Colors';

const StopMarker = ({ coordinate, stopNumber }) => {
    return (
        <Marker coordinate={coordinate} tracksViewChanges={false}>
            <View style={styles.container}>
                <Typography style={14} color={Colors.white}>{stopNumber}</Typography>
            </View>
        </Marker>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 21,
        width: 21,
        backgroundColor: 'black',
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#000',
        justifyContent: "center",
        alignItems: "center",
    },
    text: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
});

export default StopMarker;
