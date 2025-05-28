import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator, // Import ActivityIndicator for loading
} from "react-native";
import { getBooksAndPages } from "../../api/booksAndPages";

const RewindPagesRead = () => {
  const [stats, setStats] = useState({ totalBooks: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Add error state

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
        <ActivityIndicator size="large" color="#007bff" />
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
      <Text style={styles.title}>Your Reading Rewind</Text>
      <Text style={styles.subtitle}>A look back at your reading journey!</Text>
      <View style={styles.statsCard}>
        <Text style={styles.statLabel}>Total Books Read:</Text>
        <Text style={styles.statValue}>{stats.totalBooks}</Text>
        <Text style={styles.statLabel}>Total Pages Read:</Text>
        <Text style={styles.statValue}>{stats.totalPages}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: "red",
    textAlign: "center",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333", // Darker text for good contrast
    marginBottom: 10,
    textShadowColor: "rgba(0, 0, 0, 0.1)", // Subtle shadow
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontSize: 18,
    color: "#666",
    marginBottom: 30,
    fontStyle: "italic",
  },
  statsCard: {
    backgroundColor: "#ffffff", // White card background
    borderRadius: 15,
    padding: 25,
    marginHorizontal: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
    alignItems: "center",
    marginBottom: 30,
    width: "85%",
    maxWidth: 400,
  },
  statLabel: {
    fontSize: 18,
    color: "#555",
    marginTop: 15,
    marginBottom: 5,
    fontWeight: "600",
  },
  statValue: {
    fontSize: 38,
    fontWeight: "bold",
    color: "#007bff",
    marginBottom: 15,
  },
});

export default RewindPagesRead;
