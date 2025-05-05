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
import {supabase} from "../Supabase";
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import DateTimePickerModal from 'react-native-modal-datetime-picker';


async function getBookData(isbn) {
    const response = await axios({
        method: 'get',
        url: `https://openlibrary.org/search.json?q=${isbn}`
    });
    return response.data["docs"][0];
}

async function getPages(isbn) {
    const response = await axios({
        method: 'get',
        url: `https://openlibrary.org/isbn/${isbn}.json`
    });
    return response.data["number_of_pages"];
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

    useEffect(() => {
        let mounted = true;
        setLoading(true);
        supabase
            .from('book')
            .select("*")
            .eq("isbn", isbn).then(d => {
            setUserBook(d.data[0]);
        });
        getPages(isbn).then(data => {
            setPages(data);
        });
        getBookData(isbn)
            .then(data => {
                if (!mounted) return;
                if (data) {
                    data["isbn"] = isbn;
                    data["cover_image"] = `https://covers.openlibrary.org/b/id/${data.cover_i}-M.jpg`
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
            mounted = false
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

    console.log(userBook);

    if (loading) {
        return (
            <ActivityIndicator/>
        );
    }
    if (error) {
        return <Text>Error loading book: {error.message}</Text>;
    }

    return (
        <SafeAreaView style={styles.container}>
            {/*<ScrollView contentContainerStyle={styles.scrollContent}>*/}
            <View style={styles.topRow}>
                <View style={styles.infoColumn}>
                    <Text style={styles.title}>{book.title} ({pages} pages)</Text>
                    <Text style={styles.author}>
                        by {book.author_name?.[0] || "Unknown"}
                    </Text>
                </View>
                <Image
                    source={{uri: getCoverUrl(book.cover_i)}}
                    style={styles.cover}
                    resizeMode="cover"
                />
            </View>

            <Text style={styles.description}>
                {book.description
                    ? book.description.slice(0, 150) + "…"
                    : "No description available."}
            </Text>

            <View style={{width: '100%'}}>
                {userBook === undefined ?
                    <TouchableOpacity style={styles.addToLibrary} onPress={() => addBook()}>
                        <Text style={{color: '#7D819F', textAlign: 'center'}}>Add to Library</Text>
                    </TouchableOpacity> :
                    <View style={styles.inLibRow}>
                        <TouchableOpacity style={styles.removeButton} onPress={removeBook}>
                            <Text style={styles.removeButtonText}>Remove from Library</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.editButton} onPress={() => setModalVisible(true)}>
                            <FontAwesome5 name="edit" size={20} color="#7d819f"/>
                        </TouchableOpacity>
                    </View>}
            </View>

            <Modal transparent visible={modalVisible} animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalTitle}>Edit Dates</Text>

                        <Pressable onPress={() => {
                            setShowStartPicker(true);
                            console.log("pressed")
                        }} style={styles.dateField}>
                            <Text style={styles.dateFieldText}>Start: {startDate.toLocaleDateString()}</Text>
                        </Pressable>
                        <DateTimePickerModal
                            isVisible={showStartPicker}
                            mode="date"
                            onConfirm={date => {
                                setStartDate(date);
                                setShowStartPicker(false);
                            }}
                            onCancel={() => setShowStartPicker(false)}
                            headerTextIOS="Select start date"
                        />

                        <Pressable onPress={() => setShowEndPicker(true)} style={styles.dateField}>
                            <Text style={styles.dateFieldText}>Finish: {endDate.toLocaleDateString()}</Text>
                        </Pressable>
                        <DateTimePickerModal
                            isVisible={showEndPicker}
                            mode="date"
                            onConfirm={date => {
                                setEndDate(date);
                                setShowEndPicker(false);
                            }}
                            onCancel={() => setShowEndPicker(false)}
                            headerTextIOS="Select finish date"
                        />


                        <View style={styles.modalButtons}>
                            <Pressable style={styles.button} onPress={() => {
                                setModalVisible(false);
                            }}>
                                <Text style={styles.buttonText}>Save</Text>
                            </Pressable>
                            <Pressable style={[styles.button, styles.cancel]} onPress={() => setModalVisible(false)}>
                                <Text style={styles.buttonText}>Cancel</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        height: '100vh',
        alignItems: 'center',
        backgroundColor: "#fff",
        paddingHorizontal: '20%',
        margin: 12,
        borderRadius: 25,
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
        fontSize: 30,
        fontWeight: "bold",
        color: "#7d819f",
        marginBottom: 20,
        textAlign: "center",
        letterSpacing: 2,
        marginTop: 25,
        marginHorizontal: 'auto',
    },
    author: {
        fontSize: 21,
        marginBottom: 20,
        color: "#666",
        marginHorizontal: 'auto',
        textAlign: 'center',
    },
    description: {
        fontSize: 14,
        color: "#444",
        lineHeight: 20,
        marginBottom: 24,
        marginLeft: 8
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