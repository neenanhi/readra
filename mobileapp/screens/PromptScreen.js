import React, { use, useState } from "react";
import { View, Text, StyleSheet, TextInput, Button } from "react-native";
import { format } from "url";

const PromptScreen = () => {
  const [input, setInput] = useState("");
  const [formattedPrompt, setFormattedPrompt] = useState("");

  const handleSave = () => {
    const prompt = `Given the subject tags "${input}", can you generate me a reading personality no longer than 6 words? Start the prompt with <You are a> or <You are an> and describe the user with one key word.`;
    setFormattedPrompt(prompt);

    console.log("User input:\n", input);
    console.log("Formatted Prompt:\n", prompt);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter subject tags:</Text>
      <TextInput
        style={styles.input}
        value={input}
        onChangeText={setInput}
        placeholder="type something king..."
      />
      <Button title="Generate Prompt" onPress={handleSave} />
      {formattedPrompt ? (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Generated Prompt:</Text>
          <Text style={styles.resultText}>{formattedPrompt}</Text>
        </View>
      ) : null}
    </View>
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
