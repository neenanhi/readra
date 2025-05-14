import React, {useEffect, useLayoutEffect, useState} from "react";
import { PutBook } from "../api/openLibrary";
import { createBookLog } from "../api/logData";
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
import { Camera, useCameraDevice, useCodeScanner } from "react-native-vision-camera";
import {supabase} from "../Supabase";
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
    const searchBooks = async () => {
        if (!searchQuery) {
            console.log("no search query");
            return;
        }
        try {
            console.log(`https://openlibrary.org/search.json?q=${encodeURIComponent(searchQuery)}`);
            const response = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(searchQuery)}`);
            const data = await response.json();

            const processed = data.docs.map(book => {
                const result = {
                    title: book.title || null,
                    authors: book.author_name || [],
                    isbns: []
                };

                // Check for ISBN in keys
                for (const key in book) {
                    const keyMatch = key.match(/^isbn_(\d{10,13})$/);
                    if (keyMatch) {
                        result.isbns.push(keyMatch[1]);
                    }
                }

                // Check for ISBN in ia array
                if (Array.isArray(book.ia)) {
                    for (const val of book.ia) {
                        const valMatch = val.match(/^isbn_(\d{10,13})$/);
                        if (valMatch) {
                            result.isbns.push(valMatch[1]);
                        }
                    }
                }
                // If we found any ISBNs, return the result
                if (result.isbns.length > 0) return result;
                else return null;
            })
                .filter(Boolean)
                .slice(0, 25);

            console.log("Processed search results:", processed);
            setSearchResults(processed);
        } catch (err) {
            console.error("Error fetching books:", err);
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

    // --- Scanner view replaces everything when active ---
    if (scanner) {
        return (
            <View style={BookshelfStyles.cameraContainer}>
                <Camera
                    style={StyleSheet.absoluteFill}
                    device={device}
                    isActive={true}
                    codeScanner={codeScanner}
                />
                <TouchableOpacity style={BookshelfStyles.closeScanner} onPress={() => setScanner(false)}>
                    <Text style={BookshelfStyles.closeText}>Close Scanner</Text>
                </TouchableOpacity>
                <MaterialCommunityIcons
                    name="line-scan"
                    size={144}
                    style={BookshelfStyles.scannerHelper}
                    color="white"/>
            </View>
        );
    }

    // load data from user's library
    useEffect(() => {
        getLibrary();
    }, []);

	/** Book Logging: Reset Book Information when closing modal */
	const resetBookSelection = () => {
		setSelectedBookId(null);
		setSelectedBookTitle("Select a book...");
		setPagesRead(0);
		setModalVisible(false);
	}

    const renderBook = ({item}) => (
        <TouchableOpacity
            style={BookshelfStyles.card}
            onPress={() => navigation.navigate('BookDetail', {isbn: item.isbn})}>
            <ImageBackground
                source={{uri: item.cover_image}}
                style={BookshelfStyles.cover}
                imageStyle={BookshelfStyles.coverImage}
            />
            <View style={BookshelfStyles.cardContent}>
                <Text style={BookshelfStyles.bookTitle} numberOfLines={2}>
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

                <TouchableOpacity
                    style={BookshelfStyles.profileButton}
                    onPress={() => navigation.navigate("Profile")}>
                    <Text style={BookshelfStyles.profileButtonText}>P</Text>
                </TouchableOpacity>
            </View>

            {/* Search results */}
            { searchResults.length > 0 && (
                <View style={BookshelfStyles.searchResultContainer}>
                    <Text style={BookshelfStyles.heading}>Search Results</Text>
                    <FlatList
                        data={searchResults}
                        keyExtractor={(item, i) => item.key || i.toString()}
                        renderItem={({item}) => (
                            <TouchableOpacity
                                style={BookshelfStyles.searchItem}
                                onPress={() => navigation.navigate('BookDetail', {
                                    isbn: item.isbns.length > 0 ? item.isbns[0] : null
                                })}
                            >
                                <Text style={BookshelfStyles.bookTitle}>{item.title}</Text>
                            </TouchableOpacity>
                        )}
                        numColumns={4}
                    />
                </View>
            )}

            {/* Your library */}
            <Text style={BookshelfStyles.heading}>Your Library</Text>
            <FlatList
                data={books}
                keyExtractor={(item) => item.id}
                renderItem={renderBook}
                numColumns={3}
            />

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
