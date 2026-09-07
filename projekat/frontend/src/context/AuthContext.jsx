// frontend/src/context/AuthContext.jsx
import { createContext, useContext, useState } from 'react';

export const AuthContext = createContext(null);

function loadSession() {
  try {
    const token = sessionStorage.getItem('token');
    const user  = JSON.parse(sessionStorage.getItem('user'));
    if (token && user) return { token, user };
  } catch {
    // corrupted storage — ignore
  }
  return { token: null, user: null };
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(loadSession);

  function login(token, user) {
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('user', JSON.stringify(user));
    setSession({ token, user });
  }

  function logout() {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    setSession({ token: null, user: null });
  }

  return (
    <AuthContext.Provider value={{ ...session, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
