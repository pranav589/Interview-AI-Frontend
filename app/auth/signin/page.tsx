import { Metadata } from 'next';
import SigninPageClient from '@/components/auth/signin-page-client';

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your InterviewAI account to start practicing.'
};

export default function SigninPage() {
  return <SigninPageClient />;
}
