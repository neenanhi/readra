import React from "react";
import { View, Pressable, StyleSheet } from "react-native";
import Slider from "@react-native-community/slider";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { COLORS } from "../styles/colors";

export default function RateBook({
  // Convert 1–10 slider value to 0–5 star value
  rating,
  onChange,
  onSave,
  onSlidingStart,
  onSlidingComplete,
}) {
  const stars = rating / 2; // e.g. 7 ➜ 3.5 stars

  return (
    <View style={styles.container}>
      {/* ⭐ Star Row */}
      <View style={styles.starRow}>
        {[1, 2, 3, 4, 5].map((i) => (
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

      {/* ▲ Slider + Save Button Container */}
      <View style={styles.sliderWrapper}>
        <Slider
          style={{ width: "100%", height: 40 }}
          minimumValue={1}
          maximumValue={10}
          step={1}
          value={rating}
          onValueChange={onChange}
          onSlidingStart={onSlidingStart}
          onSlidingComplete={onSlidingComplete}
          minimumTrackTintColor={COLORS.background} // filled‐in color
          maximumTrackTintColor={COLORS.buttonBg} // unfilled color
          thumbTintColor={COLORS.white}            // thumb color
        />

        {/* Save / Confirm Button */}
        <Pressable style={styles.saveBtn} onPress={onSave}>
          <FontAwesome name="check" size={18} color="#fff" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    alignItems: "center",
    width: "90%",
  },
  starRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  sliderWrapper: {
    width: "100%",
    borderWidth: 1,
    borderColor: "red",   // ← debug border; remove or set to "transparent" when done
    zIndex: 10,
    position: "relative", // needed so zIndex takes effect on iOS/Android
    paddingVertical: 8,   // extra touch area above/below the thumb
  },
  saveBtn: {
    marginTop: 10,
    backgroundColor: "#7d819f",
    padding: 10,
    borderRadius: 8,
    alignSelf: "center",
  },
});