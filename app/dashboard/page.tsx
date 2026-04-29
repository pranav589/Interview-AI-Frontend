import { Metadata } from "next";
import { Suspense } from "react";
import { Navbar } from "@/components/common/navbar";
import AuthWrapper from "@/components/auth/auth-wrapper";
import { getQueryClient } from "@/lib/react-query";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { api } from "@/lib/api";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { DashboardCharts } from "@/components/dashboard/dashboard-charts";
import { RecentInterviewsList } from "@/components/dashboard/recent-interviews-list";
import { DashboardOnboarding } from "@/components/dashboard/dashboard-onboarding";
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
        <div className="min-h-screen bg-background">
          <Navbar />
          <main id="main-content" className="px-4 py-8 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-8">
              <DashboardHeader />

              <Suspense fallback={<StatsSkeleton />}>
                <DashboardStats />
              </Suspense>

              <Suspense fallback={<ChartsSkeleton />}>
                <DashboardCharts />
              </Suspense>

              <Suspense fallback={<InterviewsListSkeleton />}>
                <RecentInterviewsList />
              </Suspense>

              <Suspense fallback={null}>
                <DashboardOnboarding />
              </Suspense>
            </div>
          </main>
        </div>
      </AuthWrapper>
    </HydrationBoundary>
  );
}
