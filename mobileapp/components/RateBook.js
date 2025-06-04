// // components/RateBook.js

// import React, { useState } from "react";
// import { View, Text, Pressable, StyleSheet } from "react-native";
// import FontAwesome from "@expo/vector-icons/FontAwesome";
// import { COLORS } from "../styles/colors";

// export default function RateBook({ rating, onChange, onSave }) {
//   // rating is an integer between 1 and 10 (half‐star steps). e.g. 7 → 3.5 stars.

//   // We'll measure the total width of the star row to convert tap x → 1–10.
//   const [containerWidth, setContainerWidth] = useState(0);

//   // Convert the 1–10 rating into how many stars to fill:
//   const fullStars = Math.floor(rating / 2);      // e.g. rating=7 ⇒ fullStars=3
//   const hasHalfStar = rating % 2 === 1;           // true if an odd number ⇒ a half

//   // Render five stars, each either full, half, or empty:
//   const renderStars = () => {
//     return [1, 2, 3, 4, 5].map((i) => {
//       if (i <= fullStars) {
//         return <FontAwesome key={i} name="star" size={32} color="#FFD700" />;
//       } else if (i === fullStars + 1 && hasHalfStar) {
//         return (
//           <FontAwesome key={i} name="star-half-full" size={32} color="#FFD700" />
//         );
//       } else {
//         return <FontAwesome key={i} name="star-o" size={32} color="#FFD700" />;
//       }
//     });
//   };

//   // When user taps within the container, we calculate which half‐star they meant.
//   const handlePress = (e) => {
//     const x = e.nativeEvent.locationX;      // x‐coordinate of the tap
//     if (containerWidth === 0) return;

//     // Determine rough fraction: 0.0–1.0
//     const frac = Math.max(0, Math.min(1, x / containerWidth));

//     // Convert to 1–10 (ceiling so tapping anywhere on segment 3 means rating===3)
//     const newRating = Math.ceil(frac * 10);
//     onChange(newRating);
//   };

//   return (
//     <View style={styles.container}>
//       {/* Pressable overlay capturing taps */}
//       <Pressable
//         style={styles.starContainer}
//         onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
//         onPress={handlePress}
//       >
//         <View style={styles.starRow}>{renderStars()}</View>
//       </Pressable>

//       {/* Save / Confirm Button */}
//       <Pressable style={styles.saveBtn} onPress={onSave}>
//         <Text style={styles.saveText}>✔</Text>
//       </Pressable>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     marginTop: 24,
//     alignItems: "center",
//     width: "90%",
//   },
//   starContainer: {
//     width: "100%",            // full width so taps anywhere on row count
//     alignItems: "center",
//   },
//   starRow: {
//     flexDirection: "row",
//     justifyContent: "center",
//     // no padding/margin here—container handles layout
//   },
//   saveBtn: {
//     marginTop: 12,
//     backgroundColor: COLORS.primary || "#7d819f",
//     paddingVertical: 8,
//     paddingHorizontal: 16,
//     borderRadius: 8,
//   },
//   saveText: {
//     color: "#fff",
//     fontSize: 20,
//     fontWeight: "600",
//   },
// });

// components/RateBook.js

import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { COLORS } from "../styles/colors";
import { SPACING } from "../styles/spacing";

export default function RateBook({ rating, onChange, onSave }) {
  // rating is an integer 1..10 (half stars).  e.g. 7 → 3.5 stars.

  // We’ll measure the width of the Pressable container:
  const [containerWidth, setContainerWidth] = useState(0);

  // How many full stars? Is there a half star?
  const fullStars = Math.floor(rating / 2);  // e.g. 7 ⇒ 3
  const hasHalfStar = rating % 2 === 1;       // 7 % 2 = 1 ⇒ half

  // Render exactly 5 icons, using “star”, “star-half-full”, or “star-o”:
  const renderStars = () => {
    return [1, 2, 3, 4, 5].map((i) => {
      if (i <= fullStars) {
        // fully filled star
        return <FontAwesome key={i} name="star" size={32} color="#FFD700" />;
      } else if (i === fullStars + 1 && hasHalfStar) {
        // exactly one half‐star in the next slot
        return (
          <FontAwesome
            key={i}
            name="star-half-full"
            size={32}
            color="#FFD700"
          />
        );
      } else {
        // empty star
        return <FontAwesome key={i} name="star-o" size={32} color="#FFD700" />;
      }
    });
  };

  // When the user taps inside this Pressable, use locationX to figure out 1..10:
  const handlePress = (e) => {
    const x = e.nativeEvent.locationX;
    if (containerWidth <= 0) return;

    const frac = Math.max(0, Math.min(1, x / containerWidth));
    const newRating = Math.ceil(frac * 10);
    onChange(newRating);
  };

  return (
    <View style={styles.container}>
      {/* 
        This Pressable now fully stretches to 100% of parent width,
        and we will space the 5 stars evenly across it.
      */}
      <Pressable
        style={styles.starContainer}
        onLayout={(e) => {
          const w = e.nativeEvent.layout.width;
          console.log("RateBook container width:", w);
          setContainerWidth(w);
        }}
        onPress={handlePress}
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
    marginTop: SPACING.sm,
    // Remove alignItems:"center" here so the starContainer really can stretch
    width: "90%",      
  },
  starContainer: {
    width: "100%",            // stretch this Pressable across its parent’s 90% width
  },
  starRow: {
    flexDirection: "row",
    justifyContent: "space-between",  // spread the 5 icons across the full width
  },
  saveBtn: {
    marginTop: 12,
    backgroundColor: COLORS.primary || "#7d819f",
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