'use client';

import { useParams } from 'next/navigation';
import InterviewDetailPage from '@/components/interview/interview-detail-page';
import AuthWrapper from '@/components/auth/auth-wrapper';

export default function InterviewDetail() {
  const params = useParams();
  const id = params.id;
  const interviewId = Array.isArray(id) ? id[0] : (id || '');

  return (
    <AuthWrapper>
      <InterviewDetailPage interviewId={interviewId} />
    </AuthWrapper>
  );
}
