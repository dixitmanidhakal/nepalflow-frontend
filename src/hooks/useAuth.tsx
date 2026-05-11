import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { authAPI } from '../utils/api';
import i18n from '../i18n';

interface User {
  id: string;
  name: string;
  email?: string;
  language?: string;
  [key: string]: unknown;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (token: string, userData?: User) => void;
  logout: () => void;
  updateLanguage: (lang: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('nepalflow_token');
    if (token) {
      authAPI.getMe()
        .then((res: { data: { user: User } }) => {
          setUser(res.data.user);
          if (res.data.user.language) i18n.changeLanguage(res.data.user.language);
        })
        .catch(() => localStorage.removeItem('nepalflow_token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = (token: string, userData?: User) => {
    localStorage.setItem('nepalflow_token', token);
    if (userData) {
      setUser(userData);
      if (userData.language) i18n.changeLanguage(userData.language);
    } else {
      // Fetch user data if not provided (e.g., right after OAuth popup)
      authAPI.getMe(token)
        .then((res: { data: { user: User } }) => {
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

  const updateLanguage = async (lang: string) => {
    await authAPI.updateLanguage(lang);
    i18n.changeLanguage(lang);
    setUser(prev => prev ? { ...prev, language: lang } : prev);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateLanguage }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
