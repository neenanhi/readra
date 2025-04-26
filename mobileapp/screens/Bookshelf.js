import React, { useState } from 'react';
import {PutBook} from '../api/openLibrary';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';

export default function Bookshelf() {
  const [books, setBooks] = useState([
    { id: '1', title: 'The Midnight Library', status: 'read' },
    { id: '2', title: 'Circe', status: 'read' },
    { id: '3', title: 'Tomorrow, and Tomorrow, and Tomorrow', status: 'wantToRead' },
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newGenre, setNewGenre] = useState('');
  const [newISBN, setNewISBN] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCoverImage, setNewCoverImage] = useState('');

  //Search bar components (query holds what we want to search, results is a list of results)
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // ---------- This version uses openlibrary APi and works
  const searchBooks = async () => {
    //If no search content, return nothing
    if (!searchQuery) return;
  
    try {
      // change our search to a URI component, then use OL API to search for the resulting books
      // thanks to goodreads handling the search itself, we dont need to deal with regex
      const response = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(searchQuery)}`);
      //Once we get the response, we change it to a JSON format
      const data = await response.json();
      // Debug our query
      // console.log("Search Results:", data.docs.slice(0, 10));
      setSearchResults(data.docs.slice(0, 10));  // Show top 10 results (can be edited)
    } catch (err) {
      console.error("Error fetching books:", err);
    }
  };
  
  // ---------- This version uses goodreads APi but has some issues with validation
  // ask neena for info on what this API key is - for now its labeled SUPERCOOLAPIKEYDONTTELLNEENA
  // const searchBooks = async () => {
  //   if (!searchQuery) return;
  
  //   try {
  //     const response = await fetch(`https://www.goodreads.com/search/index.xml?key=SUPERCOOLAPIKEYDONTTELLNEENA&q=${encodeURIComponent(searchQuery)}`);
  //     const xmlText = await response.text();
  
  //     // Goodreads returns XML apparently, I hear we need to parse it to Json somehow.
  //     console.log(xmlText);  // For now, just log it
  //   } catch (err) {
  //     console.error("Error fetching books:", err);
  //   }
  // };
  
  // const addBook = () => {
  //   const newBook = {
  //     id: Date.now().toString(),
  //     title: newTitle,
  //     status: newStatus,
  //   };
  //   setBooks(prev => [...prev, newBook]);
  //   setNewTitle('');
  //   setNewStatus('read');
  //   setModalVisible(false);
  // };
  
  // Modified addBook to log info into supabase and populate book field with 
  // temporary information, we can change this temp data when we get the data
  // filling screen working
  const addBook = async () => {
    const newBook = {
      id: Date.now().toString(),
      title: newTitle,
      status: newStatus,
      // temporary info
      author: newAuthor || null,
      genre: newGenre || null,
      cover_image: newCoverImage || null,
      description: newDescription || null,
      isbn: newISBN || null
    };

    // update local state
    setBooks(prev => [...prev, newBook]);
    // send to Supabase
    await PutBook(newBook);
  
    setNewTitle('');
    setNewStatus('');
    setNewAuthor('');
    setNewGenre('');
    setNewISBN('');
    setNewDescription('');
    setNewCoverImage('');
    setModalVisible(false);
  };
  

  const renderBook = ({ item }) => (
    <Text style={styles.bookItem}>• {item.title}</Text>
  );

  const readBooks = books.filter(book => book.status === 'read');
  const wantToReadBooks = books.filter(book => book.status === 'wantToRead');

  return (
    <View style={styles.container}>
      {/* Search Bar code: */}
      <TextInput
        placeholder="Search for books..."
        style={styles.input}
        value={searchQuery}
        onChangeText={setSearchQuery}
        onSubmitEditing={searchBooks}
      />
      {/* within this component you can access searchResults at any point after it's set.*/}
      {/* Search Results looks like this: [
          { title: "SoloLeveling", author_name: ["Sung Jin Woo"], key: "/works/OL12345W" },
          { title: "MHA: Vigilantes", author_name: ["Izuku Midoriya"], key: "/works/OL67890W" }
        ]
      */}
      {searchResults.length > 0 && (
        <View style={{ flex: 1 }}>
          <Text style={styles.heading}>Search Results</Text>
          <FlatList
            data={searchResults}
            // React needs a unique key for each item in the list, 
            // if not present use the title as the key
            keyExtractor={(item, index) => item.key || index.toString()}
            renderItem={({ item }) => (
              <Text style={styles.bookItem}>
                • {item.title} {item.author_name ? `by ${item.author_name[0]}` : ''}
              </Text>
            )}
          />
        </View>
      )}

      {/* Display users read books */}

      <Text style={styles.heading}>📘 Read</Text>
      <FlatList
        data={readBooks}
        keyExtractor={item => item.id}
        renderItem={renderBook}
      />
      {/* Display books in users backlog */}
      <Text style={styles.heading}>🕮 Want to Read</Text>
      <FlatList
        data={wantToReadBooks}
        keyExtractor={item => item.id}
        renderItem={renderBook}
      />

      {/* FAB button */}
      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Text style={styles.fabText}>＋</Text>
      </TouchableOpacity>

      {/* Modal for adding a book */}
      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="slide"
      >
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Add a Book</Text>
          <TextInput
            placeholder="Book Title"
            style={styles.input}
            value={newTitle}
            onChangeText={setNewTitle}
          />
          <TextInput
            placeholder="Status (read or wantToRead)"
            style={styles.input}
            value={newStatus}
            onChangeText={setNewStatus}
          />
          <TextInput 
            placeholder="Author"
            style={styles.input}
            value={newAuthor}
            onChangeText={setNewAuthor} 
          />
          <TextInput
            placeholder="Genre"
            style={styles.input}
            value={newGenre}
            onChangeText={setNewGenre}
          />
          <TextInput 
            placeholder="ISBN"
            style={styles.input}
            value={newISBN}
            onChangeText={setNewISBN}
            keyboardType="numeric"
          />
          <TextInput
            placeholder="Description"
            style={styles.input}
            value={newDescription}
            onChangeText={setNewDescription}
          />
          <TextInput
            placeholder="Cover Image URL"
            style={styles.input}
            value={newCoverImage}
            onChangeText={setNewCoverImage}
          />

          <View style={styles.modalButtons}>
            <Pressable style={styles.button} onPress={addBook}>
              <Text style={styles.buttonText}>Add</Text>
            </Pressable>
            <Pressable style={[styles.button, styles.cancel]} onPress={() => setModalVisible(false)}>
              <Text style={styles.buttonText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 60,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    flex: 1,
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  bookItem: {
    fontSize: 16,
    marginBottom: 5,
  },
  fab: {
    position: 'absolute',
    right: 30,
    bottom: 40,
    backgroundColor: '#007AFF',
    borderRadius: 50,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  fabText: {
    color: '#fff',
    fontSize: 30,
    marginTop: -2,
  },
  modalView: {
    marginTop: '60%',
    marginHorizontal: 20,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  cancel: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
  },
});
