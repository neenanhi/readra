//RewindTeaser.js
// Teaser / Splash Screen
// 	• As soon as the user taps “Rewind,” show a very brief fullscreen animation or graphic—maybe a vintage book gently opening (faded‐in GLSL shader + overlaid text: “Your Monthly Reading Rewind).
// 	• Have it auto‐fade out after 1–1.5 seconds (or let the user tap to skip), so it feels like a teaser, not a full step.
// RewindTeaser.js

import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableWithoutFeedback,
} from "react-native";
import { GLView } from "expo-gl";

export default function RewindTeaser({ onFinish }) {
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
//     Animated.timing(fadeAnim, {
//       toValue: 1,
//       duration: 600,
//       useNativeDriver: true,
//     }).start(() => {
//       setTimeout(() => {
//         Animated.timing(fadeAnim, {
//           toValue: 0,
//           duration: 600,
//           useNativeDriver: true,
//         }).start(() => {
//           onFinish && onFinish();
//         });
//       }, 1000);
//     });
//   }, []);
    const timeout = setTimeout(() => {
       Animated.timing(fadeAnim, {
         toValue: 0,
         duration: 600,
         useNativeDriver: true,
       }).start(() => {
         onFinish && onFinish();
       });
     }, 1000);

     return () => clearTimeout(timeout);
   }, []);
