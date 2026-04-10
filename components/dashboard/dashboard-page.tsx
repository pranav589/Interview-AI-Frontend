"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { Navbar } from "@/components/common/navbar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useInterviews, useInterviewStats } from "@/hooks/use-interviews";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import {
  Play,
  Plus,
  TrendingUp,
  Clock,
  Target,
  ChevronLeft,
  ChevronRight,
  Filter,
  RotateCcw,
  MessageSquare,
} from "lucide-react";
import InterviewCard from "./interview-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { StreakTracker } from "./streak-tracker";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SampleReplay } from "./sample-replay";
import { FeatureFlag } from "@/components/common/feature-flag";
import { useFeatureFlags } from "@/lib/feature-flags-context";
import { useCompleteOnboarding } from "@/hooks/use-user";
import { INTERVIEW_TYPES, DIFFICULTY_LEVELS, MESSAGES } from "@/lib/constants";

const SkillRadarChart = dynamic(
  () => import("./skill-radar-chart").then((mod) => mod.SkillRadarChart),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[400px] w-full rounded-xl" />,
  },
);

const ScoreTrendChart = dynamic(
  () => import("./score-trend-chart").then((mod) => mod.ScoreTrendChart),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[400px] w-full rounded-xl" />,
  },
);

const OnboardingWizard = dynamic(
  () => import("./onboarding-wizard").then((mod) => mod.OnboardingWizard),
  {
    ssr: false,
  },
);

const DASHBOARD_TOOLTIPS = {
  total: "The total number of AI-powered practice sessions you've completed.",
  score: "Your average score calculated from AI feedback across all sessions.",
  time: "Total focus time spent in active interviews.",
};

