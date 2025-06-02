import React, { useEffect, useLayoutEffect, useState, } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  Pressable,
  ImageBackground,Image, Alert,
  SafeAreaView, Platform, StatusBar,
} from "react-native";

import { getCoverUrl, PutBook } from "../api/openLibrary";
import { Camera, useCameraDevice, useCodeScanner } from "react-native-vision-camera";
import { supabase, isbndbGetHeaders } from "../Supabase";

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Dropdown } from "react-native-element-dropdown";

// Importing shared style tokens
import { COLORS } from "../styles/colors";
import { SPACING } from "../styles/spacing";
import { TEXT } from "../styles/typography";

export default function Bookshelf({ navigation }) {
  const [books, setBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

    const [profileImg, setProfileImg] = useState(null);

    // Log Book Modal state
    const [modalVisible, setModalVisible] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [newStatus, setNewStatus] = useState("");
    const [bookOptions, setBookOptions] = useState([]);
    const [selectedBookId, setSelectedBookId] = useState(null);
    const [selectedBookTitle, setSelectedBookTitle] = useState("Select a book...");
    const [pagesRead, setPagesRead] = useState(0);

  // Scanner state
  const [scanner, setScanner] = useState(false);
  const device = useCameraDevice("back");
  const codeScanner = useCodeScanner({
    codeTypes: ["ean-13"],
    onCodeScanned: (codes) => {
      setScanner(false);
      console.log("Scanned ISBN:", codes[0].value);
      setSearchQuery(codes[0].value);
      searchBooks();
    },
  });

  // Adjust tab bar style when scanner is active
  useLayoutEffect(() => {
    navigation.getParent()?.setOptions({
      tabBarStyle: {
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        height: 80,
        justifyContent: "center",
        backgroundColor: COLORS.buttonBg,
        display: scanner ? "none" : "flex",
      },
    });
  }, [navigation, scanner]);

    // Load library and dropdown options
    useEffect(() => {
        getLibrary();
        const fetchProfile = async () => {
            try {
                const {data: {user}, error: getUserError} = await supabase.auth.getUser();

                const {data: profileData, error: fetchError} = await supabase
                    .from('profiles')
                    .select('username, avatar_url')
                    .eq('id', user.id)
                    .single();

                if (fetchError) {
                    console.log('Fetch profile info warning (profile might not exist yet):', fetchError.message);
                } else if (profileData) {
                    if (profileData.avatar_url) setProfileImg(profileData.avatar_url);
                }
            } catch (err) {
                console.error('Fetch profile error:', err.message);
                Alert.alert('Error', 'Could not load your profile.');
            } finally {
            }
        }
        fetchProfile();
    }, []);

  const isISBN = (query) => /^[0-9]{10,13}$/.test(query.replace(/-/g, ""));

  const searchBooks = async () => {
    if (!searchQuery) return;

    try {
      let fetchedBooks = [];

      if (isISBN(searchQuery)) {
        const response = await fetch(
          `https://api2.isbndb.com/book/${encodeURIComponent(searchQuery)}`,
          { headers: isbndbGetHeaders }
        );
        if (response.ok) {
          const data = await response.json();
          fetchedBooks = [data.book];
        } else {
          console.error("ISBN Search error:", await response.text());
          return;
        }
      } else {
        const response = await fetch(
          `https://api2.isbndb.com/books/${encodeURIComponent(searchQuery)}`,
          { headers: isbndbGetHeaders }
        );
        if (response.ok) {
          const data = await response.json();
          fetchedBooks = data.books;
        } else {
          console.error("Text Search error:", await response.text());
          return;
        }
      }

      setSearchResults(fetchedBooks);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  const addBook = async () => {
    const book = { id: Date.now().toString(), title: newTitle, status: newStatus };
    setBooks((prev) => [...prev, book]);
    await PutBook(book);

    // Update dropdown options
    setBookOptions((prev) => [
      ...prev,
      { label: newTitle, value: book.id },
    ]);

    setNewTitle("");
    setNewStatus("");
    setModalVisible(false);
  };

  const getLibrary = async () => {
    try {
      const b = await supabase.from("book").select("*");
      setBooks(b.data);

      // Update book dropdown options
      const options = b.data.map((bookItem) => ({
        label: bookItem.title,
        value: bookItem.id,
      }));
      setBookOptions(options);
    } catch (err) {
      console.error("Error fetching library:", err);
    }
  };

  const addBookLog = () => {
    // (Assuming you have a createBookLog function defined elsewhere)
    createBookLog(pagesRead, selectedBookId);
    resetBookSelection();
  };

  const resetBookSelection = () => {
    setSelectedBookId(null);
    setSelectedBookTitle("Select a book...");
    setPagesRead(0);
  };

  const renderBookCard = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate("Add a Book", {screen: "BookshelfDetail", params: { isbn: item.isbn },})
    }
    >
      <ImageBackground
        source={{
          uri:
            item.cover_image ||
            item.image ||
            "https://via.placeholder.com/100x150?text=No+Cover",
        }}
        style={styles.cover}
        imageStyle={styles.coverImage}
      />
      <View style={styles.cardContent}>
        <Text style={styles.bookTitle} numberOfLines={2}>
          {item.title}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
    <View style={styles.container}>
      {/* Search + Profile */}
      <View style={styles.searchBarContainer}>
        <TextInput
          placeholder="Search for books..."
          placeholderTextColor={COLORS.textLight}
          style={styles.input}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={searchBooks}
        />

        {/* Scan button */}
        <MaterialCommunityIcons
          style={styles.iconButton}
          name="barcode-scan"
          size={24}
          color={COLORS.textDark}
          onPress={() => setScanner(true)}
        />

        {/* Scanner overlay */}
        {scanner && (
          <Modal visible transparent animationType="slide">
            <View style={styles.cameraContainer}>
              <Camera
                style={StyleSheet.absoluteFill}
                device={device}
                isActive={true}
                codeScanner={codeScanner}
              />
              <TouchableOpacity
                style={styles.closeScanner}
                onPress={() => setScanner(false)}
              >
                <Text style={styles.closeText}>Close Scanner</Text>
              </TouchableOpacity>
              <MaterialCommunityIcons
                name="line-scan"
                size={144}
                style={styles.scannerHelper}
                color={COLORS.white}
              />
            </View>
          </Modal>
        )}

                <TouchableOpacity
                    style={styles.profileButton}
                    onPress={() => navigation.navigate("Profile")}
                >
                    {profileImg ? <Image style={styles.profileImage}
                                         source={{uri: profileImg}}></Image>
                        : <Text style={styles.profileButtonText}>P</Text>}

                </TouchableOpacity>
            </View>

      {/* Search Results */}
      {Array.isArray(searchResults) && searchResults.length > 0 && (
        <View>
          <Text style={styles.heading}>Search Results</Text>
          <View style={{ maxHeight: 200 }}>
            <FlatList
              data={searchResults}
              keyExtractor={(item, index) =>
                item.isbn || item.isbn13 || index.toString()
              }
              renderItem={renderBookCard}
              numColumns={3}
            />
          </View>
        </View>
      )}

      {/* Your Library */}
      <Text style={styles.heading}>Your Library</Text>
      <FlatList
        data={books}
        keyExtractor={(item) => item.id}
        renderItem={renderBookCard}
        numColumns={3}
      />

      {/* Log a Book Modal (FAB is commented out) */}
      {/* <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Text style={styles.fabText}>＋</Text>
      </TouchableOpacity> */}

      {modalVisible && (
        <Modal transparent visible animationType="slide">
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Log a book</Text>

            <Dropdown
              style={styles.dropdown}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              inputSearchStyle={styles.inputSearchStyle}
              data={bookOptions}
              search
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder={selectedBookTitle}
              searchPlaceholder="Search..."
              value={newStatus}
              onChange={(item) => {
                setSelectedBookId(item.value);
                setSelectedBookTitle(item.label);
              }}
            />

            <TextInput
              placeholder="Enter # of pages read..."
              placeholderTextColor={COLORS.textLight}
              onChangeText={(text) => {
                const numericValue = text.replace(/[^0-9]/g, "");
                setPagesRead(numericValue ? parseInt(numericValue, 10) : 0);
              }}
              style={styles.input}
              keyboardType="numeric"
            />

            {/* Buttons */}
            <View style={styles.modalButtons}>
              <Pressable style={styles.button} onPress={addBookLog}>
                <Text style={styles.buttonText}>Log</Text>
              </Pressable>
              <Pressable
                style={styles.button}
                onPress={() => {
                  setModalVisible(false);
                  resetBookSelection();
                }}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      )}
    </View>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    paddingTop: SPACING.xl,         // ~32px
    paddingHorizontal: SPACING.md,   // ~16px
    backgroundColor: COLORS.background,
  },
  // ── Search Bar + Profile Row
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white, // "#f0f0f0"
    marginBottom: SPACING.mid,       // ~15px
  },

  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: COLORS.borderGray,  // "#ccc"
    borderRadius: 10,
    paddingHorizontal: SPACING.sm,   // ~8px
    fontSize: 16,
    color: COLORS.textDark,          // "#2e2e42"
    fontFamily: 'serif',
  },

  iconButton: {
    marginLeft: SPACING.sm,          // ~8px
    padding: SPACING.sm,             // ~8px
    borderRadius: 8,
    backgroundColor: COLORS.backgroundGray, // "#f0f0f0"
  },

    profileButton: {
        marginLeft: SPACING.sm,          // ~8px
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.profileBg, // "#7d819f"
        justifyContent: "center",
        alignItems: "center",
    },
    profileButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontFamily: 'serif',
    },
    profileImage: {
        width: '100%',
        height: '100%',
        borderRadius: 18,
    },

  // ── Headings 
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.primaryText,       // "#2B2F3A"
    marginVertical: SPACING.sm,      // ~8px
    paddingHorizontal: SPACING.sm,   // ~8px
    fontFamily: 'serif',
  },

  // ── Book Card Styles 
  card: {
    width: "30%",
    margin: "1.5%",
    backgroundColor: COLORS.white,
    borderRadius: 12,
    elevation: 3,
    shadowColor: COLORS.shadow,      // "#000"
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: "hidden",
  },
  cover: {
    width: "100%",
    height: 150,
  },
  coverImage: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  cardContent: {
    padding: SPACING.sm,             // ~8px
    alignItems: "center",
    justifyContent: "center",
  },
  bookTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textDark,          // "#2e2e42"
    textAlign: "center",
    lineHeight: 18,
    fontFamily: 'serif',
  },

  // ── FAB (Log a book)—commented out ────────────────────────────────────────
