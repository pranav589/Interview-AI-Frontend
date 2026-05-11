"use client";

import { useSuspenseInterviewDetails } from "@/hooks/use-interviews";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import {
  ArrowLeft,
  ThumbsUp,
  AlertCircle,
  Lightbulb,
  Lock,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { SUBSCRIPTION_TIERS } from "@/lib/constants";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useInterviewJob, useGenerateFeedback } from "@/hooks/use-interviews";
import { toast } from "sonner";


const TranscriptViewer = dynamic(() => import("./transcript-viewer"), {
  loading: () => <Skeleton className="h-64 w-full rounded-xl" />,
});

const FeedbackScores = dynamic(() => import("./feedback-scores"), {
  loading: () => <Skeleton className="h-64 w-full rounded-xl" />,
});

interface InterviewDetailPageProps {
  interviewId: string;
}

export default function InterviewDetailPage({
  interviewId,
}: InterviewDetailPageProps) {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const jobIdFromUrl = searchParams.get("jobId");
  const { data: interview } = useSuspenseInterviewDetails(interviewId);
  const [activeJobId, setActiveJobId] = useState<string | null>(jobIdFromUrl || interview?.activeJobId || null);
  
  const { data: job, isLoading: isJobLoading } = useInterviewJob(activeJobId || undefined);
  const generateFeedback = useGenerateFeedback();

  // If activeJobId changes in interview data (e.g. on fresh load), update state
  useEffect(() => {
    if (interview?.activeJobId && !activeJobId) {
      setActiveJobId(interview.activeJobId);
    }
  }, [interview?.activeJobId]);

  // Refetch interview details when job is completed
  useEffect(() => {
    if (job?.status === "completed") {
      queryClient.invalidateQueries({ queryKey: ["interview", interviewId] });
      toast.success("Feedback generated successfully!");
      setActiveJobId(null);
    }
  }, [job?.status, interviewId, queryClient]);

  const handleRetryAnalysis = () => {
    toast.promise(
      generateFeedback.mutateAsync({
        threadId: interviewId,
        actualDuration: interview.actualDuration || 0,
      }),
      {
        loading: "Restarting analysis...",
        success: (data) => {
          setActiveJobId(data.jobId);
          return "Analysis restarted!";
        },
        error: "Failed to restart analysis.",
      }
    );
  };


  if (!interview) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
          <Card className="max-w-md w-full relative z-10">
            <CardContent className="pt-6">
              <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
              <p className="mb-4">Interview not found or failed to load</p>
              <Link href="/dashboard">
                <Button variant="outline">Back to Dashboard</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const feedbackData = interview.feedbackId;
  const isProcessing = !feedbackData && (job?.status === "queued" || job?.status === "processing" || (activeJobId && !job && isJobLoading));
  const isFailed = !feedbackData && job?.status === "failed";

  const iType = interview.interviewType || "interview";
  const displayTitle = interview.jobTitle
    ? `${interview.jobTitle} Interview`
    : `${iType.charAt(0).toUpperCase() + iType.slice(1)} Interview`;

  const feedback = {
    overallScore: feedbackData?.overallScore || interview.score || 0,
    communicationScore: feedbackData?.communicationScore || 0,
    technicalScore: feedbackData?.technicalScore || 0,
    confidenceScore: feedbackData?.confidenceScore || 0,
    strengths: feedbackData?.strengths || [],
    areasForImprovement: feedbackData?.areasForImprovement || [],
    suggestions: feedbackData?.suggestions || [],
    feedbackSummary:
      feedbackData?.feedbackSummary || "Detailed feedback is being processed.",
    questions: feedbackData?.questions || [],
  };


  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-8"
          >
            <Link href="/dashboard">
              <Button variant="outline" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Button>
            </Link>
          </motion.div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold mb-2">{displayTitle}</h1>
            <p className="text-muted-foreground">
              {interview.company || "General"} •{" "}
              {interview.jobTitle || "Software Engineer"}
            </p>
            <div className="flex gap-4 mt-4 text-sm text-muted-foreground">
              <span>{formatDate(interview.createdAt)}</span>
              <span>{interview.actualDuration} minutes</span>
              <span>{interview.difficultyLevel}</span>
            </div>
          </motion.div>

          {isProcessing ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-12"
            >
              <Card className="max-w-2xl mx-auto border-dashed border-primary/20 bg-primary/5">
                <CardContent className="py-12 flex flex-col items-center text-center space-y-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
                    <Loader2 className="w-12 h-12 text-primary animate-spin relative" />
                  </div>
                  <CardTitle className="text-2xl">Analyzing your session...</CardTitle>
                  <CardDescription className="max-w-md text-base">
                    Our AI is currently reviewing your performance, communication, and technical depth. This usually takes about 30-60 seconds.
                  </CardDescription>
                  <div className="flex gap-2 items-center text-sm text-muted-foreground pt-4">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span>Generating personalized insights...</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : isFailed ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-12"
            >
              <Card className="max-w-2xl mx-auto border-destructive/20 bg-destructive/5">
                <CardContent className="py-12 flex flex-col items-center text-center space-y-4">
                  <AlertCircle className="w-12 h-12 text-destructive" />
                  <CardTitle className="text-2xl">Analysis Failed</CardTitle>
                  <CardDescription className="max-w-md text-base">
                    Something went wrong while generating your feedback. Please try restarting the analysis.
                  </CardDescription>
                  <Button onClick={handleRetryAnalysis} variant="outline" className="mt-4 gap-2">
                    <Sparkles className="w-4 h-4" />
                    Retry Analysis
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ) : !feedbackData ? (
             <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-12"
            >
              <Card className="max-w-2xl mx-auto border-dashed">
                <CardContent className="py-12 flex flex-col items-center text-center space-y-4">
                  <AlertCircle className="w-12 h-12 text-muted-foreground" />
                  <CardTitle className="text-2xl">No Feedback Available</CardTitle>
                  <CardDescription className="max-w-md text-base">
                    Feedback has not been generated for this session yet.
                  </CardDescription>
                  <Button onClick={handleRetryAnalysis} className="mt-4 gap-2">
                    <Sparkles className="w-4 h-4" />
                    Generate Feedback
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <>
              {/* Overall Score */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="mb-10 flex flex-col items-center justify-center"
              >

            <div className="relative group">
              <svg
                viewBox="0 0 120 120"
                className="w-56 h-56 transition-transform duration-500 group-hover:scale-105 drop-shadow-2xl"
              >
                <defs>
                  <linearGradient
                    id="scoreGradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="var(--primary)" />
                    <stop offset="100%" stopColor="oklch(0.65 0.25 290)" />
                  </linearGradient>
                  <filter
                    id="glow"
                    x="-20%"
                    y="-20%"
                    width="140%"
                    height="140%"
                  >
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feComposite
                      in="SourceGraphic"
                      in2="blur"
                      operator="over"
                    />
                  </filter>
                </defs>

                {/* Background circle track */}
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="none"
                  stroke="var(--muted)"
                  strokeOpacity={0.6}
                  strokeWidth="12"
                />

                {/* Progress circle */}
                <motion.circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="none"
                  stroke="url(#scoreGradient)"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 52}
                  initial={{ strokeDashoffset: 2 * Math.PI * 52 }}
                  animate={{
                    strokeDashoffset:
                      2 * Math.PI * 52 * (1 - feedback.overallScore / 100),
                  }}
                  transition={{ duration: 1.5, ease: "circOut", delay: 0.5 }}
                  transform="rotate(-90 60 60)"
                  style={{
                    filter: "drop-shadow(0 0 8px oklch(0.6 0.25 270 / 0.3))",
                  }}
                />

                {/* Score text */}
                <motion.text
                  x="60"
                  y="58"
                  textAnchor="middle"
                  dominantBaseline="central"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 }}
                  className="text-4xl font-black fill-foreground"
                >
                  {feedback.overallScore}
                </motion.text>
                <motion.text
                  x="60"
                  y="80"
                  textAnchor="middle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.4 }}
                  className="text-[10px] uppercase tracking-[0.2em] font-bold fill-muted-foreground"
                >
                  out of 100
                </motion.text>
              </svg>

              {/* Floating badges for flavor */}
              <div className="absolute -top-4 -right-4 bg-primary text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg animate-bounce duration-[3000ms]">
                {feedback.overallScore >= 80
                  ? "EXCELLENT"
                  : feedback.overallScore >= 60
                    ? "GOOD"
                    : "IMPROVING"}
              </div>
            </div>
            <p className="mt-4 text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Overall Performance
            </p>
          </motion.div>
          {/* Feedback Summary */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mb-8"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">AI Feedback Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed italic">
                  "{feedback.feedbackSummary}"
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Scores Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-8"
          >
            <FeedbackScores feedback={feedback} />
          </motion.div>

          {/* Strengths and Areas for Improvement */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
          >
            {/* Strengths */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ThumbsUp className="w-5 h-5 text-green-600" />
                  Strengths
                </CardTitle>
                <CardDescription>What you did well</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {feedback.strengths.map((strength: string, index: number) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className="flex gap-3 text-sm"
                    >
                      <span className="text-green-600 font-bold">✓</span>
                      <span>{strength}</span>
                    </motion.li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Areas for Improvement */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                  Areas to Improve
                </CardTitle>
                <CardDescription>What you can work on</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {feedback.areasForImprovement.map(
                    (area: string, index: number) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                        className="flex gap-3 text-sm"
                      >
                        <span className="text-orange-600 font-bold">!</span>
                        <span>{area}</span>
                      </motion.li>
                    ),
                  )}
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          {/* Suggestions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mb-8"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-blue-600" />
                  Personalized Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {feedback.suggestions.map(
                    (suggestion: string, index: number) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                        className="flex gap-3 text-sm"
                      >
                        <span className="text-blue-600 font-bold">→</span>
                        <span>{suggestion}</span>
                      </motion.li>
                    ),
                  )}
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          {/* Per-Question Breakdown */}
          {feedback.questions && feedback.questions.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.55 }}
              className="mb-8 space-y-4"
            >
              <h2 className="text-2xl font-bold mb-4">
                Question-by-Question Breakdown
              </h2>
              <div className="space-y-4">
                {feedback.questions.map((q: any, index: number) => (
                  <Card key={index} className="overflow-hidden">
                    <CardHeader className="bg-muted/30">
                      <div className="flex md:items-center justify-between flex-col md:flex-row gap-4">
                        <CardTitle className="text-lg font-semibold flex-1">
                          Q{index + 1}: {q.question}
                        </CardTitle>
                        <div
                          className={`text-xl w-fit font-bold px-3 py-1 rounded-full ${q.score >= 70 ? "bg-green-100 text-green-700" : q.score >= 40 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}
                        >
                          {q.score}/100
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                      <div>
                        <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                          Your Answer
                        </h4>
                        <p className="text-sm bg-muted/50 p-3 rounded-lg border italic">
                          "{q.userAnswer}"
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                          Feedback
                        </h4>
                        <p className="text-sm">{q.feedback}</p>
                      </div>
                      <details className="group border rounded-lg overflow-hidden">
                        <summary className="cursor-pointer text-sm font-semibold p-3 bg-primary/5 hover:bg-primary/10 transition-colors flex items-center justify-between">
                          <span>See Ideal Answer</span>
                          <span className="text-xs transition-transform group-open:rotate-180">
                            ▼
                          </span>
                        </summary>
                        <div className="p-3 text-sm bg-background leading-relaxed whitespace-pre-wrap border-t">
                          {q.modelAnswer}
                        </div>
                      </details>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}

            </>
          )}

          {/* Transcript */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mb-8"
          >
            <TranscriptViewer
              transcript={interview.transcriptions.map((t, i) => ({
                id: `t-${i}`,
                speaker: t.role === "human" ? "user" : "ai",
                text: t.text,
                // timestamp: new Date(t.timestamp).getTime(),
              }))}
            />
          </motion.div>


          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16 pt-8 border-t border-border/50"
          >
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-48 h-12"
              >
                Back to Dashboard
              </Button>
            </Link>
            <Link
              href={`/interview-setup?type=${interview.interviewType}&difficulty=${interview.difficultyLevel}`}
              className="w-full sm:w-auto"
            >
              <Button
                size="lg"
                className="w-full sm:w-48 h-12 shadow-md shadow-primary/20 text-white"
              >
                Practice Again
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
