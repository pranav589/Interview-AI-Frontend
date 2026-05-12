import { Metadata } from "next";
import { Suspense } from "react";
import AuthWrapper from "@/components/auth/auth-wrapper";
import { getQueryClient } from "@/lib/react-query";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { api } from "@/lib/api";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { DashboardCharts } from "@/components/dashboard/dashboard-charts";
import { RecentInterviewsList } from "@/components/dashboard/recent-interviews-list";
import { DashboardOnboarding } from "@/components/dashboard/dashboard-onboarding";
import { DashboardTools } from "@/components/dashboard/dashboard-tools";
import {
  StatsSkeleton,
  ChartsSkeleton,
  InterviewsListSkeleton,
} from "@/components/dashboard/dashboard-skeletons";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "View your interview history and performance trends.",
};

export default async function Dashboard() {
  const queryClient = getQueryClient();

  // Pre-fetch Auth User
  const userData = await queryClient.fetchQuery({
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

  const userId = userData?.id || userData?._id;

  // Pre-fetch Dashboard specific data in parallel
  queryClient.prefetchQuery({
    queryKey: ["interview-stats", userId],
    queryFn: async () => {
      const response = await api.get<{ data: any }>("interview/stats");
      return response.data;
    },
  });

  queryClient.prefetchQuery({
    queryKey: [
      "interviews",
      { page: 1, limit: 5, type: undefined, difficulty: undefined },
    ],
    queryFn: async () => {
      const response = await api.get<{ data: any }>("interview", {
        params: { page: 1, limit: 5 },
      });
      return response.data;
    },
  });

  queryClient.prefetchQuery({
    queryKey: ["score-history", userId],
    queryFn: async () => {
      const response = await api.get<{ data: any }>("interview/score-history");
      return response.data;
    },
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AuthWrapper>
        <div className="min-h-screen bg-canvas">
          <main id="main-content" className="section-padding">
            <div className="space-y-12">
              <DashboardHeader userName={userData?.fullName} />

              <div className="space-y-16">
                <Suspense fallback={<StatsSkeleton />}>
                  <DashboardStats />
                </Suspense>

                <Suspense fallback={<ChartsSkeleton />}>
                  <DashboardCharts />
                </Suspense>

                {/* <DashboardTools /> */}

                <Suspense fallback={<InterviewsListSkeleton />}>
                  <RecentInterviewsList />
                </Suspense>

                <Suspense fallback={null}>
                  <DashboardOnboarding />
                </Suspense>
              </div>
            </div>
          </main>
        </div>
      </AuthWrapper>
    </HydrationBoundary>
  );
}
