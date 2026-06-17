"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { api, ApiResponse } from "@/lib/api";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Shield, Camera, AlertTriangle, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";

interface InviteDetails {
  status: "early" | "active" | "expired" | "completed";
  candidateName: string;
  candidateEmail: string;
  scheduledStart: string;
  scheduledEnd: string;
  jobTitle: string;
  company: string;
  duration: number;
  interviewType: string;
  difficultyLevel: string;
  interviewId: string;
  numberOfQuestions: number;
}

export default function InviteWaitingRoom() {
  const { token } = useParams();
  const router = useRouter();
  const { user, isLoggedIn, refreshUser, logout } = useAuth();

  // Verification Checks
  const [hasPermissions, setHasPermissions] = useState(false);
  const [isCheckingPermissions, setIsCheckingPermissions] = useState(false);
  const [privacyConsent, setPrivacyConsent] = useState(false);

  // Time Countdown
  const [timeLeft, setTimeLeft] = useState<string>("");

  const { data: details, error: queryError, isLoading: loading } = useQuery<InviteDetails>({
    queryKey: ["invite-details", token],
    queryFn: async () => {
      const res = await api.get<ApiResponse<InviteDetails>>(`invites/${token}`);
      if (!res.success || !res.data) {
        throw new Error(res.message || "Failed to retrieve invitation details.");
      }
      return res.data;
    },
    enabled: !!token,
    retry: false,
  });

  const error = queryError instanceof Error ? queryError.message : (queryError ? String(queryError) : null);

  // Countdown timer if it is early
  useEffect(() => {
    if (!details || details.status !== "early") return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const start = new Date(details.scheduledStart).getTime();
      const diff = start - now;

      if (diff <= 0) {
        clearInterval(interval);
        // Refresh details when countdown completes
        window.location.reload();
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(
        `${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [details]);

  const requestHardwarePermissions = async () => {
    setIsCheckingPermissions(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: { width: 640, height: 480 },
      });
      stream.getTracks().forEach((track) => track.stop());
      setHasPermissions(true);
      toast.success("Camera & Microphone access verified.");
    } catch (err) {
      setHasPermissions(false);
      toast.error("Please grant camera and microphone access to proceed.");
    } finally {
      setIsCheckingPermissions(false);
    }
  };

  const startInterviewMutation = useMutation({
    mutationFn: async () => {
      if (isLoggedIn) {
        await logout();
      }
      const res = await api.post<any>(`invites/${token}/start`);
      if (!res.success || !res.data) {
        throw new Error(res.message || "Failed to start the interview session.");
      }
      return res.data;
    },
    onSuccess: async (data) => {
      if (typeof window !== "undefined") {
        localStorage.setItem("is-logged-in", "true");
      }
      await refreshUser();
      toast.success("Authentication successful! Loading interview room...");
      setTimeout(() => {
        router.push(`/interview-room?id=${data.interviewId}`);
      }, 800);
    },
    onError: (err: any) => {
      toast.error(err.message || "Error setting up session.");
    }
  });

  const handleStartInterview = () => {
    if (!hasPermissions) {
      toast.error("Please test and allow camera/mic access first.");
      return;
    }
    if (!privacyConsent) {
      toast.error("Please review and accept the proctoring consent.");
      return;
    }
    startInterviewMutation.mutate();
  };

  if (loading) {
    return (
      <div className="min-h-screen  flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-12 h-12 rounded-full border-2 border-[#0066cc] border-t-transparent animate-spin" />
          <p className="text-[#1d1d1f] font-sans text-[17px] tracking-tight">Verifying invitation token...</p>
        </div>
      </div>
    );
  }

  if (error || !details) {
    return (
      <div className="min-h-screen  flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-[#ff3b30]/10 rounded-full flex items-center justify-center text-[#ff3b30] mb-6">
          <AlertTriangle size={32} />
        </div>
        <h1 className="text-[#1d1d1f] text-[34px] font-semibold tracking-[-0.374px] mb-4">
          Invalid Invitation
        </h1>
        <p className="text-[#7a7a7a] text-[17px] max-w-md mb-8 leading-[1.47] tracking-tight">
          {error || "This invitation link is invalid, broken, or has expired."}
        </p>
        <Button
          onClick={() => router.push("/")}
          className="rounded-full bg-[#0066cc] text-white hover:bg-[#0071e3] px-8 h-11 transition-all active:scale-[0.95]"
        >
          Back to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[580px] w-full space-y-8">
        
        {/* Header Branding */}
        <div className="text-center">
          <span className="text-[12px] uppercase tracking-[0.2em] text-[#7a7a7a] font-semibold">AI Interview Platform</span>
          <h1 className="text-[#1d1d1f] text-[40px] font-semibold tracking-[-0.01em] mt-2 mb-1">
            Interview Check-in
          </h1>
          <p className="text-[#7a7a7a] text-[17px] tracking-tight">
            Hi {details.candidateName}, welcome to your scheduled session.
          </p>
        </div>

        {/* State-Based Cards */}
        <AnimatePresence mode="wait">
          {details.status === "early" && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="bg-white border border-[#e0e0e0] rounded-[18px] p-8 text-center shadow-none">
                <div className="w-16 h-16 bg-[#0066cc]/10 text-[#0066cc] rounded-full flex items-center justify-center mx-auto mb-6">
                  <Clock size={32} />
                </div>
                <h2 className="text-[#1d1d1f] text-[24px] font-semibold tracking-tight mb-2">
                  Too Early to Start
                </h2>
                <p className="text-[#7a7a7a] text-[17px] max-w-md mx-auto mb-6 leading-[1.47]">
                  Your interview for <span className="font-semibold text-[#1d1d1f]">{details.jobTitle}</span> at <span className="font-semibold text-[#1d1d1f]">{details.company}</span> is scheduled to begin soon.
                </p>
                <div className="text-[48px] font-light text-[#1d1d1f] font-mono tracking-wider mb-2">
                  {timeLeft || "00:00:00"}
                </div>
                <span className="text-[12px] uppercase tracking-wider text-[#7a7a7a] font-semibold">
                  Countdown to Start Time
                </span>
              </Card>
            </motion.div>
          )}

          {details.status === "expired" && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="bg-white border border-[#e0e0e0] rounded-[18px] p-8 text-center shadow-none">
                <div className="w-16 h-16 bg-[#ff3b30]/10 text-[#ff3b30] rounded-full flex items-center justify-center mx-auto mb-6">
                  <Clock size={32} className="rotate-180" />
                </div>
                <h2 className="text-[#1d1d1f] text-[24px] font-semibold tracking-tight mb-2">
                  Link Expired
                </h2>
                <p className="text-[#7a7a7a] text-[17px] max-w-md mx-auto mb-6 leading-[1.47]">
                  The scheduled window for this interview closed at <span className="font-semibold text-[#1d1d1f]">{new Date(details.scheduledEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>. Please contact the recruiting team to reschedule.
                </p>
              </Card>
            </motion.div>
          )}

          {details.status === "completed" && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="bg-white border border-[#e0e0e0] rounded-[18px] p-8 text-center shadow-none">
                <div className="w-16 h-16 bg-[#34c759]/10 text-[#34c759] rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check size={32} />
                </div>
                <h2 className="text-[#1d1d1f] text-[24px] font-semibold tracking-tight mb-2">
                  Interview Completed
                </h2>
                <p className="text-[#7a7a7a] text-[17px] max-w-md mx-auto mb-6 leading-[1.47]">
                  You have already completed this interview session. The hiring team has been notified and is currently reviewing your assessment results.
                </p>
              </Card>
            </motion.div>
          )}

          {details.status === "active" && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              {/* Job Details Card */}
              <Card className="bg-white border border-[#e0e0e0] rounded-[18px] p-6 shadow-none">
                <div className="border-b border-[#f0f0f0] pb-4 mb-4">
                  <span className="text-[12px] uppercase text-[#7a7a7a] font-semibold">Active Invitation</span>
                  <h2 className="text-[#1d1d1f] text-[24px] font-semibold tracking-tight mt-1">
                    {details.jobTitle}
                  </h2>
                  <span className="text-[#1d1d1f] text-[17px] font-medium block mt-1">{details.company}</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-[14px]">
                  <div>
                    <span className="text-[#7a7a7a] block">Duration</span>
                    <span className="text-[#1d1d1f] font-medium">{details.duration} Minutes</span>
                  </div>
                  <div>
                    <span className="text-[#7a7a7a] block">Format</span>
                    <span className="text-[#1d1d1f] font-medium capitalize">{details.interviewType} Round</span>
                  </div>
                </div>
              </Card>

              {/* Account Conflict Alert */}
              {isLoggedIn && user && user.email.toLowerCase() !== details.candidateEmail.toLowerCase() && (
                <Card className="bg-[#ff9500]/10 border border-[#ff9500]/20 rounded-[18px] p-4 shadow-none">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-[#ff9500]/20 text-[#ff9500] mt-0.5 animate-pulse">
                      <AlertTriangle size={18} />
                    </div>
                    <div className="flex-1">
                      <span className="text-[#1d1d1f] text-[14px] font-semibold block text-left">Account Connection Conflict</span>
                      <span className="text-[#7a7a7a] text-[12px] block mt-1 leading-normal text-left">
                        You are currently signed in as <strong className="text-[#1d1d1f]">{user.name || user.email}</strong>. Starting this interview will automatically log you out of your current session and sign you in as the candidate <strong className="text-[#1d1d1f]">{details.candidateName}</strong>.
                      </span>
                    </div>
                  </div>
                </Card>
              )}

              {/* Checklist & Proctoring Consent */}
              <div className="space-y-4">
                <h3 className="text-[#1d1d1f] text-[17px] font-semibold px-1">Hardware & Security Checklist</h3>
                
                {/* Hardware Check */}
                <Card className="bg-white border border-[#e0e0e0] rounded-[18px] p-4 shadow-none">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${hasPermissions ? 'bg-[#34c759]/10 text-[#34c759]' : 'bg-[#0066cc]/10 text-[#0066cc]'}`}>
                        {hasPermissions ? <Check size={18} /> : <Camera size={18} />}
                      </div>
                      <div>
                        <span className="text-[#1d1d1f] text-[14px] font-semibold block">Camera & Microphone</span>
                        <span className="text-[#7a7a7a] text-[12px]">Verify browser audio/video input works</span>
                      </div>
                    </div>
                    {hasPermissions ? (
                      <span className="text-[#34c759] text-[14px] font-medium flex items-center gap-1">
                        <Check size={16} /> Verified
                      </span>
                    ) : (
                      <Button
                        onClick={requestHardwarePermissions}
                        disabled={isCheckingPermissions}
                        className="rounded-full bg-[#fafafc] text-[#1d1d1f] border border-[#e0e0e0] px-4 h-8 text-xs hover:bg-[#f0f0f0] transition-all active:scale-[0.95]"
                      >
                        {isCheckingPermissions ? "Testing..." : "Test Device"}
                      </Button>
                    )}
                  </div>
                </Card>

                {/* Privacy Consent */}
                <Card className="bg-white border border-[#e0e0e0] rounded-[18px] p-4 shadow-none">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-[#ff9500]/10 text-[#ff9500] mt-0.5">
                      <Shield size={18} />
                    </div>
                    <div className="flex-1">
                      <span className="text-[#1d1d1f] text-[14px] font-semibold block">Proctoring & Photo Verification</span>
                      <span className="text-[#7a7a7a] text-[12px] block mb-3">
                        Periodic camera snapshots will be taken randomly to verify your presence. Browser focus is monitored. All data is securely locked for recruitment evaluation only.
                      </span>
                      <label className="flex items-start gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={privacyConsent}
                          onChange={(e) => setPrivacyConsent(e.target.checked)}
                          className="w-4.5 h-4.5 rounded border-[#e0e0e0] text-[#0066cc] focus:ring-[#0066cc] mt-0.5"
                        />
                        <span className="text-[#1d1d1f] text-[13px] font-medium leading-tight">
                          I understand that this interview consists of <strong>{details.numberOfQuestions || 5} questions</strong> and is limited to a total of <strong>{details.duration || 30} minutes</strong>. I agree to manage my time accordingly and consent to secure camera and focus proctoring during the session.
                        </span>
                      </label>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Start Button */}
              <Button
                onClick={handleStartInterview}
                disabled={startInterviewMutation.isPending || !hasPermissions || !privacyConsent}
                className="w-full rounded-full bg-[#0066cc] text-white hover:bg-[#0071e3] py-6 h-12 text-[17px] font-medium transition-all active:scale-[0.95] disabled:opacity-50 disabled:pointer-events-none"
              >
                {startInterviewMutation.isPending ? "Preparing Workspace..." : "Start Official Interview"}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