export default function DashboardPage() {
  const { user, refreshUser } = useAuth();
  const [page, setPage] = useState(1);
  const [type, setType] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const { data: statsData, isLoading: isStatsLoading } = useInterviewStats();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const completeOnboarding = useCompleteOnboarding();

  useEffect(() => {
    if (!statsData || !user) return;

    // Show only if not completed and user has no completed interviews
    // Use both backend flag and local totalInterviews check
    if (!user.onboardingCompleted && statsData.totalInterviews === 0) {
      setShowOnboarding(true);
    }
  }, [statsData, user]);

  const handleCloseOnboarding = async () => {
    try {
      await completeOnboarding.mutateAsync();
      setShowOnboarding(false);
    } catch (err) {
      console.error(MESSAGES.ONBOARDING.COMPLETE_FAILED, err);
      // Fallback to local storage if API fails, though backend is better
      localStorage.setItem("onboarding_completed", "true");
      setShowOnboarding(false);
    }
  };

  const {
    data: interviewsResponse,
    isLoading: isInterviewsLoading,
    isFetching: isInterviewsFetching,
    isError: isInterviewsError,
  } = useInterviews({
    page,
    limit: 5,
    type: type !== "all" ? type : undefined,
    difficulty: difficulty !== "all" ? difficulty : undefined,
  });

  const interviews = interviewsResponse?.data;
  const pagination = interviewsResponse?.pagination;

  const isInitialLoading =
    (isInterviewsLoading && !interviewsResponse) || isStatsLoading;
  const isError = isInterviewsError;

  const { isFeatureEnabled } = useFeatureFlags();

  const statsList = [
    {
      title: "Total Interviews",
      value: statsData?.totalInterviews || 0,
      icon: Target,
      flag: "stat_total_interviews_enabled",
      tooltipKey: "total",
    },
    {
      title: "Average Score",
      value: statsData?.avgScore || 0,
      icon: TrendingUp,
      suffix: "%",
      flag: "stat_average_score_enabled",
      tooltipKey: "score",
    },
    {
      title: "Total Time",
      value: statsData?.totalDuration || 0,
      suffix: "min",
      icon: Clock,
      flag: "stat_total_time_enabled",
      tooltipKey: "time",
    },
  ].filter((stat) => isFeatureEnabled(stat.flag));

  // Determine grid columns dynamically based on active stats + streak tracker
  const activeStatsCount = statsList.length + (isFeatureEnabled("streak_enabled") ? 1 : 0);
  const gridColsClass = 
    activeStatsCount === 4 ? "sm:grid-cols-2 lg:grid-cols-4" :
    activeStatsCount === 3 ? "sm:grid-cols-3" :
    activeStatsCount === 2 ? "sm:grid-cols-2" :
    "grid-cols-1";

  if (isError) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="bg-destructive/10 p-4 rounded-full mb-4">
          <RotateCcw className="w-8 h-8 text-destructive" />
        </div>
        <p className="text-destructive font-bold text-xl mb-2">
          Failed to load dashboard
        </p>
        <p className="text-muted-foreground mb-6 text-center max-w-sm">
          We're having trouble fetching your interview data. Please try again.
        </p>
        <Button onClick={() => window.location.reload()} className="gap-2">
          <RotateCcw className="w-4 h-4" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main id="main-content" className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6"
          >
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">
                Welcome back, {user?.name}!
              </h1>
              <p className="text-muted-foreground text-lg">
                Continue practicing and improving your interview skills
              </p>
            </div>
            <Link href="/interview-setup">
              <Button
                size="lg"
                className="gap-2 h-12 px-6 shadow-lg hover:shadow-primary/20"
              >
                <Plus className="w-5 h-5" />
                Start New Practice
              </Button>
            </Link>
          </motion.div>

          {/* Top Row: Dynamic Stats Grid */}
          <div className={`grid ${gridColsClass} gap-6 mb-8`}>
            <TooltipProvider>
              {isInitialLoading ? (
                Array(activeStatsCount || 4)
                  .fill(0)
                  .map((_, i) => (
                    <Card key={i} className="overflow-hidden">
                      <CardHeader className="pb-2">
                        <Skeleton className="h-4 w-24" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-8 w-16" />
                      </CardContent>
                    </Card>
                  ))
              ) : (
                <>
                   {statsList.map((stat, index) => {
                    const Icon = stat.icon;
                    const tooltipText = DASHBOARD_TOOLTIPS[stat.tooltipKey as keyof typeof DASHBOARD_TOOLTIPS];

                    return (
                      <motion.div
                        key={stat.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Card className="hover:shadow-md transition-all border-primary/5 cursor-help h-full group hover:border-primary/20">
                              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                  {stat.title}
                                </CardTitle>
                                <div className="p-2 bg-primary/5 rounded-lg group-hover:bg-primary/10 transition-colors">
                                  <Icon className="h-4 w-4 text-primary" />
                                </div>
                              </CardHeader>
                              <CardContent>
                                <div className="text-3xl font-bold flex items-baseline gap-1">
                                  {stat.value}
                                  {stat.suffix && (
                                    <span className="text-sm font-normal text-muted-foreground">
                                      {stat.suffix}
                                    </span>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{tooltipText}</p>
                          </TooltipContent>
                        </Tooltip>
                      </motion.div>
                    );
                  })}

                  {/* Streak Card as the 4th Stat Card */}
                  <FeatureFlag name="streak_enabled">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <StreakTracker
                        streak={statsData?.streak || 0}
                        percentile={statsData?.percentile || 0}
                        isCompact
                      />
                    </motion.div>
                  </FeatureFlag>
                </>
              )}
            </TooltipProvider>
          </div>

          {/* Second Row: Side-by-Side Charts (2-Column Grid) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
            <FeatureFlag name="score_trend_enabled">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <ScoreTrendChart />
              </motion.div>
            </FeatureFlag>

            <FeatureFlag name="skills_radar_enabled">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <SkillRadarChart
                  data={
                    statsData?.radarData || {
                      communication: 0,
                      technical: 0,
                      confidence: 0,
                    }
                  }
                />
              </motion.div>
            </FeatureFlag>
            {/* TODO: Take this feature later */}
            {/* <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <WeeklyDigestToggle initialValue={true} />
              </motion.div> */}

            {!isInitialLoading &&
              statsData &&
              statsData.totalInterviews === 0 && (
                <div className="mb-10">
                  <Card className="bg-primary/5 border-primary/20">
                    <CardHeader>
                      <CardTitle className="text-base text-primary">
                        Next Steps
                      </CardTitle>
                      <CardDescription>
                        Complete your first interview to track your score trends
                        and skill distribution.
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </div>
              )}

            {/* Commented Features (Preserved as requested) */}
            {/* <WeeklyDigestToggle initialValue={true} /> */}
          </div>
          {/* Interview History */}
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border pb-6">
              <div>
                <h2 className="text-2xl font-bold">Recent Interviews</h2>
                <p className="text-muted-foreground">
                  History and detailed feedback from your sessions
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 mr-2">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Filter:</span>
                </div>

                <Select
                  value={type}
                  onValueChange={(val) => {
                    setType(val);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="w-full sm:w-[140px] h-10">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {INTERVIEW_TYPES.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={difficulty}
                  onValueChange={(val) => {
                    setDifficulty(val);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="w-full sm:w-[140px] h-10">
                    <SelectValue placeholder="Difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Difficulties</SelectItem>
                    {DIFFICULTY_LEVELS.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {(type !== "all" || difficulty !== "all") && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-10 px-3 text-muted-foreground"
                    onClick={() => {
                      setType("all");
                      setDifficulty("all");
                      setPage(1);
                    }}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                )}
              </div>
            </div>

            <div className="relative min-h-[300px]">
              {/* Localized Fetching Overlay */}
              <AnimatePresence>
                {isInterviewsFetching && !isInterviewsLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-10 bg-background/40 backdrop-blur-[2px] flex flex-col gap-4 p-2 rounded-lg"
                  >
                    {Array(3)
                      .fill(0)
                      .map((_, i) => (
                        <div
                          key={i}
                          className="bg-card/50 border rounded-xl p-6 flex gap-4 items-start shadow-sm"
                        >
                          <Skeleton className="h-12 w-12 rounded-lg opacity-50" />
                          <div className="space-y-2 flex-1">
                            <Skeleton className="h-5 w-1/3 opacity-50" />
                            <Skeleton className="h-4 w-1/4 opacity-50" />
                          </div>
                          <Skeleton className="h-10 w-24 opacity-50" />
                        </div>
                      ))}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-background/80 px-4 py-2 rounded-full border shadow-lg flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                        <span className="text-xs font-bold uppercase tracking-wider ml-1">
                          Refreshing
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {isInitialLoading ? (
                <div className="space-y-4">
                  {Array(3)
                    .fill(0)
                    .map((_, i) => (
                      <Card key={i} className="p-6">
                        <div className="flex gap-4 items-start">
                          <Skeleton className="h-12 w-12 rounded-lg" />
                          <div className="space-y-2 flex-1">
                            <Skeleton className="h-5 w-1/3" />
                            <Skeleton className="h-4 w-1/4" />
                          </div>
                          <Skeleton className="h-10 w-24" />
                        </div>
                      </Card>
                    ))}
                </div>
              ) : !Array.isArray(interviews) || interviews.length === 0 ? (
                <div className="text-center py-20 bg-muted/10 rounded-2xl border-2 border-dashed border-border/50">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center"
                  >
                    <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mb-6">
                      <MessageSquare className="w-10 h-10 text-primary/40 animate-pulse" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">
                      {type !== "all" || difficulty !== "all"
                        ? "No results found"
                        : "Start your first interview"}
                    </h3>
                    <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
                      {type !== "all" || difficulty !== "all"
                        ? "Try adjusting your filters to find what you're looking for."
                        : "Practice makes perfect. Start your first AI-powered interview practice session now."}
                    </p>
                    {type !== "all" || difficulty !== "all" ? (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setType("all");
                          setDifficulty("all");
                          setPage(1);
                        }}
                      >
                        Clear All Filters
                      </Button>
                    ) : (
                      <div className="space-y-12 w-full max-w-4xl mx-auto">
                        <Link href="/interview-setup">
                          <Button className="gap-2 h-12 px-8 font-bold text-lg">
                            <Plus className="w-5 h-5" />
                            Create Your First Interview
                          </Button>
                        </Link>

                        <div className="space-y-6">
                          <div className="flex items-center gap-3 justify-center text-muted-foreground mb-4">
                            <div className="h-[1px] w-12 bg-border" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">
                              See how it works
                            </span>
                            <div className="h-[1px] w-12 bg-border" />
                          </div>
                          <SampleReplay />
                        </div>
                      </div>
                    )}
                  </motion.div>
                </div>
              ) : (
                <>
                  <div
                    className={`grid grid-cols-1 gap-4 mb-8 transition-opacity duration-200 ${isInterviewsFetching ? "opacity-50" : "opacity-100"}`}
                  >
                    {interviews.map((interview, index) => (
                      <motion.div
                        key={interview._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <InterviewCard interview={interview} />
                      </motion.div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {pagination && pagination.totalPages > 1 && (
                    <div className="flex items-center justify-center gap-6 mt-12 py-4">
                      <Button
                        variant="ghost"
                        onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                        disabled={page === 1 || isInterviewsFetching}
                        className="gap-2"
                      >
                        <ChevronLeft className="w-5 h-5" />
                        Previous
                      </Button>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-primary">{page}</span>
                        <span className="text-muted-foreground">/</span>
                        <span className="text-muted-foreground">
                          {pagination.totalPages}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        onClick={() =>
                          setPage((prev) =>
                            Math.min(pagination.totalPages, prev + 1),
                          )
                        }
                        disabled={
                          page === pagination.totalPages || isInterviewsFetching
                        }
                        className="gap-2"
                      >
                        Next
                        <ChevronRight className="w-5 h-5" />
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      <FeatureFlag name="onboarding_enabled">
        {showOnboarding && (
          <OnboardingWizard
            isOpen={showOnboarding}
            onClose={handleCloseOnboarding}
          />
        )}
      </FeatureFlag>
    </div>
  );
}
