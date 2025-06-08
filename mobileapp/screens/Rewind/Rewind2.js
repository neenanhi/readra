//File: Rewind2.js
import { View, Text, StyleSheet, Animated, Dimensions } from "react-native";
import { useState, useEffect, useRef } from "react";
import { GLView } from "expo-gl";
import LottieView from "lottie-react-native";

import RewindScreen2 from "./RewindScreen2"; // Assuming this component exists
import AnimatedShader from "../../components/AnimatedShader";
import AnimatedCircle from "../../components/AnimatedCircle"; // Assuming this component exists

const AnimatedLottie = Animated.createAnimatedComponent(LottieView);
const SCREEN_W = Dimensions.get("window").width;
const SPOT_SIZE = SCREEN_W * 2.65; // 130% of screen width


export default function Rewind2({isActive}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isActive) return;
    fadeAnim.setValue(0); // reset fade animation
    slideAnim.setValue(50); // reset slide animation

    progress.setValue(0); // reset progress animation
    Animated.timing(progress, {
      toValue: 1,
      duration: 1200,
      useNativeDriver: false,
    }).start();

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isActive, fadeAnim, slideAnim, progress]);

  return (
    <View style={styles.container}>
        <AnimatedLottie
          source={require("../../assets/animations/sparklybooks.json")}
          progress={progress}
          resizeMode="contain"
          style={{
            position: "absolute",
            width: SPOT_SIZE,
            height: SPOT_SIZE,
            top: -SPOT_SIZE * 0.01, // Adjust to center vertically
            left: -SPOT_SIZE * 0.2, // Adjust to center horizontally
            zIndex: 0,
          }}
        />

      <RewindScreen2 />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#2e3a59",
  },
  background: {
    flex: 1,
    zIndex: 0,
  },
});

