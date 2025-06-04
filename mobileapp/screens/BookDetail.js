import BookCard from "../components/BookCard";
import axios from "axios";
import {
    ActivityIndicator,
    Button,
    ScrollView,
    TouchableOpacity,
    Image,
    SafeAreaView,
    StyleSheet,
    Text,
    View, TextInput, Pressable, Modal
} from "react-native";
import React, {useEffect, useState} from "react";
import {getCoverUrl, PutBook} from "../api/openLibrary";
import {supabase, isbndbGetHeaders} from "../Supabase";
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

import { COLORS } from '../styles/colors';
import { SPACING } from '../styles/spacing';
import { TEXT } from '../styles/typography';

export async function getBookData(isbn) {
    try {
        const response = await axios.get(`https://api2.isbndb.com/book/${isbn}`, {
            headers: isbndbGetHeaders
        });
        // console.log("printing")
        // console.log(response.data.book)
        return response.data.book;
    } catch (error) {
        console.error(`Error fetching book data for ISBN ${isbn}:`, error.response?.data || error.message);
        return null;
    }
}

export async function getPages(isbn) {
    try {
        const response = await axios.get(`https://api2.isbndb.com/book/${isbn}`, {
            headers: isbndbGetHeaders
        });

        return response.data.book?.pages || null;
    } catch (error) {
        console.error(`Error fetching page count for ISBN ${isbn}:`, error.response?.data || error.message);
        return null;
    }
}


