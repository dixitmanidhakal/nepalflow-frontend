import { useState, useEffect, createContext, useContext } from 'react';
import { authAPI } from '../utils/api';
import i18n from '../i18n';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('nepalflow_token');
    if (token) {
      authAPI.getMe()
        .then(res => {
          setUser(res.data.user);
          if (res.data.user.language) i18n.changeLanguage(res.data.user.language);
        })
        .catch(() => localStorage.removeItem('nepalflow_token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = (token, userData) => {
    localStorage.setItem('nepalflow_token', token);
    if (userData) {
      setUser(userData);
      if (userData.language) i18n.changeLanguage(userData.language);
    } else {
      // Fetch user data if not provided (e.g., right after OAuth popup)
      authAPI.getMe(token)
        .then(res => {
          setUser(res.data.user);
          if (res.data.user?.language) i18n.changeLanguage(res.data.user.language);
        })
        .catch(() => {
          // If fetch fails, still set a placeholder so ProtectedRoute passes
          setUser({ id: 'pending', name: 'User' });
        });
    }
  };

  const logout = () => {
    localStorage.removeItem('nepalflow_token');
    setUser(null);
  };

  const updateLanguage = async (lang) => {
    await authAPI.updateLanguage(lang);
    i18n.changeLanguage(lang);
    setUser(prev => ({ ...prev, language: lang }));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateLanguage }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
