import BookCard from "../components/BookCard";
import axios from "axios";
import {ActivityIndicator, Button, View} from "react-native";
import {useEffect, useState} from "react";

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
    var num = 9781250159014;

    useEffect(() => {
        let mounted = true;
        setLoading(true);
        getBookData(num)
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
        return () => { mounted = false };
    }, [num]);


    if (loading) {
        return <ActivityIndicator />;
    }
    if (error) {
        return <Text>Error loading book: {error.message}</Text>;
    }
    // at this point `book` is guaranteed to be non-null
    return (
        <View>
            <BookCard book={book} />
        </View>
    );
}