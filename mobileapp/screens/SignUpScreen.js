import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import { supabase } from "../Supabase";
import { AuthScreenStyles } from "../styles/AuthScreenStyles";

export default function SignUpScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Check your email to confirm your account.");
    }
  };

  return (
    <View style={AuthScreenStyles.container}>
      <Image
        source={require("../assets/images/readra_logo_border.png")}
        style={AuthScreenStyles.logo}
      />
      <Text style={AuthScreenStyles.title}>READRA</Text>
      <TextInput
        style={AuthScreenStyles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <TextInput
        style={AuthScreenStyles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TextInput
        style={AuthScreenStyles.input}
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />
      <TouchableOpacity style={AuthScreenStyles.button} onPress={handleSignUp}>
        <Text style={AuthScreenStyles.buttonText}>Register</Text>
      </TouchableOpacity>
      <Text style={AuthScreenStyles.link}>
        Already have an account?{" "}
        <Text
          style={AuthScreenStyles.linkBold}
          onPress={() => navigation.navigate("SignIn")}
        >
          Sign in
        </Text>
      </Text>
      {message ? <Text style={AuthScreenStyles.message}>{message}</Text> : null}
    </View>
  );
}
