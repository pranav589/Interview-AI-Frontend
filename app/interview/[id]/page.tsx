import { Metadata } from "next";
import { Suspense } from "react";
import InterviewDetailPage from "@/components/interview/interview-detail-page";
import { InterviewDetailSkeleton } from "@/components/interview/interview-detail-skeleton";
import { Navbar } from "@/components/common/navbar";
import AuthWrapper from "@/components/auth/auth-wrapper";

export const metadata: Metadata = {
  title: "Interview Details",
  description: "Detailed analysis and feedback for your AI interview session.",
};

type Props = {
  params: Promise<{ id: string }>;
};

export default async function InterviewDetail({ params }: Props) {
  const { id } = await params;

  return (
    <AuthWrapper>
      <div className="min-h-screen bg-background">
        <Navbar />
        <Suspense fallback={<InterviewDetailSkeleton />}>
          <InterviewDetailPage interviewId={id} />
        </Suspense>
      </div>
    </AuthWrapper>
  );
}
