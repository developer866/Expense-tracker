import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  loginRequest,
  registerRequest,
  logoutRequest,
  restoreSession,
  setSessionExpiredHandler,
} from '../api/client';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [status, setStatus] = useState('loading'); // loading | signedOut | signedIn
  const [user, setUser] = useState(null);

  useEffect(() => {
    let alive = true;

    // If the session dies while the app is open, send the user back to login
    setSessionExpiredHandler(() => {
      setUser(null);
      setStatus('signedOut');
    });

    // On app start, check for a saved session
    (async () => {
      const u = await restoreSession();
      if (!alive) return;
      setUser(u);
      setStatus(u ? 'signedIn' : 'signedOut');
    })();

    return () => {
      alive = false;
    };
  }, []);

  const login = useCallback(async (input) => {
    const u = await loginRequest(input);
    setUser(u);
    setStatus('signedIn');
  }, []);

  const register = useCallback(async (input) => {
    const u = await registerRequest(input);
    setUser(u);
    setStatus('signedIn');
  }, []);

  const logout = useCallback(async () => {
    await logoutRequest();
    setUser(null);
    setStatus('signedOut');
  }, []);

  return (
    <AuthContext.Provider value={{ status, user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}