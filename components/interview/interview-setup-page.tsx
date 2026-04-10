'use client';

import { Navbar } from '@/components/common/navbar';
import InterviewSetupForm, { InterviewConfig } from '@/components/interview/interview-setup-form';
import { useCreateInterview } from '@/hooks/use-interviews';
import { useRouter } from 'next/navigation';
import AuthWrapper from '@/components/auth/auth-wrapper';
import { useAuth } from '@/lib/auth-context';

export default function InterviewSetupPage() {
  const router = useRouter();
  const createInterview = useCreateInterview();
  const { refreshUser } = useAuth();

  const handleStartInterview = async (config: InterviewConfig) => {
    try {
      const response = await createInterview.mutateAsync(config);
      await refreshUser(); // Update credits in Navbar
      const interviewId = (response as any).interviewId;
      router.push(`/interview-room?id=${interviewId}`);
    } catch (error) {
      console.error("Failed to create interview:", error);
    }
  };

  return (
    <AuthWrapper>
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <InterviewSetupForm 
            onStartInterview={handleStartInterview} 
            isLoading={createInterview.isPending}
          />
        </div>
      </div>
    </AuthWrapper>
  );
}
