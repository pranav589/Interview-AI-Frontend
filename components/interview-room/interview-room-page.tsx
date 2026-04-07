"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/common/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, Loader2, FileText, Pause, Play } from "lucide-react";
import CameraFeed from "./camera-feed";
import AIAvatar from "./ai-avatar";
import TranscriptionChat, { ChatMessage } from "./transcription-chat";
import { useVoice } from "@/hooks/use-voice";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useInterviewDetails } from "@/hooks/use-interviews";

// Sub-components
import InterviewHeader from "./interview-header";
import InterviewSetupView from "./interview-setup-view";
import InterviewControls from "./interview-controls";
import InterviewModals from "./interview-modals";

export default function InterviewRoomPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      }
    >
      <InterviewRoomContent />
    </Suspense>
  );
}

function InterviewRoomContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const {
    data: interviewData,
    isLoading: isDetailsLoading,
    isError: isDetailsError,
  } = useInterviewDetails(id || "");

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isInterviewActive, setIsInterviewActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [aiState, setAiState] = useState<
    "idle" | "thinking" | "listening" | "speaking"
  >("idle");
  const [interviewTime, setInterviewTime] = useState(0);
  const [partialTranscript, setPartialTranscript] = useState("");
  const [feedback, setFeedback] = useState("");
  const [showStopModal, setShowStopModal] = useState(false);
  const [showTimeUpModal, setShowTimeUpModal] = useState(false);
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);
  const [permissionsError, setPermissionsError] = useState<string | null>(null);
  const [isCheckingPermissions, setIsCheckingPermissions] = useState(false);
  const [hasPermissions, setHasPermissions] = useState(false);
  const [isStartingInterview, setIsStartingInterview] = useState(false);

  const ws = useRef<WebSocket | null>(null);
  const threadId = useRef<string>(id || "");
  const { startRecording, stopRecording, volume } = useVoice();
  const isSpeakingRef = useRef(false);
  const isInterviewActiveRef = useRef(false);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (id) threadId.current = id;
  }, [id]);

  // Determine if this is a resume scenario
  const isResuming = interviewData?.status === "paused" || interviewData?.status === "in-progress";

  // Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isInterviewActive && !isPaused) {
      timer = setInterval(() => {
        setInterviewTime((prev) => {
          const next = prev + 1;
          const durationSeconds = (interviewData?.duration || 30) * 60;
          if (next >= durationSeconds) {
            clearInterval(timer);
            handleTimeUp();
            return durationSeconds;
          }
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isInterviewActive, isPaused, interviewData?.duration]);

  const handleTimeUp = () => {
    setIsInterviewActive(false);
    isInterviewActiveRef.current = false;
    ws.current?.close();
    ws.current = null;
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
    }
    setAiState("idle");
    stopRecording();
    setShowTimeUpModal(true);
  };

  const requestPermissions = async () => {
    setIsCheckingPermissions(true);
    setPermissionsError(null);
    try {
      const audioConstraints = {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        channelCount: 1,
        sampleRate: 16000,
      };

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: audioConstraints,
        video: isVideoEnabled,
      });
      stream.getTracks().forEach((track) => track.stop());
      setHasPermissions(true);
    } catch (err: any) {
      console.error("Permission check failed:", err);
      setHasPermissions(false);
      setPermissionsError(
        err.name === "NotAllowedError" || err.name === "PermissionDeniedError"
          ? "Camera and microphone access denied. Please enable them in your browser settings."
          : "Could not access camera/microphone. Please ensure they are connected.",
      );
    } finally {
      setIsCheckingPermissions(false);
    }
  };

  const speakText = (text: string) => {
    return new Promise<void>((resolve) => {
      if (typeof window === "undefined" || !window.speechSynthesis) {
        console.warn("Speech synthesis not supported");
        return resolve();
      }

      // Stop any current speaking
      window.speechSynthesis.cancel();
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current.currentTime = 0;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();

      // Try to find the best sounding neural voices
      const preferred =
        voices.find(
          (v) =>
            v.lang.startsWith("en") &&
            (v.name.includes("Google") ||
              v.name.includes("Neural") ||
              v.name.includes("Aria"))
        ) ||
        voices.find(
          (v) => v.lang.startsWith("en") && v.name.includes("Female")
        ) ||
        voices.find((v) => v.lang.startsWith("en-US")) ||
        voices[0];

      if (preferred) utterance.voice = preferred;
      
      // Fine-tune rate and pitch for a more natural feel
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      utterance.onstart = () => {
        isSpeakingRef.current = true;
        setAiState("speaking");
      };
      
      utterance.onend = () => {
        isSpeakingRef.current = false;
        setAiState("listening");
        resolve();
      };
      
      utterance.onerror = (e) => {
        if (e.error !== "interrupted" && e.error !== "canceled") {
          console.error("SpeechSynthesis Error:", e);
        }
        isSpeakingRef.current = false;
        setAiState("listening");
        resolve();
      };

      window.speechSynthesis.speak(utterance);
    });
  };

  const queryClient = useQueryClient();
  const feedbackMutation = useMutation({
    mutationFn: async ({ id, actualDuration }: { id: string; actualDuration: number }) =>
      await api.post<{ feedback: string }>("interview/feedback", {
        threadId: id,
        actualDuration,
      }),
    onSuccess: (data: any, variables: { id: string; actualDuration: number }) => {
      setFeedback(data.feedback.feedbackSummary || "No summary provided.");
      if (variables) {
        queryClient.invalidateQueries({ queryKey: ["interview", variables.id] });
        queryClient.invalidateQueries({ queryKey: ["interviews"] });
        queryClient.invalidateQueries({ queryKey: ["interview-stats"] });
      }
    },
  });

  // ---------- Pause / Resume Handler ----------
  const handleTogglePause = () => {
    if (isPaused) {
      // RESUME
      setIsPaused(false);

      // Tell backend to resume
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify({ type: "resume" }));
      }

      // Resume audio recording
      startRecording(ws.current);

      setAiState("listening");
      setMessages(prev => [...prev, {
        id: `sys-${Date.now()}`,
        speaker: "system",
        text: "Interview resumed. Continue when ready.",
      }]);
    } else {
      // PAUSE
      setIsPaused(true);

      // Stop TTS immediately
      window.speechSynthesis?.cancel();

      // Stop audio recording
      stopRecording();

      // Tell backend to pause (with current elapsed time)
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify({
          type: "pause",
          elapsedSeconds: interviewTime,
        }));
      }

      setAiState("idle");
      setMessages(prev => [...prev, {
        id: `sys-${Date.now()}`,
        speaker: "system",
        text: "Interview paused. Take your time.",
      }]);
    }
  };

  const handleStartInterview = async () => {
    if (!id || !interviewData) return toast.error("Interview data missing");
    if (permissionsError) return alert(permissionsError);
    setIsStartingInterview(true);

    const resuming = interviewData.status === "paused" || interviewData.status === "in-progress";

    try {
      setAiState("thinking");
      setMessages([
        {
          id: "init-1",
          speaker: "system",
          text: resuming ? "Reconnecting to your interview session..." : "Obtaining secure access ticket...",
        },
      ]);
      
      // 1. Get a one-time ticket for WS authentication
      const ticketData = await api.post<{ ticket: string }>("auth/ws-ticket");
      const ticket = ticketData.ticket;

      setMessages((prev) => [
        ...prev,
        {
          id: `init-${Date.now()}`,
          speaker: "system",
          text: "Ticket obtained. Connecting to interview server...",
        },
      ]);

      // 2. Connect with ticket as query param for cross-origin auth support
      const wsUrl = new URL(process.env.NEXT_PUBLIC_WS_URL!);
      wsUrl.searchParams.set("ticket", ticket);
      
      const socket = new WebSocket(wsUrl.toString());
      ws.current = socket;

      socket.onopen = () => {
        if (resuming) {
          // Send resume instead of start
          socket.send(JSON.stringify({ type: "resume", threadId: id }));
          // Initialize timer from saved elapsed time
          setInterviewTime(interviewData.elapsedSeconds || 0);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              id: `init-${Date.now()}`,
              speaker: "system",
              text: "Connected. Initializing interviewer...",
            },
          ]);
          socket.send(
            JSON.stringify({
              type: "start",
              threadId: id,
              resume: (interviewData as any).resume || "",
              numberOfQuestions: interviewData.numberOfQuestions ?? 5,
              interviewType: (interviewData as any).interviewType ?? "technical",
              difficultyLevel:
                (interviewData as any).difficultyLevel ?? "intermediate",
              jobTitle: (interviewData as any).jobTitle || "",
              company: (interviewData as any).company || "",
              customTopics: (interviewData as any).customTopics || "",
              jobDescription: (interviewData as any).jobDescription || "",
              companyStyle: (interviewData as any).companyStyle || "",
            }),
          );
        }
        startRecording(socket);
        setIsInterviewActive(true);
        isInterviewActiveRef.current = true;
        setIsStartingInterview(false);
      };

      socket.onmessage = async (e) => {
        const data = JSON.parse(e.data);
        if (data.type === "text") {
          setAiState("thinking");
          setMessages((prev) => [
            ...prev,
            { id: `ai-${Date.now()}`, speaker: "ai", text: data.content },
          ]);
          await speakText(data.content);
          
          if (data.isFinished) {
            // Graceful end: give a brief moment after TTS completes
            setMessages((prev) => [
              ...prev,
              {
                id: `sys-${Date.now()}`,
                speaker: "system",
                text: "Interview complete. Generating your feedback...",
              },
            ]);
            // Small delay so user can read the message
            await new Promise(resolve => setTimeout(resolve, 1500));
            // End interview and get feedback
            setIsInterviewActive(false);
            isInterviewActiveRef.current = false;
            stopRecording();
            setIsVideoEnabled(false);
            setIsMuted(true);
            ws.current?.close();
            ws.current = null;
            setAiState("idle");
            handleGetFeedbackAndRedirect();
          }
        } else if (data.type === "user_text") {
          setAiState("thinking");
          setPartialTranscript("");
          setMessages((prev) => [
            ...prev,
            { id: `user-${Date.now()}`, speaker: "user", text: data.content },
          ]);
        } else if (data.type === "partial_text") {
          setPartialTranscript(data.content);
        } else if (data.type === "paused") {
          // Backend confirmed pause
          toast.info("Interview paused");
        } else if (data.type === "resumed") {
          // Backend confirmed resume — transcriber is ready
          toast.success("Interview resumed");
        } else if (data.type === "history") {
          // Load existing conversation from paused session
          const historicalMessages: ChatMessage[] = data.messages
            .filter((m: any) => m.text && m.text !== "Start the interview.")
            .map((m: any, i: number) => ({
              id: `history-${i}`,
              speaker: m.role === "human" ? "user" : "ai",
              text: m.text,
            }));

          setMessages(prev => [
            ...prev,
            ...historicalMessages,
            {
              id: `sys-${Date.now()}`,
              speaker: "system",
              text: "Previous conversation restored. Ready to continue.",
            },
          ]);
        } else if (data.type === "error") {
          setMessages((prev) => [
            ...prev,
            {
              id: `err-${Date.now()}`,
              speaker: "system",
              text: `⚠️ ${data.message}`,
            },
          ]);
          toast.error(data.message);
        }
      };
      socket.onclose = () => {
        if (isInterviewActiveRef.current) {
          setIsInterviewActive(false);
          isInterviewActiveRef.current = false;
          window.speechSynthesis?.cancel();
          stopRecording();
          setShowDisconnectModal(true);
        }
      };
      socket.onerror = () => {
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            speaker: "system",
            text: "Connection failed. Please check if the backend is running on port 3001.",
          },
        ]);
        setAiState("idle");
        setIsInterviewActive(false);
        setIsStartingInterview(false);
      };
    } catch (err) {
      setIsStartingInterview(false);
    }
  };

  const confirmStop = async () => {
    setShowStopModal(false);
    window.speechSynthesis?.cancel();
    stopRecording();
    setIsVideoEnabled(false);
    setIsMuted(true);
    setHasPermissions(false);
    setIsInterviewActive(false);
    isInterviewActiveRef.current = false;
    ws.current?.close();
    ws.current = null;
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
    }
    setAiState("idle");

    handleGetFeedbackAndRedirect();
  };

  const handleGetFeedbackAndRedirect = () => {
    toast.promise(feedbackMutation.mutateAsync({ id: id || threadId.current, actualDuration: Math.ceil(interviewTime / 60) }), {
      loading: "Analyzing your interview session...",
      success: () => {
        router.push(`/interview/${id}`);
        return "Interview completed! Your feedback is ready.";
      },
      error: () => {
        router.push("/dashboard");
        return "Session ended, but feedback generation failed.";
      },
    });
  };

  useEffect(() => {
    return () => {
      stopRecording();
      ws.current?.close();
      window.speechSynthesis?.cancel();
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
      }
    };
  }, [stopRecording]);

  if (isDetailsLoading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  if (isDetailsError || (!id && !isDetailsLoading))
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center text-destructive mb-6">
          <AlertCircle size={32} />
        </div>
        <h1 className="text-2xl font-bold mb-2">Interview Session Not Found</h1>
        <p className="text-muted-foreground mb-8 max-w-md">
          We couldn&apos;t find the interview session you&apos;re looking for.
        </p>
        <Link href="/interview-setup">
          <Button>Back to Setup</Button>
        </Link>
      </div>
    );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <motion.main
        id="main-content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="px-4 py-6 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto">
          <InterviewHeader
            isInterviewActive={isInterviewActive}
            hasMessages={messages.length > 0}
            id={id}
            interviewData={interviewData}
            interviewTime={interviewTime}
            onGetFeedback={() => feedbackMutation.mutate({ id: threadId.current, actualDuration: Math.ceil(interviewTime / 60) })}
          />

          <AnimatePresence mode="wait">
            {!isInterviewActive && messages.length === 0 ? (
              <InterviewSetupView
                interviewData={interviewData}
                isCheckingPermissions={isCheckingPermissions}
                hasPermissions={hasPermissions}
                permissionsError={permissionsError}
                isStartingInterview={isStartingInterview}
                isResuming={isResuming}
                onRequestPermissions={requestPermissions}
                onStartInterview={handleStartInterview}
                onResetPermissions={() => setHasPermissions(false)}
              />
            ) : (
              <motion.div
                key="interview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8 h-full flex flex-col gap-4"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[400px]">
                  <AIAvatar
                    isThinking={aiState === "thinking"}
                    isListening={aiState === "listening"}
                    isSpeaking={aiState === "speaking"}
                    volume={volume}
                  />
                  <CameraFeed
                    isMuted={isMuted}
                    isVideoEnabled={false}
                  />
                </div>
                <div className="min-h-[350px] ">
                  <TranscriptionChat
                    messages={messages}
                    partialTranscript={partialTranscript}
                    isTranscribing={
                      aiState === "thinking" && !partialTranscript
                    }
                  />
                </div>
                <InterviewControls
                  isMuted={isMuted}
                  isVideoEnabled={isVideoEnabled}
                  isPaused={isPaused}
                  onToggleMute={() => setIsMuted(!isMuted)}
                  onToggleVideo={() => setIsVideoEnabled(!isVideoEnabled)}
                  onTogglePause={handleTogglePause}
                  onEndInterview={() => setShowStopModal(true)}
                />
                {feedback && (
                  <Card className="bg-emerald-500/10 border-emerald-200 dark:border-emerald-800">
                    <CardHeader className="py-4 font-bold text-emerald-600 flex flex-row items-center gap-2">
                      <FileText className="w-5 h-5" /> Interview Feedback
                    </CardHeader>
                    <CardContent className="py-6 italic text-muted-foreground whitespace-pre-wrap leading-relaxed">
                      {typeof feedback === "string"
                        ? feedback
                        : (feedback as any).feedbackSummary}
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.main>

      {/* Pause Overlay */}
      <AnimatePresence>
        {isPaused && isInterviewActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card border rounded-2xl p-12 text-center shadow-xl max-w-md"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                <Pause className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Interview Paused</h2>
              <p className="text-muted-foreground mb-6">
                Take a break. Your progress is saved. Click Resume when you&apos;re ready to continue.
              </p>
              <p className="text-sm text-muted-foreground mb-8">
                Time elapsed: {Math.floor(interviewTime / 60)}:{String(interviewTime % 60).padStart(2, '0')}
              </p>
              <Button size="lg" onClick={handleTogglePause} className="gap-2 w-full">
                <Play className="w-5 h-5" />
                Resume Interview
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <InterviewModals
        showStopModal={showStopModal}
        showTimeUpModal={showTimeUpModal}
        showDisconnectModal={showDisconnectModal}
        onCloseStop={() => setShowStopModal(false)}
        onConfirmStop={confirmStop}
        onCloseTimeUp={() => {
          setShowTimeUpModal(false);
          handleGetFeedbackAndRedirect();
        }}
        onCloseDisconnect={() => {
          setShowDisconnectModal(false);
          router.push("/dashboard");
        }}
      />
    </div>
  );
}
