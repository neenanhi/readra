// mobileapp/components/AnimatedShader.js

import React, { useRef, useEffect } from "react";
import { Animated, Easing, Dimensions, StyleSheet } from "react-native";
import LinearGradient from "react-native-linear-gradient";

/**
 * Get the device’s screen dimensions. We’ll use these values to size and position
 * the gradient so that it fully covers (or partially covers) whatever area we want.
 */
const { width: screenW, height: screenH } = Dimensions.get("window");

export default function AnimatedShader({ style }) {
  /**
   * 1) Create an Animated.Value that goes from 0 → 1.
   *    We’ll interpolate that into a rotation angle, 0deg → 360deg.
   */
  const spinAnim = useRef(new Animated.Value(0)).current;

  /**
   * 2) Keep a ref to the looping animation so we can stop it later
   *    (e.g. after a few seconds) if desired.
   */
  const loopRef = useRef(null);

  useEffect(() => {
    // 3) Define a looped timing animation: spinAnim goes from 0 → 1 in 2000ms (2s)
    //    and then repeats indefinitely.
    loopRef.current = Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 2000,       // ← Duration of one full rotation (in milliseconds)
        easing: Easing.linear, 
        useNativeDriver: true, // Use native driver for best performance
      })
    );

    // 4) Start the loop immediately when the component mounts
    loopRef.current.start();

    /**
     * 5) (Optional) If you want the gradient to stop spinning after X milliseconds,
     *    you can uncomment the block below and adjust the timeout value.
     *    For example, to spin for 5 seconds and then stop:
     */
    //  const timeout = setTimeout(() => {
    //  if (loopRef.current) {
    //     loopRef.current.stop();
    //    }
    //  }, 10000); // ← 5000ms = 5s
     
    //  return () => {
    //    clearTimeout(timeout);
    //    if (loopRef.current) {
    //      loopRef.current.stop();
    //    }
    //  };
     /*
     * If you do NOT want to ever stop, simply return the cleanup below.
     */
    
    // 6) Cleanup: if the component unmounts, stop the animation.
    return () => {
      if (loopRef.current) {
        loopRef.current.stop();
      }
    };
  }, [spinAnim]);

  /**
   * 7) Interpolate the animated value (0 → 1) into rotation degrees (0deg → 360deg).
   *    You can change the outputRange if you want a partial sweep (e.g. ["0deg","180deg"]).
   */
  const rotate = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  /**
   * 8) Return an Animated.View that rotates according to `rotate`. Inside it, we
   *    render a LinearGradient that is sized to twice the screen’s width/height
   *    and offset so that rotating it never reveals corners.
   *
   *    If you want the gradient to cover only part of your screen (e.g., a header),
   *    you can either:
   *      • Change the `style` prop you pass in (instead of StyleSheet.absoluteFill),
   *        supply a fixed width/height, position, etc.
   *      • Or modify the inline style below (width: width * 2, height: height * 2, etc.).
   */

  // 1) Choose the size for your shape (200×200 here)
  const CONTAINER_SIZE = 200;

  return (
    <Animated.View
      style={[
        {
          width: CONTAINER_SIZE,
          height: CONTAINER_SIZE,
          // 2) Make it a circle by setting borderRadius = half the size
          borderRadius: CONTAINER_SIZE / 2,
          // 3) Clip children to this shape
          overflow: "hidden",
          // 4) Position it where you want (here: centered on screen)
          position: "absolute",
          top: (screenH - CONTAINER_SIZE) / 2,
          left: (screenW - CONTAINER_SIZE) / 2,
          // 5) Apply rotation
          transform: [{ rotate }],
        },
        style,
      ]}
    >
        {/* 12) Now render the LinearGradient itself. Because the parent Animated.View
        is rotating, we only need the gradient’s box to be large enough to cover the view
        at all rotation angles.

        • width: width * 2 and height: height * 2 means the gradient is twice as wide and tall
          as the screen. That way, when you rotate ±45°, the gradient still covers all corners.

        • position: "absolute", left: -width/2, top: -height/2 shifts the gradient box so that
          its center aligns with the screen’s center (so it rotates around the correct pivot). */}

      <LinearGradient
        // 13) These colors define the gradient’s start and end. You can put as many colors
        //     as you like—for example: colors={["#FFF","#000","#FF0"]}.
        colors={["#FF0000", "#0000FF"]}

        // 14) `start` and `end` define the vector along which the gradient runs.
        //     { x:0,y:0 } → { x:1,y:1 } is a diagonal from top-left to bottom-right.
        //     If you want left-to-right only, use start={{ x:0,y:0.5 }} end={{ x:1,y:0.5 }}.
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}

        style={{
          // 6) Make the gradient box large enough that when we rotate,
          //    no corners show empty. For a 200×200 circle, 200×200 is enough,
          //    since a circle’s bounding square is 200×200.
          width: CONTAINER_SIZE,
          height: CONTAINER_SIZE,
        }}
      />
    </Animated.View>
  );
}