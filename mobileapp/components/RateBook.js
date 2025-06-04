import React from "react";
import { View, Pressable, StyleSheet } from "react-native";
import Slider from "@react-native-community/slider";
import FontAwesome from "@expo/vector-icons/FontAwesome";

export default function RateBook({ rating, onChange, onSave }) {
  // Convert 1-10 slider value to 0-5 star value
  const stars = rating / 2;          // e.g. 7 ➜ 3.5 stars

  return (
    <View style={styles.container}>
      {/* ⭐ Row */}
      <View style={styles.starRow}>
        {[1, 2, 3, 4, 5].map(i => (
          <FontAwesome
            key={i}
            name={
              stars >= i
                ? "star"
                : stars >= i - 0.5
                  ? "star-half-full"
                  : "star-o"
            }
            size={26}
            color="#FFD700"
          />
        ))}
      </View>

      {/* Slider */}
      <Slider
        style={{ width: "100%" }}
        minimumValue={1}
        maximumValue={10}
        step={1}
        value={rating}
        onValueChange={onChange}
      />

      {/* Optional save button */}
      <Pressable style={styles.saveBtn} onPress={onSave}>
        <FontAwesome name="check" size={18} color="#fff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 24, alignItems: "center", width: "90%" },
  starRow: { flexDirection: "row", marginBottom: 12 },
  saveBtn: {
    marginTop: 10,
    backgroundColor: "#7d819f",
    padding: 10,
    borderRadius: 8,
  },
});