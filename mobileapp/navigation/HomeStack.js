// navigation/HomeStack.js

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Home from '../screens/Home';
import BookDetail from '../screens/BookDetail';

const Stack = createNativeStackNavigator();

export default function HomeStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {/* The main “Home” screen */}
            <Stack.Screen
                name="HomeMain"
                component={Home}
                options={{ headerShown: false }}
            />

            {/* BookDetail is now registered here */}
            <Stack.Screen
                name="BookDetail"
                component={BookDetail}
                options={{
                    headerShown: true,            // or false, depending on your design
                    title: 'Book Details',
                }}
            />
        </Stack.Navigator>
    );
}
