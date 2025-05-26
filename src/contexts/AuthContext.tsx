'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthContextType, LoginCredentials, User } from '@/types';
import {
  authenticateUser,
  saveAuthState,
  loadAuthState,
  clearAuthState,
  isBrowser,
} from '@/utils/auth';

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    if (!isBrowser()) {
      setIsLoading(false);
      return;
    }

    try {
      const { isAuthenticated: savedAuth, user: savedUser } = loadAuthState();
      setIsAuthenticated(savedAuth);
      setUser(savedUser);
    } catch (error) {
      console.error('Error checking auth state:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      setIsLoading(true);
      const authenticatedUser = await authenticateUser(credentials);

      if (authenticatedUser) {
        setUser(authenticatedUser);
        setIsAuthenticated(true);
        saveAuthState(authenticatedUser);
        return true;
      } else {
        setUser(null);
        setIsAuthenticated(false);
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      setUser(null);
      setIsAuthenticated(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    clearAuthState();
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 