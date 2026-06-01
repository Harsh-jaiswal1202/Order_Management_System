/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      // Axios interceptor will automatically attach the token
      const res = await api.get('/auth/me');
      setUser(res.data);
    } catch {
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let timer;
    if (token) {
      localStorage.setItem('token', token);
      timer = setTimeout(() => {
        fetchUser();
      }, 0);
    } else {
      localStorage.removeItem('token');
      timer = setTimeout(() => {
        setUser(null);
        setLoading(false);
      }, 0);
    }
    return () => clearTimeout(timer);
  }, [token, fetchUser]);

  const login = async (email, password) => {
    const formData = new URLSearchParams();
    formData.append('username', email); // OAuth2 expects username
    formData.append('password', password);
    
    const res = await api.post('/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    setToken(res.data.access_token);
  };

  const register = async (email, password) => {
    await api.post('/auth/register', { email, password });
    await login(email, password);
  };

  const logout = () => {
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
