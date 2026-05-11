import { Metadata } from "next";
import { Suspense } from "react";
import AuthWrapper from "@/components/auth/auth-wrapper";
import { getQueryClient } from "@/lib/react-query";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { AnalysisResultContent } from "@/components/resume/analysis-result-content";
import { AnalysisResultSkeleton } from "@/components/resume/resume-skeletons";

export const metadata: Metadata = {
  title: "Analysis Results | InterviewAI",
  description: "View your detailed resume analysis and ATS score.",
};

interface PageProps {
  params: { id: string };
}

export default async function ResumeAnalysisResultPage({ params }: PageProps) {
  const { id } = await params;
  const queryClient = getQueryClient();

  queryClient.prefetchQuery({
    queryKey: ["resume-analysis", id],
    queryFn: async () => {
      const response = await api.get<{ data: any }>(`/resume/analyze/${id}`);
      return response.data;
    },
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AuthWrapper>
        <div className="min-h-screen bg-background">
          <main id="main-content">
            <Suspense fallback={<AnalysisResultSkeleton />}>
              <AnalysisResultContent />
            </Suspense>
          </main>
        </div>
      </AuthWrapper>
    </HydrationBoundary>
  );
}
