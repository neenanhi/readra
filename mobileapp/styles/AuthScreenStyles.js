import { StyleSheet } from "react-native";

export const AuthScreenStyles = StyleSheet.create({
  // entire screen
  container: {
    flex: 1,
    paddingTop: 50,
    paddingLeft: 24,
    paddingRight: 24,
    justifyContent: "flex-start",
    backgroundColor: "#f9f9f9",
  },

  // logo + title
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#7d819f",
    marginBottom: 40,
    textAlign: "center",
    letterSpacing: 5,
  },
  logo: {
    width: 100,
    height: 100,
    alignSelf: "center",
    marginBottom: 10,
    resizeMode: "contain",
  },

  // email and password
  input: {
    height: 50,
    borderRadius: 10,
    paddingHorizontal: 16,
    backgroundColor: "#e6e6e6",
    marginBottom: 16,
    fontSize: 16,
  },

  // login & sign up button
  button: {
    backgroundColor: "#7d819f",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  buttonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
  },

  // link to switch from log in to sign up pages
  link: {
    marginTop: 24,
    textAlign: "center",
    color: "#555",
  },
  linkBold: {
    color: "#007bff",
    fontWeight: "600",
  },

  // error message from supabase
  message: {
    textAlign: "center",
    color: "red",
    marginTop: 12,
  },
});
