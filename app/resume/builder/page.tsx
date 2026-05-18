import { Metadata } from "next";
import { Suspense } from "react";
import AuthWrapper from "@/components/auth/auth-wrapper";
import { getQueryClient } from "@/lib/react-query";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ResumeBuilderContent } from "@/components/resume/resume-builder/resume-builder-content";
import { BuilderSkeleton } from "@/components/resume/resume-skeletons";

export const metadata: Metadata = {
  title: "AI Resume Builder | InterviewAI",
  description: "Build a high-impact resume in minutes with our AI assistant.",
};

export default async function ResumeBuilderPage() {
  const queryClient = getQueryClient();

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
            <Suspense fallback={<BuilderSkeleton />}>
              <ResumeBuilderContent />
            </Suspense>
          </main>
        </div>
      </AuthWrapper>
    </HydrationBoundary>
  );
}
