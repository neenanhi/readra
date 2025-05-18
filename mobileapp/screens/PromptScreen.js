import React, { use, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Button,
  ScrollView,
} from "react-native";
import OpenAI from "openai";
let OPENAI_API_KEY = "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";
import readingPersonalityData from "../data/readingPersonality.json";

const client = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

const PromptScreen = () => {
  const [input, setInput] = useState("");

  const [response, setResponse] = useState(""); // chatgpt response (should be a number repsenting index)
  const [personality, setPersonality] = useState(""); // personality from json file
  const [description, setDescription] = useState(""); // description frm json file

  const [isLoading, setIsLoading] = useState(false); // State for loading indicator (keep track of when openai start/stops generating)
  const [error, setError] = useState(null); // State for errors

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);
    setResponse("");
    setPersonality("");
    setDescription("");

    // test prompt
    // need to change input with subject tags in library
    const prompt = `Given the subject tags: "${input}". From the following list of reading personalities, identify the best matching personality and return only its index (0-based):
${readingPersonalityData
  .map((item, index) => `${index}: ${item.personality}`)
  .join("\n")}
Respond with only the index of the most relevant reading personality.`;

    console.log("User input: ", input);
    console.log("Formatted Prompt:", prompt);

    try {
      // Make the API call using the generated prompt
      const completion = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 5, // expecting a number (index) for reading personality
        //temperature: 0.7, // Adjust creativity/randomness
      });

      // Extract the response text, maks sure path to the content is correct based on the API response structure
      const selectedIndexStr = completion.choices[0]?.message?.content?.trim();
      const selectedIndex = parseInt(selectedIndexStr, 10);

      // log response or error in console.log
      if (
        !isNaN(selectedIndex) &&
        selectedIndex >= 0 &&
        selectedIndex < readingPersonalityData.length
      ) {
        setResponse(selectedIndex);
        console.log("Selected Index:", selectedIndex);

        // set personality
        const selectedPersonality =
          readingPersonalityData[selectedIndex].personality;
        setPersonality(selectedPersonality);

        // set description
        const personalityDescription =
          readingPersonalityData[selectedIndex].description;
        setDescription(personalityDescription);
      } else {
        throw new Error("Invalid Index received from API.");
      }

      // error handling
    } catch (error) {
      console.error("Error calling OpenAI API:", error);
      setError(error.message || "Failed to get response from AI."); // Store the error message
      setResponse(""); // Clear any previous response on error
    } finally {
      setIsLoading(false); // Stop loading indicator
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Subject tags:</Text>
      <TextInput
        style={styles.input}
        value={input}
        onChangeText={setInput}
        placeholder="tags should be pulled from library"
        autoCapitalize="none"
      />
      <Button
        title="Generate Prompt"
        onPress={handleSave}
        disabled={isLoading}
      />
      {error && (
        <Text style={{ color: "red", marginTop: 8, textAlign: "center" }}>
          {error}
        </Text>
      )}
      {/* reading personality and description */}
      {response ? (
        <View style={styles.responseContainer}>
          <Text style={styles.resultText}>{personality}</Text>
          <Text style={styles.resultText}>{description}</Text>
        </View>
      ) : null}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f0f0f0",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: "#fff",
    fontSize: 16,
  },
});

export default PromptScreen;
