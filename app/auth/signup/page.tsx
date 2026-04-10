import dynamic from 'next/dynamic';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign Up',
  description: 'Join InterviewAI today and master your interview skills.'
};

const SignupPageClient = dynamic(() => import('@/components/auth/signup-page-client'), {
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="mt-4 text-muted-foreground">Joining the community...</p>
      </div>
    </div>
  )
});

export default function SignupPage() {
  return <SignupPageClient />;
}
