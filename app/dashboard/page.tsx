import { Metadata } from "next";
import { Suspense } from "react";
import { Navbar } from "@/components/common/navbar";
import AuthWrapper from "@/components/auth/auth-wrapper";

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
  return (
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
  );
}
