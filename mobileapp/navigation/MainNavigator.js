// Library Imports
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text, StyleSheet, Image, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Component Imports
import Bookshelf from "../screens/Bookshelf";
import Home from "../screens/Home";
import BookDetail from "../screens/BookDetail";
import PromptScreen from "../screens/PromptScreen";
import Rewind1 from "../screens/Rewind/Rewind1";
import {Rewind} from "../screens/RewindManager";
import HomeStack from "./HomeStack";
import Profile from "../screens/Profile";
import TestSliderScreen from "../screens/TestSliderScreen";


const Tab = createBottomTabNavigator();

function Placeholder({ label }) {
  return (
    <Text style={{ paddingTop: 100, textAlign: "center" }}>
      {label} screen coming soon
    </Text>
  );
}
const Stack = createNativeStackNavigator();

function BookshelfStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="BookshelfMain"
        component={Bookshelf}
        options={{ headerShown: false, title: ' ', }}
      />
      <Stack.Screen
        name="BookshelfDetail"
        component={BookDetail} 
        options={{
          headerShown: false,
          headerTitle: ' ',
        }}
      />
      <Stack.Screen
        name="Profile"
        component={Profile}
        options={{ headerShown: false, title: ' '}}
      />
    </Stack.Navigator>
  );
}

export default function MainNavigator() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <Tab.Navigator
        initialRouteName="Home"
        screenOptions={{
            headerShown: false,
            tabBarStyle: {
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
            height: 80,
            display: "flex",
            justifyContent: "center",
            backgroundColor: "#2e3a59",
            borderTopWidth: 1,      // usually 1px or less
            borderTopColor: "rgba(255, 255, 255, 0.3)",
            // borderColor: '#2e3a59',
            // borderWidth: 1,
            // position: 'absolute',
          },
          tabBarItemStyle: {
            margin: "auto",
          },
          tabBarShowLabel: false,
        }}
      >
        {/* Login Screen */}
          <Tab.Screen
              name="Home"
              component={HomeStack}
              options={{
                  tabBarIcon: () => (
                      <Image
                          source={require("../assets/library_icon.png")}
                          style={{
                              width: 50,
                              height: 50,
                              marginTop: 20,
                              marginLeft: 30,
                          }}
                      />
                  ),
              }}
          />
        {/* Add a book Screen */}

        <Tab.Screen
          name="Test Slider"
          component={TestSliderScreen}
        ></Tab.Screen>

        <Tab.Screen
          name="Add a Book"
          component={BookshelfStack}
          options={{
            tabBarIcon: () => (
              <View
                style={{
                  width: 60,
                  height: 60,
                  marginTop: -10,            // float it up over the tab bar
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {/* ─── TOP HALF: has the thin border ─── */}
                <View
                  style={{
                    position: "absolute",
                    top: 0,
                    width: 60,
                    height: 200,
                    backgroundColor: "#2e3a59",
                    borderTopLeftRadius: 30,
                    borderTopRightRadius: 30,
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.3)",
                    display: "flex",
                    justifyContent: "center",
                    backgroundColor: "#2e3a59",
                    borderTopWidth: 1,      // usually 1px or less
                    borderTopColor: "rgba(255, 255, 255, 0.3)",
                  }}
                />

                {/* ─── BOTTOM HALF: no border, just solid color ─── */}
                <View
                  style={{
                    position: "absolute",
                    top: 16,
                    width: 100,
                    height: 200,
                    backgroundColor: "#2e3a59",
                    // borderBottomLeftRadius: 30,
                    // borderBottomRightRadius: 30,
                  }}
                />

                {/* ─── THE ICON sits on top of both halves ─── */}
                <Image
                  source={require("../assets/add_book.png")}
                  style={{
                    width: 50,
                    height: 50,
                    marginLeft: 10,
                  }}
                />
              </View>
            ),
          }}
        />
        {/* Rewind Screen */}
        <Tab.Screen
          name="Rewind"
          component={Rewind}
          options={{
            tabBarIcon: () => (
              <Image
                source={require("../assets/rewind_icon.png")}
                style={{
                  width: 50,
                  height: 50,
                  marginTop: 20,
                  marginRight: 30,
                }}
              />
            ),
          }}
        />
      </Tab.Navigator>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2e3a59",
  },
});
