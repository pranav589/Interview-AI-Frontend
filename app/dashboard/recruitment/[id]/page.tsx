"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api, ApiResponse } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Clock, ShieldAlert, CheckCircle, ThumbsUp, AlertCircle, Lightbulb, User } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import AuthWrapper from "@/components/auth/auth-wrapper";
import FeedbackScores from "@/components/interview/feedback-scores";
import TranscriptViewer from "@/components/interview/transcript-viewer";

interface Snapshot {
  _id: string;
  timestamp: string;
  filename: string;
  trigger: "random" | "tab-switch" | "start" | "finish";
}

interface ProctorLog {
  _id: string;
  timestamp: string;
  event: string;
  details: string;
}

interface InterviewDetails {
  _id: string;
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  company: string;
  interviewType: string;
  difficultyLevel: string;
  duration: number;
  actualDuration: number;
  status: string;
  score: number;
  createdAt: string;
  videoFilename?: string;
  feedbackId?: {
    overallScore: number;
    communicationScore: number;
    technicalScore: number;
    confidenceScore: number;
    strengths: string[];
    areasForImprovement: string[];
    suggestions: string[];
    feedbackSummary: string;
    questions: Array<{
      question: string;
      userAnswer: string;
      feedback: string;
      score: number;
      modelAnswer: string;
    }>;
  };
  transcriptions: Array<{
    role: "human" | "ai";
    text: string;
    timestamp: string;
  }>;
  snapshots: Snapshot[];
  proctoringLogs: ProctorLog[];
}

function SecureImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [imgUrl, setImgUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const loadSecureImage = async () => {
      try {
        const { default: axiosInstance } = await import("@/lib/axiosInstance");
        const res = await axiosInstance.get(src, { responseType: "blob" });
        if (active) {
          const url = URL.createObjectURL(res as any);
          setImgUrl(url);
        }
      } catch (err) {
        console.error("Failed to load secure image:", err);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadSecureImage();
    return () => {
      active = false;
      if (imgUrl) URL.revokeObjectURL(imgUrl);
    };
  }, [src]);

  if (loading) {
    return <div className={`animate-pulse bg-muted rounded-xl ${className}`} />;
  }

  if (!imgUrl) {
    return (
      <div className={`flex items-center justify-center bg-muted text-muted-foreground text-xs rounded-xl ${className}`}>
        Image unavailable
      </div>
    );
  }

  return <img src={imgUrl} alt={alt} className={className} />;
}

