// File: Rewind3.js
import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, Animated, Dimensions } from "react-native";
import LottieView from "lottie-react-native";
import { getRewind3Data } from "../../api/rewindData";
import { use } from "react";
import {COLORS} from "../../styles/colors";

const AnimatedLottie = Animated.createAnimatedComponent(LottieView);
const SCREEN_W = Dimensions.get("window").width;
const SPOT_SIZE = SCREEN_W * 2.65; // 130% of screen width

export default function RewindWithDataScreen({isActive}) {
  const [topAuthors, setTopAuthors] = useState([]);
  const [topRatedBooks, setTopRatedBooks] = useState([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const progress = useRef(new Animated.Value(0)).current;
  const lottieRef = useRef(null);

  // 1️⃣ Fetch data once on mount
  useEffect(() => {
    getRewind3Data()
      .then(data => {
        setTopAuthors(data.topAuthors || []);
        setTopRatedBooks(data.topBooks || []);
      })
      .catch(e => console.error("fetchData error:", e));
  }, []);

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
    // lottieRef.current?.reset();
    // lottieRef.current?.play();

        // slide + fade in
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
          source={require("../../assets/animations/spotlight.json")}
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
          styles.statsCard,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <Text style={styles.sectionHeader}>Top Rated Books</Text>
        {topRatedBooks.length ? (
          topRatedBooks.map((b, i) => (
            <Text key={i} style={styles.text}>
              {b.title} — {b.user_rating} ⭐
            </Text>
          ))
        ) : (
          <Text style={styles.text}>Loading…</Text>
        )}

        <Text style={styles.sectionHeader}>Top Rated Authors</Text>
        <Text style={styles.text}>
          {topAuthors.length ? topAuthors.join(", ") : "Loading…"}
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.midnightSlate,
  },
  // lottieWrapper: {
  //   ...StyleSheet.absoluteFillObject,
  //   paddingLeft: 45,      // ← bump this value to taste
  //   overflow: "hidden",         // hide any overshoot
  // },
  background: {
    flex: 1,
    zIndex: 0,
  },
  statsCard: {
    alignSelf: "center",
    zIndex: 1,
    // width: "90%",
    // backgroundColor: "#fff",
    borderRadius: 16,
    padding: 50,
    // alignItems: "center",
    top: -20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowColor: "COLORS.midnightSlate",
    elevation: 8,
  },
  sectionHeader: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 20,
    marginBottom: 12,
    textAlign: "center",
  },
  text: {
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
    marginBottom: 6,
  },
});
