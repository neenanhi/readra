import React, {useEffect} from 'react';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {NavigationContainer} from '@react-navigation/native';
import {UserProvider} from './context/UserContext';
import SessionRouter from './SessionRouter';
import {useCameraPermission} from "react-native-vision-camera";
import {supabase} from "./Supabase";
import {Linking} from "react-native"; // this is the main router that decides which navigator to show based on the session state


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

    const {hasPermission, requestPermission} = useCameraPermission()

    useEffect(() => {
        const handleDeepLink = async (event) => {
            try {
                const url = event.url;

                let match = url.match(/access_token=([^&]+)/);
                const access_token = match ? match[1] : null;

                match = url.match(/refresh_token=([^&]+)/);
                const refresh_token = match ? match[1] : null;

                if (!access_token) {
                    console.warn('[OAuth] No access token found in URL:', url);
                    return;
                }
                if (!refresh_token) {
                    console.warn('[OAuth] No refresh token found in URL:', url);
                    return;
                }

                const { data, error } = await supabase.auth.setSession({access_token: access_token, refresh_token: refresh_token});
                if (error) {
                    console.error('[Supabase] exchangeCodeForSession error:', error);
                    return;
                }
            } catch (err) {
                console.error('[DeepLink] unexpected error:', err);
            }
        };

        const listener = Linking.addEventListener('url', handleDeepLink);

        (async () => {
            const initialUrl = await Linking.getInitialURL();
            if (initialUrl) {
                await handleDeepLink({ url: initialUrl });
            }
        })();

        return () => {
            listener.remove();
        };
    }, []);

    // everything inside this provider has access to the user context
    return (
        <UserProvider>
            <GestureHandlerRootView style={{flex: 1}}>
                <NavigationContainer>
                    <SessionRouter/>
                </NavigationContainer>
            </GestureHandlerRootView>
        </UserProvider>
    );
}