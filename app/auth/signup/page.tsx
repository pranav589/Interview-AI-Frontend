import { Metadata } from 'next';
import SignupPageClient from '@/components/auth/signup-page-client';

export const metadata: Metadata = {
  title: 'Sign Up',
  description: 'Join InterviewAI today and master your interview skills.'
};

export default function SignupPage() {
  return <SignupPageClient />;
}
