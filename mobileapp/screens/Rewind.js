import { View, Text, StyleSheet } from "react-native";
import { useEffect, useState } from "react";
import { getLogData } from "../api/openLibrary";

const Rewind = () => {
  const [logData, setLogData] = useState({
    logs: [],
    totalPagesRead: 0,
    mostPagesLog: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      const data = await getLogData();
      setLogData(data);
    };
    fetchData();
  }, []);

  const displayLogInfo = () => {
    if (!(logData.logs)) {
      return <Text>No logs found</Text>
    }

    return (
      logData.logs.map((log, index) => (
        <Text key={index}>
          Log #{index + 1}: {log.pages} pages
        </Text>
      ))
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.profileText}>Rewind</Text>
      
      <Text>Total Pages Read: {logData.totalPagesRead}</Text>
      
      {logData.logs.length > 0 ? (
        logData.logs.map((log, index) => (
          <Text key={index}>
            Book {index + 1}: {log.pages} pages
          </Text>
        ))
      ) : (
        <Text>No logs found</Text>
      )}
    </View>
  );
};

// ... (keep your existing styles)
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

export default Rewind;
