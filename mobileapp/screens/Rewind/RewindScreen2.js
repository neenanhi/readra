// File: RewindScreen2.js
import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { getBooksAndPages } from "../../api/booksAndPages";

const RewindPagesRead = () => {
  const [stats, setStats] = useState({ totalBooks: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const result = await getBooksAndPages();
        setStats(result);
      } catch (err) {
        console.error("Error fetching reading stats:", err);
        setError("Failed to load your reading stats. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4169E1" />
        <Text style={styles.loadingText}>Loading your reading journey...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.statsCard}>
        <Text style={styles.statLabel}>
          You read a total of{" "}
          <Text style={styles.statValue}>{stats.totalPages}</Text> pages across{" "}
          <Text style={styles.statValue}>{stats.totalBooks}</Text> books!
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent: "center",
    // alignItems: "center",
  },
  errorText: {
    fontSize: 18,
    color: "red",
    textAlign: "center",
  },
  statsCard: {
    borderRadius: 16,
    padding: 24,
    top: "32%",
    width: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },

  statLabel: {
    fontSize: 20,
    color: "#fff",
    textAlign: "center",
    fontWeight: "500",
    fontStyle: "italic",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#A47BC0",
  },
});

export default RewindPagesRead;
