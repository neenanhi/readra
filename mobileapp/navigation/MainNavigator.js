import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import Bookshelf from '../screens/Bookshelf';
import Home from '../screens/Home';
import SignUpScreen from '../screens/SignUpScreen';
import { Text } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const Tab = createBottomTabNavigator();

function Placeholder({ label }) {
  return <Text style={{ paddingTop: 100, textAlign: 'center' }}>{label} screen coming soon</Text>;
}

export default function MainNavigator() {
  return (
    <GestureHandlerRootView style={{flex: 1}}>
        <Tab.Navigator initialRouteName="Login"> 
          <Tab.Screen name="Login" component={SignUpScreen} />
          <Tab.Screen name="Home" component={Home} />
          <Tab.Screen name="Bookshelf" component={Bookshelf} />
          <Tab.Screen name="Analytics" children={() => <Placeholder label="Analytics" />} />
          <Tab.Screen name="Wrapped" children={() => <Placeholder label="Wrapped" />} />
        </Tab.Navigator>
    </GestureHandlerRootView>
  );
}
