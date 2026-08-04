import React, { createContext, useContext, useState, useEffect } from 'react';
import API_BASE from '../config/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize from local storage or actual API check on load
  useEffect(() => {
    const checkUser = async () => {
      const token = sessionStorage.getItem('greenkrt_token');
      if (token) {
        try {
          const res = await fetch(`${API_BASE}/api/auth/me`, {
            headers: { 'x-auth-token': token }
          });
          if (res.ok) {
            const data = await res.json();
            setUser(data);
            sessionStorage.setItem('greenkrt_user', JSON.stringify(data));
          } else {
            logout();
          }
        } catch {
          // If server is down, fallback to session storage user if exists
          const storedUser = sessionStorage.getItem('greenkrt_user');
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          } else {
            logout();
          }
        }
      }
      setLoading(false);
    };

    checkUser();
  }, []);

  const login = (userData, token) => {
    setUser(userData);
    sessionStorage.setItem('greenkrt_user', JSON.stringify(userData));
    if (token) {
      sessionStorage.setItem('greenkrt_token', token);
    }
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('greenkrt_user');
    sessionStorage.removeItem('greenkrt_token');
  };

  const updateUser = (userData) => {
    setUser(userData);
    sessionStorage.setItem('greenkrt_user', JSON.stringify(userData));
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
