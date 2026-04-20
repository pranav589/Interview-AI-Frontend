import { Metadata } from "next";
import { Suspense } from "react";
import InterviewDetailPage from "@/components/interview/interview-detail-page";
import { InterviewDetailSkeleton } from "@/components/interview/interview-detail-skeleton";
import { Navbar } from "@/components/common/navbar";
import { getQueryClient } from "@/lib/react-query";
import { apiServer, prefetchAuthUser } from "@/lib/api-server";
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

  // Get User Data (Already seeded by RootLayout)
  const user = queryClient.getQueryData<any>(["auth-user"]);

  // Pre-fetch Interview Details (NOT awaited to enable Streaming Suspense)
  // Only trigger if we have a user session.
  if (user) {
    queryClient.prefetchQuery({
      queryKey: ["interview", id],
      queryFn: async () => {
        try {
          const res = await apiServer<{ data: any }>(`interview/${id}`);
          return res.data;
        } catch (e) {
          return null;
        }
      },
    });
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="min-h-screen bg-background">
        <Navbar />
        <Suspense fallback={<InterviewDetailSkeleton />}>
          <InterviewDetailPage interviewId={id} />
        </Suspense>
      </div>
    </HydrationBoundary>
  );
}
