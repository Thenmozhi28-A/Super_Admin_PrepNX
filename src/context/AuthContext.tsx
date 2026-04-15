import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, LoginResponse } from '../types/Types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  authStorage: LoginResponse | null;
  login: (token: string, userData: LoginResponse) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [authStorage, setAuthStorage] = useState<LoginResponse | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedStorage = localStorage.getItem('authStorage');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    if (savedStorage) {
      setAuthStorage(JSON.parse(savedStorage));
    }
  }, []);

  const login = (token: string, userData: LoginResponse) => {
    const actualUser = userData.data;
    setToken(token);
    setUser(actualUser);
    setAuthStorage(userData);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(actualUser));
    localStorage.setItem('authStorage', JSON.stringify(userData));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setAuthStorage(null);
    localStorage.clear();
  };

  return (
    <AuthContext.Provider value={{ user, token, authStorage, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
