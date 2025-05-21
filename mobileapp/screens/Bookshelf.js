import React, {useEffect, useLayoutEffect, useState } from "react";
import { ScrollView } from 'react-native';
import {getCoverUrl, PutBook} from "../api/openLibrary";

import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Modal,
    Pressable,
    ImageBackground,
} from "react-native";

import {Camera, useCameraDevice, useCodeScanner} from "react-native-vision-camera";
import {supabase, isbndbGetHeaders} from "../Supabase";

import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Dropdown } from 'react-native-element-dropdown';
import { BookshelfStyles } from "../styles/BookshelfStyles";

export default function Bookshelf({navigation}) {
    // Books
    const [books, setBooks] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
	// Log Book Modal
    const [modalVisible, setModalVisible] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [newStatus, setNewStatus] = useState("");
	const [bookOptions, setBookOptions] = useState([]);
	const [selectedBookId, setSelectedBookId] = useState(null);
	const [selectedBookTitle, setSelectedBookTitle] = useState("Select a book...");
	const [pagesRead, setPagesRead] = useState(0);

	const addBookLog = () => {
		createBookLog(pagesRead, selectedBookId);
		resetBookSelection();
	}

    // --- Normal app UI below ---
    const isISBN = (query) => /^[0-9]{10,13}$/.test(query.replace(/-/g, ''));
    const searchBooks = async () => {
        if (!searchQuery) return;

        try {
            let books = [];

            if(isISBN(searchQuery)){
                const response = await fetch(`https://api2.isbndb.com/book/${encodeURIComponent(searchQuery)}`, {
                    headers: isbndbGetHeaders,
                });
                if (response.ok) {
                    const data = await response.json();
                    books = [data.book]; // normalize to array
                } else {
                    console.error("ISBN Search error:", await response.text());
                    return;
                }
            }
            else{
                const response = await fetch(`https://api2.isbndb.com/books/${encodeURIComponent(searchQuery)}`, {
                    headers: isbndbGetHeaders,
                });
                if (response.ok) {
                    const data = await response.json();
                    books = data.books;
                } else {
                    console.error("Text Search error:", await response.text());
                    return;
                }
            }

            setSearchResults(books);

        } catch (err) {
            console.error("Fetch error:", err);
        }
    };


    const addBook = async () => {
        const book = {id: Date.now().toString(), title: newTitle, status: newStatus};
        setBooks((prev) => [...prev, book]);
        await PutBook(book);

				// Update dropdown options
				setBookOptions(prev => [...prev, {
					label: newTitle,
					value: book.id
				}]);

				setNewTitle("");
        setNewStatus("");
        setModalVisible(false);
    };

    const getLibrary = async () => {
        const b = await supabase
            .from("book")
            .select('*')
        setBooks(b.data);
        // Refresh library
        await getLibrary();


		// Update book dropdown options
		const options = b.data.map(book => ({
			label: book.title,
			value: book.id
		}));
		setBookOptions(options);
	}

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

    useLayoutEffect(() => {
        navigation.getParent()?.setOptions({
            tabBarStyle: {
                borderTopLeftRadius: 30,
                borderTopRightRadius: 30,
                height: 80,
                justifyContent: "center",
                backgroundColor: "#2e3a59",
                display: scanner ? "none" : "flex" }
        });
    }, [navigation, scanner]);


    // load data from user's library
    useEffect(() => {
        getLibrary();
    }, []);


    const renderBookCard = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('BookDetail', { isbn: item.isbn })}
        >
            <ImageBackground
            source={{ uri: item.cover_image || item.image || 'https://via.placeholder.com/100x150?text=No+Cover' }}
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
        <View style={BookshelfStyles.container}>
            {/* Search + Profile */}
            <View style={BookshelfStyles.searchBarContainer}>
                <TextInput
                    placeholder="Search for books..."
                    style={BookshelfStyles.input}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    onSubmitEditing={searchBooks}
                />

                {/* Scan button */}
                <MaterialCommunityIcons
                    style={BookshelfStyles.iconButton}
                    name="barcode-scan"
                    size={24}
                    color="black"
                    onPress={() => setScanner(true)}/>
                {/* Scanner overlay using Modal */}
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
                        color="white"
                    />
                    </View>
                </Modal>
                )}


                <TouchableOpacity
                    style={BookshelfStyles.profileButton}
                    onPress={() => navigation.navigate("Profile")}>
                    <Text style={BookshelfStyles.profileButtonText}>P</Text>
                </TouchableOpacity>
            </View>

            {/* Search results */}
            {/* {console.log(searchResults)} */}
            {Array.isArray(searchResults) && searchResults.length > 0 && (
                <View>
                    <Text style={styles.heading}>Search Results</Text>
                    <View style={{ maxHeight: 200 }}>
                        <FlatList
                        data={searchResults}
                        keyExtractor={(item, index) => item.isbn || item.isbn13 || index.toString()}
                        renderItem={renderBookCard}
                        numColumns={3}
                        />
                    </View>
                </View>
            )}


            {/* Your library */}
            <Text style={BookshelfStyles.heading}>Your Library</Text>
            <FlatList
                data={books}
                keyExtractor={(item) => item.id}
                renderItem={renderBookCard}
                numColumns={3}
            />
            {/* {console.log(books)} */}

            {/* Log a booka FAB */}
            <TouchableOpacity style={BookshelfStyles.fab} onPress={() => setModalVisible(true)}>
                <Text style={BookshelfStyles.fabText}>＋</Text>
            </TouchableOpacity>

            {/* Log a book modal */}
            <Modal transparent visible={modalVisible} animationType="slide">
                <View style={BookshelfStyles.modalView}>
                    <Text style={BookshelfStyles.modalTitle}>Log a book</Text>
					{/* Replace the Status TextInput with this Dropdown */}
					<Dropdown
						style={BookshelfStyles.dropdown}
						placeholderStyle={BookshelfStyles.placeholderStyle}
						selectedTextStyle={BookshelfStyles.selectedTextStyle}
	    				inputSearchStyle={BookshelfStyles.inputSearchStyle}
						data={bookOptions}
						search
						maxHeight={300}
						labelField="label"
					    valueField="value"
					    placeholder={selectedBookTitle}
						searchPlaceholder="Search..."
						value={newStatus}
						onChange={item => {
							setSelectedBookId(item.value);
							setSelectedBookTitle(item.label);
						}}
					/>
					<TextInput
						placeholder="Enter # of pages read..."
		    			onChangeText={(text) => {
                            // Remove non-numeric characters and convert to number
                            const numericValue = text.replace(/[^0-9]/g, '');
                            // Sets pages read to
                            setPagesRead(numericValue ? parseInt(numericValue, 10) : 0);
					    }}
						style={BookshelfStyles.input}
						keyboardType="numeric"
					/>
                    {/* Buttons */}
                    <View style={BookshelfStyles.modalButtons}>
                        <Pressable style={BookshelfStyles.button} onPress={addBookLog}>
                            <Text style={BookshelfStyles.buttonText}>Log</Text>
                        </Pressable>
                        <Pressable style={BookshelfStyles.button} onPress={() => setModalVisible(false)}>
                        	<Text style={BookshelfStyles.buttonText} onPress={() => resetBookSelection()}>Cancel</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </View>
    );
};
