import BookCard from "../components/BookCard";
import axios from "axios";
import {ActivityIndicator, Button, TouchableOpacity, Image, SafeAreaView, StyleSheet, Text, View} from "react-native";
import React, {useEffect, useState} from "react";
import {getCoverUrl} from "../api/openLibrary";

async function getBookData(isbn) {
    const response = await axios({
        method: 'get',
        url: `https://openlibrary.org/search.json?q=${isbn}`
    });
    console.log(response.data["docs"][0])
    return response.data["docs"][0];
}

export default function BookDetail({isbn}) {

    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let mounted = true;
        setLoading(true);
        getBookData(isbn)
            .then(data => {
                if (!mounted) return;
                if (data) {
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
            <View style={styles.topRow}>
                <View style={styles.infoColumn}>
                    <Text style={styles.title}>{book.title}</Text>
                    <Text style={styles.author}>
                        by {book.author_name?.[0] || "Unknown"}
                    </Text>
                </View>
                <Image
                    source={{ uri: getCoverUrl(book.cover_i) }}
                    style={styles.cover}
                    resizeMode="cover"
                />
            </View>

            <Text style={styles.description}>
                {book.description
                    ? book.description.slice(0, 150) + "…"
                    : "No description available."}
            </Text>

            <View style={{ width: '100%' }}>
                <TouchableOpacity style={styles.addToLibrary} onPress={() => console.log("Tapped!")}>
                    <Text style={{ color:'#7D819F', textAlign: 'center' }}>Add to Library</Text>
                </TouchableOpacity>
                {/* <View style={styles.buttonWrapper}>
                    <Button
                        title="Remove"
                        onPress={() => console.log("Remove tapped")}
                        color="#d9534f"
                    />
                </View>
                <View style={styles.buttonWrapper}>
                    <Button
                        title="Edit"
                        onPress={() => console.log("Edit tapped")}
                        color="#5bc0de"
                    />
                </View> */}
            </View>
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
        width: "70%",
        aspectRatio: 2/3,
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
        marginTop: 50,
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
    removeFromLibrary: {
        backgroundColor: '#7D819F',
        borderWidth: 1,
        padding: 15,
        borderRadius: 10,
        width: '80%',
        marginHorizontal: 'auto',
        marginBottom: 20,
    }
});