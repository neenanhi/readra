import React, { createContext, useState } from 'react';

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
export const UserContext = createContext();

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

    return (
        <UserContext.Provider value={{ session, setSession }}>
            {children}
        </UserContext.Provider>
    );
};