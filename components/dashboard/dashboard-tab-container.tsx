"use client";

import { useState, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, FileText } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  StatsSkeleton,
  ChartsSkeleton,
  InterviewsListSkeleton,
} from "@/components/dashboard/dashboard-skeletons";
import { cn } from "@/lib/utils";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { DashboardCharts } from "@/components/dashboard/dashboard-charts";
import { RecentInterviewsList } from "@/components/dashboard/recent-interviews-list";
import { RecentResumesList } from "@/components/dashboard/recent-resumes-list";
import { DashboardTools } from "@/components/dashboard/dashboard-tools";

export function DashboardTabContainer() {
  const [activeTab, setActiveTab] = useState<"interview" | "resume">("interview");

  return (
    <div className="space-y-10">
      {/* Sliding Glassmorphic Tabs Selector */}
      <div className="flex justify-center">
        <Tabs
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as "interview" | "resume")}
          className="w-full max-w-md"
        >
          <TabsList className="relative w-full h-12 p-1 bg-parchment/40 dark:bg-ink/10 border border-hairline rounded-full backdrop-blur-xl flex gap-1 select-none shadow-sm">
            
            {/* Interview Practice Tab */}
            <TabsTrigger
              value="interview"
              className={cn(
                "relative flex-1 h-full rounded-full text-sm font-semibold tracking-tight text-ink-muted-48 dark:text-ink/60 transition-colors duration-300 z-10 border-none bg-transparent hover:text-ink select-none focus-visible:ring-0 focus-visible:outline-none",
                activeTab === "interview" && "text-indigo-600 dark:text-white"
              )}
            >
              {activeTab === "interview" && (
                <motion.div
                  layoutId="activeTabBackground"
                  className="absolute inset-0 bg-white dark:bg-indigo-500 rounded-full shadow-sm -z-10 border border-hairline/10 dark:border-none"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <Sparkles className="w-4 h-4" />
              Interview Prep
            </TabsTrigger>

            {/* Resume Intelligence Tab */}
            <TabsTrigger
              value="resume"
              className={cn(
                "relative flex-1 h-full rounded-full text-sm font-semibold tracking-tight text-ink-muted-48 dark:text-ink/60 transition-colors duration-300 z-10 border-none bg-transparent hover:text-ink select-none focus-visible:ring-0 focus-visible:outline-none",
                activeTab === "resume" && "text-indigo-600 dark:text-white"
              )}
            >
              {activeTab === "resume" && (
                <motion.div
                  layoutId="activeTabBackground"
                  className="absolute inset-0 bg-white dark:bg-indigo-500 rounded-full shadow-sm -z-10 border border-hairline/10 dark:border-none"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <FileText className="w-4 h-4" />
              Resume Intelligence
            </TabsTrigger>

          </TabsList>
        </Tabs>
      </div>

      {/* Animated Tab Content wrapper */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-16"
        >
          {activeTab === "interview" ? (
            <div className="space-y-16">
              {/* Stats bento grid filtered to interview metrics */}
              <Suspense fallback={<StatsSkeleton mode="interview" />}>
                <DashboardStats mode="interview" />
              </Suspense>

              {/* Performance charts and skill radar */}
              <Suspense fallback={<ChartsSkeleton />}>
                <DashboardCharts />
              </Suspense>

              {/* Recent interview history */}
              <Suspense fallback={<InterviewsListSkeleton />}>
                <RecentInterviewsList />
              </Suspense>
            </div>
          ) : (
            <div className="space-y-16">
              {/* Stats bento grid filtered to resume metrics */}
              <Suspense fallback={<StatsSkeleton mode="resume" />}>
                <DashboardStats mode="resume" />
              </Suspense>

              {/* Recent resumes with vaults status & actions */}
              <Suspense fallback={<InterviewsListSkeleton />}>
                <RecentResumesList />
              </Suspense>

              {/* Career tools selection */}
              <DashboardTools />
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