export default function CandidateReport() {
  const { id } = useParams();
  const router = useRouter();
  const [selectedSnapshot, setSelectedSnapshot] = useState<Snapshot | null>(null);

  const { data: details, error: queryError, isLoading: loading } = useQuery<InterviewDetails>({
    queryKey: ["interview-details", id],
    queryFn: async () => {
      const res = await api.get<ApiResponse<InterviewDetails>>(`interview/${id}`);
      if (!res.success || !res.data) {
        throw new Error(res.message || "Failed to load report.");
      }
      return res.data;
    },
    enabled: !!id,
    retry: false,
  });

  const error = queryError instanceof Error ? queryError.message : (queryError ? String(queryError) : null);


  if (loading) {
    return (
      <div className="min-h-screen  flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-12 h-12 rounded-full border-2 border-[#0066cc] border-t-transparent animate-spin" />
          <p className="text-[#1d1d1f] font-sans text-[17px] tracking-tight">Loading candidate report...</p>
        </div>
      </div>
    );
  }

  if (error || !details) {
    return (
      <div className="min-h-screen  flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-[#ff3b30]/10 rounded-full flex items-center justify-center text-[#ff3b30] mb-6">
          <AlertCircle size={32} />
        </div>
        <h1 className="text-[#1d1d1f] text-[34px] font-semibold tracking-[-0.374px] mb-4">
          Report Not Found
        </h1>
        <p className="text-[#7a7a7a] text-[17px] max-w-md mb-8 leading-[1.47] tracking-tight">
          {error || "We couldn't retrieve the details for this interview session."}
        </p>
        <Link href="/dashboard/recruitment">
          <Button className="rounded-full bg-[#0066cc] text-white hover:bg-[#0071e3] px-8 h-11">
            Back to Recruitment
          </Button>
        </Link>
      </div>
    );
  }

  const feedback = details.feedbackId || {
    overallScore: details.score || 0,
    communicationScore: 0,
    technicalScore: 0,
    confidenceScore: 0,
    strengths: [],
    areasForImprovement: [],
    suggestions: [],
    feedbackSummary: "Summary report is still processing.",
    questions: [],
  };

  const getTriggerLabel = (trigger: string) => {
    switch (trigger) {
      case "start":
        return "Start Verification";
      case "finish":
        return "Complete Verification";
      case "tab-switch":
        return "Focus Lost Trigger";
      default:
        return "Periodic Check";
    }
  };

  const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:3001/api/v1";

  return (
    <AuthWrapper>
      <div className="min-h-screen pb-24">
        <main className="max-w-[1024px] mx-auto px-4 py-12 sm:px-6 lg:px-8 space-y-10">
          
          {/* Back Button */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
            <Link href="/dashboard/recruitment">
              <Button variant="ghost" size="sm" className="gap-2 rounded-full border border-[#e0e0e0] bg-white text-[#1d1d1f] hover:bg-[#f5f5f7]">
                <ArrowLeft className="w-4 h-4" /> Back to Recruitment
              </Button>
            </Link>
          </motion.div>

          {/* Candidate Profile Info Header */}
          <Card className="bg-white border border-[#e0e0e0] rounded-[18px] p-8 shadow-none">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="space-y-3">
                <span className="text-[12px] uppercase tracking-[0.2em] text-[#7a7a7a] font-semibold">Candidate Assessment Report</span>
                <h1 className="text-[#1d1d1f] text-[34px] font-semibold tracking-tight leading-none mt-1">
                  {details.candidateName}
                </h1>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[14px] text-[#7a7a7a]">
                  <span className="flex items-center gap-1.5"><User size={14} /> {details.candidateEmail}</span>
                  <span>•</span>
                  <span className="font-medium text-[#1d1d1f]">{details.jobTitle}</span>
                  <span>•</span>
                  <span>{new Date(details.createdAt).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}</span>
                </div>
              </div>

              {/* overall score circle */}
              <div className="flex items-center gap-4 border-l border-[#f0f0f0] pl-6 h-20">
                <div className="text-center">
                  <span className="text-[36px] font-bold text-[#1d1d1f] leading-none">{feedback.overallScore}</span>
                  <span className="text-[14px] text-[#7a7a7a] block font-semibold mt-1">OVERALL SCORE</span>
                </div>
              </div>
            </div>
          </Card>

          {/* PROCTORING TELEMETRY (SNAPSHOTS GALLERY + LOGS TIMELINE) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Snapshot Gallery (Left Column) */}
            <Card className="lg:col-span-8 bg-white border border-[#e0e0e0] rounded-[18px] p-6 shadow-none flex flex-col justify-between">
              <div className="space-y-4">
                <CardHeader className="p-0">
                  <CardTitle className="text-[#1d1d1f] text-[20px] font-semibold tracking-tight">Webcam Snapshot Gallery</CardTitle>
                  <CardDescription className="text-[#7a7a7a] text-[13px] mt-1">
                    Visual verification snapshots taken randomly and on window focus changes during the session.
                  </CardDescription>
                </CardHeader>

                {details.snapshots.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-[#e0e0e0] rounded-[18px] bg-[#fafafc]">
                    <span className="text-3xl mb-3">📹</span>
                    <span className="text-[#1d1d1f] font-semibold text-[14px]">No snapshots available</span>
                    <span className="text-[#7a7a7a] text-[12px] mt-1">Snapshots are only captured for proctored candidate rounds.</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
                    {details.snapshots.map((snap) => (
                      <div
                        key={snap._id}
                        onClick={() => setSelectedSnapshot(snap)}
                        className="group relative cursor-pointer overflow-hidden rounded-[12px] border border-[#e0e0e0] aspect-video hover:border-[#0066cc] transition-all"
                      >
                        <SecureImage
                          src={`interview/${details._id}/snapshots/${snap.filename}`}
                          alt="Webcam Snapshot"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-black/60 backdrop-blur-xs p-2 text-white text-[10px] flex flex-col justify-end">
                          <span className="font-semibold truncate">{getTriggerLabel(snap.trigger)}</span>
                          <span className="text-white/80 mt-0.5">{new Date(snap.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>
                        </div>
                        {snap.trigger === "tab-switch" && (
                          <div className="absolute top-2 right-2 bg-[#ff3b30] text-white px-2 py-0.5 rounded-full text-[9px] font-bold flex items-center gap-1 shadow-md">
                            <ShieldAlert size={10} /> Focus Warning
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>

            {/* Proctoring Timeline (Right Column) */}
            <Card className="lg:col-span-4 bg-white border border-[#e0e0e0] rounded-[18px] p-6 shadow-none flex flex-col justify-between">
              <div className="space-y-4">
                <CardHeader className="p-0">
                  <CardTitle className="text-[#1d1d1f] text-[20px] font-semibold tracking-tight">Proctoring Timeline</CardTitle>
                  <CardDescription className="text-[#7a7a7a] text-[13px] mt-1">
                    Complete audit trail of browser integrity events.
                  </CardDescription>
                </CardHeader>

                {details.proctoringLogs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center bg-[#fafafc] rounded-[12px] border border-[#e0e0e0] text-[#7a7a7a] text-xs">
                    No proctoring logs registered.
                  </div>
                ) : (
                  <div className="relative pl-4 border-l border-[#f0f0f0] space-y-4 pt-2">
                    {details.proctoringLogs.map((log) => {
                      const isWarning = log.event === "tab_blur";
                      return (
                        <div key={log._id} className="relative text-[12px] space-y-1">
                          {/* Indicator Dot */}
                          <div className={`absolute -left-[20px] top-1 w-2.5 h-2.5 rounded-full border-2 bg-white ${isWarning ? 'border-[#ff3b30]' : 'border-[#34c759]'}`} />
                          
                          <div className="flex justify-between items-center gap-2">
                            <span className={`font-semibold uppercase tracking-wider text-[9px] ${isWarning ? 'text-[#ff3b30]' : 'text-[#7a7a7a]'}`}>
                              {log.event.replace("_", " ")}
                            </span>
                            <span className="text-[#7a7a7a] font-mono">
                              {new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                            </span>
                          </div>
                          <p className="text-[#1d1d1f] font-normal leading-relaxed">{log.details}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Recorded Interview Playback */}
          {details.videoFilename && (
            <Card className="bg-white border border-[#e0e0e0] rounded-[18px] p-6 shadow-none">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-[#1d1d1f] text-[20px] font-semibold tracking-tight">Recorded Interview Session</CardTitle>
                <CardDescription className="text-[#7a7a7a] text-[13px] mt-1">
                  Full audio-video recording of the candidate's interview session.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 overflow-hidden rounded-xl border border-[#e0e0e0] bg-black aspect-video max-w-2xl mx-auto">
                <video
                  src={details.videoFilename}
                  controls
                  playsInline
                  className="w-full h-full object-contain"
                />
              </CardContent>
            </Card>
          )}

          {/* STANDARD CORE SCORES GRID */}
          <div className="space-y-4">
            <h2 className="text-[#1d1d1f] text-[21px] font-semibold tracking-tight px-1">Evaluation & Feedback Scores</h2>
            <FeedbackScores feedback={feedback} />
          </div>

          {/* STRENGTHS & SUGGESTIONS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="bg-white border border-[#e0e0e0] rounded-[18px] p-6 shadow-none">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="flex items-center gap-2 text-[#1d1d1f] text-[18px] font-semibold">
                  <ThumbsUp className="w-4.5 h-4.5 text-[#34c759]" /> Candidate Strengths
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ul className="space-y-3">
                  {feedback.strengths.map((str, i) => (
                    <li key={i} className="flex gap-3 text-[14px] text-[#1d1d1f]">
                      <span className="text-[#34c759] font-bold">✓</span>
                      <span>{str}</span>
                    </li>
                  ))}
                  {feedback.strengths.length === 0 && <span className="text-[#7a7a7a] text-[14px]">No feedback metrics populated.</span>}
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white border border-[#e0e0e0] rounded-[18px] p-6 shadow-none">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="flex items-center gap-2 text-[#1d1d1f] text-[18px] font-semibold">
                  <AlertCircle className="w-4.5 h-4.5 text-[#ff9500]" /> Areas to Improve
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ul className="space-y-3">
                  {feedback.areasForImprovement.map((area, i) => (
                    <li key={i} className="flex gap-3 text-[14px] text-[#1d1d1f]">
                      <span className="text-[#ff9500] font-bold">!</span>
                      <span>{area}</span>
                    </li>
                  ))}
                  {feedback.areasForImprovement.length === 0 && <span className="text-[#7a7a7a] text-[14px]">No issues reported.</span>}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* DETAILED FEEDBACK SUMMARY */}
          <Card className="bg-white border border-[#e0e0e0] rounded-[18px] p-6 shadow-none">
            <CardHeader className="p-0 mb-3">
              <CardTitle className="text-[#1d1d1f] text-[18px] font-semibold">AI Interview Evaluation Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-0 text-[#7a7a7a] text-[15px] italic leading-[1.5]">
              &ldquo;{feedback.feedbackSummary}&rdquo;
            </CardContent>
          </Card>

          {/* PER-QUESTION BREAKDOWN */}
          {feedback.questions && feedback.questions.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-[#1d1d1f] text-[21px] font-semibold tracking-tight px-1">Question-by-Question Breakdown</h2>
              <div className="space-y-4">
                {feedback.questions.map((q, index) => (
                  <Card key={index} className="bg-white border border-[#e0e0e0] rounded-[18px] p-6 shadow-none">
                    <div className="flex justify-between items-start gap-4 mb-4 pb-3 border-b border-[#f0f0f0]">
                      <div>
                        <span className="text-[12px] uppercase text-[#7a7a7a] font-semibold">Question {index + 1}</span>
                        <h4 className="text-[#1d1d1f] text-[16px] font-semibold tracking-tight mt-0.5">{q.question}</h4>
                      </div>
                      <span className={`text-[15px] font-bold px-3 py-1 rounded-full ${q.score >= 75 ? 'text-[#34c759] bg-[#34c759]/10' : q.score >= 50 ? 'text-[#ff9500] bg-[#ff9500]/10' : 'text-[#ff3b30] bg-[#ff3b30]/10'}`}>
                        {q.score}/100
                      </span>
                    </div>
                    <div className="space-y-4 text-[14px]">
                      <div>
                        <span className="text-[#7a7a7a] font-semibold block mb-1">Candidate Answer</span>
                        <p className="bg-[#fafafc] border border-[#e0e0e0] p-3 rounded-lg italic text-[#1d1d1f] leading-relaxed">
                          &ldquo;{q.userAnswer}&rdquo;
                        </p>
                      </div>
                      <div>
                        <span className="text-[#7a7a7a] font-semibold block mb-1">AI Evaluator Critique</span>
                        <p className="text-[#1d1d1f] leading-relaxed">{q.feedback}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* TRANSCRIPT VIEW */}
          <div className="space-y-4">
            <h2 className="text-[#1d1d1f] text-[21px] font-semibold tracking-tight px-1">Session Transcript</h2>
            <TranscriptViewer
              transcript={details.transcriptions.map((t, i) => ({
                id: `t-${i}`,
                speaker: t.role === "human" ? "user" : "ai",
                text: t.text,
              }))}
            />
          </div>

        </main>
      </div>

      {/* Snapshot Zoom Lightbox Modal */}
      {selectedSnapshot && (
        <div
          className="fixed inset-0 bg-black/95 z-[999] flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setSelectedSnapshot(null)}
        >
          <div className="relative max-w-4xl w-full">
            <SecureImage
              src={`interview/${details._id}/snapshots/${selectedSnapshot.filename}`}
              alt="Webcam Snapshot Expanded"
              className="w-full max-h-[85vh] object-contain rounded-xl shadow-2xl mx-auto"
            />
            <div className="text-center text-white mt-4 space-y-1">
              <h3 className="font-semibold text-lg">{getTriggerLabel(selectedSnapshot.trigger)}</h3>
              <p className="text-white/70 text-sm">{new Date(selectedSnapshot.timestamp).toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}
    </AuthWrapper>
  );
}
