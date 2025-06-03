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

export default function SignInScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSignIn = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Signed in successfully!");
      // You can now navigate to your home screen or fetch user data
    }
  };

  return (
    <View style={AuthScreenStyles.container}>
      {/* title */}
      <Image
        source={require("../assets/images/readra_logo_border.png")}
        style={AuthScreenStyles.logo}
      />
      <Text style={AuthScreenStyles.title}>READRA</Text>

      {/* header for login screen */}
      {/* <Text style={AuthScreenStyles.header}>Login to your account</Text>*/}

      {/* email & password */}
      <TextInput
        style={AuthScreenStyles.input}
        placeholder="Email"
        placeholderTextColor="#000"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <TextInput
        style={AuthScreenStyles.input}
        placeholder="Password"
        placeholderTextColor="#000"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {/* login button */}
      <TouchableOpacity style={AuthScreenStyles.button} onPress={handleSignIn}>
        <Text style={AuthScreenStyles.buttonText}>Log in</Text>
      </TouchableOpacity>

      {/* text with link to sign up screen */}
      <Text style={AuthScreenStyles.link}>
        Don’t have an account?{" "}
        <Text
          style={AuthScreenStyles.linkBold}
          onPress={() => navigation.navigate("SignUp")}
        >
          Sign up
        </Text>
      </Text>

      {/* error message from supabase */}
      {message ? <Text style={AuthScreenStyles.message}>{message}</Text> : null}
    </View>
  );
}
