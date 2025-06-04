// // components/RateBook.js

// import React from "react";
// import { View, Pressable, StyleSheet } from "react-native";
// import Slider from "@react-native-community/slider";
// import FontAwesome from "@expo/vector-icons/FontAwesome";
// import { COLORS } from "../styles/colors";

// export default function RateBook({
//   rating,
//   onChange,
//   onSave,
//   onSlidingStart,
//   onSlidingComplete,
// }) {
//   // Convert 1–10 slider value into 0–5 “star” value
//   const stars = rating / 2;

//   return (
//     <View style={styles.container}>
//       {/* ⭐ Star Row */}
//       <View style={styles.starRow}>
//         {[1, 2, 3, 4, 5].map((i) => (
//           <FontAwesome
//             key={i}
//             name={
//               stars >= i
//                 ? "star"
//                 : stars >= i - 0.5
//                 ? "star-half-full"
//                 : "star-o"
//             }
//             size={26}
//             color="#FFD700"
//           />
//         ))}
//       </View>

//       {/* ▲ Slider + Save Button Container */}
//       <View
//         style={styles.sliderWrapper}
//         // By returning true here, we force this View to capture
//         // the touch immediately (so the ScrollView underneath won’t steal it).
//         onStartShouldSetResponder={() => true}
//         onMoveShouldSetResponder={() => true}
//         onMoveShouldSetResponderCapture={() => true}
//       >
//         <Slider
//           style={{ width: "100%", height: 40 }}
//           minimumValue={1}
//           maximumValue={10}
//           step={1}
//           value={rating}
//           onValueChange={onChange}
//           onSlidingStart={onSlidingStart}
//           onSlidingComplete={onSlidingComplete}
//           minimumTrackTintColor={COLORS.background}  
//           maximumTrackTintColor={COLORS.buttonBg}   
//           thumbTintColor={COLORS.white}            
//         />

//         {/* Save / Confirm Button */}
//         <Pressable style={styles.saveBtn} onPress={onSave}>
//           <FontAwesome name="check" size={18} color="#fff" />
//         </Pressable>
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     marginTop: 24,
//     alignItems: "center",
//     width: "90%",
//   },
//   starRow: {
//     flexDirection: "row",
//     marginBottom: 12,
//   },
//   sliderWrapper: {
//     width: "100%",
//     borderWidth: 1,
//     borderColor: "red",   // ← debug border: you can remove or set to "transparent" once it's working
//     zIndex: 10,
//     position: "relative", // needed so zIndex takes effect
//     paddingVertical: 12,  // increase vertical padding so the thumb is easy to grab
//   },
//   saveBtn: {
//     marginTop: 10,
//     backgroundColor: "#7d819f",
//     padding: 10,
//     borderRadius: 8,
//     alignSelf: "center",
//   },
// });

// components/RateBook.js

import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { COLORS } from "../styles/colors";

export default function RateBook({ rating, onChange, onSave }) {
  // rating is an integer between 1 and 10 (half‐star steps). e.g. 7 → 3.5 stars.

  // We'll measure the total width of the star row to convert tap x → 1–10.
  const [containerWidth, setContainerWidth] = useState(0);

  // Convert the 1–10 rating into how many stars to fill:
  const fullStars = Math.floor(rating / 2);      // e.g. rating=7 ⇒ fullStars=3
  const hasHalfStar = rating % 2 === 1;           // true if an odd number ⇒ a half

  // Render five stars, each either full, half, or empty:
  const renderStars = () => {
    return [1, 2, 3, 4, 5].map((i) => {
      if (i <= fullStars) {
        return <FontAwesome key={i} name="star" size={32} color="#FFD700" />;
      } else if (i === fullStars + 1 && hasHalfStar) {
        return (
          <FontAwesome key={i} name="star-half-full" size={32} color="#FFD700" />
        );
      } else {
        return <FontAwesome key={i} name="star-o" size={32} color="#FFD700" />;
      }
    });
  };

  // When user taps within the container, we calculate which half‐star they meant.
  const handlePress = (e) => {
    const x = e.nativeEvent.locationX;      // x‐coordinate of the tap
    if (containerWidth === 0) return;

    // Determine rough fraction: 0.0–1.0
    const frac = Math.max(0, Math.min(1, x / containerWidth));

    // Convert to 1–10 (ceiling so tapping anywhere on segment 3 means rating===3)
    const newRating = Math.ceil(frac * 10);
    onChange(newRating);
  };

  return (
    <View style={styles.container}>
      {/* Pressable overlay capturing taps */}
      <Pressable
        style={styles.starContainer}
        onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
        onPress={handlePress}
      >
        <View style={styles.starRow}>{renderStars()}</View>
      </Pressable>

      {/* Save / Confirm Button */}
      <Pressable style={styles.saveBtn} onPress={onSave}>
        <Text style={styles.saveText}>✔</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    alignItems: "center",
    width: "90%",
  },
  starContainer: {
    width: "100%",            // full width so taps anywhere on row count
    alignItems: "center",
  },
  starRow: {
    flexDirection: "row",
    justifyContent: "center",
    // no padding/margin here—container handles layout
  },
  saveBtn: {
    marginTop: 12,
    backgroundColor: COLORS.primary || "#7d819f",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  saveText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
  },
});