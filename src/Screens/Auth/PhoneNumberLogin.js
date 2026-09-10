import React, { useState } from "react";
import { View, ScrollView, KeyboardAvoidingView, StyleSheet, Image, TouchableOpacity } from "react-native";
import { CommonView } from "../../Component/CommonView";
import { Images } from "../../Constants/Images";
import HeaderContent from "../../Component/HeaderContent";
import Button from "../../Component/Button";
import PhoneNumberInput from "../../Component/PhoneNumberInput";
import { Typography } from "../../Component/Typography";
import { Colors } from "../../Constants/Colors";
import { Fonts } from "../../Constants/Fonts";
import { validators } from "../../Backend/Validator";
import ErrorBox from "../../Component/ErrorBox";

const PhoneNumberLogin = ({ navigation }) => {
  const [phone_number, setPhone_number] = useState('');
  const [error, setError] = useState({});

  const [countryCode, setCountryCode] = useState(
    countryCode || {
      flag: '🇮🇳',
      dial_code: '+91',
      code: 'IN',
    },
  );

  const HandleError = () => {
    let error = {
      phone_number: validators.checkFixPhoneNumber('Phone Number', phone_number)
    };
    setError(error);
    if (!error.phone_number) {
      navigation.navigate('Otp')
    }
  }
  return (
    <CommonView AuthImg={Images?.AuthBg}>
      {/* <KeyboardAvoidingView behavior={Platform.OS === "android" ? "height" : "padding"}> */}
        {/* <ScrollView keyboardShouldPersistTaps="handled"> */}
          <HeaderContent AuthHeader={true} title={"Welcome Back!"} Sub_title={"Enter your phone number to receive a verification code."} />
          <View style={{ width: "95%", alignSelf: "center" }}>

            <PhoneNumberInput
              title="Phone Number"
              value={phone_number}
              onChange={e => {
                setPhone_number(e);
              }}
              country={countryCode}
              onCountryPress={setCountryCode}
              countryCode={countryCode}
              setCountryCode={setCountryCode}
              style_title={styles.text}
            //   error={error?.phone_number}
            />
            <ErrorBox message={error.phone_number} />
                </View>
            <View style={{flex:1,justifyContent:"flex-end"}}>

            <Button style_button={{}} title={"Login"}
              onPress={HandleError}
              />
              </View>
        {/* </ScrollView> */}
      {/* </KeyboardAvoidingView> */}
    </CommonView>
  )
};

export default PhoneNumberLogin

const styles = StyleSheet.create({
  text: {
    marginLeft: 10
  },
  text: {
    marginHorizontal: 5
  },
  line: {
    width: 125,
    height: 1,
    tintColor: Colors.Secondary,
    marginTop: 10
  },
  logo: {
    height: 56,
    width: 56
  },
  signup: {
    flexDirection: "row",
    alignSelf: "center",
    marginTop:"75%",
  }
})