import { Metadata } from 'next';
import InterviewSetupPage from '@/components/interview/interview-setup-page';
import { getQueryClient } from '@/lib/react-query';
import { apiServer, prefetchAuthUser } from '@/lib/api-server';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

export const metadata: Metadata = {
  title: 'Start New Interview',
  description: 'Set up your AI interview session. Choose type, difficulty, and more.'
};

export default async function InterviewSetup() {
  const queryClient = getQueryClient();

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <InterviewSetupPage />
    </HydrationBoundary>
  );
}
