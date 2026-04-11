import { Metadata } from 'next';
import { Navbar } from '@/components/common/navbar';
import AuthWrapper from '@/components/auth/auth-wrapper';
import { ApplicationWizard } from '@/components/interviewer/application-wizard';

export const metadata: Metadata = {
  title: 'Apply as Interviewer | Interview with AI',
  description: 'Apply to become a verified interviewer on our platform.',
};

export default function InterviewerApplyPage() {
  return (
    <AuthWrapper>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container max-w-7xl mx-auto px-4 py-12">
          <div className="text-center mb-12 space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">Become an Interviewer</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Help engineers grow their careers by conducting practice sessions and providing high-quality feedback.
            </p>
          </div>
          <ApplicationWizard />
        </main>
      </div>
    </AuthWrapper>
  );
}
