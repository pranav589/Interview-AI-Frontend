import dynamic from 'next/dynamic';
import { Metadata } from 'next';
import { Navbar } from '@/components/common/navbar';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
  title: 'Start New Interview',
  description: 'Set up your AI interview session. Choose type, difficulty, and more.'
};

const InterviewSetupPage = dynamic(() => import('@/components/interview/interview-setup-page'), {
  loading: () => (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-12 space-y-8 animate-pulse">
        <div className="space-y-4 text-center">
          <Skeleton className="h-10 w-64 mx-auto" />
          <Skeleton className="h-6 w-96 mx-auto" />
        </div>
        <Skeleton className="h-[600px] w-full rounded-2xl" />
      </div>
    </div>
  )
});

export default function InterviewSetup() {
  return <InterviewSetupPage />;
}
