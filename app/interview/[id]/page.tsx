'use client';
import { useParams } from 'next/navigation';
import AuthWrapper from '@/components/auth/auth-wrapper';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { Navbar } from '@/components/common/navbar';

const InterviewDetailPage = dynamic(() => import('@/components/interview/interview-detail-page'), {
  loading: () => (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="px-4 py-8 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-12 animate-pulse">
        <div className="space-y-4">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-12 w-2/3" />
          <Skeleton className="h-6 w-1/3" />
        </div>
        <div className="flex justify-center">
          <Skeleton className="w-56 h-56 rounded-full" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-32 w-full rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-64 w-full rounded-xl" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  )
});

export default function InterviewDetail() {
  const params = useParams();
  const id = params.id;
  const interviewId = Array.isArray(id) ? id[0] : (id || '');

  return (
    <AuthWrapper>
      <InterviewDetailPage interviewId={interviewId} />
    </AuthWrapper>
  );
}
