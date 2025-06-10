import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import OpenAI from "openai";
import { OPENAI_API_KEY } from "@.env";
import { COLORS } from "../../styles/colors";
import readingPersonalityData from "../../data/readingPersonality.json";
import { supabase } from "../../Supabase";
import { getUserSubject } from "../RewindManager";

const client = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

const RewindScreen1 = () => {
  const [subjectTags, setSubjectTags] = useState(""); // subject tags from books
  // what chatgpt will return (index representing which reading personality is best)
  const [personalityIndex, setPersonalityIndex] = useState(null);
  const [personality, setPersonality] = useState("");
  const [description, setDescription] = useState("");

  const [isLoadingPersonality, setIsLoadingPersonality] = useState(false); // Loading for OpenAI call
  const [isFetchingSubjects, setIsFetchingSubjects] = useState(true); // Loading for subject fetching
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);

  // Function to call OpenAI API and determine personality
  const generatePersonality = async (tags) => {
    if (
      !tags ||
      tags.includes("No subjects found") ||
      tags.includes("Error fetching subjects")
    ) {
      setError("Cannot generate personality without valid subject tags.");
      setIsLoadingPersonality(false);
      return;
    }

    setIsLoadingPersonality(true);
    setError(null);
    setPersonalityIndex(null);
    setPersonality("");
    setDescription("");

    const prompt = `Given the subject tags: "${tags}". From the following list of reading personalities, identify the best matching personality and return only its index (0-based):
${readingPersonalityData
  .map((item, index) => `${index}: ${item.personality}`)
  .join("\n")}
Respond with only the index of the most relevant reading personality.`;

    console.log("Formatted Prompt for OpenAI:", prompt);

    try {
      const completion = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 5,
      });

      const selectedIndexStr = completion.choices[0]?.message?.content?.trim();
      const selectedIndex = parseInt(selectedIndexStr, 10);

      if (
        !isNaN(selectedIndex) &&
        selectedIndex >= 0 &&
        selectedIndex < readingPersonalityData.length
      ) {
        setPersonalityIndex(selectedIndex);
        console.log("Selected Index from OpenAI:", selectedIndex);

        const selectedPersonality =
          readingPersonalityData[selectedIndex].personality;
        setPersonality(selectedPersonality);

        const personalityDescription =
          readingPersonalityData[selectedIndex].description;
        setDescription(personalityDescription);
      } else {
        throw new Error(
          "Invalid Index received from AI. Response: " + selectedIndexStr
        );
      }
    } catch (apiError) {
      console.error("Error calling OpenAI API:", apiError);
      setError(apiError.message || "Failed to get personality from AI.");
      setPersonalityIndex(null);
    } finally {
      setIsLoadingPersonality(false);
    }
  };

  // Effect to get user ID and fetch subjects, then trigger personality generation
  useEffect(() => {
    const fetchAndGenerate = async () => {
      setIsFetchingSubjects(true);
      setError(null);

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.error("Error getting session:", sessionError);
        setError("Failed to get user session.");
        setIsFetchingSubjects(false);
        return;
      }

      if (session?.user?.id) {
        const currentUserId = session.user.id;
        setUserId(currentUserId);

        try {
          const { subjectCountsSB, subjectCountsISBN } = await getUserSubject(
            currentUserId
          );

          const allSubjects = { ...subjectCountsSB, ...subjectCountsISBN };
          const formattedSubjects = Object.entries(allSubjects)
            .map(([subject, count]) => `${subject} (${count})`)
            .join(", ");

          if (formattedSubjects) {
            setSubjectTags(formattedSubjects); // Set the subjectTags state
            // Now that subjects are fetched, generate personality
            await generatePersonality(formattedSubjects);
          } else {
            setSubjectTags("No subjects found for this user.");
            setError("No reading subjects found to generate a personality.");
          }
        } catch (fetchError) {
          console.error("Error fetching user subjects:", fetchError);
          setError(fetchError.message || "Failed to fetch reading subjects.");
          setSubjectTags("Error fetching subjects.");
        } finally {
          setIsFetchingSubjects(false);
        }
      } else {
        setError("User not logged in or session not found.");
        setIsFetchingSubjects(false);
        setSubjectTags("Please log in to see your subjects.");
      }
    };

    fetchAndGenerate();
  }, []); // Empty dependency array means this runs once on mount

  return (
    <View contentContainerStyle={styles.container}>
      {/* Show loading indicator if either subjects are fetching or personality is generating */}
      {(isFetchingSubjects || isLoadingPersonality) && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4169E1" />
          <Text style={styles.loadingText}>
            Loading your reading personality...
          </Text>
        </View>
      )}
      {/* Display error messages */}
      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Display personality and description only when available and no errors */}
      {personality &&
      description &&
      !error &&
      !(isFetchingSubjects || isLoadingPersonality) ? (
        <View style={styles.responseContainer}>
          {/* <Text style={styles.sectionTitle}>Reading Personality:</Text> */}
          <Text style={styles.personalityText}>{personality}</Text>
          <Text style={styles.descriptionText}>{description}</Text>

          {/* display fetched subjects (for debugging) */}
          <Text style={styles.debugTitle}>Fetched Subjects:</Text>
          <Text style={styles.debugText}>{subjectTags}</Text>
        </View>
      ) : null}

      {/* error if no personality generated */}
      {!personality &&
        !error &&
        !(isFetchingSubjects || isLoadingPersonality) && (
          <Text style={styles.hintText}>
            No personality generated. This might happen if there are no subjects
            found or an issue occurred.
          </Text>
        )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },

  loadingContainer: {
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#555",
  },

  errorText: {
    color: "red",
    marginTop: 20,
    textAlign: "center",
    fontSize: 16,
    paddingHorizontal: 15,
  },
  responseContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 32, // Increase for more padding, decrease for less
    alignItems: "center",
    width: "90%",

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  personalityText: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#007bff",
    marginBottom: 10,
    textAlign: "center",
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#666",
    textAlign: "center",
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 5,
    color: "#888",
    textAlign: "center",
  },
  debugText: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
  },
  hintText: {
    marginTop: 30,
    fontSize: 16,
    color: "#777",
    textAlign: "center",
    fontStyle: "italic",
  },
});

export default RewindScreen1;
