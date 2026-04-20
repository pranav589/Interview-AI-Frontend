import { Metadata } from "next";
import { Suspense } from "react";
import { Navbar } from "@/components/common/navbar";
import { getQueryClient } from "@/lib/react-query";
import { apiServer } from "@/lib/api-server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

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

  // Get User Data
  const user = queryClient.getQueryData<any>(["auth-user"]);

  //  Start pre-fetching secondary data
  // Notice we DON'T await these. This allows the server to start sending the HTML
  // for the Navbar and Header immediately, while the secondary data is still being fetched.
  // The Suspense boundaries on the client will handle the loading states.
  if (user) {
    queryClient.prefetchQuery({
      queryKey: ["interview-stats", user.id],
      queryFn: () =>
        apiServer<{ data: any }>("interview/stats").then((res) => res.data),
    });
    queryClient.prefetchQuery({
      queryKey: ["interviews", { page: 1, limit: 5 }],
      queryFn: () => apiServer("interview?page=1&limit=5"),
    });
    queryClient.prefetchQuery({
      queryKey: ["score-history", user.id],
      queryFn: () =>
        apiServer<{ data: any }>("interview/score-history").then(
          (res) => res.data,
        ),
    });
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main id="main-content" className="px-4 py-8 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto space-y-8">
            <DashboardHeader userName={user?.name} />

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
    </HydrationBoundary>
  );
}
