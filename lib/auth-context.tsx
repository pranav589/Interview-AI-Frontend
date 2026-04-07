'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from './types';
import { api } from './api';

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (email: string, password: string, twoFactorCode?: string) => Promise<any>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  setup2FA: () => Promise<{ otpAuthUrl: string }>;
  verify2FA: (code: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      // Verify session with backend using cookies
      await refreshUser();
    } catch (error) {
      console.error('Initial auth check failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email: string, password: string, twoFactorCode?: string) => {
    try {
      const response = await api.post<any>('auth/login', { email, password, twoFactorCode });

      if (response.user) {
        const userData: User = {
          ...response.user,
          avatar: response.user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${response.user.id}`
        };
        setUser(userData);
      }
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to sign in');
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    try {
      await api.post('auth/register', { name, email, password });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to sign up');
    }
  };

  const logout = async () => {
    try {
      await api.post('auth/logout');
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      setUser(null);
    }
  };

  const verifyEmail = async (token: string) => {
    try {
      await api.get(`auth/verify-email?token=${token}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Email verification failed');
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      await api.post('auth/forgot-password', { email });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to send reset link');
    }
  };

  const resetPassword = async (token: string, password: string) => {
    try {
      await api.post('auth/reset-password', { token, password });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Password reset failed');
    }
  };

  const setup2FA = async () => {
    try {
      return await api.post<{ otpAuthUrl: string }>('auth/2fa/setup');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '2FA setup failed');
    }
  };

  const verify2FA = async (code: string) => {
    try {
      await api.post('auth/2fa/verify', { code });
      // Update local user state to reflect 2FA is enabled
      if (user) {
        const updatedUser = { ...user, twoFactorEnabled: true };
        setUser(updatedUser);
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '2FA verification failed');
    }
  };

  const refreshUser = async () => {
    try {
      const response = await api.get<{ user: any }>('user/me');
      if (response.user) {
        const updatedUser = {
          ...response.user,
          avatar: response.user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${response.user.id}`
        };
        setUser(updatedUser);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
  };

  const value: AuthContextType = {
    user,
    isLoggedIn: !!user,
    isLoading,
    login,
    signup,
    logout,
    verifyEmail,
    forgotPassword,
    resetPassword,
    setup2FA,
    verify2FA,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
