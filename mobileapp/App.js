import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { UserProvider } from './context/UserContext';
import SessionRouter from './SessionRouter'; // this is the main router that decides which navigator to show based on the session state


// =====================
// App
// ------------------------
// Purpose:
// - Wraps the entire app in context (UserProvider)
// - Wraps the app in React Navigation setup
// - Loads SessionRouter to determine which navigator (Main, Auth) to show
//
// Inputs:
// - None
//
// Outputs:
// - The whole app UI
// =====================
export default function App() {
  // everything inside this provider has access to the user context
  return (
    <UserProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <NavigationContainer>
          <SessionRouter />
        </NavigationContainer>
      </GestureHandlerRootView>
    </UserProvider>
  );
}