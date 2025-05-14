import { View, Text, StyleSheet, Animated } from "react-native";
import { useEffect, useState, useRef } from "react";
import { getTopAuthors, getTopBooks } from "../../api/rewindData";

const Rewind3 = () => {
  const [topAuthors, setTopAuthors] = useState([]);
  const [topRatedBooks, setTopRatedBooks] = useState([]);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  /** Fetches top 3 authors and books, then plays animation */
  useEffect(() => {
    const fetchData = async () => {
      const authorData = await getTopAuthors();
      setTopAuthors(authorData);
      
      const ratingData = await getTopBooks();
      setTopRatedBooks(ratingData);

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
    return <Text>{book.title} {book.rating}</Text>
  });

return (
  <View style={styles.container}>
    <Text style={styles.sectionHeader}>Top Rated Books</Text>
    {topRatedBooks.length === 0 ? 
      <Text style={styles.bookText}>"Loading top books..."</Text> 
      : renderBooks()
    }
    <Animated.Text style={[styles.animatedText, { opacity: fadeAnim }]}>
      {topAuthors.length > 0
        ? topAuthors.join("\n")
        : "Loading top authors..."}
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
