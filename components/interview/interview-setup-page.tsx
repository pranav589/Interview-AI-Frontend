'use client';

import { Navbar } from '@/components/common/navbar';
import InterviewSetupForm, { InterviewConfig } from '@/components/interview/interview-setup-form';
import { useCreateInterview } from '@/hooks/use-interviews';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import AuthWrapper from '@/components/auth/auth-wrapper';

export default function InterviewSetupPage() {
  const router = useRouter();
  const createInterview = useCreateInterview();

  const handleStartInterview = async (config: InterviewConfig) => {
    try {
      const response = await createInterview.mutateAsync(config);
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
          {createInterview.isPending ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground font-medium">Setting up your interview...</p>
            </div>
          ) : (
            <InterviewSetupForm onStartInterview={handleStartInterview} />
          )}
        </div>
      </div>
    </AuthWrapper>
  );
}
