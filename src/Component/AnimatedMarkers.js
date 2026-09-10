import React, { useEffect, useRef } from "react";
import { View, Animated, Easing, StyleSheet } from "react-native";

const AnimatedMarkers = ({ coordinate }) => {
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1500,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.pulse,
          {
            transform: [
              {
                scale: pulseAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 2],
                }),
              },
            ],
            opacity: pulseAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.5, 0],
            }),
          },
        ]}
      />

      <View style={styles.marker}>
        <View style={styles.innerCircle} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Container now has a defined size
  container: {
    width: 35,
    height: 35,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 40,
    overflow: "hidden",
  },
  pulse: {
    position: "absolute",
    width: 45,
    height: 48,
    backgroundColor: "#00DB46",
    overflow: "hidden",
  },
  marker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "red",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  innerCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#00DB46",
  },
});

export default AnimatedMarkers;
