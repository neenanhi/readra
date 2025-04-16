import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { getCoverUrl } from '../api/openLibrary';

const BookCard = ({ book }) => {
  return (
    <View style={styles.card}>
      <Image
        source={{ uri: getCoverUrl(book.cover_i) }}
        style={styles.image}
        resizeMode="cover"
      />
      <Text style={styles.title}>{book.title}</Text>
      <Text style={styles.author}>by {book.author_name?.[0] || 'Unknown'}</Text>
      <Text style={styles.description}>
        {book.description ? book.description.slice(0, 100) + '...' : 'No description available.'}
      </Text>
      <Text style={styles.rating}>★★★★★</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 160,
    marginRight: 16,
  },
  image: {
    height: 192,
    width: '100%',
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#d2d3e0',
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'serif',
    color: '#2e2e42',
  },
  author: {
    fontStyle: 'italic',
    fontSize: 12,
    color: '#55556d',
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    color: '#6e6e84',
  },
  rating: {
    marginTop: 4,
    fontSize: 14,
  },
});

export default BookCard;