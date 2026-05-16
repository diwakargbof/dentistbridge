import React, { createContext, useContext, useState } from 'react';
import { api } from '../lib/api.js';
import { resetClient } from '../lib/realtime.js';

const AuthContext = createContext(null);

function loadSession() {
  try { return JSON.parse(localStorage.getItem('cs_session') || 'null'); }
  catch { return null; }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => loadSession());

  const profile = session?.profile || null;

  const signIn = async (phone) => {
    const data = await api.auth.phoneLogin(phone);
    localStorage.setItem('cs_session', JSON.stringify(data));
    setSession(data);
    return data.profile;
  };

  const signOut = () => {
    localStorage.removeItem('cs_session');
    setSession(null);
    resetClient();
  };

  return (
    <AuthContext.Provider value={{ session, profile, loading: false, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
