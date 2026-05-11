import { Metadata } from "next";
import { Suspense } from "react";
import AuthWrapper from "@/components/auth/auth-wrapper";
import { getQueryClient } from "@/lib/react-query";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ResumeLandingContent } from "@/components/resume/resume-landing-content";
import { ResumeLandingSkeleton } from "@/components/resume/resume-skeletons";

export const metadata: Metadata = {
  title: "Resume Hub | InterviewAI",
  description: "AI-powered resume analysis, matching, and building suite.",
};

export default async function ResumeHubPage() {
  const queryClient = getQueryClient();

  // Pre-fetch Auth User for the landing page
  await queryClient.prefetchQuery({
    queryKey: ["auth-user"],
    queryFn: async () => {
      try {
        const response = await api.get<{ data: any }>("user/me");
        return response?.data || null;
      } catch (error) {
        return null;
      }
    },
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AuthWrapper>
        <div className="min-h-screen bg-canvas">
          <main id="main-content">
            <Suspense fallback={<ResumeLandingSkeleton />}>
              <ResumeLandingContent />
            </Suspense>
          </main>
        </div>
      </AuthWrapper>
    </HydrationBoundary>
  );
}
