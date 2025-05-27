import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { getBooksAndPages } from "../../api/booksAndPages";

const RewindPagesRead = () => {
  const [stats, setStats] = useState({ totalBooks: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const result = await getBooksAndPages();
      setStats(result);
      setLoading(false);
    };
    fetchStats();
  }, []);

  if (loading) return <Text>Loading...</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Reading Stats</Text>
      <Text style={styles.stat}>Books read: {stats.totalBooks}</Text>
      <Text style={styles.stat}>Pages read: {stats.totalPages}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  stat: { fontSize: 18, marginBottom: 10 },
});

export default RewindPagesRead;
