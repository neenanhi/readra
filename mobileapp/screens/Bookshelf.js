import React, { useEffect, useContext, useState } from 'react';
import { PutBook } from "../api/openLibrary";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  Pressable,
  Button,
} from "react-native";
import { Camera, useCameraDevice, useCodeScanner } from "react-native-vision-camera";
import { fetchUserBooks } from "../api/userLibrary";
import { UserContext } from '../context/UserContext';

export default function Bookshelf({ navigation }) {
  const [books, setBooks] = useState([]);
  const { session } = useContext(UserContext);
  // fetchUserBooks
  // const [books, setBooks] = useState([
  //   { id: "1", title: "The Midnight Library", status: "read" },
  //   { id: "2", title: "Circe", status: "read" },
  //   { id: "3", title: "Tomorrow, and Tomorrow, and Tomorrow", status: "wantToRead" },
  //   // …add your own initial items…
  // ]);

  useEffect(() => {
    const getBooks = async () => {
      try {
        if (session?.user?.id) {
          const userBooks = await fetchUserBooks(session.user.id);
          setBooks(userBooks);
        }
      } catch (err) {
        console.error('Error fetching books:', err);
      }
    }
    getBooks();
  }, [session]);



  const [modalVisible, setModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newStatus, setNewStatus] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const [scanner, setScanner] = useState(false);
  const device = useCameraDevice("back");
  const codeScanner = useCodeScanner({
    codeTypes: ["ean-13"],
    onCodeScanned: (codes) => {
      setScanner(false);
      console.log("Scanned ISBN:", codes[0].value);
    },
  });

  // --- Scanner view replaces everything when active ---
  if (scanner) {
    return (
      <View style={styles.cameraContainer}>
        <Camera
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={true}
          codeScanner={codeScanner}
        />
        <TouchableOpacity style={styles.closeScanner} onPress={() => setScanner(false)}>
          <Text style={styles.closeText}>Close Scanner</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // --- Normal app UI below ---
  const searchBooks = async () => {
    if (!searchQuery) return;
    try {
      const response = await fetch(
        `https://openlibrary.org/search.json?q=${encodeURIComponent(searchQuery)}`
      );
      const data = await response.json();
      setSearchResults(data.docs.slice(0, 10));
    } catch (err) {
      console.error("Error fetching books:", err);
    }
  };

  const handleAddSearchBook = async (item) => {
    let detailed = {};
    try {
      const res = await fetch(`https://openlibrary.org${item.key}.json`);
      detailed = await res.json();
    } catch {
      /* ignore */
    }

    // pick a genre if available
    const genre =
      detailed.subjects?.find((s) => /^[A-Za-z\s]+$/.test(s)) ?? null;

    const newBook = {
      id: Date.now().toString(),
      title: item.title,
      status: "wantToRead",
      author: item.author_name?.[0] ?? null,
      genre,
      cover_image: item.cover_i
        ? `https://covers.openlibrary.org/b/id/${item.cover_i}-M.jpg`
        : null,
      description:
        typeof detailed.description === "string"
          ? detailed.description
          : detailed.description?.value ?? null,
      isbn: item.isbn?.[0] ?? null,
    };

    try {
      await PutBook(newBook);
      setBooks((prev) => [...prev, newBook]);
      alert(`"${newBook.title}" added to your library!`);
    } catch {
      alert("Failed to add book.");
    }
  };

  const addBook = async () => {
    const book = { id: Date.now().toString(), title: newTitle, status: newStatus };
    setBooks((prev) => [...prev, book]);
    await PutBook(book);
    setNewTitle("");
    setNewStatus("");
    setModalVisible(false);
  };

  const renderBook = ({ item }) => (
    <View style={styles.bookItem}>
      <View style={styles.bookCover}>
        <Text style={styles.bookTitle}>{item.title}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Search + Profile */}
      <View style={styles.searchBarContainer}>
        <TextInput
          placeholder="Search for books..."
          style={styles.input}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={searchBooks}
        />
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => navigation.navigate("Profile")}
        >
          <Text style={styles.profileButtonText}>P</Text>
        </TouchableOpacity>
      </View>

      {/* Scan button */}
      <Button title="Scan ISBN" onPress={() => setScanner(true)} />

      {/* Search results */}
      {searchResults.length > 0 && (
        <View style={styles.searchResultContainer}>
          <Text style={styles.heading}>Search Results</Text>
          <FlatList
            data={searchResults}
            keyExtractor={(item, i) => item.key || i.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.searchItem}
                onPress={() => handleAddSearchBook(item)}
              >
                <Text style={styles.bookTitle}>{item.title}</Text>
              </TouchableOpacity>
            )}
            numColumns={4}
          />
        </View>
      )}

      {/* Your library */}
      <Text style={styles.heading}>Your Library</Text>
      <FlatList
        data={books}
        keyExtractor={(item) => item.id}
        renderItem={renderBook}
        numColumns={4}
      />

      {/* Add‐book FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Text style={styles.fabText}>＋</Text>
      </TouchableOpacity>

      {/* Add‐book Modal */}
      <Modal transparent visible={modalVisible} animationType="slide">
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Add a Book</Text>
          <TextInput
            placeholder="Title"
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
          <View style={styles.modalButtons}>
            <Pressable style={styles.button} onPress={addBook}>
              <Text style={styles.buttonText}>Add</Text>
            </Pressable>
            <Pressable
              style={[styles.button, styles.cancel]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, paddingHorizontal: 20, backgroundColor: "#fff" },
  searchBarContainer: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 10,
    fontSize: 16,
    color: "#333",
  },
  profileButton: {
    marginLeft: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#7d819f",
    justifyContent: "center",
    alignItems: "center",
  },
  profileButtonText: { color: "#fff", fontSize: 16 },

  heading: { fontSize: 20, fontWeight: "bold", marginVertical: 10, paddingHorizontal: 10 },

  searchResultContainer: { flex: 1 },
  searchItem: { flex: 1, padding: 8, marginBottom: 20, alignItems: "center" },

  bookItem: { width: "25%", paddingHorizontal: 8, marginBottom: 20, alignItems: "center" },
  bookCover: {
    width: "100%",
    height: 100,
    backgroundColor: "#ddd",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  bookTitle: { fontSize: 14, color: "#333", textAlign: "center" },

  fab: {
    position: "absolute",
    right: 30,
    bottom: 40,
    backgroundColor: "#7d819f",
    borderRadius: 50,
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  fabText: { color: "#fff", fontSize: 30, marginTop: -2 },

  modalView: {
    marginTop: "60%",
    marginHorizontal: 20,
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  modalButtons: { flexDirection: "row", justifyContent: "space-between" },
  button: { backgroundColor: "#7d819f", paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10 },
  cancel: { backgroundColor: "#ccc" },
  buttonText: { color: "#fff", fontSize: 16 },

  cameraContainer: { flex: 1 },
  closeScanner: {
    position: "absolute",
    top: 40,
    left: 20,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 10,
    borderRadius: 6,
  },
  closeText: { color: "#fff", fontSize: 16 },
});
