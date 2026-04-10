import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import AuthWrapper from '@/components/auth/auth-wrapper';
import { Skeleton } from '@/components/ui/skeleton';
import { Navbar } from '@/components/common/navbar';

const DashboardPage = dynamic(() => import('@/components/dashboard/dashboard-page'), {
  loading: () => (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-pulse">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="space-y-4">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-6 w-96" />
          </div>
          <Skeleton className="h-12 w-48" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array(4).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-[400px] w-full rounded-xl" />
          <Skeleton className="h-[400px] w-full rounded-xl" />
        </div>
      </div>
    </div>
  )
});

export const metadata: Metadata = { 
  title: 'Dashboard',
  description: 'View your interview history and performance trends.'
};

export default function Dashboard() {
  return (
    <AuthWrapper>
      <DashboardPage />
    </AuthWrapper>
  );
}
