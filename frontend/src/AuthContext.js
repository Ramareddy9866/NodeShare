import { createContext, useContext, useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from './api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      (async () => {
        try {
          const res = await api.get('/users/me');
          setUser(res.data);
          const decoded = jwtDecode(token);
          const expiryTime = decoded.exp * 1000;
          const timeLeft = expiryTime - Date.now();
          if (timeLeft > 0) {
            setTimeout(logout, timeLeft);
          } else {
            logout();
          }
        } catch (err) {
          logout();
        } finally {
          setLoading(false);
        }
      })();
    } else {
      setUser(null);
      setLoading(false);
    }
  }, []);

  const login = async (token) => {
    try {
      localStorage.setItem('token', token);
      const res = await api.get('/users/me');
      setUser(res.data);
      const decoded = jwtDecode(token);
      const expiryTime = decoded.exp * 1000;
      const timeLeft = expiryTime - Date.now();
      if (timeLeft > 0) {
        setTimeout(logout, timeLeft);
      }
      return res.data;
    } catch (error) {
      logout();
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);