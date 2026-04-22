'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from './types';
import { api } from './api';

import { usePathname } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import {
  useLogin,
  useLogout,
  useSignup,
  useVerifyEmail,
  useForgotPassword,
  useResetPassword,
  useSetup2FA,
  useVerify2FA
} from '@/hooks/use-auth';

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
  isClient: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [isClient, setIsClient] = useState(false);
  
  const loginMutation = useLogin();
  const logoutMutation = useLogout();
  const signupMutation = useSignup();
  const verifyEmailMutation = useVerifyEmail();
  const forgotPasswordMutation = useForgotPassword();
  const resetPasswordMutation = useResetPassword();
  const setup2FAMutation = useSetup2FA();
  const verify2FAMutation = useVerify2FA();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // useQuery will automatically use the hydrated state from HydrationBoundary in layout.tsx
  const { data: user, isLoading: queryLoading } = useQuery({
    queryKey: ['auth-user'],
    queryFn: async () => {
      try {
        const response = await api.get<{ user: any }>('user/me');
        if (response?.user) {
          return {
            ...response.user,
            avatar: response.user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${response.user.id}`
          } as User;
        }
        return null;
      } catch (err: any) {
        if (err.response?.status === 401) {
          return null;
        }
        throw err;
      }
    },
    // We keep it enabled always. If SSR hydrated it, it won't fetch until staleTime.
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  const login = useCallback(async (email: string, password: string, twoFactorCode?: string) => {
    return await loginMutation.mutateAsync({ email, password, twoFactorCode });
  }, [loginMutation]);

  const signup = useCallback(async (name: string, email: string, password: string) => {
    await signupMutation.mutateAsync({ name, email, password });
  }, [signupMutation]);

  const logout = useCallback(async () => {
    await logoutMutation.mutateAsync();
  }, [logoutMutation]);

  const verifyEmail = useCallback(async (token: string) => {
    await verifyEmailMutation.mutateAsync(token);
  }, [verifyEmailMutation]);

  const forgotPassword = useCallback(async (email: string) => {
    await forgotPasswordMutation.mutateAsync(email);
  }, [forgotPasswordMutation]);

  const resetPassword = useCallback(async (token: string, password: string) => {
    await resetPasswordMutation.mutateAsync({ token, password });
  }, [resetPasswordMutation]);

  const setup2FA = useCallback(async () => {
    return await setup2FAMutation.mutateAsync();
  }, [setup2FAMutation]);

  const verify2FA = useCallback(async (code: string) => {
    await verify2FAMutation.mutateAsync(code);
  }, [verify2FAMutation]);

  const refreshUser = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['auth-user'] });
  }, [queryClient]);

  const value: AuthContextType = {
    user: user || null,
    isLoggedIn: !!user,
    isLoading: queryLoading, // useQuery correctly handles server-side hydrated state
    login,
    signup,
    logout,
    verifyEmail,
    forgotPassword,
    resetPassword,
    setup2FA,
    verify2FA,
    refreshUser,
    isClient
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