// export default function BookDetail({isbn}) {
export default function BookDetail({route}) {
    const {isbn} = route.params;

    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pages, setPages] = useState(null);
    const [userBook, setUserBook] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    // Date pickers state
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);

    function cleanDescription(raw) {
        if (!raw) return "No description available.";

        // Remove HTML tags
        let cleaned = raw.replace(/<[^>]*>/g, "");

        // Remove URLs
        cleaned = cleaned.replace(/https?:\/\/\S+/g, "");

        // Remove markdown-style links [text](url)
        cleaned = cleaned.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");

        return cleaned.trim();
    }

    useEffect(() => {
        let mounted = true;
        setLoading(true);

        // Fetch user-specific book record from Supabase
        supabase
            .from('book')
            .select('*')
            .eq('isbn', isbn)
            .then(d => {
                setUserBook(d.data[0]);
            })
            .then(() => {
                setEndDate(new Date(userBook?.date_finished));
                setStartDate(new Date(userBook?.date_started));
            });

        // Fetch page count from ISBNdb
        getPages(isbn).then(data => {
            if (mounted) setPages(data);
        });

        // Fetch book metadata from ISBNdb
        getBookData(isbn)
            .then(data => {
                if (!mounted) return;
                if (data) {
                    data.isbn = isbn;
                    data.cover_image = data.cover_image || data.image || data.image_original || null;
                    data.description = data.synopsis || data.description|| null;
                    // console.log(data)
                    // console.log(data.cover_image)
                    data.description = cleanDescription(data.description);
                    setBook(data);
                } else {
                    setError(new Error("No book found"));
                }
            })
            .catch(err => {
                if (mounted) setError(err);
            })
            .finally(() => {
                if (mounted) setLoading(false);
            });

        return () => {
            mounted = false;
        };
    }, [isbn]);

    function addBook() {
        setLoading(true);
        PutBook(book)
            .then(() => {
                supabase
                    .from('book')
                    .select("*")
                    .eq("isbn", isbn).then(d => {
                    setUserBook(d.data[0]);
                });
                setLoading(false);
            });
    }

    function removeBook() {
        setLoading(true);
        supabase
            .from("book")
            .delete()
            .eq("isbn", isbn)
            .then(() => {
                supabase
                    .from('book')
                    .select("*")
                    .eq("isbn", isbn).then(d => {
                    setUserBook(d.data[0]);
                });
                setLoading(false);
            });
    }

    function updateBook() {
        setLoading(true);
        supabase
            .from("book")
            .update({date_started: startDate, date_finished: endDate})
            .eq("isbn", isbn)
            .then(() => {
                setLoading(false);
            });
    }

    // console.log(userBook, startDate, endDate);

    if (loading) {
        return (
            <ActivityIndicator/>
        );
    }
    if (error) {
        return <Text>Error loading book: {error.message}</Text>;
    }

    return (
        <SafeAreaView style={styles.screen}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.card}>
                    <View style={styles.topRow}>
                        <View style={styles.infoColumn}>
                            <Text style={[TEXT.heading, styles.title]}>{book.title}
                            </Text>
                            <Text style={[TEXT.subheading, styles.author]}>
                            by {book.authors?.[0] || "Unknown"}
                            </Text>
                        </View>
                        <Image
                            source={{ uri: getCoverUrl(book) }}
                            style={styles.cover}
                            resizeMode="cover"
                        />
                    </View>

                    <Text style={[TEXT.subheading, styles.author]}>
                            Pages: {pages || "Unknown"}
                            </Text>

                    <Text style={[TEXT.body, styles.description]}>
                    {book.description
                        ? book.description
                        : "No description available."}
                    </Text>

                    <View style={styles.actionContainer}>
                    {userBook === undefined ? (
                        <TouchableOpacity
                        style={styles.addToLibrary}
                        onPress={() => addBook()}
                        >
                        <Text style={[TEXT.button, styles.addToLibraryText]}>
                            Add to Library
                        </Text>
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.inLibRow}>
                        <TouchableOpacity
                            style={styles.removeButton}
                            onPress={removeBook}
                        >
                            <Text style={[TEXT.button, styles.removeButtonText]}>
                            Remove from Library
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.editButton}
                            onPress={() => setModalVisible(true)}
                        >
                            <FontAwesome5
                            name="edit"
                            size={20}
                            color={COLORS.textSecondary}
                            />
                        </TouchableOpacity>
                        </View>
                    )}
                    </View>

                <Modal transparent visible={modalVisible} animationType="slide">
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalView}>
                            <Text style={[TEXT.subheading, styles.modalTitle]}>
                                Edit Dates
                            </Text>

                            <Pressable
                                onPress={() => {
                                setShowStartPicker(true);
                                }}
                                style={styles.dateField}
                            >
                                <Text style={[TEXT.body, styles.dateFieldText]}>
                                Start: {startDate.toLocaleDateString()}
                                </Text>
                            </Pressable>
                            <DateTimePickerModal
                                isVisible={showStartPicker}
                                mode="date"
                                onConfirm={(date) => {
                                setStartDate(date);
                                setShowStartPicker(false);
                                }}
                                onCancel={() => setShowStartPicker(false)}
                                headerTextIOS="Select start date"
                            />

                            <Pressable
                                onPress={() => setShowEndPicker(true)}
                                style={styles.dateField}
                            >
                                <Text style={[TEXT.body, styles.dateFieldText]}>
                                Finish: {endDate.toLocaleDateString()}
                                </Text>
                            </Pressable>
                            <DateTimePickerModal
                                isVisible={showEndPicker}
                                mode="date"
                                onConfirm={(date) => {
                                setEndDate(date);
                                setShowEndPicker(false);
                                }}
                                onCancel={() => setShowEndPicker(false)}
                                headerTextIOS="Select finish date"
                            />

                            <View style={styles.modalButtons}>
                                <Pressable
                                style={[styles.button, styles.saveButton]}
                                onPress={() => {
                                    updateBook();
                                    setModalVisible(false);
                                }}
                                >
                                <Text style={[TEXT.button, styles.buttonText]}>Save</Text>
                                </Pressable>
                                <Pressable
                                style={[styles.button, styles.cancelButton]}
                                onPress={() => setModalVisible(false)}
                                >
                                <Text style={[TEXT.button, styles.buttonText]}>Cancel</Text>
                                </Pressable>
                            </View>
                        </View>
                    </View>
                </Modal>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: "#2e3a59",
    },
    card: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: "#fff",
        margin: 24,
        borderRadius: 25,
        // borderWidth: StyleSheet.hairlineWidth,
        overflow: 'scroll',
    },
    topRow: {
        marginBottom: 24,
    },
    cover: {
        width: "60%",
        aspectRatio: 2 / 3,
        borderRadius: 8,
        backgroundColor: "#d2d3e0",
        display: 'flex',
        marginHorizontal: 'auto',
    },
    infoColumn: {
        flex: 1,
        justifyContent: "center",
    },
    title: {
        fontSize: 25,
        fontWeight: "bold",
        color: "#7d819f",
        marginBottom: 12,
        textAlign: "center",
        marginTop: 40,
        marginHorizontal: 32,
        fontFamily: 'georgia',
    },
    author: {
        fontSize: 20,
        marginBottom: 20,
        color: "#666",
        marginHorizontal: 'auto',
        textAlign: 'center',
        fontFamily: 'georgia',
    },
    description: {
        fontSize: 14,
        color: "#444",
        lineHeight: 20,
        marginBottom: 24,
    },
    buttonRow: {
        justifyContent: "space-between",
    },
    buttonWrapper: {
        flex: 1,
        marginHorizontal: 4,
    },
    addToLibrary: {
        backgroundColor: 'transparent',
        borderColor: '#7D819F',
        borderWidth: 1,
        padding: 15,
        borderRadius: 10,
        width: '80%',
        marginHorizontal: 'auto',
        marginBottom: 20,
    },
    inLibRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        marginBottom: 24,
        paddingHorizontal: '5%',
    },
    removeButton: {
        flex: 1,
        height: "100%",
        backgroundColor: '#7D819F',
        paddingVertical: 12,
        borderRadius: 8,
        marginRight: 12,
    },
    removeButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
    editButton: {
        width: 48,
        height: 48,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#7d819f',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalView: {
        width: '80%',
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 15,
        shadowColor: '#000',
        shadowOpacity: 0.25,
        shadowOffset: {width: 0, height: 2},
        elevation: 5,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    dateField: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
    },
    dateFieldText: {
        fontSize: 16,
        color: '#333',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
    },
    button: {
        backgroundColor: '#7d819f',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
    },
    cancel: {
        backgroundColor: '#ccc',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});