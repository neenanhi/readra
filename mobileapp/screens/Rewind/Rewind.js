import { View, Text, StyleSheet } from "react-native";
import { useEffect, useState } from "react";
import { getLogData } from "../../api/logData";
import Rewind3 from "./Rewind3";

const Rewind2 = () => {
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

  /** Displays a user's individual logs */
  const displayLogs = () => {
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

  /** Format date */
  const mostPagesLogDate = () => {
    if (!logData.mostPagesLog?.created_at) return "No date available";
    
    const date = new Date(logData.mostPagesLog.created_at);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  return (
    <View style={styles.container}>
      <Text style={styles.profileText}>Rewind</Text>
      <Text>You have read a total of { logData.totalPagesRead } across all books</Text>
      <Text>Your most active day was { mostPagesLogDate() }, where you read { logData?.mostPagesLog?.pages || 'unknown'} pages</Text>
      {/* Function below displays all user log information */}
      {/* { displayLogs() } */}
      <Rewind3/>
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
