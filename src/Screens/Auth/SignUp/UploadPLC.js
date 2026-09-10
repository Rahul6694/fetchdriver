import { StyleSheet, View } from 'react-native';
import React, { useState } from 'react';
import ContainerView from '../../../Component/ContainerView';
import Typography from '../../../Component/UI/Typography';
import { Fonts } from '../../../Constants/Fonts';
import { Colors } from '../../../Constants/Colors';
import HeaderWithBack from '../../../Component/HeaderWithBack';
import { Images } from '../../../Constants/Images';
import WarningComponent from '../../../Component/WarningComponent';
import Date_Picker from '../../../Component/DatePicker';
import Button from '../../../Component/Button';

const UploadPLC = () => {
    const [expiryDate, setExpiryDate] = useState();

    return (
        <ContainerView style={styles.container}>
            <HeaderWithBack source={Images.Back} />
            <View style={styles.content}>
                <View style={styles.textContainer}>
                    <Typography
                        size={26}
                        fontFamily={Fonts.Inter_Bold}
                        color={Colors.Black}
                        style={styles.title}
                    >
                        Take a photo of your Personal Liability Cover
                    </Typography>
                    <Typography
                        color={Colors.gray}
                        style={styles.description}
                    >
                        Make sure all information is readable and not blurry, and that all corners of the document are visible.
                    </Typography>
                </View>
                <WarningComponent
                    title="Do Not"
                    sub_title="Upload irrelevant images (blank photos, selfies, random pictures) - This will delay your account activation"
                />
                <Typography size={16} lineHeight={19.36}>
                    The name on your document{" "}
                    <Typography
                        fontFamily={Fonts.Inter_Medium}
                        size={16}
                        lineHeight={19.36}
                        color={Colors.Black}
                    >
                        must match the name on your profile
                    </Typography>
                </Typography>
                <Date_Picker
                    title="Expiry Date"
                    onChange={(d) => setExpiryDate(d)}
                    onConfirm={(d) => setExpiryDate(d)}
                />
                <WarningComponent
                    title="IMPORTANT:"
                    sub_title="Make sure that your document is not expired and you upload a clear picture"
                />
            </View>
            <View style={styles.buttonContainer}>
                <Button
                    title="Take Photo"
                    style_button={{ backgroundColor: Colors.Black }}
                />
            </View>
        </ContainerView>
    );
};

export default UploadPLC;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flexGrow: 1,
    },
    textContainer: {
        marginTop: 29,
        marginBottom: 18,
    },
    title: {
        marginBottom: 10,
    },
    description: {
        color: Colors.labelColor,
    },
    buttonContainer: {
       
        justifyContent: 'flex-end',
    },
});
