import { Metadata } from "next";
import { Suspense } from "react";
import InterviewDetailPage from "@/components/interview/interview-detail-page";
import { InterviewDetailSkeleton } from "@/components/interview/interview-detail-skeleton";
import { Navbar } from "@/components/common/navbar";
import AuthWrapper from "@/components/auth/auth-wrapper";
import { getQueryClient } from "@/lib/react-query";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const response = await api.get<{ data: any }>(`interview/${id}`);
    const interview = response?.data;
    
    if (!interview) return { title: "Interview Details" };

    return {
      title: `Interview Analysis: ${interview.position || "Untitled Session"}`,
      description: `Analysis and feedback for interview on ${formatDate(interview.createdAt)}.`,
    };
  } catch (error) {
    return { title: "Interview Details" };
  }
}

export default async function InterviewDetail({ params }: Props) {
  const { id } = await params;
  const queryClient = getQueryClient();

  // Pre-fetch specific interview data (Don't await to allow streaming)
  queryClient.prefetchQuery({
    queryKey: ["interview", id],
    queryFn: async () => {
      const response = await api.get<{ data: any }>(`interview/${id}`);
      return response.data;
    },
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
