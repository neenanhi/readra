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
