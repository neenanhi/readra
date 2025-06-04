import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, Pressable, Animated } from "react-native";
import Rewind1 from "./Rewind/Rewind1";
import Rewind2 from "./Rewind/Rewind2";
import Rewind3 from "./Rewind/Rewind3";
import axios from "axios";
import { supabase, isbndbGetHeaders } from "../Supabase";
const stories = [Rewind1, Rewind2, Rewind3];
const AUTO_ADVANCE_MS = 15000;

/**
 * I totally stole this from my hw from another class LOL
 * Fetches and counts subjects from books read by a specific user.
 * @param {string} userId - UUID of the user.
 * @returns {Promise<Object>} A dictionary of subjects and their counts.
 */
export async function getUserSubject(userId) {
  // Pulling data from supabase
  const { data, error } = await supabase
    .from("book")
    .select("genre, isbn")
    .eq("user", userId);

  if (error) {
    console.error("Error fetching user books:", error);
    return {};
  }

  const subjectCountsSB = {};
  const subjectCountsISBN = {};

  for (const book of data) {
    // normalize all names to lowercase so no duplicate entries
    const genre = book.genre?.toLowerCase().trim();
    // simple genre count for supabase entries
    if (genre) {
      subjectCountsSB[genre] = (subjectCountsSB[genre] || 0) + 1;
    }

    // Count subjects from ISBNdb
    const isbn = book.isbn?.trim();
    if (isbn) {
      try {
        const response = await axios.get(
          `https://api2.isbndb.com/book/${isbn}`,
          {
            headers: isbndbGetHeaders,
          }
        );

        const subjects = response.data.book?.subjects;
        if (Array.isArray(subjects)) {
          for (const subject of subjects) {
            const normalized = subject.toLowerCase().trim();
            subjectCountsISBN[normalized] =
              (subjectCountsISBN[normalized] || 0) + 1;
          }
        }
      } catch (err) {
        console.warn(
          `ISBNdb lookup failed for ISBN ${isbn}:`,
          err.response?.data || err.message
        );
      }
    }
  }

  return { subjectCountsSB, subjectCountsISBN };
}

export function Rewind() {
  const [current, setCurrent] = useState(0);
  const progressAnims = useRef(
    stories.map(() => new Animated.Value(0))
  ).current;
  const timeoutRef = useRef(null);
  // console.log()
  const animateCurrent = (index) => {
    progressAnims[index].setValue(0);
    Animated.timing(progressAnims[index], {
      toValue: 1,
      duration: AUTO_ADVANCE_MS,
      useNativeDriver: false,
    }).start();
  };

  const nextStory = () => {
    if (current < stories.length - 1) {
      progressAnims[current].setValue(1);
      setCurrent((prev) => prev + 1);
    }
  };

  const prevStory = () => {
    if (current > 0) {
      progressAnims[current].setValue(0);
      setCurrent((prev) => prev - 1);
    }
  };

  useEffect(() => {
    for (let i = 0; i < stories.length; i++) {
      if (i < current) progressAnims[i].setValue(1);
      else if (i > current) progressAnims[i].setValue(0);
    }
    animateCurrent(current);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (current < stories.length - 1) {
      timeoutRef.current = setTimeout(() => {
        nextStory();
      }, AUTO_ADVANCE_MS);
    }

    return () => clearTimeout(timeoutRef.current);
  }, [current]);

  const StoryComponent = stories[current];

  return (
    <View style={styles.container}>
      <View style={styles.progressBar}>
        {stories.map((_, idx) => (
          <View key={idx} style={styles.progressDotBackground}>
            <Animated.View
              style={[
                styles.progressDotActive,
                {
                  width: progressAnims[idx].interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0%", "100%"],
                  }),
                  backgroundColor:
                    idx < current ? "#fff" : idx === current ? "#fff" : "#444",
                  opacity: idx === current ? 1 : idx < current ? 0.7 : 0.35,
                },
              ]}
            />
          </View>
        ))}
      </View>

      <View style={styles.storyContainer}>
        {stories.map((StoryComponent, idx) => (
            <View
                key={idx}
                style={[
                  styles.storyContainer,
                  {
                    opacity: idx === current ? 1 : 0,
                    pointerEvents: idx === current ? "auto" : "none",
                  },
                ]}
            >
              <StoryComponent />
            </View>
        ))}
      </View>

      <Pressable style={styles.leftZone} onPress={prevStory} />
      <Pressable style={styles.rightZone} onPress={nextStory} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  storyContainer: {
    width: "100%",
    height: "100%",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  leftZone: {
    position: "absolute",
    left: 0,
    top: 0,
    width: "35%",
    height: "100%",
    zIndex: 2,
  },
  rightZone: {
    position: "absolute",
    right: 0,
    top: 0,
    width: "35%",
    height: "100%",
    zIndex: 2,
  },
  progressBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 16,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingTop: 8,
    zIndex: 10,
  },
  progressDotBackground: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#444",
    marginHorizontal: 2,
    marginTop: "30%",
    overflow: "hidden",
  },
  progressDotActive: {
    height: 4,
    borderRadius: 2,
    backgroundColor: "#fff",
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
  },
});
