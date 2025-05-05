import React, {useLayoutEffect, useState} from "react";
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
    Button, Image, ImageBackground,
} from "react-native";
import {Camera, useCameraDevice, useCodeScanner} from "react-native-vision-camera";
import {supabase} from "../Supabase";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Dropdown } from 'react-native-element-dropdown';

export default function Bookshelf({navigation}) {
    const [books, setBooks] = useState([]);

    const [modalVisible, setModalVisible] = useState(false);
    const [logBookModalVisibility, setLogBookModalVisbility] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [newStatus, setNewStatus] = useState("");

    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);

		// Test
		const statusOptions = [
			{ label: 'Want to read', value: 'wantToRead' },
			{ label: 'Currently reading', value: 'currentlyReading' },
			{ label: 'Finished reading', value: 'read' },
		];
		

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
        setNewTitle("");
        setNewStatus("");
        setModalVisible(false);
    };

    const getLibrary = async () => {
        const b = await supabase
            .from("book")
            .select('*')
        setBooks(b.data);
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
                <MaterialCommunityIcons
                    name="line-scan"
                    size={144}
                    style={styles.scannerHelper}
                    color="white"/>
            </View>
        );
    }

    // load data from user's library
    getLibrary();

		/** Book Logging: Reset Book Information when closing modal */
		const resetBookSelection = () => {
			setNewStatus("");
			setLogBookModalVisbility(false);
			return;
		}

    const renderBook = ({item}) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('BookDetail', {isbn: item.isbn})}>
            <ImageBackground
                source={{uri: item.cover_image}}
                style={styles.cover}
                imageStyle={styles.coverImage}/>
            <View style={styles.cardContent}>
                <Text style={styles.bookTitle} numberOfLines={2}>
                    {item.title}
                </Text>
            </View>
        </TouchableOpacity>
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

                {/* Scan button */}
                <MaterialCommunityIcons
                    style={styles.iconButton}
                    name="barcode-scan"
                    size={24}
                    color="black"
                    onPress={() => setScanner(true)}/>

                <TouchableOpacity
                    style={styles.profileButton}
                    onPress={() => navigation.navigate("Profile")}>
                    <Text style={styles.profileButtonText}>P</Text>
                </TouchableOpacity>
            </View>

            {/* Search results */}
            {searchResults.length > 0 && (
                <View style={styles.searchResultContainer}>
                    <Text style={styles.heading}>Search Results</Text>
                    <FlatList
                        data={searchResults}
                        keyExtractor={(item, i) => item.key || i.toString()}
                        renderItem={({item}) => (
                            <TouchableOpacity
                                style={styles.searchItem}
                                onPress={() => navigation.navigate('BookDetail', {
                                    isbn: item.isbns.length > 0 ? item.isbns[0] : null
                                })}
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
                numColumns={3}
            />

            {/* Add‐book FAB */}
            <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
                <Text style={styles.fabText}>＋</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={() => setLogBookModalVisbility(true)}>
                    <Text style={styles.buttonText}>Log a book</Text>
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

            {/* Log a book modal */}
            <Modal transparent visible={logBookModalVisibility} animationType="slide">
                <View style={styles.modalView}>
                    <Text style={styles.modalTitle}>Log a book</Text>
										{/* Replace the Status TextInput with this Dropdown */}
										<Dropdown
											style={styles.dropdown}
											placeholderStyle={styles.placeholderStyle}
											selectedTextStyle={styles.selectedTextStyle}
											inputSearchStyle={styles.inputSearchStyle}
											data={statusOptions}
											search
											maxHeight={300}
											labelField="label"
											valueField="value"
											placeholder="Select a book..."
											searchPlaceholder="Search..."
											value={newStatus}
											onChange={item => {
												setNewStatus(item.value);
											}}
										/>
                    <View style={styles.modalButtons}>
                        <Pressable style={styles.button} onPress={addBook}>
                            <Text style={styles.buttonText}>Log</Text>
                        </Pressable>
                        <Pressable
                            style={[styles.button, styles.cancel]}
                            onPress={() => setLogBookModalVisbility(false)}
                        >
                            <Text style={styles.buttonText} onPress={() => resetBookSelection()}>Cancel</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {flex: 1, paddingTop: 60, paddingHorizontal: 20, backgroundColor: "#fff"},
    searchBarContainer: {flexDirection: "row", alignItems: "center", marginBottom: 15},
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
    iconButton: {
        marginLeft: 8,
        padding: 8,
        borderRadius: 8,
        backgroundColor: '#f0f0f0',
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
    profileButtonText: {color: "#fff", fontSize: 16},

    heading: {fontSize: 20, fontWeight: "bold", marginVertical: 10, paddingHorizontal: 10},

    searchResultContainer: {flex: 1},
    searchItem: {flex: 1, padding: 8, marginBottom: 20, alignItems: "center"},

    card: {
        width: '30%',
        margin: "1.5%",
        backgroundColor: '#fff',
        borderRadius: 12,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
        overflow: 'hidden',
    },
    cover: {
        width: '100%',
        height: 150,
    },
    coverImage: {
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
    },
    cardContent: {
        padding: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bookTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        textAlign: 'center',
        lineHeight: 18,
    },

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
    fabText: {color: "#fff", fontSize: 30, marginTop: -2},

    modalView: {
        marginTop: "60%",
        marginHorizontal: 20,
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 15,
        shadowColor: "#000",
        shadowOpacity: 0.25,
        shadowOffset: {width: 0, height: 2},
        elevation: 5,
    },
    modalTitle: {fontSize: 18, fontWeight: "bold", marginBottom: 10},
    modalButtons: {flexDirection: "row", justifyContent: "space-between"},
    button: {backgroundColor: "#7d819f", paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10},
    cancel: {backgroundColor: "#ccc"},
    buttonText: {color: "#fff", fontSize: 16},

    cameraContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        width: "100%"
    },
    closeScanner: {
        position: "absolute",
        top: 40,
        left: 20,
        backgroundColor: "rgba(0,0,0,0.6)",
        padding: 10,
        borderRadius: 6,
    },
    closeText: {color: "#fff", fontSize: 16},
    scannerHelper: {
        transform: [
            { scaleX: 1.5},
            { scaleY: 1.2 }
        ]
    },
		dropdown: {
			height: 40,
			borderWidth: 1,
			borderColor: '#ccc',
			borderRadius: 10,
			paddingHorizontal: 10,
			marginBottom: 15,
		},
		placeholderStyle: {
			fontSize: 16,
			color: '#999',
		},
		selectedTextStyle: {
			fontSize: 16,
			color: '#333',
		},
		inputSearchStyle: {
			height: 40,
			fontSize: 16,
		},		
});
