import { View, Text, StyleSheet, Animated } from "react-native";
import { useEffect, useState, useRef } from "react";
import { getRewind3Data } from "../api/rewindData";

const Rewind3 = () => {
  const [topAuthors, setTopAuthors] = useState([]);
  const [topRatedBooks, setTopRatedBooks] = useState([]);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  /** Fetches top 3 authors and books, then plays animation */
  useEffect(() => {
    const fetchData = async () => {
      const rewind3Data = getRewind3Data();
      setTopAuthors(rewind3Data.topAuthors || []);
      setTopRatedBooks(rewind3Data.topBooks || []);

      // Start fade-in animation once data is loaded
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }).start();
    }

    fetchData();
  }, []);

  // Helper function to display book ratings and titles
  const renderBooks = () => topRatedBooks?.map((book) => {
    return <Text>{book.title} {book.user_rating}</Text>
  });

  return (
    <View style={styles.container}>
      <Text style={styles.sectionHeader}>Top Rated Books</Text>
      {/* Render top 3 rated book titles + ratings */}
      {topRatedBooks.length === 0 ? 
        <Text>Loading top books...</Text> : renderBooks()
      }
      <Animated.Text style={[styles.animatedText, { opacity: fadeAnim }]}>
        {/* Render top 3 authors */}
        {topAuthors.length === 0 ?
          <Text>Loading top books...</Text> : topAuthors.join("\n")
        }
      </Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  animatedText: {
    fontSize: 20,
    fontWeight: "600",
    color: '#7d819f'
  },
});

export default Rewind3;
