import React, {useEffect, useContext, useState} from 'react';
import {View, Text, TouchableOpacity, ScrollView, Image, StyleSheet, ActivityIndicator} from 'react-native';
import {getCoverUrl, fetchBooks} from '../api/openLibrary';
import BookCard from '../components/BookCard';
import {UserContext} from '../context/UserContext';
import {supabase} from "../Supabase";
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';

const Home = ({navigation}) => {
    // function setBooks changes value of books
    // books starts as an empty array []
    // useState rerenders the UI when books/loading value updates
    const [books, setBooks] = useState([]);
    const [recent, setRecent] = useState(null);
    const [loading, setLoading] = useState(true);
    const {displayName} = useContext(UserContext); // get session from UserContext

    // =====================
    // Book Fetching
    // useEffect runs when Home first appears on screen
    // async function fetchBooks fetches data from the OpenLib API
    // async to use await, pausing until data is fetched
    // =====================
    useEffect(() => {
        const getBooks = async () => {
            try {
                const books = await fetchBooks();
                // rerender Home with fetched books
                setBooks(books);
            } catch (err) {
                console.error('Error fetching books:', err);
            } finally {
                // stop loading spinner once books are fetched
                setLoading(false);
            }
        }
        const getRecent = async () => {
            try {
                const {data, error} = await supabase
                    .from('book')
                    .select('*')
                    .order('created_at', {ascending: false})
                    .limit(1)
                if (error) throw error
                setRecent(data)
            } catch (err) {
                console.error('Error fetching recent books:', err)
            }
        }
        getBooks();
        getRecent();
    }, []);


    return (
        <View style={styles.container}>
            <Text style={styles.greetingText}> Hi, {displayName}</Text>
            {/* Quote of the Day */}
            <View style={styles.quoteBox}>
                <Text style={styles.quoteText}>
                    “For those who <Text style={styles.quoteEmphasis}>come after</Text>.”
                </Text>
                <Text style={styles.quoteAuthor}>— Gustave</Text>
            </View>

            {/* Find your next read section header */}
            <View style={styles.headerRow}>
                <Text style={styles.sectionTitle}>Trending now:</Text>
            </View>

            {/* Horizontal Scroll of Book Cards */}
            {loading ? (
                <ActivityIndicator size="large" color="#999" style={{marginVertical: 0}}/>
            ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollRow}>
                    {books.map((book, index) => (
                        <BookCard key={index} book={book} navigation={navigation}/>
                    ))}
                </ScrollView>
            )}

            {/* Reading Analysis Card */}

            {recent && recent.length > 0 && (
                <TouchableOpacity
                    style={styles.recentCard}
                    onPress={() => navigation.navigate('Rewind')}
                >
                    <Image
                        source={{uri: recent[0].cover_image}}
                        style={styles.recentCover}
                        resizeMode="cover"
                    />
                    <View style={styles.recentInfo}>
                        <Text style={styles.recentTitle}>
                            {recent[0].title || 'Untitled'}
                        </Text>
                        <Text style={styles.recentAuthor}>
                            by {recent[0].author_name?.[0] || 'Unknown'}
                        </Text>
                        <Text style={styles.recentAction}>
                            Analyze your reading →
                        </Text>
                    </View>
                </TouchableOpacity>
            )}

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fdfaf6',
        paddingHorizontal: 16,
        paddingVertical: 24,
    },
    quoteBox: {
        marginBottom: 32,
        padding: 24,
        borderRadius: 24,
        backgroundColor: '#e9e6f0',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    quoteText: {
        fontSize: 18,
        fontStyle: 'italic',
        color: '#2e2e42',
        textAlign: 'center',
    },
    quoteEmphasis: {
        fontWeight: 'bold',
    },
    quoteAuthor: {
        marginTop: 8,
        fontSize: 14,
        color: '#7a7a90',
        textAlign: 'center',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        marginBottom: 8,
        color: '#2e2e42',
        fontFamily: 'serif',
    },
    arrow: {
        fontSize: 20,
        color: '#2e2e42',
    },
    scrollRow: {
        marginBottom: 16,
    },
    bookCard: {
        width: 160,
        marginRight: 16,
    },
    bookCover: {
        height: 192,
        width: '100%',
        borderRadius: 12,
        marginBottom: 8,
        backgroundColor: '#d2d3e0',
    },
    bookTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        fontFamily: 'serif',
        color: '#2e2e42',
    },
    bookAuthor: {
        fontStyle: 'italic',
        fontSize: 12,
        color: '#55556d',
        marginBottom: 4,
    },
    bookDescription: {
        fontSize: 12,
        color: '#6e6e84',
    },
    rating: {
        marginTop: 4,
        fontSize: 14,
    },
    analysisCard: {
        padding: 24,
        borderRadius: 24,
        backgroundColor: '#e6e9f2',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        flexDirection: 'row',
        alignItems: 'center',
    },
    analysisCover: {
        height: 80,
        width: 56,
        backgroundColor: '#a5a7c7',
        borderRadius: 8,
        marginRight: 16,
    },
    analysisText: {
        fontSize: 18,
        fontFamily: 'serif',
        color: '#2e2e42',
    },
    recentCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
        marginBottom: 64,
        // shadow for iOS
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        // elevation for Android
        elevation: 2,
    },
    recentCover: {
        width: 80,
        height: 120,
        borderRadius: 8,
        backgroundColor: '#d2d3e0',
        marginRight: 16,
    },
    recentInfo: {
        flex: 1,
    },
    recentTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2e2e42',
        marginBottom: 4,
    },
    recentAuthor: {
        fontSize: 14,
        fontStyle: 'italic',
        color: '#55556d',
        marginBottom: 8,
    },
    recentAction: {
        fontSize: 14,
        fontWeight: '600',
        color: '#3b82f6',  // a nice accent color
    },
});

export default Home;