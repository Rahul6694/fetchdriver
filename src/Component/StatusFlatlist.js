import { FlatList, Image, StyleSheet, TouchableOpacity, View, TextInput } from 'react-native';
import React, { useState } from 'react';
import { Typography } from './Typography';
import { Colors } from '../Constants/Colors';
import { Images } from '../Constants/Images';

const StatusFlatlist = ({ style_view, Data }) => {
    const [selected, setSelected] = useState(1);
    const [otherText, setOtherText] = useState("");
    return (
        <View style={[{ backgroundColor: Colors.LightBlue, paddingHorizontal: 10, borderRadius: 10 }, style_view]}>
            <FlatList
                data={Data}
                renderItem={({ item }) => (
                    <View style={styles.items}>
                    <View style={styles.data}>
                        <Typography textAlign={"center"} size={14} color={Colors.Secondary} style={styles.text}>
                            {item.title}
                        </Typography>
                        <TouchableOpacity
                            style={[styles.tick, { backgroundColor: selected === item.id ? Colors.Secondary : Colors.LightBlue }]}
                            onPress={() => setSelected(selected === item.id ? null : item.id)} 
                        >
                            <Image style={{ height: 14, width: 17 }} source={Images.Tick} />
                        </TouchableOpacity>

                        </View>
                        {selected === item.id && item.title === "Other" && (
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your option"
                                placeholderTextColor={Colors.Secondary}
                                value={otherText}
                                onChangeText={setOtherText}
                                multiline
                            />
                        )}
                    </View>
                )}
                keyExtractor={(item) => item.id.toString()}
            />
        </View>
    );
};

export default StatusFlatlist;

const styles = StyleSheet.create({
    tick: {
        height: 22,
        width: 22,
        borderWidth: 1,
        borderColor: Colors.Secondary,
        borderRadius: 5,
        alignItems: "center",
        justifyContent: "center"
    },
    text: {
        marginBottom: 2
    },
    data: {
        flexDirection: "row",
            justifyContent: "space-between"
        },
            items:{
        borderBottomWidth: 0.5,
        borderColor: Colors.Secondary,
        paddingVertical: 10
    },
    input: {
        marginTop: 10,
        padding: 10,
        height: 80,
        // borderWidth: 1,
        // borderColor: Colors.Secondary,
        borderRadius: 5,
        backgroundColor: Colors.Primary,
        color:Colors.Secondary,
        textAlignVertical:"top"
    }
});
