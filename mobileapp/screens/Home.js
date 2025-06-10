// Home.js
import React, {useEffect, useContext, useState} from 'react';
import {View, Text, TextInput, TouchableOpacity, ScrollView, Image, StyleSheet, ActivityIndicator, Pressable, SafeAreaView, Platform, StatusBar} from 'react-native';
import {getCoverUrl, fetchBooks, fetchSimilar} from '../api/openLibrary';
import BookCard from '../components/BookCard';
import {UserContext} from '../context/UserContext';
import {supabase} from "../Supabase";
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';

import { COLORS } from '../styles/colors';
import { SPACING } from '../styles/spacing';
import { TEXT } from '../styles/typography';

const Home = ({navigation}) => {
    // function setBooks changes value of books
    // books starts as an empty array []
    // useState rerenders the UI when books/loading value updates
    const [books, setBooks] = useState([]);
    const [recent, setRecent] = useState(null);
    const [recentBook, setRecentBook] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditingQuote, setIsEditingQuote] = useState(false);
    const [quoteInput, setQuoteInput] = useState("");
    const [quoteAuthor, setQuoteAuthor] = useState("");

    const [existingQuoteId, setExistingQuoteId] = useState(null);
    const { session, displayName } = useContext(UserContext);

    const saveQuote = async () => {
      try {
        if (!session || !session.user) return;
        const userId = session.user.id;
        const payload = {
          user_id: userId,
          book_id: null,
          text: quoteInput,
          author: quoteAuthor,
          source: 'Manual',
        };

        let result;
        if (existingQuoteId) {
          result = await supabase
            .from('quotes')
            .update({
              text: quoteInput,
              author: quoteAuthor,
            })
            .eq('quote_id', existingQuoteId)
            .select('quote_id, text, author')
            .single();
        } else {
          // Insert a new row 
          result = await supabase
            .from('quotes')
            .insert(payload)
            .select('quote_id, text, author')
            .single();
        }

        if (result.error) throw result.error;
        if (!existingQuoteId && result.data?.quote_id) {
          setExistingQuoteId(result.data.quote_id);
        }

        setIsEditingQuote(false);
      } catch (err) {
        console.error('Error saving quote:', err);
      }
    };

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
                console.log(books);
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
                setRecentBook(data);
                if (error) throw error
                // console.log(data)
                // need to edit as a json instead of list
                setRecent(
                    data.map(book => ({
                      ...book,
                      author: Array.isArray(book.author)
                        ? book.author.join(", ")
                        : typeof book.author === "string" && book.author.startsWith("[")
                        ? JSON.parse(book.author).join(", ")
                        : book.author,
                    }))
                  );

            } catch (err) {
                console.error('Error fetching recent books:', err)
            }
        };
        // fetch the user's saved manual quote for the home screen
        const getSavedQuote = async () => {
          try {
            // a) if there's no logged‐in session, do nothing
            if (!session || !session.user) return;

            const userId = session.user.id;

            // b) query quotes table for a manual quote with no book_id
            const { data: existing, error: quoteError } = await supabase
              .from('quotes')
              .select('quote_id, text, author')
              .eq('user_id', userId)
              .eq('source', 'Manual')
              .is('book_id', null)
              .single();

            if (quoteError) {
              // if it's simply "no rows", supabase returns 406 (PGRST116) 
              // we only log unexpected errors
              if (quoteError.code !== 'PGRST116') {
                console.error('Error fetching saved quote:', quoteError);
              }
              return;
            }

            if (existing) {
              // populate state with the saved values
              setQuoteInput(existing.text);
              setQuoteAuthor(existing.author || '');
              setExistingQuoteId(existing.quote_id);
            }
          } catch (err) {
            console.error('Error in getSavedQuote:', err);
          }
        };

        getRecent();
        getBooks();
        getSavedQuote();
      }, [session]);


    return (
        <SafeAreaView style={styles.safe}>
        <Pressable 
            style={styles.container}
            onPress={() => {
                if (isEditingQuote) {saveQuote();}
            }}
        >
            {/* Greeting */}
            <View style={styles.greetingContainer}>
                <Text style={styles.greetingText}> Hello, {displayName}!</Text>
            </View>
            
            {/* Quote (press to edit) */}
            {isEditingQuote ? (
                <View style={styles.quoteBox}>
                <TextInput
                    style={styles.quoteInput}
                    multiline
                    placeholder="Type your favorite quote..."
                    placeholderTextColor={COLORS.textLight}
                    font
                    value={quoteInput}
                    onChangeText={setQuoteInput}
                />

                {/* Author Input */}
                <TextInput
                    style={styles.authorInput}
                    placeholder="— Author (e.g You)"
                    placeholderTextColor={COLORS.textLight}
                    value={quoteAuthor}
                    onChangeText={setQuoteAuthor}
                />

                {/* Save Button */}
                <TouchableOpacity style={styles.saveButton} onPress={saveQuote}>
                    <Text style={styles.saveButtonLabel}>Save</Text>
                </TouchableOpacity>

            </View>
            ) : (
            <TouchableOpacity onPress={() => setIsEditingQuote(true)}>
                <View style={styles.quoteBox}>
                    {quoteInput ? (
                        <>
                            <Text style={styles.quoteText}>
                                “{quoteInput}”
                            </Text>
                            <Text style={styles.quoteAuthor}>— {quoteAuthor || 'You'}</Text>
                        </>
                    ) : (
                        <>
                            <Text style={styles.quoteText}>
                                “For those who <Text style={styles.quoteEmphasis}>come after</Text>.”
                            </Text>
                            <Text style={styles.quoteAuthor}>— Gustave</Text>
                        </>
                    )}
                </View>
            </TouchableOpacity>
            )}

            {/* Find your next read section header */}
            <View style={styles.headerRow}>
                <Text style={styles.sectionTitle}>NYT Bestsellers:</Text>
            </View>

            {/* Horizontal Scroll of Book Cards */}
            <ScrollView>
                {loading ? (
                    <ActivityIndicator size="large" color={COLORS.textLight} />
                ) : (
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.scrollRow}
                    >
                        {books.map((book, index) => (
                            <BookCard key={index} book={book.topBook} navigation={navigation} detailScreenName="HomeDetail"/>
                        ))}
                    </ScrollView>
                )}
            </ScrollView>

            {/* Reading Analysis Card */}
            {recent && recent.length > 0 && (
            <TouchableOpacity
                style={styles.recentCard}
                onPress={() => navigation.navigate('Rewind')}
                >
                <Image
                    source={{ uri: recent[0].cover_image }}
                    style={styles.recentCover}
                    resizeMode="cover"
                />
                <View style={styles.recentInfo}>
                    <Text style={styles.recentTitle}>
                    {recent[0].title || 'Untitled'}
                    {/* {console.log(recent)} */}
                    </Text>
                    <Text style={styles.recentAuthor}>
                    by {recent[0].author || 'Unknown'}
                    </Text>
                    <Text style={styles.recentAction}>Analyze your reading →</Text>
                </View>
            </TouchableOpacity>
            )}

        </Pressable>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background, 
    // backgroundColor: '#F7F8FA',
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xl,
  },

  greetingContainer: {
    marginBottom: SPACING.lg,
    borderRadius: 12,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  greetingText: {
    ...TEXT.h1, // fontSize:24, fontWeight:'600', color:COLORS.primaryText, fontFamily:'georgia'
  },

  quoteBox: {
    marginBottom: SPACING.md + 4, // ~20px
    padding: SPACING.lg,         // 24px
    borderRadius: 24,
    backgroundColor: COLORS.quoteBg,
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  quoteInput: {
    ...TEXT.bodyLarge, // fontSize:18, fontStyle:'italic', color:COLORS.textDark, fontFamily:'avenir'
    textAlign: 'center',
    marginBottom: SPACING.xs,   // small gap below quote text
    fontStyle: 'italic',
  },

  authorInput: {
    ...TEXT.bodySmall, // fontSize:14, color:COLORS.textLight
    textAlign: 'center',
    paddingVertical: SPACING.xs,
  },

  saveButton: {
    marginTop: SPACING.xs,
    alignSelf: 'center',
    backgroundColor: COLORS.buttonBg,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 8,
  },

  saveButtonLabel: {
    ...TEXT.buttonLabel, // fontSize:14, fontWeight:'600', color:COLORS.white
  },

  quoteText: {
    fontSize: 18,
    fontStyle: 'italic',
    color: COLORS.textDark,
    textAlign: 'center',
  },
  quoteEmphasis: {
    fontSize: 18,       // ensure the nested text is the same size
    fontStyle: 'italic',
    fontWeight: 'bold',
    color: COLORS.textDark,
  },
  quoteAuthor: {
    marginTop: SPACING.xs,
    ...TEXT.bodySmall,
    textAlign: 'center',
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TEXT.sectionTitle, // fontSize:18, fontWeight:'600', color:COLORS.textDark, 
  },

  scrollRow: {
    marginBottom: SPACING.md,
  },

  recentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.quoteBg,
    padding: 12,
    borderRadius: 16,
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  recentCover: {
    width: 80,
    height: 120,
    borderRadius: 8,
    backgroundColor: COLORS.placeholderBg,
    marginRight: SPACING.md,
  },
  recentInfo: {
    flex: 1,
  },
  recentTitle: {
    ...TEXT.cardTitle, // fontSize:16, fontWeight:'bold', color:COLORS.textDark, fontFamily:'avenir'
    marginBottom: SPACING.xs,
  },
  recentAuthor: {
    ...TEXT.cardSubtitle, // fontSize:14, fontStyle:'italic', color:COLORS.mutedText
    marginBottom: SPACING.sm,
  },
  recentAction: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.accent,
    fontFamily: 'serif',
  },
});

export default Home;