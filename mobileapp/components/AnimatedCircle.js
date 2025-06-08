// mobileapp/components/AnimatedCircle.js
import React, { useRef, useEffect } from "react";
import { Animated, Dimensions, StyleSheet } from "react-native";

const { width } = Dimensions.get("window");

export default function AnimatedCircle() {

  // 1) Create an Animated.Value for rotation (0→1)
  const spinAnim = useRef(new Animated.Value(0)).current;

  // 1) Define an Animated.Value for horizontal position (0 → 1)
  const posAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 2) Create a looping animation: posAnim goes 0→1→0 continuously
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(posAnim, {
          toValue: 1,
          duration: 1000,         // 1 second to go from left to right
          useNativeDriver: true,
        }),
        Animated.timing(posAnim, {
          toValue: 0,
          duration: 1000,         // 1 second to come back
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [posAnim]);

  // 3) Interpolate posAnim (0→1) into a translationX value
  //    We’ll move the circle from -50 (left of center) → +50 (right of center)
  const translateX = posAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-50, 50],
  });

  return (
    <Animated.View
      style={[
        styles.circle,
        {
          transform: [{ translateX }],
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  circle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 0, 0, 0.8)", // semi‐opaque red
  },
});