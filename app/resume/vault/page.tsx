import { Metadata } from "next";
import { Suspense } from "react";
import AuthWrapper from "@/components/auth/auth-wrapper";
import { getQueryClient } from "@/lib/react-query";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ResumeVaultContent } from "@/components/resume/resume-vault-content";
import { ResumeLandingSkeleton } from "@/components/resume/resume-skeletons";

export const metadata: Metadata = {
  title: "Resume Vault | InterviewAI",
  description: "Manage saved resumes and choose your default resume.",
};

export default async function ResumeVaultPage() {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["resumes"],
    queryFn: async () => {
      try {
        const response = await api.get<{ data: any[] }>("/resume");
        return response?.data || [];
      } catch (error) {
        return [];
      }
    },
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AuthWrapper>
        <div className="min-h-screen bg-canvas">
          <main id="main-content">
            <Suspense fallback={<ResumeLandingSkeleton />}>
              <ResumeVaultContent />
            </Suspense>
          </main>
        </div>
      </AuthWrapper>
    </HydrationBoundary>
  );
}
