'use client';

import { useAuth } from '@/lib/auth-context';
import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Navbar } from '@/components/common/navbar';
import { useRouter } from 'next/navigation';

interface AuthWrapperProps {
    children: React.ReactNode;
}

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
    const { user, isLoggedIn, isLoading, isClient } = useAuth();
    const [showLoading, setShowLoading] = useState(false);
    const router = useRouter();

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
        if (isClient && !isLoading) {
            if (!isLoggedIn) {
                // Check if we are on a protected path before redirecting
                // (AuthWrapper is usually only used on protected pages, but good to be safe)
                const isAuthPath = window.location.pathname.startsWith('/auth');
                if (!isAuthPath) {
                    console.log('[AuthWrapper] No session found. Redirecting to signin.');
                    router.push('/auth/signin');
                }
            } else if (user) {
                const path = window.location.pathname;

                // 1. Candidate route protection
                if (user.role === 'candidate') {
                    // Allowed paths: /invite/*, /interview-room/*
                    const isAllowed = path.startsWith('/invite') || path.startsWith('/interview-room');
                    if (!isAllowed) {
                        console.log('[AuthWrapper] Candidates cannot access this page. Redirecting to invite complete.');
                        router.push('/invite/complete');
                    }
                }

                // 2. Employer auto-redirect from /dashboard to /dashboard/recruitment
                if (user.role === 'employer' && path === '/dashboard') {
                    console.log('[AuthWrapper] Employer auto-redirect to recruitment.');
                    router.push('/dashboard/recruitment');
                }
            }
        }
    }, [isClient, isLoading, isLoggedIn, user]);

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
