import React, { useEffect, useContext } from 'react';
import { UserContext } from './context/UserContext';
import { supabase } from './Supabase';
import MainNavigator from './navigation/MainNavigator';
import AuthNavigator from './navigation/AuthNavigator';

// =====================
// SessionRouter
// ------------------------
// Purpose:
// - Reads the user session from context
// - Listens for changes to auth state (login, logout)
// - Chooses which navigator to render: Main or Auth
//
// Inputs:
// - None directly (relies on UserContext)
//
// Outputs:
// - <MainNavigator /> if user is logged in
// - <AuthNavigator /> if not
// =====================

export default function SessionRouter() {
  const { session, setSession } = useContext(UserContext);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return session ? <MainNavigator /> : <AuthNavigator />;
}

// export default function SessionRouter() {
//   const { user } = useContext(UserContext);
//   return user ? <MainNavigator /> : <AuthNavigator />;
// }