import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName?: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('nyayalens_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('nyayalens_token');
      if (storedToken) {
        try {
          const userData = await authService.getCurrentUser();
          setUser(userData);
          setToken(storedToken);
        } catch (err: any) {
          console.error('Failed to restore session:', err);
          localStorage.removeItem('nyayalens_token');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const extractError = (err: any, fallback: string): string => {
    if (!err.response) {
      return 'Network Error: Cannot connect to backend API server. Check if your backend is running or asleep.';
    }
    if (err.response.status === 404) {
      return 'API 404 Error: Backend API URL not found. Ensure VITE_API_BASE_URL environment variable is set in Vercel settings to your Render backend URL.';
    }
    const detail = err.response.data?.detail;
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail) && detail.length > 0) {
      return detail.map((d: any) => d.msg || d.message || JSON.stringify(d)).join(', ');
    }
    return fallback;
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const authData = await authService.login(email, password);
      localStorage.setItem('nyayalens_token', authData.access_token);
      setToken(authData.access_token);
      const userData = await authService.getCurrentUser();
      setUser(userData);
    } catch (err: any) {
      const msg = extractError(err, 'Login failed. Please check your credentials.');
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, fullName?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const authData = await authService.register(email, password, fullName);
      localStorage.setItem('nyayalens_token', authData.access_token);
      setToken(authData.access_token);
      const userData = await authService.getCurrentUser();
      setUser(userData);
    } catch (err: any) {
      const msg = extractError(err, 'Registration failed. Please try again.');
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('nyayalens_token');
    setToken(null);
    setUser(null);
    setError(null);
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        error,
        login,
        register,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
