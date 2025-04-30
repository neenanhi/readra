import React, { useState } from "react";
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
} from "react-native";
import ProfileScreen from "./Profile";

export default function Bookshelf({ navigation }) {
  const [books, setBooks] = useState([
    { id: "1", title: "The Midnight Library", status: "read" },
    { id: "2", title: "Circe", status: "read" },
    {
      id: "3",
      title: "Tomorrow, and Tomorrow, and Tomorrow",
      status: "wantToRead",
    },
    { id: "4", title: "brainrot", status: "wantToRead" },
    { id: "5", title: "tiktok", status: "wantToRead" },
    { id: "6", title: "doomscrolling", status: "read" },
    { id: "7", title: "dead inside", status: "wantToRead" },
    { id: "8", title: "cannot figure out backend", status: "read" },
    { id: "9", title: "still struggling with Golang", status: "wantToRead" },
    { id: "10", title: "gave up", status: "read" },
    {
      id: "11",
      title: "doing UI instead of fixing actual problem",
      status: "wantToRead",
    },
    { id: "12", title: "dropping out", status: "wantToRead" },
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newStatus, setNewStatus] = useState("");

  // Search bar components
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  // ---------- This version uses openlibrary APi and works
  const searchBooks = async () => {
    if (!searchQuery) return;

    try {
      // change our search to a URI component, then use OL API to search for the resulting books
      // thanks to goodreads handling the search itself, we dont need to deal with regex
      const response = await fetch(
        `https://openlibrary.org/search.json?q=${encodeURIComponent(
          searchQuery
        )}`
      );
      //Once we get the response, we change it to a JSON format
      const data = await response.json();
      setSearchResults(data.docs.slice(0, 10));
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

  //-- This function handles the adding books from the search bar to the library--
  const handleAddSearchBook = async (item) => {
    let detailedData = {};
    let isbn = null;
    let genre = null;

    // fetch detailed book info using the key
    try {
      const response = await fetch(`https://openlibrary.org${item.key}.json`);
      detailedData = await response.json();
    } catch (err) {
      console.warn("Failed to fetch detailed book info:", err);
    }

    // filter genre using regex (only alphabetical subjects)
    if (detailedData.subjects) {
      // Note: This dosnt always work and genre's are sometimes.... not genres
      // IDK if Counting is a genre but when I searched for math textbooks it gave this
      // "Counting" from this ["collectionID:elmmath", "Counting", "Study and teaching (Primary)", "Mathematics"]
      // if we want to mess with the genre matching stuff we just handle it in this area regardless
      genre =
        detailedData.subjects.find((sub) => /^[A-Za-z\s]+$/.test(sub)) || null;
    }
    // Build the new book object
    const newBook = {
      id: Date.now().toString(),
      title: item.title || "Unknown Title",
      status: "wantToRead",
      author: item.author_name ? item.author_name[0] : null,
      genre: genre,
      cover_image: item.cover_i
        ? `https://covers.openlibrary.org/b/id/${item.cover_i}-M.jpg`
        : null,
      // if the data contains a string we know we have a description itself, if its not that then we are dealing with the
      // "description": { "value": "This is a more complex description." } version it sometimes returns, so get th evalue
      description: cleanDescription(
        typeof detailedData.description === "string"
          ? detailedData.description
          : detailedData.description?.value || null
      ),
      isbn: isbn,
    };

    console.log(JSON.stringify(newBook));
    // Save to Supabase and update local state
    try {
      // comment out putcommand to not update supabase
      await PutBook(newBook);
      setBooks((prev) => [...prev, newBook]);
      alert(`"${newBook.title}" added to your library!`);
    } catch (err) {
      console.error("Failed to add book:", err);
      alert("Error adding book.");
    }
  };

  // description needs cleaning done on it, so I made a basic function to do it
  function cleanDescription(rawDescription) {
    if (!rawDescription) return null;
    let cleaned = rawDescription.split(/Source:|Also contained in:/)[0].trim();
    cleaned = cleaned.replace(/\[.*?\]\(.*?\)/g, "");
    cleaned = cleaned.replace(/https?:\/\/\S+/g, "");
    cleaned = cleaned.replace(/\r?\n|\r/g, " ").replace(/\s+/g, " ");

    return cleaned;
  }

  const addBook = async () => {
    const newBook = {
      id: Date.now().toString(),
      title: newTitle,
      status: newStatus,
    };
    setBooks((prev) => [...prev, newBook]);
    await PutBook(newBook);
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
      {/* Search Bar */}
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
          onPress={() => {
            navigation.navigate("Profile");
          }}
        >
          <Text style={styles.profileButtonText}>P</Text>
        </TouchableOpacity>
      </View>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <View style={styles.searchResultContainer}>
          <Text style={styles.heading}>Search Results</Text>
          <FlatList
            data={searchResults}
            keyExtractor={(item, index) => item.key || index.toString()}
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

      {/* Combined Library Section */}
      <Text style={styles.heading}>Your Library</Text>
      <FlatList
        data={books}
        keyExtractor={(item) => item.id}
        renderItem={renderBook}
        numColumns={4}
      />

      {/* FAB button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.fabText}>＋</Text>
      </TouchableOpacity>

      {/* Modal for adding a book */}
      <Modal transparent={true} visible={modalVisible} animationType="slide">
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Add a Book</Text>
          <TextInput
            placeholder="Book Title"
            style={styles.input}
            value={newTitle}
            onChangeText={setNewTitle}
            placeholderTextColor="#666"
          />
          <TextInput
            placeholder="Status (read or wantToRead)"
            style={styles.input}
            value={newStatus}
            onChangeText={setNewStatus}
            placeholderTextColor="#666"
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
  container: {
    paddingTop: 60,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    flex: 1,
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    padding: 10,
  },
  bookItem: {
    width: "25%",
    paddingHorizontal: 8,
    marginBottom: 20,
    alignItems: "center",
  },
  bookCover: {
    width: "100%",
    height: 100,
    backgroundColor: "#ddd",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  bookTitle: {
    fontSize: 14,
    color: "#333",
    textAlign: "center",
  },
  bookAuthor: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    flex: 1,
    height: 40,
    fontSize: 16,
    color: "#333",
  },
  button: {
    backgroundColor: "#7d819f",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  cancel: {
    backgroundColor: "#ccc",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
  searchResultContainer: {
    flex: 10,
  },
  searchItem: {
    paddingHorizontal: 8,
    marginBottom: 20,
    alignItems: "center",
  },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  profileButton: {
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#7d819f",
    marginLeft: 10,
  },
  profileButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  // + old fab -- add a book feature
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
  fabText: {
    color: "#fff",
    fontSize: 30,
    marginTop: -2,
  },
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
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
