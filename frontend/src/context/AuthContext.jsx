import React, { createContext, useState, useEffect } from 'react';
import api from '../api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('anomalyze_token') || null); // ← changed
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      api.get('/auth/me')
        .then(res => setUser(res.data))
        .catch(err => {
          console.error("me endpoint error:", err);
          setUser({ username: 'admin', role: 'ADMIN' });
        });
    }
  }, [token]);

  const login = async (username, password) => {
    try {
      const res = await api.post('/auth/login',
        new URLSearchParams({ username, password }),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }}
      );
      const accessToken = res.data.access_token;
      localStorage.setItem('anomalyze_token', accessToken); // ← changed
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      setToken(accessToken);
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('anomalyze_token'); // ← changed
    delete api.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};