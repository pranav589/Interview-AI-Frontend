import { Metadata } from 'next';
import InterviewRoomPage from '@/components/interview-room/interview-room-page';
import AuthWrapper from '@/components/auth/auth-wrapper';

export const metadata: Metadata = {
  title: 'Interview Room',
  description: 'Ongoing AI interview session. Focus and interact with the AI interviewer.'
};

export default function InterviewRoom() {
  return (
    <AuthWrapper>
      <InterviewRoomPage />
    </AuthWrapper>
  );
}
