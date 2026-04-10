'use client';

import React, { createContext, useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from './api';

interface FeatureFlags {
  [key: string]: boolean;
}

interface FeatureFlagsContextType {
  flags: FeatureFlags;
  isLoading: boolean;
  isFeatureEnabled: (key: string) => boolean;
}

const FeatureFlagsContext = createContext<FeatureFlagsContextType | undefined>(undefined);

export function FeatureFlagsProvider({ children }: { children: React.ReactNode }) {
  const { data: flagsData, isLoading } = useQuery({
    queryKey: ['feature-flags'],
    queryFn: async () => {
      const response = await api.get<{ success: boolean; data: FeatureFlags }>('/config/features');
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const flags = flagsData || {};

  const isFeatureEnabled = (key: string) => {
    return !!flags[key];
  };

  return (
    <FeatureFlagsContext.Provider value={{ flags, isLoading, isFeatureEnabled }}>
      {children}
    </FeatureFlagsContext.Provider>
  );
}

export function useFeatureFlags() {
  const context = useContext(FeatureFlagsContext);
  if (context === undefined) {
    throw new Error('useFeatureFlags must be used within a FeatureFlagsProvider');
  }
  return context;
}
