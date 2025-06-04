// screens/TestSliderScreen.js

import React, { useState } from "react";
import { SafeAreaView, View, Text, StyleSheet } from "react-native";
import Slider from "@react-native-community/slider";

export default function TestSliderScreen() {
  const [val, setVal] = useState(5);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.label}>Current value: {val}</Text>
      <View style={styles.sliderWrapper} onStartShouldSetResponder={() => true} onMoveShouldSetResponder={() => true}>
        <Slider
          style={{ width: "80%", height: 40 }}
          minimumValue={1}
          maximumValue={10}
          step={1}
          value={val}
          onValueChange={(newVal) => {
            console.log("Moved to:", newVal);
            setVal(newVal);
          }}
          minimumTrackTintColor="#007AFF"
          maximumTrackTintColor="#CCCCCC"
          thumbTintColor="#FFFFFF"
        />
      </View>
      <Text style={styles.instructions}>
        Drag the white circle horizontally. Check the console/logs for “Moved to: …”.
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 24,
    marginBottom: 20,
  },
  sliderWrapper: {
    width: "100%",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "red",    // you’ll see a red box around the slider
    paddingVertical: 10,
  },
  instructions: {
    marginTop: 20,
    textAlign: "center",
    color: "#555",
  },
});