//   fab: {
//     position: "absolute",
//     right: SPACING.lg,               // ~24px
//     bottom: SPACING.lg,              // ~24px
//     backgroundColor: COLORS.profileBg, // "#7d819f"
//     borderRadius: 50,
//     width: 60,
//     height: 60,
//     justifyContent: "center",
//     alignItems: "center",
//     elevation: 5,
//   },
//   fabText: {
//     color: COLORS.white,
//     fontSize: 30,
//     marginTop: -6,
//     fontFamily: 'serif',
//   },

  // ── Modal (Log a book) ─────────────────────────────────────────────────────
  modalView: {
    marginTop: "60%",                // keep 60% from top
    marginHorizontal: SPACING.md,    // ~16px
    backgroundColor: COLORS.white,
    padding: SPACING.md,             // ~16px
    borderRadius: 15,
    shadowColor: COLORS.shadow,      // "#000"
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: SPACING.sm,        // ~8px
    color: COLORS.primaryText,
    fontFamily: 'serif',
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: SPACING.sm,           // slight gap
  },
  button: {
    backgroundColor: COLORS.profileBg, // "#7d819f"
    paddingVertical: SPACING.sm,       // ~8px
    paddingHorizontal: SPACING.lg,     // ~24px
    borderRadius: 10,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontFamily: 'serif',
  },

  // ── Camera Overlay (Scanner) ──────────────────────────────────────────────
  cameraContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    backgroundColor: "rgba(0,0,0,0.8)",
  },
  closeScanner: {
    position: "absolute",
    top: SPACING.lg,                 // ~24px
    left: SPACING.sm,                // ~8px
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: SPACING.sm,             // ~8px
    borderRadius: 6,
  },
  closeText: {
    color: COLORS.white,
    fontSize: 16,
    fontFamily: 'serif',
  },
  scannerHelper: {
    transform: [
      { scaleX: 1.5 },
      { scaleY: 1.2 },
    ],
  },

  // ── Dropdown (Log a book modal) ────────────────────────────────────────────
  dropdown: {
    height: 40,
    borderWidth: 1,
    borderColor: COLORS.borderGray,   // "#ccc"
    borderRadius: 10,
    paddingHorizontal: SPACING.sm,     // ~8px
    marginBottom: SPACING.lg,          // ~24px
  },
  placeholderStyle: {
    fontSize: 16,
    color: COLORS.textLight,           // "#7a7a90"
    fontFamily: 'serif',
  },
  selectedTextStyle: {
    fontSize: 16,
    color: COLORS.textDark,            // "#2e2e42"
    fontFamily: 'serif',
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
    fontFamily: 'serif',
  },
});