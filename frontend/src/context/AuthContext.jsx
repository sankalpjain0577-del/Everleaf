import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('everleaf_token');
    if (!token) { setLoading(false); return; }
    api.get('/auth/me')
      .then((res) => setUser(res.data.user))
      .catch(() => localStorage.removeItem('everleaf_token'))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('everleaf_token', res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  const register = async (payload) => {
    const res = await api.post('/auth/register', payload);
    localStorage.setItem('everleaf_token', res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = () => {
    localStorage.removeItem('everleaf_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
