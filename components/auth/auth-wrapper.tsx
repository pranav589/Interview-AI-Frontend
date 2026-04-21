'use client';

import { useAuth } from '@/lib/auth-context';
import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Navbar } from '@/components/common/navbar';

interface AuthWrapperProps {
    children: React.ReactNode;
}

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
    const { isLoggedIn, isLoading, isClient } = useAuth();
    const [showLoading, setShowLoading] = useState(false);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isLoading) {
            timer = setTimeout(() => setShowLoading(true), 150);
        } else if (showLoading) {
            // Trigger View Transition only when transitioning from loading state to content
            if ((document as any).startViewTransition) {
                (document as any).startViewTransition(() => {
                    setShowLoading(false);
                });
            } else {
                setShowLoading(false);
            }
        } else {
            setShowLoading(false);
        }
        return () => clearTimeout(timer);
    }, [isLoading]);

    useEffect(() => {
        if (isClient && !isLoading && !isLoggedIn) {
            window.location.href = '/auth/signin';
        }
    }, [isClient, isLoading, isLoggedIn]);

    if (isLoading && showLoading) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
                    <div className="space-y-4">
                        <Skeleton className="h-10 w-64" />
                        <Skeleton className="h-4 w-96" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <Skeleton className="h-32 rounded-xl" />
                        <Skeleton className="h-32 rounded-xl" />
                        <Skeleton className="h-32 rounded-xl" />
                        <Skeleton className="h-32 rounded-xl" />
                    </div>
                    <Skeleton className="h-[400px] w-full rounded-2xl" />
                </div>
            </div>
        );
    }

    if (isLoading && !showLoading) {
        return null;
    }

    if (!isLoggedIn) {
        return null;
    }

    return <>{children}</>;
}
