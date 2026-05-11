import { Metadata } from "next";
import { Suspense } from "react";
import AuthWrapper from "@/components/auth/auth-wrapper";
import { getQueryClient } from "@/lib/react-query";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { JdMatcherContent } from "@/components/resume/jd-matcher-content";
import { JdMatchHistory } from "@/components/resume/jd-match-history";
import { JdMatcherSkeleton } from "@/components/resume/resume-skeletons";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "JD Matcher | InterviewAI",
  description:
    "Align your resume to a specific job role and get AI-optimized rewrites.",
};

export default async function JdMatcherPage() {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["resumes"],
    queryFn: async () => {
      const response = await api.get<{ data: any[] }>("/resume");
      return response?.data || [];
    },
  });

  await queryClient.prefetchQuery({
    queryKey: ["jd-matches"],
    queryFn: async () => {
      const response = await api.get<{ data: any[] }>("/resume/jd-match");
      return response?.data || [];
    },
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AuthWrapper>
        <div className="min-h-screen bg-canvas">
          <main id="main-content">
            <Suspense fallback={<JdMatcherSkeleton />}>
              <JdMatcherContent />
            </Suspense>

            <div className="bg-canvas border-t border-hairline section-padding py-24">
              <Suspense
                fallback={
                  <div className="space-y-4">
                    <Skeleton className="h-8 w-48 mb-6" />
                    <Skeleton className="h-24 w-full rounded-lg" />
                  </div>
                }
              >
                <JdMatchHistory />
              </Suspense>
            </div>
          </main>
        </div>
      </AuthWrapper>
    </HydrationBoundary>
  );
}
