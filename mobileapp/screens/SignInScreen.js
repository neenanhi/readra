import * as AuthSession from "expo-auth-session";
import React, {useEffect, useState} from "react";
import {
    View,
    TextInput,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image, Linking,
} from "react-native";
import {supabase} from "../Supabase";
import {AuthScreenStyles} from "../styles/AuthScreenStyles";
import linking from "react-native-web/src/exports/Linking";


export default function SignInScreen({navigation}) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    const handleSignIn = async () => {
        const {error} = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setMessage(error.message);
        } else {
            setMessage("Signed in successfully!");
        }
    };

    const handleGoogleSignIn = async () => {
        const redirectUri = AuthSession.makeRedirectUri({
            scheme: "readra",
            path: "/oauthredirect",
            useProxy: false,
        });
        const {data, error} = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {redirectTo: redirectUri},
        });
        if (error) {
            console.log("supabase.signInWithOAuth error:", error.message);
            return;
        }

        console.log("→ supabase returned data.url:", data?.url);
        const result = await Linking.openURL(data.url);
        console.log("openAuthSessionAsync result:", result);
    }

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

            <TouchableOpacity style={AuthScreenStyles.button} onPress={handleGoogleSignIn}>
                <Text style={AuthScreenStyles.buttonText}>Login With Google</Text>
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
