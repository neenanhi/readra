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
import { OPENAI_API_KEY } from "@env";

const client = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

const PromptScreen = () => {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState(""); // State to store the API response
  const [isLoading, setIsLoading] = useState(false); // State for loading indicator
  const [error, setError] = useState(null); // State for errors

  const handleSave = async () => {
    setIsLoading(true); // Start loading
    setError(null); // Clear previous errors
    setResponse(""); // Clear previous response

    // test prompt
    const prompt = `Given the subject tags "${input}", can you generate me a reading personality no longer than 6 words? Start the prompt with <You are a> or <You are an> and describe the user with one key word.`;
    console.log("User input: ", input);
    console.log("Formatted Prompt:", prompt);

    try {
      // Make the API call using the generated prompt
      const completion = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "user", content: prompt }, // Pass the formatted prompt here
        ],
        // Optional parameters:
        max_tokens: 20, // Limit response length if needed (e.g., for 6 words)
        temperature: 0.7, // Adjust creativity/randomness
      });

      // Extract the response text, maks sure path to the content is correct based on the API response structure
      const result = completion.choices[0]?.message?.content?.trim();

      // log response/error in console.log
      if (result) {
        setResponse(result);
        console.log("API Response:", result);
      } else {
        throw new Error("No response content received from API.");
      }
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
        placeholder="type something king..."
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
      {/* Rewind Prompt */}
      {response ? (
        <View style={styles.responseContainer}>
          <Text>{response}</Text>
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
