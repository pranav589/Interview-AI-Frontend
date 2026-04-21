"use client";

import { motion } from "framer-motion";
import { TrendingUp, Clock, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSuspenseInterviewStats } from "@/hooks/use-interviews";
import { useFeatureFlags } from "@/lib/feature-flags-context";
import { StreakTracker } from "./streak-tracker";
import { FeatureFlag } from "@/components/common/feature-flag";

const DASHBOARD_TOOLTIPS = {
  total: "The total number of AI-powered practice sessions you've completed.",
  score: "Your average score calculated from AI feedback across all sessions.",
  time: "Total focus time spent in active interviews.",
};

export function DashboardStats() {
  const { data: statsData } = useSuspenseInterviewStats();
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

  const activeStatsCount = statsList.length + (isFeatureEnabled("streak_enabled") ? 1 : 0);
  const gridColsClass = 
    activeStatsCount === 4 ? "sm:grid-cols-2 lg:grid-cols-4" :
    activeStatsCount === 3 ? "sm:grid-cols-3" :
    activeStatsCount === 2 ? "sm:grid-cols-2" :
    "grid-cols-1";

  return (
    <div className={`grid ${gridColsClass} gap-6 mb-8`}>
      <TooltipProvider>
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
      </TooltipProvider>
    </div>
  );
}
