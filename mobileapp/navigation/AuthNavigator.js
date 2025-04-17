import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import SignUpScreen from '../screens/SignUpScreen';
import SignInScreen from '../screens/SignInScreen';

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
    return (
        <Stack.Navigator initialRouteName= "SignIn">
            <Stack.Screen
                name="SignIn"
                component={SignInScreen}
                options={{title: 'Sign In'}}/>
            <Stack.Screen
                name="SignUp"
                component={SignUpScreen}
                options={{title: 'Sign Up'}}/>
        </Stack.Navigator>
    );
}