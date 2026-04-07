import { Metadata } from 'next';
import InterviewSetupPage from '@/components/interview/interview-setup-page';

export const metadata: Metadata = {
  title: 'Start New Interview',
  description: 'Set up your AI interview session. Choose type, difficulty, and more.'
};

export default function InterviewSetup() {
  return <InterviewSetupPage />;
}
