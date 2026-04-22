import { Metadata } from "next";
import { Suspense } from "react";
import InterviewDetailPage from "@/components/interview/interview-detail-page";
import { InterviewDetailSkeleton } from "@/components/interview/interview-detail-skeleton";
import { Navbar } from "@/components/common/navbar";
import AuthWrapper from "@/components/auth/auth-wrapper";
import { getQueryClient } from "@/lib/react-query";
import { apiServer } from "@/lib/api-server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

export const metadata: Metadata = {
  title: "Interview Details",
  description: "Detailed analysis and feedback for your AI interview session.",
};

type Props = {
  params: Promise<{ id: string }>;
};

export default async function InterviewDetail({ params }: Props) {
  const { id } = await params;
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["interview", id],
    queryFn: () => apiServer(`interview/${id}`),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AuthWrapper>
        <div className="min-h-screen bg-background">
          <Navbar />
          <Suspense fallback={<InterviewDetailSkeleton />}>
            <InterviewDetailPage interviewId={id} />
          </Suspense>
        </div>
      </AuthWrapper>
    </HydrationBoundary>
  );
}
