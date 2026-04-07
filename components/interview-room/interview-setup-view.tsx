"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Play, Video } from "lucide-react";
import Link from "next/link";
import { LoadingButton } from "../common/loading-button";

interface InterviewSetupViewProps {
  interviewData: any;
  isCheckingPermissions: boolean;
  hasPermissions: boolean;
  permissionsError: string | null;
  isStartingInterview: boolean;
  isResuming?: boolean;
  onRequestPermissions: () => void;
  onStartInterview: () => void;
  onResetPermissions: () => void;
}

export default function InterviewSetupView({
  interviewData,
  isCheckingPermissions,
  hasPermissions,
  permissionsError,
  isStartingInterview,
  isResuming,
  onRequestPermissions,
  onStartInterview,
  onResetPermissions,
}: InterviewSetupViewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-2xl mx-auto"
    >
      <Card>
        <CardContent className="pt-12 pb-12 text-center space-y-8">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-6xl"
          >
            🎤
          </motion.div>

          <div className="space-y-4">
            <h2 className="text-3xl font-bold">{isResuming ? 'Resume Your Interview' : 'Interview Practice Session'}</h2>
            {interviewData && (
              <p className="text-primary font-medium">
                {interviewData.jobTitle
                  ? `${interviewData.jobTitle} Interview`
                  : `${interviewData.interviewType} Interview`}{" "}
                • {interviewData.difficultyLevel} level
              </p>
            )}
            <p className="text-muted-foreground text-lg max-w-md mx-auto">
              We need your permission to access the camera and microphone for
              the interview.
            </p>
          </div>

          <div className="space-y-6 mb-8 text-left max-w-md mx-auto">
            {isCheckingPermissions ? (
              <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-xl space-y-4 bg-muted/50">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-medium animate-pulse">
                  Waiting for browser permission...
                </p>
              </div>
            ) : !hasPermissions ? (
              <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-xl space-y-4 bg-muted/50">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                  <Video className="w-6 h-6" />
                </div>
                <p className="text-sm font-medium text-center">
                  Click the button below to enable your camera and microphone.
                </p>
                <Button
                  onClick={onRequestPermissions}
                  variant="default"
                  size="sm"
                >
                  Enable Camera & Mic
                </Button>
                {permissionsError && (
                  <div className="flex items-start gap-2 p-3 mt-2 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm leading-tight">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <p>{permissionsError}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-4 p-4 rounded-lg bg-muted border border-emerald-500/30">
                <div className="text-2xl">✅</div>
                <div className="flex-1">
                  <p className="font-semibold">Hardware Access Ready</p>
                  <p className="text-sm text-emerald-500 font-medium">
                    Camera & Microphone are active
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs"
                  onClick={onResetPermissions}
                >
                  Reset
                </Button>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4 max-w-xs mx-auto pt-4">
            <motion.div
              whileHover={
                !hasPermissions || isCheckingPermissions ? {} : { scale: 1.05 }
              }
              whileTap={
                !hasPermissions || isCheckingPermissions ? {} : { scale: 0.95 }
              }
            >
              <LoadingButton
                size="lg"
                onClick={onStartInterview}
                isLoading={isStartingInterview}
                disabled={!hasPermissions}
                loadingText={isResuming ? "Resuming..." : "Starting..."}
                icon={<Play className="w-5 h-5 fill-current" />}
                className="w-full shadow-lg shadow-primary/20"
              >
                {isResuming ? 'Resume Interview Session' : 'Start Interview'}
              </LoadingButton>
            </motion.div>

            <Link
              href="/dashboard"
              className="text-muted-foreground hover:text-foreground transition-colors text-sm"
            >
              Back to Dashboard
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
