import { View, Text, StyleSheet } from "react-native";
import { useEffect, useState } from "react";
import { getLogData } from "../../api/logData";
import RewindScreen2 from "./RewindScreen2";

const Rewind2 = () => {
  // second rewind screen
  return (
    <View style={styles.container}>
      <RewindScreen2 />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  profileText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
});

export default Rewind2;
