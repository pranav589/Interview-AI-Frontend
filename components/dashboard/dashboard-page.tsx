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
import { Badge } from "@/components/ui/badge";
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
  UserCheck,
  Video,
  Sparkles,
  Users,
} from "lucide-react";
import { format } from "date-fns";
import InterviewCard from "./interview-card";
import { InterviewerCTA } from "../interviewer/interviewer-cta";
import {
  useMyCandidateBookings,
  useMyInterviewerBookings,
} from "@/hooks/use-interviewer";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UnifiedActivityCard from "./unified-activity-card";
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
  const [activeTab, setActiveTab] = useState("all");
  const { data: statsData, isLoading: isStatsLoading } = useInterviewStats();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const completeOnboarding = useCompleteOnboarding();

  useEffect(() => {
    if (!statsData || !user) return;

    // Show only if not completed and user has no completed interviews
    // Use both backend flag and local totalInterviews check
    if (!user.onboardingCompleted && statsData.candidate.total.count === 0) {
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
      value: statsData?.candidate?.total?.count || 0,
      subStats: [
        { label: "AI", value: statsData?.candidate?.ai?.count || 0 },
        { label: "Peer", value: statsData?.candidate?.human?.count || 0 },
      ],
      icon: Target,
      flag: "stat_total_interviews_enabled",
      tooltipKey: "total",
    },
    {
      title: "Average Score",
      value: statsData?.candidate?.total?.score || 0,
      subStats: [
        { label: "AI", value: `${statsData?.candidate?.ai?.score || 0}%` },
        { label: "Peer", value: `${statsData?.candidate?.human?.score || 0}%` },
      ],
      icon: TrendingUp,
      suffix: "%",
      flag: "stat_average_score_enabled",
      tooltipKey: "score",
    },
    {
      title: "Total Time",
      value: statsData?.candidate?.total?.time || 0,
      subStats: [
        { label: "AI", value: `${statsData?.candidate?.ai?.time || 0}m` },
        { label: "Peer", value: `${statsData?.candidate?.human?.time || 0}m` },
      ],
      suffix: "min",
      icon: Clock,
      flag: "stat_total_time_enabled",
      tooltipKey: "time",
    },
  ].filter((stat) => isFeatureEnabled(stat.flag));

  // Determine grid columns dynamically based on active stats + streak tracker
  const activeStatsCount =
    statsList.length + (isFeatureEnabled("streak_enabled") ? 1 : 0);
  const gridColsClass =
    activeStatsCount === 4
      ? "sm:grid-cols-2 lg:grid-cols-4"
      : activeStatsCount === 3
        ? "sm:grid-cols-3"
        : activeStatsCount === 2
          ? "sm:grid-cols-2"
          : "grid-cols-1";

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
            <div className="flex flex-col sm:flex-row gap-4">
              {isFeatureEnabled("interview_peer_enabled") && (
                <Link href="/interviewer/browse">
                  <Button
                    variant="outline"
                    size="lg"
                    className="gap-2 h-12 px-6 border-primary/20 hover:bg-primary/5"
                  >
                    <UserCheck className="w-5 h-5 text-primary" />
                    Book Peer Interview
                  </Button>
                </Link>
              )}
              <Link href="/interview-setup">
                <Button
                  size="lg"
                  className="gap-2 h-12 px-6 shadow-lg hover:shadow-primary/20"
                >
                  <Plus className="w-5 h-5" />
                  Start AI Practice
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Interviewer Hub (Conditional) */}
          {isFeatureEnabled("interview_peer_enabled") &&
            user?.interviewerStatus === "approved" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mb-10"
              >
                <InterviewerStatsHub
                  conducted={statsData?.interviewer?.total?.count || 0}
                  time={statsData?.interviewer?.total?.time || 0}
                />
              </motion.div>
            )}

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
                    const tooltipText =
                      DASHBOARD_TOOLTIPS[
                        stat.tooltipKey as keyof typeof DASHBOARD_TOOLTIPS
                      ];

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
                                {isFeatureEnabled("interview_peer_enabled") && (
                                  <div className="flex flex-wrap gap-2 mt-3">
                                    {stat.subStats?.map((sub, i) => (
                                      <div
                                        key={sub.label}
                                        className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-muted/50 border border-border/50"
                                      >
                                        <span className="text-[9px] font-bold uppercase text-muted-foreground tracking-widest">
                                          {sub.label}
                                        </span>
                                        <span className="text-[10px] font-black">
                                          {sub.value}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                )}
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

          {isFeatureEnabled("interview_peer_enabled") && (
            <div className="mb-10">
              <InterviewerCTA />
            </div>
          )}

          {isFeatureEnabled("interview_peer_enabled") && (
            <UpcomingHumanInterviews />
          )}

          {/* Activity Hub */}
          <div className="space-y-8 mb-16">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b pb-4">
              <div>
                <h2 className="text-2xl font-black tracking-tight">
                  Activity Hub
                </h2>
                <p className="text-muted-foreground text-sm">
                  Track your progress across AI training and peer sessions
                </p>
              </div>
            </div>

            <Tabs
              defaultValue="all"
              className="w-full"
              onValueChange={setActiveTab}
            >
              <TabsList className="bg-muted/50 p-1 mb-6">
                <TabsTrigger value="all" className="gap-2 px-6">
                  <Target className="w-3.5 h-3.5" />
                  All Activity
                </TabsTrigger>
                <TabsTrigger value="ai" className="gap-2 px-6">
                  <Sparkles className="w-3.5 h-3.5" />
                  AI Practice
                </TabsTrigger>
                {isFeatureEnabled("interview_peer_enabled") && (
                  <TabsTrigger value="human" className="gap-2 px-6">
                    <Users className="w-3.5 h-3.5" />
                    Peer Prep
                  </TabsTrigger>
                )}
              </TabsList>

              <TabsContent
                value="all"
                className="space-y-4 focus-visible:outline-none focus-visible:ring-0"
              >
                <UnifiedHistoryFeed
                  type="all"
                  interviews={interviews || []}
                  isLoading={isInterviewsLoading}
                  pagination={pagination}
                  page={page}
                  setPage={setPage}
                  isFetching={isInterviewsFetching}
                  filterType={type}
                  filterDifficulty={difficulty}
                />
              </TabsContent>

              <TabsContent
                value="ai"
                className="space-y-6 focus-visible:outline-none focus-visible:ring-0"
              >
                <div className="flex flex-wrap items-center gap-3 bg-muted/30 p-4 rounded-xl border border-border/50">
                  <div className="flex items-center gap-2 mr-2">
                    <Filter className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-bold uppercase tracking-widest text-[10px] opacity-70">
                      AI Session Filters:
                    </span>
                  </div>

                  <Select
                    value={type}
                    onValueChange={(val) => {
                      setType(val);
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="w-full sm:w-[140px] h-9 bg-background">
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
                    <SelectTrigger className="w-full sm:w-[140px] h-9 bg-background">
                      <SelectValue placeholder="Difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Difficulty</SelectItem>
                      {DIFFICULTY_LEVELS.map((d) => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {(type !== "all" || difficulty !== "all") && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 px-3 text-muted-foreground hover:text-primary bg-background border-dashed"
                      onClick={() => {
                        setType("all");
                        setDifficulty("all");
                        setPage(1);
                      }}
                    >
                      <RotateCcw className="w-3 h-3 mr-2" />
                      Reset
                    </Button>
                  )}
                </div>

                <UnifiedHistoryFeed
                  type="ai"
                  interviews={interviews || []}
                  isLoading={isInterviewsLoading}
                  pagination={pagination}
                  page={page}
                  setPage={setPage}
                  isFetching={isInterviewsFetching}
                  filterType={type}
                  filterDifficulty={difficulty}
                />
              </TabsContent>

              {isFeatureEnabled("interview_peer_enabled") && (
                <TabsContent
                  value="human"
                  className="space-y-4 focus-visible:outline-none focus-visible:ring-0"
                >
                  <UnifiedHistoryFeed
                    type="human"
                    interviews={[]}
                    filterType={type}
                    filterDifficulty={difficulty}
                  />
                </TabsContent>
              )}
            </Tabs>
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
              statsData.candidate.total.count === 0 && (
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

function UnifiedHistoryFeed({
  type,
  interviews,
  isLoading,
  pagination,
  page,
  setPage,
  isFetching,
  filterType,
  filterDifficulty,
}: {
  type: "all" | "ai" | "human";
  interviews: any[];
  isLoading?: boolean;
  pagination?: any;
  page?: number;
  setPage?: (page: number | ((p: number) => number)) => void;
  isFetching?: boolean;
  filterType?: string;
  filterDifficulty?: string;
}) {
  const { data: candidateBookings, isLoading: isCandLoading } =
    useMyCandidateBookings();
  const { data: interviewerBookings, isLoading: isIntLoading } =
    useMyInterviewerBookings();

  if (isLoading || isCandLoading || isIntLoading) {
    return (
      <div className="space-y-4">
        {Array(3)
          .fill(0)
          .map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
      </div>
    );
  }

  const aiItems = interviews.map((i) => ({
    ...i,
    activityType: "ai",
    date: new Date(i.createdAt),
  }));

  const humanItems = [
    ...(candidateBookings || []).map((b) => ({
      ...b,
      role: "Candidate",
      activityType: "human",
      date: new Date(b.startTime),
    })),
    ...(interviewerBookings || []).map((b) => ({
      ...b,
      role: "Interviewer",
      activityType: "human",
      date: new Date(b.startTime),
    })),
  ].filter((b) => {
    // Human sessions are only filtered by status (completed/cancelled)
    // AI specific type/difficulty filters are ignored here as requested
    return b.status === "completed" || b.status === "cancelled";
  });

  let combined = [];
  if (type === "all") combined = [...aiItems, ...humanItems];
  else if (type === "ai") combined = aiItems;
  else combined = humanItems;

  combined.sort((a, b) => b.date.getTime() - a.date.getTime());

  if (combined.length === 0) {
    return (
      <Card className="border-dashed border-2 py-20 flex flex-col items-center justify-center bg-muted/5 rounded-2xl">
        <div className="p-4 bg-muted/20 rounded-full mb-4">
          <Clock className="w-8 h-8 text-muted-foreground/50" />
        </div>
        <p className="text-muted-foreground font-medium">
          No results found with current filters
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Try resetting your filters to see more activity
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div
        className={`grid grid-cols-1 gap-4 transition-opacity duration-200 ${isFetching ? "opacity-50" : "opacity-100"}`}
      >
        {combined.map((item: any) => (
          <UnifiedActivityCard
            key={item._id}
            item={item}
            type={item.activityType as "ai" | "human"}
          />
        ))}
      </div>

      {/* Pagination Controls */}
      {type !== "human" &&
        pagination &&
        pagination.totalPages > 1 &&
        setPage && (
          <div className="flex items-center justify-center gap-6 mt-12 py-4 border-t border-border/50">
            <Button
              variant="ghost"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page === 1 || isFetching}
              className="gap-2 font-bold"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-black text-xs shadow-lg shadow-primary/20">
                {page}
              </div>
              <span className="text-muted-foreground text-xs font-bold uppercase tracking-widest">
                of {pagination.totalPages}
              </span>
            </div>
            <Button
              variant="ghost"
              onClick={() =>
                setPage((prev) => Math.min(pagination.totalPages, prev + 1))
              }
              disabled={page === pagination.totalPages || isFetching}
              className="gap-2 font-bold"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
    </div>
  );
}

function UpcomingHumanInterviews() {
  const { data: candidateBookings, isLoading: isCandLoading } =
    useMyCandidateBookings();
  const { data: interviewerBookings, isLoading: isIntLoading } =
    useMyInterviewerBookings();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 10000); // Check every 10s
    return () => clearInterval(timer);
  }, []);

  if (isCandLoading || isIntLoading)
    return <Skeleton className="h-40 w-full rounded-xl mb-10" />;

  const allUpcoming = [
    ...(candidateBookings || []).map((b) => ({ ...b, role: "Candidate" })),
    ...(interviewerBookings || []).map((b) => ({ ...b, role: "Interviewer" })),
  ]
    .filter((b) => b.status === "confirmed" || b.status === "pending")
    .sort(
      (a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
    );

  if (allUpcoming.length === 0) return null;

  return (
    <div className="mb-14 space-y-6">
      <div className="flex items-center gap-2 text-primary">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Video className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Upcoming Peer Sessions</h2>
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">
            Your scheduled practice interviews
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allUpcoming.map((booking: any) => (
          <Card
            key={booking._id}
            className="border-primary/20 bg-primary/5 shadow-lg overflow-hidden relative group hover:border-primary transition-all"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Video className="w-12 h-12" />
            </div>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start mb-2">
                <span
                  className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${booking.role === "Interviewer" ? "bg-orange-500/10 text-orange-500" : "bg-blue-500/10 text-blue-500"}`}
                >
                  As {booking.role}
                </span>
                {new Date(booking.startTime) > now && (
                  <Badge
                    variant="outline"
                    className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-[10px] h-5 animate-pulse"
                  >
                    Live Soon
                  </Badge>
                )}
              </div>
              <CardTitle className="text-lg">
                {booking.role === "Interviewer"
                  ? booking.candidateId?.name
                  : booking.interviewerId?.name}
              </CardTitle>
              <CardDescription className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {format(new Date(booking.startTime), "PPP p")}
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="flex flex-wrap gap-1">
                {(
                  booking.interviewerId?.expertiseTags ||
                  booking.candidateId?.expertiseTags
                )
                  ?.slice(0, 3)
                  .map((tag: string) => (
                    <span
                      key={tag}
                      className="text-[10px] bg-primary/10 px-2 py-0.5 rounded text-primary font-medium"
                    >
                      {tag}
                    </span>
                  ))}
              </div>
            </CardContent>
            <div className="px-6 pb-6 mt-auto">
              {new Date(booking.startTime) <= now ? (
                <Link href={`/interview/human/${booking._id}`}>
                  <Button className="w-full gap-2 shadow-primary/20 shadow-lg group-hover:bg-primary transition-all font-bold">
                    Join Interview Room
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </Button>
                </Link>
              ) : (
                <Button
                  disabled
                  className="w-full gap-2 opacity-50 cursor-not-allowed font-bold"
                  variant="secondary"
                >
                  <Clock className="w-4 h-4" />
                  Starts at {format(new Date(booking.startTime), "p")}
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
function InterviewerStatsHub({
  conducted,
  time,
}: {
  conducted: number;
  time: number;
}) {
  return (
    <Card className="relative overflow-hidden border-none shadow-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white">
      <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
        <Users className="w-32 h-32" />
      </div>

      <CardHeader className="relative z-10 pb-2">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-indigo-500/20 rounded-lg backdrop-blur-sm border border-indigo-400/20">
            <UserCheck className="w-5 h-5 text-indigo-400" />
          </div>
          <CardTitle className="text-xl font-bold tracking-tight">
            Interviewer Performance
          </CardTitle>
          <div className="ml-auto px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            Approved Mentor
          </div>
        </div>
        <CardDescription className="text-indigo-200/60 font-medium">
          Track your contribution and impact as a peer interviewer
        </CardDescription>
      </CardHeader>

      <CardContent className="relative z-10 pt-4 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div className="flex flex-col gap-1">
            <span className="text-indigo-200/50 text-xs font-bold uppercase tracking-widest">
              Sessions Conducted
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black">{conducted}</span>
              <span className="text-indigo-400/80 font-bold">Interviews</span>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-indigo-200/50 text-xs font-bold uppercase tracking-widest">
              Total Mentoring Time
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black">{time}</span>
              <span className="text-indigo-400/80 font-bold">Minutes</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
