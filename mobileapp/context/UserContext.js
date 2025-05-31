import React, { createContext, useState, useEffect } from 'react';
import { supabase } from '../Supabase'; 

// =====================
// UserContext
// ------------------------
// Purpose:
// - Create a context that holds session info
// - Share the user's session state across the app
//
// Usage:
// - Wrap the app in <UserProvider> in App.js
// - Use 'useContext(UserContext)' to access session state anywhere
// =====================
export const UserContext = createContext({
  session: null,
  setSession: () => {},
  displayName: '',               // start as an empty string
  refreshDisplayName: async () => {}
});

// =====================
// UserProvider
// ------------------------
// Purpose:
// - Holds the session state
// - Makes session, setSession available to entire app
//
// Inputs:
// - children (React elements inside the provider)
//
// Outputs:
// - <UserContext.Provider> which gives access to:
//   - session: the current logged-in user info or null
//   - setSession: function to update the session state (after login/logout)
// =====================
export const UserProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [displayName, setDisplayName] = useState(''); // no “Friend” fallback

  // Helper function to derive the best display name for user:
  //  1) Look up profiles.username where id = user.id
  //  2) Else fallback to email prefix (everything before '@')
  const fetchDisplayName = async (user) => {
    try { // Check profiles table for custom username
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)   // assume your table uses `id` = user.id
        .single();

      if (!profileError && profile?.username) {
        setDisplayName(profile.username);
        return;
      }
      // use email prefix
      //    E.g. if email = "neena@example.com", prefix = "neena"
      const email = user.email || '';
      const prefix = email.split('@')[0];
      setDisplayName(prefix);
    } catch (err) {
      console.error('Error in fetchDisplayName:', err.message);
      // On any error, still fallback to email prefix
      const email = user.email || '';
      const prefix = email.split('@')[0];
      setDisplayName(prefix);
    }
  };

  // Exposed function to allow screens to re‐fetch the displayName on demand.
  // For example, after ProfileScreen upserts a new username, call this.
  const refreshDisplayName = async () => {
    // Supabase v2: getSession() returns { data: { session }, error }
    const {
      data: { session: currentSession },
      error: sessionError
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.error('Error fetching session in refreshDisplayName:', sessionError.message);
      return;
    }

    if (currentSession?.user) {
      await fetchDisplayName(currentSession.user);
    } else {
      setDisplayName(''); // no user => no displayName
    }
  };

  // On mount:  
  //  1) Attempt to read the existing session (getSession()),  
  //  2) If there is a user, fetchDisplayName(user),  
  //  3) Then subscribe to onAuthStateChange.
  useEffect(() => {
    let authListener = null;

    (async () => {
      // a) Get any existing session
      const {
        data: { session: existingSession },
        error: getSessionError
      } = await supabase.auth.getSession();

      if (getSessionError) {
        console.error('Error getting existing session:', getSessionError.message);
      }
      setSession(existingSession);

      if (existingSession?.user) {
        await fetchDisplayName(existingSession.user);
      } else {
        setDisplayName(''); // no user at startup
      }

      // b) Listen for future auth changes (login / logout / token refresh)
      const { data: listener } = supabase.auth.onAuthStateChange(
        async (event, newSession) => {
          // Whenever auth changes, update our session state
          setSession(newSession);

          if (newSession?.user) {
            // If a user just signed in or token was refreshed, re‐fetch their displayName
            await fetchDisplayName(newSession.user);
          } else {
            // If user logged out, clear the displayName
            setDisplayName('');
          }
        }
      );

      authListener = listener;
    })();

    // Cleanup on unmount
    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  // Provide context to children
  return (
    <UserContext.Provider
      value={{
        session,
        setSession,
        displayName,
        refreshDisplayName
      }}
    >
      {children}
    </UserContext.Provider>
  );
};