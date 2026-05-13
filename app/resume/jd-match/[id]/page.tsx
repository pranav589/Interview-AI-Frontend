import { Metadata } from "next";
import { Suspense } from "react";
import { Navbar } from "@/components/common/navbar";
import AuthWrapper from "@/components/auth/auth-wrapper";
import { getQueryClient } from "@/lib/react-query";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { JdMatchResultContent } from "@/components/resume/jd-match-result-content";
import { JdMatchResultSkeleton } from "@/components/resume/resume-skeletons";

export const metadata: Metadata = {
  title: "Match Analysis | InterviewAI",
  description: "View your JD match analysis and AI-optimized resume content.",
};

export default async function JdMatchResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const queryClient = getQueryClient();

  // Pre-fetch match analysis result
  await queryClient.prefetchQuery({
    queryKey: ["jd-match", id],
    queryFn: async () => {
      try {
        const response = await api.get<{ data: any }>(`/resume/jd-match/${id}`);
        return response?.data || null;
      } catch (error) {
        return null;
      }
    },
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AuthWrapper>
        <div className="min-h-screen bg-background">
          <main id="main-content">
            <Suspense fallback={<JdMatchResultSkeleton />}>
              <JdMatchResultContent />
            </Suspense>
          </main>
        </div>
      </AuthWrapper>
    </HydrationBoundary>
  );
}
