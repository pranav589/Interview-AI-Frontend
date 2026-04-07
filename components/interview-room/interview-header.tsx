"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import Link from "next/link";

interface InterviewHeaderProps {
  isInterviewActive: boolean;
  hasMessages: boolean;
  id: string | null;
  interviewData: any;
  interviewTime: number;
  onGetFeedback: () => void;
}

export default function InterviewHeader({
  isInterviewActive,
  hasMessages,
  id,
  interviewData,
  interviewTime,
  onGetFeedback,
}: InterviewHeaderProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const durationSeconds = (interviewData?.duration || 30) * 60;
  const remainingTime = Math.max(0, durationSeconds - interviewTime);
  const isTimeCritical = remainingTime < 60;

  if (!isInterviewActive && !hasMessages) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4"
    >
      <div>
        <h1 className="text-3xl font-bold">Interview Session</h1>
        <p className="text-muted-foreground">
          Session ID: <span className="font-mono text-xs">{id}</span>
        </p>
      </div>

      <div className="flex items-center gap-4">
        {isInterviewActive && (
          <div className="flex flex-col items-end">
            <motion.div
              animate={
                isTimeCritical
                  ? {
                      scale: [1, 1.1, 1],
                      color: ["#ef4444", "#ef4444", "#ef4444"],
                    }
                  : { scale: [1, 1.05, 1] }
              }
              transition={{ duration: 1, repeat: Infinity }}
              className={`text-2xl font-mono font-bold ${
                isTimeCritical ? "text-destructive" : "text-primary"
              }`}
            >
              {formatTime(remainingTime)}
            </motion.div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
              {isTimeCritical ? "Time Closing In" : "Remaining Time"}
            </p>
          </div>
        )}

        {!isInterviewActive && hasMessages && (
          <Button onClick={onGetFeedback} variant="outline" className="gap-2">
            <FileText className="w-4 h-4" /> Get AI Feedback
          </Button>
        )}

        {!isInterviewActive && (
          <Link href="/dashboard">
            <Button variant="ghost">Exit</Button>
          </Link>
        )}
      </div>
    </motion.div>
  );
}
