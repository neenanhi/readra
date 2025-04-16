import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { fetchBooks, getCoverUrl } from '../api/openLibrary';
import BookCard from '../components/BookCard';

const Home = ({ navigation }) => {
  // function setBooks changes value of books
  // books starts as an empty array []
  // useState rerenders the UI when books/loading value updates
  const [books, setBooks] = useState([]); 
  const [loading, setLoading] = useState(true); 


  // =====================
  // Book Fetching
  // useEffect runs when Home first appears on screen
  // async function fetchBooks fetches data from the OpenLib API
  // async to use await, pausing until data is fetched
  // =====================
  useEffect(() => {
    const getBooks = async () => {
      try {
        const books = await fetchBooks();
        // rerender Home with fetched books
        setBooks(books);
      } catch (err) {
        console.error('Error fetching books:', err);
      } finally {
        // stop loading spinner once books are fetched
        setLoading(false);
      }
    }
    getBooks();
  }, []);

  return (
    <ScrollView style={styles.container}>
      {/* Quote of the Day */}
      <View style={styles.quoteBox}>
        <Text style={styles.quoteText}>
          “Anything worth having <Text style={styles.quoteEmphasis}>takes time</Text>.”
        </Text>
        <Text style={styles.quoteAuthor}>— Someone Notable</Text>
      </View>

      {/* Find your next read section header */}
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Find your next read:</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Bookshelf')}>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Horizontal Scroll of Book Cards */}
      {loading ? (
        <ActivityIndicator size="large" color="#999" style={{ marginVertical: 20 }} />
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollRow}>
          {books.map((book, index) => (
            <BookCard key={index} book={book} />
            // <View key={index} style={styles.bookCard}>
            //   <Image
            //     source={{ uri: getCoverUrl(book.cover_i) }}
            //     style={styles.bookCover}
            //     resizeMode="cover"
            //   />
            //   <Text style={styles.bookTitle}>{book.title}</Text>
            //   <Text style={styles.bookAuthor}>by {book.author_name?.[0] || 'Unknown'}</Text>
            //   <Text style={styles.bookDescription}>
            //     {book.description ? book.description.slice(0, 100) + '...' : 'No description available.'}
            //   </Text>
            //   <Text style={styles.rating}>★★★★★</Text>
            // </View>
          ))}
        </ScrollView>
      )}

      {/* Reading Analysis Card */}
      <TouchableOpacity style={styles.analysisCard} onPress={() => navigation.navigate('Analytics')}>
        <View style={styles.analysisCover} />
        <Text style={styles.analysisText}>Your reading: Analyzed</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fdfaf6',
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  quoteBox: {
    marginBottom: 32,
    padding: 24,
    borderRadius: 24,
    backgroundColor: '#e9e6f0',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  quoteText: {
    fontSize: 18,
    fontStyle: 'italic',
    color: '#2e2e42',
    textAlign: 'center',
  },
  quoteEmphasis: {
    fontWeight: 'bold',
  },
  quoteAuthor: {
    marginTop: 8,
    fontSize: 14,
    color: '#7a7a90',
    textAlign: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#2e2e42',
    fontFamily: 'serif',
  },
  arrow: {
    fontSize: 20,
    color: '#2e2e42',
  },
  scrollRow: {
    marginBottom: 32,
  },
  bookCard: {
    width: 160,
    marginRight: 16,
  },
  bookCover: {
    height: 192,
    width: '100%',
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#d2d3e0',
  },
  bookTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'serif',
    color: '#2e2e42',
  },
  bookAuthor: {
    fontStyle: 'italic',
    fontSize: 12,
    color: '#55556d',
    marginBottom: 4,
  },
  bookDescription: {
    fontSize: 12,
    color: '#6e6e84',
  },
  rating: {
    marginTop: 4,
    fontSize: 14,
  },
  analysisCard: {
    padding: 24,
    borderRadius: 24,
    backgroundColor: '#e6e9f2',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  analysisCover: {
    height: 80,
    width: 56,
    backgroundColor: '#a5a7c7',
    borderRadius: 8,
    marginRight: 16,
  },
  analysisText: {
    fontSize: 18,
    fontFamily: 'serif',
    color: '#2e2e42',
  },
});

export default Home;