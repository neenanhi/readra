import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Bookshelf from '../screens/Bookshelf';
import Home from '../screens/Home';
import SignUpScreen from '../screens/SignUpScreen';
import { Text } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { Image } from 'react-native';
import { View } from 'react-native-web';

const Tab = createBottomTabNavigator();

function Placeholder({ label }) {
  return <Text style={{ paddingTop: 100, textAlign: 'center' }}>{label} screen coming soon</Text>;
}

export default function MainNavigator() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <Tab.Navigator 
        initialRouteName="Login"
        screenOptions={{
          tabBarStyle: {
            backgroundColor: '#2E3A59',
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
            height: 60,
            display: 'flex',
            justifyContent: 'center',
            backgroundColor: '#2e3a59',
          },
          tabBarItemStyle: {
            margin: 'auto',
          },  
          tabBarShowLabel: false,
        }}
      > 
        {/* Login Screen */}
        <Tab.Screen 
          name="Login" 
          component={SignUpScreen} 
          options={{
          tabBarIcon: () => (
            <Image source={require('../assets/library_icon.svg')} style={{ margin: 'auto', width: 50, height: 50 }}/>  
          ),
          }} 
        />
        {/* Add a book Screen */}
        <Tab.Screen 
          name="Add a Book" 
          component={Bookshelf} 
          options={{
            tabBarIcon: () => (
              <View
                style={{
                  padding: 32,
                  marginTop: -30,
                  top: 0,
                  left: 0,
                  right: 0,
                  borderRadius: 30,
                  backgroundColor: '#2e3a59',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 60,
                  height: 60,
                }}
              >
              <Image 
                source={require('../assets/add_book.png')} 
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
          // FIX COMPONENT LATER
          component={Bookshelf}
          options={{
            tabBarIcon: () => (
              <Image source={require('../assets/rewind_icon.svg')} style={{ width: 50, height: 50 }} />
            ),
          }}       
        />
        {/* <Tab.Screen name="Sign Up" component={SignUpScreen} /> */}
        {/* <Tab.Screen name="Bookshelf" component={Bookshelf} /> */}
        {/* <Tab.Screen name="Analytics" children={() => <Placeholder label="Analytics" />} /> */}
        {/* <Tab.Screen name="Rewind" children={() => <Placeholder label="Rewind" />} /> */}
      </Tab.Navigator>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});