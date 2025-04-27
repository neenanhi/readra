// Home.js
import React, {useEffect, useContext, useState} from 'react';
import {View, Text, TextInput, TouchableOpacity, ScrollView, Image, StyleSheet, ActivityIndicator, Pressable, SafeAreaView, Platform, StatusBar} from 'react-native';
import {getCoverUrl, fetchBooks} from '../api/openLibrary';
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
    //     getBooks();
    //     getRecent();
    // }, []);

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

        getBooks();
        getRecent();
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
            