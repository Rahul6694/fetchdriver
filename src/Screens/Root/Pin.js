// import { StyleSheet, Text, View } from 'react-native'
// import React from 'react'

// const Pin = () => {
//   return (
//     <View>
//       <Text>Pin</Text>
//     </View>
//   )
// }

// export default Pin

// const styles = StyleSheet.create({})
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from "react-native";
import OtpInput, { Otp_Timer } from "../../Component/OtpInput";
import { Colors } from "../../Constants/Colors";
import Typography from "../../Component/UI/Typography";
import Input from "../../Component/Input";
import { useDispatch } from "react-redux";
import { isAuth } from "../../Redux/action";

const OtpScreen = ({ navigation }) => {
  const dispatch = useDispatch();

  const [otp, setOtp] = useState("");
  const [counter, setCounter] = useState(30);
  const [error, setError] = useState("");
  const [showNameInput, setShowNameInput] = useState(false);
  const [name, setName] = useState("");
  const [aadhar, setAadhar] = useState("");

  useEffect(() => {
    let interval;
    if (counter > 0) {
      interval = setInterval(() => setCounter(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [counter]);

  const handleVerify = () => {
    if (showNameInput) {
      dispatch(isAuth(true));
      console.log("Registration Complete with Name:", name);
    } else {
      if (otp === "1234") {
        setError("");
        setShowNameInput(true);
        alert("✅ OTP Verified");
      } else {
        setError("Invalid OTP ❌");
      }
    }
  };

  const handleResend = () => {
    setOtp("");
    setCounter(30);
    setError("");
    setShowNameInput(false);
    alert("🔄 OTP Resent");
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: Colors.white }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.headerBox}>
          <Typography size={28} fontFamily={"Inter_Bold"} color={Colors.black} textAlign="center">
            Verify OTP
          </Typography>
          <Typography size={16} color={Colors.Black} style={{ marginTop: 8 }} textAlign="center">
            Enter the 4-digit code sent to your mobile
          </Typography>
          <Typography size={14} color={"#000"} style={{ marginTop: 4 }} textAlign="center">
            Use <Text style={{ fontWeight: "bold" }}>1234</Text> for demo
          </Typography>
        </View>

        <View style={styles.inputContainer}>
          <OtpInput
            value={otp}
            setValue={setOtp}
            onChangeText={setOtp}
            error={error}
            mainStyle={{ marginBottom: 20 }}
          />

          {showNameInput && (
            <Typography size={14} color={Colors.lightGreen} textAlign="center" style={{ marginTop: -10 }}>
              ✓ OTP Verified!
            </Typography>
          )}

          {showNameInput && (
            <>
              <Input
                style_inputContainer={{
                  width: "100%",
                  borderWidth: 1,
                  borderColor: "#ddd",
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  // paddingVertical: 10,
                  marginBottom: 20
                }}
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e)}
              />
              <Input
                style_inputContainer={{
                  width: "100%",
                  borderWidth: 1,
                  borderColor: "#ddd",
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  // paddingVertical: 10,
                  marginBottom: 20
                }}
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e)}
              />




            </>
          )}



          <TouchableOpacity
            style={[
              styles.verifyBtn,
              !showNameInput ? otp.length < 4
                ? { backgroundColor: "#9bb9ec" }
                : { backgroundColor: Colors.lightBlue } : name.length < 2
                ? { backgroundColor: "#9bb9ec" }
                : { backgroundColor: Colors.lightBlue }


            ]}
            disabled={otp.length < 4

            }

            onPress={handleVerify}
          >
            <Text style={styles.verifyText}>
              {showNameInput ? "Complete Registration" : "Verify & Continue"}
            </Text>
          </TouchableOpacity>

        </View>
        {!showNameInput &&
          <Otp_Timer
            counter={counter}
            onPressResend={handleResend}
            receiveText
            resendText
          />}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default OtpScreen;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    alignItems: "center",
    justifyContent: "center",
    flexGrow: 1
  },
  headerBox: {
    marginBottom: 20,
    alignItems: "center"
  },
  verifyBtn: {
    height: 55,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    width: "100%"
  },
  verifyText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600"
  },
  inputContainer: {
    width: "100%",
    padding: 20,
    borderRadius: 12,
    backgroundColor: Colors.white,
    elevation: 5,
    marginBottom: 20
  }
});
