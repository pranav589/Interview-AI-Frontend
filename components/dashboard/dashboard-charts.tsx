"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FeatureFlag } from "@/components/common/feature-flag";
import { useSuspenseInterviewStats } from "@/hooks/use-interviews";

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

export function DashboardCharts() {
  const { data: statsData } = useSuspenseInterviewStats();

  return (
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

      {statsData && statsData.totalInterviews === 0 && (
        <motion.div 
            className="lg:col-span-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
        >
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
        </motion.div>
      )}
    </div>
  );
}
