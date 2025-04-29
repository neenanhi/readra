import BookCard from "../components/BookCard";
import axios from "axios";
import {ActivityIndicator, Button, Image, SafeAreaView, StyleSheet, Text, View} from "react-native";
import React, {useEffect, useState} from "react";
import {getCoverUrl} from "../api/openLibrary";

async function getBookData(isbn) {
    const response = await axios({
        method: 'get',
        url: `https://openlibrary.org/search.json?q=${isbn}`
    });

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
                <Image
                    source={{ uri: getCoverUrl(book.cover_i) }}
                    style={styles.cover}
                    resizeMode="cover"
                />

                <View style={styles.infoColumn}>
                    <Text style={styles.title}>{book.title}</Text>
                    <Text style={styles.author}>
                        by {book.author_name?.[0] || "Unknown"}
                    </Text>
                </View>
            </View>

            <Text style={styles.description}>
                {book.description
                    ? book.description.slice(0, 150) + "…"
                    : "No description available."}
            </Text>

            <View style={styles.buttonRow}>
                <View style={styles.buttonWrapper}>
                    <Button
                        title="Add to Library"
                        onPress={() => console.log("Add tapped")}
                    />
                </View>
                <View style={styles.buttonWrapper}>
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
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        padding: 24,
        margin: 12,
        borderRadius: 25,
    },
    topRow: {
        flexDirection: "row",
        marginBottom: 24,
    },
    cover: {
        width: "45%",
        aspectRatio: 0.7,
        borderRadius: 8,
        backgroundColor: "#d2d3e0",
        marginTop: 8,
        marginLeft: 8
    },
    infoColumn: {
        flex: 1,
        paddingLeft: 16,
        justifyContent: "center",
    },
    title: {
        fontSize: 24,
        fontWeight: "700",
        color: "#333",
        marginBottom: 8,
    },
    author: {
        fontSize: 16,
        fontWeight: "500",
        color: "#666",
    },
    description: {
        fontSize: 14,
        color: "#444",
        lineHeight: 20,
        marginBottom: 24,
        marginLeft: 8
    },
    buttonRow: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    buttonWrapper: {
        flex: 1,
        marginHorizontal: 4,
    },
});