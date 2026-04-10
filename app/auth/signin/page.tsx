import dynamic from 'next/dynamic';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your InterviewAI account to start practicing.'
};

const SigninPageClient = dynamic(() => import('@/components/auth/signin-page-client'), {
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="mt-4 text-muted-foreground">Preparing your workspace...</p>
      </div>
    </div>
  )
});

export default function SigninPage() {
  return <SigninPageClient />;
}
