// components/RateBook.js

import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { COLORS } from "../styles/colors";

export default function RateBook({ rating, onChange, onSave }) {
  // `rating` is 1..10 (half stars). e.g. 7 => 3.5 stars

  // Measure the width of the star container exactly once:
  const [containerWidth, setContainerWidth] = useState(0);

  // Full stars vs. half star
  const fullStars = Math.floor(rating / 2);
  const hasHalfStar = rating % 2 === 1;

  const renderStars = () => {
    return [1, 2, 3, 4, 5].map((i) => {
      if (i <= fullStars) {
        return <FontAwesome key={i} name="star" size={32} color="#FFD700" />;
      } else if (i === fullStars + 1 && hasHalfStar) {
        return (
          <FontAwesome
            key={i}
            name="star-half-full"
            size={32}
            color="#FFD700"
          />
        );
      } else {
        return <FontAwesome key={i} name="star-o" size={32} color="#FFD700" />;
      }
    });
  };

  // Converts (x / containerWidth) into a 1..10 rating
  const handlePress = (e) => {
    const x = e.nativeEvent.locationX;
    if (containerWidth <= 0) return;
    const frac = Math.max(0, Math.min(1, x / containerWidth));
    const newRating = Math.ceil(frac * 10);
    onChange(newRating);
  };

  return (
    <View style={styles.container}>
      {/* The Pressable now captures both taps and drags */}
      <Pressable
        style={styles.starContainer}
        onLayout={(e) => {
          const w = e.nativeEvent.layout.width;
          console.log("RateBook container width:", w);
          setContainerWidth(w);
        }}
        onPress={handlePress}
        onResponderMove={(e) => handlePress(e)} // drag‐to‐rate
        // onStartShouldSetResponder={() => true}
        // onMoveShouldSetResponder={() => true}
        hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}  // bigger hit zone
      >
        <View style={styles.starRow}>{renderStars()}</View>
      </Pressable>

      <Pressable style={styles.saveBtn} onPress={onSave}>
        <Text style={styles.saveText}>✔</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    width: "90%",     // 90% of parent width
    // no alignItems here (so child can fill)
  },
  starContainer: {
    width: "100%", 
  },
  starRow: {
    flexDirection: "row",
    justifyContent: "space-between",  // spread 5 icons across full width
  },
  saveBtn: {
    marginTop: 12,
    backgroundColor: COLORS.white || COLORS.periwinkle,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: "center",
  },
  saveText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
  },
});