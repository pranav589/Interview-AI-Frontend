import { Metadata } from "next";
import { Suspense } from "react";
import AuthWrapper from "@/components/auth/auth-wrapper";
import { getQueryClient } from "@/lib/react-query";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ResumeAnalyzerContent } from "@/components/resume/resume-analyzer-content";
import { ResumeAnalysisHistory } from "@/components/resume/resume-analysis-history";
import { ResumeAnalyzerSkeleton } from "@/components/resume/resume-skeletons";

export const metadata: Metadata = {
  title: "Resume Analyzer | InterviewAI",
  description: "Get deep AI feedback and ATS score for your resume.",
};

export default async function ResumeAnalyzerPage() {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["resumes"],
    queryFn: async () => {
      const response = await api.get<{ data: any[] }>("resume");
      return response.data || [];
    },
  });

  await queryClient.prefetchQuery({
    queryKey: ["resume-analyses"],
    queryFn: async () => {
      const response = await api.get<{ data: any[] }>("/resume/analyze");
      return response.data || [];
    },
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AuthWrapper>
        <div className="min-h-screen bg-canvas">
          <main id="main-content">
            <Suspense fallback={<ResumeAnalyzerSkeleton />}>
              <ResumeAnalyzerContent />
            </Suspense>

            <section className="bg-canvas-parchment section-padding border-t border-hairline">
              <ResumeAnalysisHistory />
            </section>
          </main>
        </div>
      </AuthWrapper>
    </HydrationBoundary>
  );
}
