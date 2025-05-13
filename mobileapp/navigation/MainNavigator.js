// Library Imports
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text, StyleSheet, Image, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { createNativeStackNavigator } from '@react-navigation/native-stack';


// Component Imports
import Bookshelf from "../screens/Bookshelf";
import Home from "../screens/Home";
import BookDetail from "../screens/BookDetail";
import Rewind1 from "../screens/Rewind1";

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
      <Stack.Screen name="BookshelfMain" component={Bookshelf} options={{ headerShown: false }} />
      <Stack.Screen name="BookDetail" component={BookDetail} />
    </Stack.Navigator>
  );
}


export default function MainNavigator() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <Tab.Navigator
        initialRouteName="Home"
        screenOptions={{
          tabBarStyle: {
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
            height: 80,
            display: "flex",
            justifyContent: "center",
            backgroundColor: "#2e3a59",
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
          component={Home}
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
          name="Add a Book"
          component={BookshelfStack}

          options={{
            tabBarIcon: () => (
              <View
                style={{
                  padding: 32,
                  marginTop: -10,
                  top: 0,
                  left: 0,
                  right: 0,
                  borderRadius: 30,
                  backgroundColor: "#2e3a59",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 60,
                  height: 60,
                }}
              >
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
          component={Rewind1}
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
  },
});
