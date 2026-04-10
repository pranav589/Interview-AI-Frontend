'use client';

import React from 'react';
import { useFeatureFlags } from '@/lib/feature-flags-context';

interface FeatureFlagProps {
  name: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}


export function FeatureFlag({ name, children, fallback = null }: FeatureFlagProps) {
  const { isFeatureEnabled, isLoading } = useFeatureFlags();

  if (isLoading) {
    return null;
  }

  if (isFeatureEnabled(name)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}
