//File: Rewind2.js
import { View, Text, StyleSheet, Animated, Dimensions } from "react-native";
import { useState, useEffect, useRef } from "react";
import LottieView from "lottie-react-native";

import RewindScreen1 from "./RewindScreen1"; // Assuming this component exists

const AnimatedLottie = Animated.createAnimatedComponent(LottieView);
const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");
const SPOT_SIZE = SCREEN_W * 2.35; // 130% of screen width
const SPARK_SIZE = SCREEN_W * 0.45; // 75% of screen width
const CENTER_X = SCREEN_W / 2  - SPARK_SIZE / 2;
const CENTER_Y = SCREEN_H / 2 - SPARK_SIZE / 2;
//   +Y moves it down, –Y moves it up.
//   +X moves right,  –X moves left.
const NUDGE_X = -140;  
const NUDGE_Y = -250;

export default function Rewind1({isActive}) {
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
          source={require("../../assets/animations/starflare.json")}
          progress={progress}
          resizeMode="contain"
          style={{
            position: "absolute",
            width: SPOT_SIZE,
            height: SPOT_SIZE,
            top: -SPOT_SIZE * 0.05, // Adjust to center vertically
            left: -SPOT_SIZE * 0.2, // Adjust to center horizontally
            zIndex: 0,
          }}
        />

        <AnimatedLottie
          source={require("../../assets/animations/spark.json")}
          progress={progress}
          resizeMode="contain"
          style={{
            position: "absolute",
            width: SPARK_SIZE * 3.5,
            // aspectRatio: 1,
            height: SPARK_SIZE * 3.7,
            top: CENTER_Y + NUDGE_Y, // Adjust to center vertically
            left: CENTER_X + NUDGE_X, // Adjust to center horizontally
            zIndex: 0,
          }}
          colorFilters={[
            {
              keypath: "**.Fill 1",
              color: "#A47BC0",
            },
          ]}
        />

        <AnimatedLottie
          source={require("../../assets/animations/starscircle.json")}
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

        <Animated.View
          style={[
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            styles.textWrapper,
          ]}
        >
          <RewindScreen1 />
          
        </Animated.View>

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
  textWrapper: {
    position: "absolute",
    top: "36%",           // same vertical spot you like
    width: "90%",       // keeps it from touching the edges
    alignSelf: "center",
    
    // nudge right
    alignItems: "flex-end",  
    paddingHorizontal: 16,   // give the shadows some breathing room
    overflow: "visible",     // allow shadows to draw outside
  }
});



