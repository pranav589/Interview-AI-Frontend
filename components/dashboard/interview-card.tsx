"use client";

import Link from "next/link";
import { Interview } from "@/lib/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Calendar, Clock, Eye, Play } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface InterviewCardProps {
  interview: Interview;
}

const difficultyColors = {
  beginner: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  intermediate:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  advanced: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

const typeColors = {
  behavioral: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  technical:
    "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  "system-design":
    "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
};

const statusColors: Record<string, string> = {
  "not-started":
    "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  "in-progress":
    "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200",
  paused: "bg-amber-100 text-amber-800 dark:bg-amber-800 dark:text-amber-200",
  completed:
    "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200",
};

const statusLabels: Record<string, string> = {
  "not-started": "Not Started",
  "in-progress": "In Progress",
  paused: "Paused",
  completed: "Completed",
};

export default function InterviewCard({ interview }: InterviewCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-green-600 dark:text-green-400";
    if (score >= 70) return "text-yellow-600 dark:text-yellow-400";
    return "text-orange-600 dark:text-orange-400";
  };

  const displayTitle = interview.jobTitle
    ? `${interview.jobTitle} Interview`
    : `${interview.interviewType.charAt(0).toUpperCase() + interview.interviewType.slice(1)} Interview`;

  const isResumable =
    interview.status === "paused" || interview.status === "in-progress";

  return (
    <motion.div whileHover={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
      <Card className="transition-colors cursor-pointer border-hairline hover:bg-secondary/50">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-[17px] font-semibold tracking-tight mb-2">{displayTitle}</h3>
              <p className="text-caption text-muted-foreground mb-3">
                {interview.company || "General"} •{" "}
                {interview.jobTitle || "Software Engineer"}
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant="outline"
                  className={
                    interview.interviewType
                      ? typeColors[
                          interview.interviewType as keyof typeof typeColors
                        ]
                      : ""
                  }
                >
                  {interview.interviewType}
                </Badge>
                <Badge
                  variant="outline"
                  className={
                    interview.difficultyLevel
                      ? difficultyColors[
                          interview.difficultyLevel as keyof typeof difficultyColors
                        ]
                      : ""
                  }
                >
                  {interview.difficultyLevel}
                </Badge>
                <Badge
                  variant="outline"
                  className={statusColors[interview.status] || ""}
                >
                  {statusLabels[interview.status] || interview.status}
                </Badge>
              </div>
            </div>

            {interview.status === "completed" && (
              <div className="flex flex-row sm:flex-col items-baseline sm:items-end gap-2 sm:gap-0">
                <div
                  className={`text-[34px] font-semibold tracking-tight ${getScoreColor(interview.score)}`}
                >
                  {interview.score}
                </div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">
                  Score
                </p>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex items-start md:items-center justify-between flex-col md:flex-row">
            <div className="flex gap-6 text-sm text-muted-foreground justify-between md:justify-normal w-full">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(interview.createdAt)}</span>
              </div>
              {interview.status === "completed" && (
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {interview.actualDuration} min
                </div>
              )}
            </div>
            <div className="mt-4 md:mt-0 w-full md:w-fit">
              {isResumable ? (
                <Link href={`/interview-room?id=${interview._id}`}>
                  <Button
                    size="sm"
                    variant="default"
                    className="gap-2  w-full md:w-fit text-white"
                  >
                    <Play className="w-4 h-4" />
                    Resume Interview
                  </Button>
                </Link>
              ) : interview.status === "completed" ? (
                <Link href={`/interview/${interview._id}`}>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2 w-full md:w-fit"
                  >
                    <Eye className="w-4 h-4" />
                    View Feedback
                  </Button>
                </Link>
              ) : (
                <Link href={`/interview-room?id=${interview._id}`}>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2  w-full md:w-fit"
                  >
                    <Play className="w-4 h-4" />
                    Start Interview
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
