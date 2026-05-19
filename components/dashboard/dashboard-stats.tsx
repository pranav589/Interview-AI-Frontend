"use client";

import { motion } from "framer-motion";
import { 
  TrendingUp, 
  Clock, 
  Target, 
  FileText, 
  Flame, 
  Award, 
  FileCheck, 
  Zap, 
  Sparkles,
  ChevronRight
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useSuspenseDashboardStats } from "@/hooks/use-user";

interface DashboardStatsProps {
  mode?: "interview" | "resume" | "both";
}

export function DashboardStats({ mode = "both" }: DashboardStatsProps) {
  const { data: stats } = useSuspenseDashboardStats();

  const interviewStats = stats?.interviewStats || {
    totalInterviews: 0,
    avgScore: 0,
    totalDuration: 0,
    streak: 0,
    percentile: 0,
  };

  const resumeStats = stats?.resumeStats || {
    totalResumes: 0,
    avgAtsScore: 0,
    maxAtsScore: 0,
    totalJdMatches: 0,
    avgJdMatchScore: 0,
    maxJdMatchScore: 0,
  };

  const isSingleMode = mode === "interview" || mode === "resume";

  const renderInterviewStats = () => (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-ink/65 dark:text-ink/80">
            Mock Interview Prep
          </h3>
        </div>
        {interviewStats.streak > 0 && (
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-orange-500/10 text-orange-500 uppercase tracking-wider flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-500" />
            {interviewStats.streak} Day Streak
          </span>
        )}
      </div>

      <div className={isSingleMode ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" : "grid grid-cols-2 gap-4"}>
        {/* Card 1: Completed Interviews */}
        <motion.div
          whileHover={{ y: -4, scale: 1.01 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Card className="border-hairline bg-parchment/40 dark:bg-ink/10 backdrop-blur-xl h-full transition-all group overflow-hidden relative select-none">
            <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:scale-110 group-hover:opacity-10 transition-all duration-300">
              <Target className="w-20 h-20 text-emerald-500" />
            </div>
            <CardContent className="p-5 flex flex-col justify-between h-full gap-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-ink-muted-48 dark:text-ink/60 uppercase tracking-wider">
                  Completed
                </span>
                <div className="p-2 bg-emerald-500/10 rounded-xl group-hover:bg-emerald-500/20 transition-colors">
                  <Target className="h-4 w-4 text-emerald-500" />
                </div>
              </div>
              <div>
                <div className="text-[34px] font-bold tracking-tight text-ink flex items-baseline gap-1 leading-none">
                  {interviewStats.totalInterviews}
                  <span className="text-caption font-normal text-ink-muted-48 dark:text-ink/40">
                    sessions
                  </span>
                </div>
                <p className="text-[11px] text-ink-muted-48 dark:text-ink/50 mt-1 font-medium">
                  Total AI practices finished
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Card 2: Average Score */}
        <motion.div
          whileHover={{ y: -4, scale: 1.01 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Card className="border-hairline bg-parchment/40 dark:bg-ink/10 backdrop-blur-xl h-full transition-all group overflow-hidden relative select-none">
            <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:scale-110 group-hover:opacity-10 transition-all duration-300">
              <TrendingUp className="w-20 h-20 text-indigo-500" />
            </div>
            <CardContent className="p-5 flex flex-col justify-between h-full gap-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-ink-muted-48 dark:text-ink/60 uppercase tracking-wider">
                  Average Score
                </span>
                <div className="p-2 bg-indigo-500/10 rounded-xl group-hover:bg-indigo-500/20 transition-colors">
                  <TrendingUp className="h-4 w-4 text-indigo-500" />
                </div>
              </div>
              <div>
                <div className="text-[34px] font-bold tracking-tight text-ink flex items-baseline gap-0.5 leading-none">
                  {interviewStats.avgScore}
                  <span className="text-caption font-semibold text-indigo-500">%</span>
                </div>
                <p className="text-[11px] text-ink-muted-48 dark:text-ink/50 mt-1 font-medium">
                  {interviewStats.percentile > 0 ? `Top ${100 - interviewStats.percentile}% global score` : "Performance index"}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Card 3: Active Streak */}
        <motion.div
          whileHover={{ y: -4, scale: 1.01 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Card className="border-hairline bg-parchment/40 dark:bg-ink/10 backdrop-blur-xl h-full transition-all group overflow-hidden relative select-none">
            <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:scale-110 group-hover:opacity-10 transition-all duration-300">
              <Flame className="w-20 h-20 text-orange-500" />
            </div>
            <CardContent className="p-5 flex flex-col justify-between h-full gap-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-ink-muted-48 dark:text-ink/60 uppercase tracking-wider">
                  Practice Streak
                </span>
                <div className="p-2 bg-orange-500/10 rounded-xl group-hover:bg-orange-500/20 transition-colors">
                  <Flame className="h-4 w-4 text-orange-500" />
                </div>
              </div>
              <div>
                <div className="text-[34px] font-bold tracking-tight text-ink flex items-baseline gap-1 leading-none">
                  {interviewStats.streak}
                  <span className="text-caption font-normal text-ink-muted-48 dark:text-ink/40">
                    days
                  </span>
                </div>
                <p className="text-[11px] text-ink-muted-48 dark:text-ink/50 mt-1 font-medium">
                  {interviewStats.streak === 0 ? "Start practicing today!" : "Keep the heat going!"}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Card 4: Active Practice Duration */}
        <motion.div
          whileHover={{ y: -4, scale: 1.01 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Card className="border-hairline bg-parchment/40 dark:bg-ink/10 backdrop-blur-xl h-full transition-all group overflow-hidden relative select-none">
            <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:scale-110 group-hover:opacity-10 transition-all duration-300">
              <Clock className="w-20 h-20 text-amber-500" />
            </div>
            <CardContent className="p-5 flex flex-col justify-between h-full gap-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-ink-muted-48 dark:text-ink/60 uppercase tracking-wider">
                  Total Time
                </span>
                <div className="p-2 bg-amber-500/10 rounded-xl group-hover:bg-amber-500/20 transition-colors">
                  <Clock className="h-4 w-4 text-amber-500" />
                </div>
              </div>
              <div>
                <div className="text-[34px] font-bold tracking-tight text-ink flex items-baseline gap-1 leading-none">
                  {interviewStats.totalDuration}
                  <span className="text-caption font-normal text-ink-muted-48 dark:text-ink/40">
                    mins
                  </span>
                </div>
                <p className="text-[11px] text-ink-muted-48 dark:text-ink/50 mt-1 font-medium">
                  Total active speaking time
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );

  const renderResumeStats = () => (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 rounded-full bg-indigo-500" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-ink/65 dark:text-ink/80">
            Resume Hub & ATS Scores
          </h3>
        </div>
        {resumeStats.totalResumes > 0 && (
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-primary uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            ATS Sync Active
          </span>
        )}
      </div>

      <div className={isSingleMode ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" : "grid grid-cols-2 gap-4"}>
        {/* Card 1: Total Resumes */}
        <motion.div
          whileHover={{ y: -4, scale: 1.01 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Card className="border-hairline bg-parchment/40 dark:bg-ink/10 backdrop-blur-xl h-full transition-all group overflow-hidden relative select-none">
            <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:scale-110 group-hover:opacity-10 transition-all duration-300">
              <FileText className="w-20 h-20 text-purple-500" />
            </div>
            <CardContent className="p-5 flex flex-col justify-between h-full gap-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-ink-muted-48 dark:text-ink/60 uppercase tracking-wider">
                  Resumes
                </span>
                <div className="p-2 bg-purple-500/10 rounded-xl group-hover:bg-purple-500/20 transition-colors">
                  <FileText className="h-4 w-4 text-purple-500" />
                </div>
              </div>
              <div>
                <div className="text-[34px] font-bold tracking-tight text-ink flex items-baseline gap-1 leading-none">
                  {resumeStats.totalResumes}
                  <span className="text-caption font-normal text-ink-muted-48 dark:text-ink/40">
                    files
                  </span>
                </div>
                <p className="text-[11px] text-ink-muted-48 dark:text-ink/50 mt-1 font-medium">
                  Uploaded in Resume Vault
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Card 2: ATS Performance */}
        <motion.div
          whileHover={{ y: -4, scale: 1.01 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Card className="border-hairline bg-parchment/40 dark:bg-ink/10 backdrop-blur-xl h-full transition-all group overflow-hidden relative select-none">
            <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:scale-110 group-hover:opacity-10 transition-all duration-300">
              <Award className="w-20 h-20 text-cyan-500" />
            </div>
            <CardContent className="p-5 flex flex-col justify-between h-full gap-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-ink-muted-48 dark:text-ink/60 uppercase tracking-wider">
                  ATS Audit
                </span>
                <div className="p-2 bg-cyan-500/10 rounded-xl group-hover:bg-cyan-500/20 transition-colors">
                  <Award className="h-4 w-4 text-cyan-500" />
                </div>
              </div>
              <div>
                <div className="text-[34px] font-bold tracking-tight text-ink flex items-baseline gap-0.5 leading-none">
                  {resumeStats.avgAtsScore}
                  <span className="text-caption font-semibold text-cyan-500">%</span>
                </div>
                <p className="text-[11px] text-ink-muted-48 dark:text-ink/50 mt-1 font-medium flex items-center justify-between">
                  <span>Average ATS rating</span>
                  {resumeStats.maxAtsScore > 0 && (
                    <span className="text-primary font-bold">Max: {resumeStats.maxAtsScore}%</span>
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Card 3: Job Description Matches */}
        <motion.div
          whileHover={{ y: -4, scale: 1.01 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Card className="border-hairline bg-parchment/40 dark:bg-ink/10 backdrop-blur-xl h-full transition-all group overflow-hidden relative select-none">
            <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:scale-110 group-hover:opacity-10 transition-all duration-300">
              <FileCheck className="w-20 h-20 text-violet-500" />
            </div>
            <CardContent className="p-5 flex flex-col justify-between h-full gap-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-ink-muted-48 dark:text-ink/60 uppercase tracking-wider">
                  JD Matches
                </span>
                <div className="p-2 bg-violet-500/10 rounded-xl group-hover:bg-violet-500/20 transition-colors">
                  <FileCheck className="h-4 w-4 text-violet-500" />
                </div>
              </div>
              <div>
                <div className="text-[34px] font-bold tracking-tight text-ink flex items-baseline gap-1 leading-none">
                  {resumeStats.totalJdMatches}
                  <span className="text-caption font-normal text-ink-muted-48 dark:text-ink/40">
                    matched
                  </span>
                </div>
                <p className="text-[11px] text-ink-muted-48 dark:text-ink/50 mt-1 font-medium">
                  Total job target reviews
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Card 4: Alignment Strength */}
        <motion.div
          whileHover={{ y: -4, scale: 1.01 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Card className="border-hairline bg-parchment/40 dark:bg-ink/10 backdrop-blur-xl h-full transition-all group overflow-hidden relative select-none">
            <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:scale-110 group-hover:opacity-10 transition-all duration-300">
              <Zap className="w-20 h-20 text-rose-500" />
            </div>
            <CardContent className="p-5 flex flex-col justify-between h-full gap-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-ink-muted-48 dark:text-ink/60 uppercase tracking-wider">
                  Alignment Score
                </span>
                <div className="p-2 bg-rose-500/10 rounded-xl group-hover:bg-rose-500/20 transition-colors">
                  <Zap className="h-4 w-4 text-rose-500" />
                </div>
              </div>
              <div>
                <div className="text-[34px] font-bold tracking-tight text-ink flex items-baseline gap-0.5 leading-none">
                  {resumeStats.avgJdMatchScore}
                  <span className="text-caption font-semibold text-rose-500">%</span>
                </div>
                <p className="text-[11px] text-ink-muted-48 dark:text-ink/50 mt-1 font-medium flex items-center justify-between">
                  <span>Average target match</span>
                  {resumeStats.maxJdMatchScore > 0 && (
                    <span className="text-primary font-bold">Max: {resumeStats.maxJdMatchScore}%</span>
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );

  if (isSingleMode) {
    return (
      <div className="mb-8">
        {mode === "interview" ? renderInterviewStats() : renderResumeStats()}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      {renderInterviewStats()}
      {renderResumeStats()}
    </div>
  );
}
