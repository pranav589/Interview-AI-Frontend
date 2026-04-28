"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/common/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, FileText, Pause, Play, Code2 } from "lucide-react";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import { ChatMessage } from "./transcription-chat";
import { useVoice } from "@/hooks/use-voice";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { MESSAGES } from "@/lib/constants";
import { api } from "@/lib/api";
import { useInterviewDetails } from "@/hooks/use-interviews";
import { useFeatureFlags } from "@/lib/feature-flags-context";

// Sub-components
import InterviewHeader from "./interview-header";
import InterviewSetupView from "./interview-setup-view";
import InterviewControls from "./interview-controls";
import InterviewModals from "./interview-modals";

const CodingEditor = dynamic(() => import("./coding-editor"), {
  ssr: false,
  loading: () => <Skeleton className="h-[500px] w-full rounded-2xl" />,
});

const AIAvatar = dynamic(() => import("./ai-avatar"), {
  ssr: false,
  loading: () => <Skeleton className="rounded-2xl h-full" />,
});

const CameraFeed = dynamic(() => import("./camera-feed"), {
  ssr: false,
  loading: () => <Skeleton className="rounded-2xl h-full" />,
});

const TranscriptionChat = dynamic(() => import("./transcription-chat"), {
  ssr: false,
  loading: () => <Skeleton className="h-[400px] w-full rounded-2xl" />,
});

export default function InterviewRoomPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background">
          <Navbar />
          <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 space-y-8">
            <div className="flex justify-between items-center">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-10 w-32" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[400px]">
              <Skeleton className="rounded-2xl h-full" />
              <Skeleton className="rounded-2xl h-full" />
            </div>
            <Skeleton className="h-[400px] w-full rounded-2xl" />
          </div>
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
  const { isFeatureEnabled } = useFeatureFlags();

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
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);
  const [permissionsError, setPermissionsError] = useState<string | null>(null);
  const [isCheckingPermissions, setIsCheckingPermissions] = useState(false);
  const [hasPermissions, setHasPermissions] = useState(false);
  const [isStartingInterview, setIsStartingInterview] = useState(false);

  // Coding Mode States
  const [isCodingMode, setIsCodingMode] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState("javascript");
  const [code, setCode] = useState("");

  const ws = useRef<WebSocket | null>(null);
  const threadId = useRef<string>(id || "");
  const { startRecording, stopRecording, volume } = useVoice({
    isMuted: isMuted || aiState === "speaking",
  });
  const isSpeakingRef = useRef(false);
  const isInterviewActiveRef = useRef(false);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const speechQueueRef = useRef<{ text: string; url: string }[]>([]);
  const isProcessingQueueRef = useRef(false);

  useEffect(() => {
    if (id) threadId.current = id;
  }, [id]);

  // Determine if this is a resume scenario
  const isResuming =
    interviewData?.status === "paused" ||
    interviewData?.status === "in-progress";

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

  const waitForAISpeech = async () => {
    // Small buffer to allow any pending speech to initialize
    await new Promise((resolve) => setTimeout(resolve, 500));
    while (
      isProcessingQueueRef.current ||
      isSpeakingRef.current ||
      speechQueueRef.current.length > 0
    ) {
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  };

  const handleTimeUp = async () => {
    isInterviewActiveRef.current = false;
    stopRecording();
    await waitForAISpeech();

    setIsInterviewActive(false);
    ws.current?.close();
    ws.current = null;

    setAiState("idle");
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
          ? MESSAGES.INTERVIEW_ROOM.PERMISSION_DENIED
          : MESSAGES.INTERVIEW_ROOM.PERMISSION_ERROR,
      );
    } finally {
      setIsCheckingPermissions(false);
    }
  };

  const processSpeechQueue = async () => {
    if (!isFeatureEnabled("tts_enabled")) {
      speechQueueRef.current = [];
      setAiState("listening");
      if (ws.current?.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify({ type: "speech_finished" }));
      }
      return;
    }

    if (isProcessingQueueRef.current) return;
    if (speechQueueRef.current.length === 0) {
      setAiState("listening");
      return;
    }

    isProcessingQueueRef.current = true;

    while (speechQueueRef.current.length > 0) {
      const item = speechQueueRef.current[0]; // Peek
      if (!item) break;

      // Ensure this item has an audio object
      if (!(item as any).audio) {
        (item as any).audio = new Audio(item.url);
        (item as any).audio.preload = "auto";
      }

      const audio = (item as any).audio as HTMLAudioElement;
      currentAudioRef.current = audio;

      // Start pre-loading the NEXT chunk immediately
      const nextItem = speechQueueRef.current[1];
      if (nextItem && !(nextItem as any).audio) {
        (nextItem as any).audio = new Audio(nextItem.url);
        (nextItem as any).audio.preload = "auto";
      }

      await new Promise<void>((resolve) => {
        audio.onplay = () => {
          isSpeakingRef.current = true;
          setAiState("speaking");
        };

        audio.onended = () => {
          isSpeakingRef.current = false;
          currentAudioRef.current = null;
          speechQueueRef.current.shift(); // Remove after completion
          resolve();
        };

        audio.onerror = (e) => {
          console.error("TTS Audio Error:", e);
          isSpeakingRef.current = false;
          currentAudioRef.current = null;
          speechQueueRef.current.shift();
          resolve();
        };

        audio.play().catch((err) => {
          if (err.name !== "AbortError") {
            console.error("Audio Playback Failed:", err);
          }
          isSpeakingRef.current = false;
          currentAudioRef.current = null;
          speechQueueRef.current.shift();
          resolve();
        });
      });
    }

    isProcessingQueueRef.current = false;
    setAiState("listening");

    // Signal potential backend mic-lock to release
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type: "speech_finished" }));
    }
  };

  const speakText = (text: string) => {
    // Strip markdown for cleaner TTS
    const cleanText = text
      .replace(/\*\*/g, "")
      .replace(/\*/g, "")
      .replace(/#{1,6}\s/g, "")
      .replace(/`{1,3}/g, "")
      .trim();

    if (!cleanText) return Promise.resolve();

    // Split into sentences for lower perceived latency
    const sentences = cleanText.match(/[^.!?]+[.!?]+(?=\s|$)|[^.!?]+$/g) || [
      cleanText,
    ];

    const baseUrl =
      process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
      "http://localhost:3001/api/v1";

    sentences.forEach((s) => {
      const trimmed = s.trim();
      if (trimmed) {
        const ttsUrl = `${baseUrl}/tts?text=${encodeURIComponent(trimmed)}`;
        speechQueueRef.current.push({ text: trimmed, url: ttsUrl });
      }
    });

    processSpeechQueue();
    return Promise.resolve();
  };

  const queryClient = useQueryClient();
  const feedbackMutation = useMutation({
    mutationFn: async ({
      id,
      actualDuration,
    }: {
      id: string;
      actualDuration: number;
    }) =>
      await api.post<{ feedback: string }>("interview/feedback", {
        threadId: id,
        actualDuration,
      }),
    onSuccess: (
      data: any,
      variables: { id: string; actualDuration: number },
    ) => {
      setFeedback(data.feedback.feedbackSummary || "No summary provided.");
      if (variables) {
        queryClient.invalidateQueries({
          queryKey: ["interview", variables.id],
        });
        queryClient.invalidateQueries({ queryKey: ["interviews"] });
        queryClient.invalidateQueries({ queryKey: ["interview-stats"] });
      }
    },
  });

  const handleTogglePause = () => {
    if (isPaused) {
      setIsPaused(false);
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify({ type: "resume" }));
      }
      startRecording(ws.current);
      setAiState("listening");
      setMessages((prev) => [
        ...prev,
        {
          id: `sys-${Date.now()}`,
          speaker: "system",
          text: MESSAGES.INTERVIEW_ROOM.RESUMED,
        },
      ]);
    } else {
      setIsPaused(true);
      speechQueueRef.current = [];
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current.src = ""; // Force stop download
        currentAudioRef.current = null;
      }
      stopRecording();
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(
          JSON.stringify({
            type: "pause",
            elapsedSeconds: interviewTime,
          }),
        );
      }
      setAiState("idle");
      setMessages((prev) => [
        ...prev,
        {
          id: `sys-${Date.now()}`,
          speaker: "system",
          text: MESSAGES.INTERVIEW_ROOM.PAUSED,
        },
      ]);
    }
  };

  const handleStartInterview = async () => {
    if (!id || !interviewData)
      return toast.error(MESSAGES.INTERVIEW.DATA_MISSING);
    if (permissionsError) return alert(permissionsError);
    setIsStartingInterview(true);

    const resuming =
      interviewData.status === "paused" ||
      interviewData.status === "in-progress";

    try {
      setAiState("thinking");
      setMessages([
        {
          id: "init-1",
          speaker: "system",
          text: resuming
            ? MESSAGES.INTERVIEW_ROOM.RECONNECTING
            : MESSAGES.INTERVIEW_ROOM.GETTING_TICKET,
        },
      ]);

      const ticketData = await api.post<{ ticket: string }>("auth/ws-ticket");
      const ticket = ticketData.ticket;

      setMessages((prev) => [
        ...prev,
        {
          id: `init-${Date.now()}`,
          speaker: "system",
          text: MESSAGES.INTERVIEW_ROOM.TICKET_OBTAINED,
        },
      ]);

      const wsUrl = new URL(process.env.NEXT_PUBLIC_WS_URL!);
      wsUrl.searchParams.set("ticket", ticket);

      const socket = new WebSocket(wsUrl.toString());
      ws.current = socket;

      socket.onopen = () => {
        if (resuming) {
          socket.send(JSON.stringify({ type: "resume", threadId: id }));
          setInterviewTime(interviewData.elapsedSeconds || 0);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              id: `init-${Date.now()}`,
              speaker: "system",
              text: MESSAGES.INTERVIEW_ROOM.CONNECTED,
            },
          ]);
          socket.send(
            JSON.stringify({
              type: "start",
              threadId: id,
              resume: (interviewData as any).resume || "",
              numberOfQuestions: interviewData.numberOfQuestions ?? 5,
              interviewType:
                (interviewData as any).interviewType ?? "technical",
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
          // RESPECT the backend's decision on coding mode instead of forcing it false
          if (data.isCodingMode !== undefined) {
            setIsCodingMode(!!data.isCodingMode);
          }

          setAiState("thinking");
          setMessages((prev) => [
            ...prev,
            { id: `ai-${Date.now()}`, speaker: "ai", text: data.content },
          ]);
          await speakText(data.content);

          if (data.isFinished) {
            setMessages((prev) => [
              ...prev,
              {
                id: `sys-${Date.now()}`,
                speaker: "system",
                text: MESSAGES.INTERVIEW_ROOM.COMPLETE,
              },
            ]);

            // Wait for AI to finish speaking before showing complete modal
            await waitForAISpeech();

            setIsInterviewActive(false);
            isInterviewActiveRef.current = false;
            stopRecording();
            setIsVideoEnabled(false);
            setIsMuted(true);
            ws.current?.close();
            ws.current = null;
            setAiState("idle");
            setShowCompleteModal(true);
          }
        } else if (data.type === "coding_question") {
          setIsCodingMode(true);
          setCurrentLanguage(data.language || "javascript");
          // Only update code if it's explicitly provided and non-empty
          if (data.initialCode) {
            setCode(data.initialCode);
          }
          setAiState("thinking");

          setMessages((prev) => [
            ...prev,
            {
              id: `ai-code-${Date.now()}`,
              speaker: "ai",
              text: data.questionText,
            },
          ]);
          await speakText(data.questionText);
        } else if (data.type === "user_text") {
          // The backend may wait (silence-gate) before invoking the AI.
          // Keep UI in listening state until we actually receive the AI response.
          setAiState("listening");
          setPartialTranscript("");
          setMessages((prev) => [
            ...prev,
            { id: `user-${Date.now()}`, speaker: "user", text: data.content },
          ]);
        } else if (data.type === "partial_text") {
          setAiState("listening");
          setPartialTranscript(data.content);
        } else if (data.type === "paused") {
          toast.info("Interview paused");
        } else if (data.type === "resumed") {
          toast.success("Interview resumed");
        } else if (data.type === "history") {
          const historicalMessages: ChatMessage[] = data.messages
            .filter((m: any) => m.text && m.text !== "Start the interview.")
            .map((m: any, i: number) => ({
              id: `history-${i}`,
              speaker: m.role === "human" ? "user" : "ai",
              text: m.text,
            }));

          setMessages((prev) => [
            ...prev,
            ...historicalMessages,
            {
              id: `sys-${Date.now()}`,
              speaker: "system",
              text: MESSAGES.INTERVIEW_ROOM.PREVIOUS_RESTORED,
            },
          ]);

          if (data.isCodingMode) {
            setIsCodingMode(true);
          }
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
          speechQueueRef.current = [];
          if (currentAudioRef.current) {
            currentAudioRef.current.pause();
            currentAudioRef.current.src = "";
            currentAudioRef.current = null;
          }
          isProcessingQueueRef.current = false;
          isSpeakingRef.current = false;
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
            text: MESSAGES.INTERVIEW_ROOM.CONNECTION_FAILED,
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
    speechQueueRef.current = [];
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.src = "";
      currentAudioRef.current = null;
    }
    isProcessingQueueRef.current = false;
    isSpeakingRef.current = false;
    stopRecording();
    setIsVideoEnabled(false);
    setIsMuted(true);
    setHasPermissions(false);
    setIsInterviewActive(false);
    isInterviewActiveRef.current = false;
    ws.current?.close();
    ws.current = null;
    setAiState("idle");

    handleGetFeedbackAndRedirect();
  };

  const handleGetFeedbackAndRedirect = () => {
    toast.promise(
      feedbackMutation.mutateAsync({
        id: id || threadId.current,
        actualDuration: Math.ceil(interviewTime / 60),
      }),
      {
        loading: "Analyzing your interview session...",
        success: () => {
          router.push(`/interview/${id}`);
          return "Interview completed! Your feedback is ready.";
        },
        error: () => {
          router.push("/dashboard");
          return "Session ended, but feedback generation failed.";
        },
      },
    );
  };

  const handleSubmitCode = async (submittedCode: string, language: string) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(
        JSON.stringify({
          type: "code_submission",
          content: submittedCode,
          language: language,
        }),
      );

      setMessages((prev) => [
        ...prev,
        {
          id: `submit-${Date.now()}`,
          speaker: "user",
          text: `🚀 [Submitted ${language} Code]`,
        },
      ]);

      toast.success("Code submitted for evaluation");
    }
  };

  useEffect(() => {
    return () => {
      stopRecording();
      ws.current?.close();
      speechQueueRef.current = [];
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
      }
    };
  }, [stopRecording]);

  if (isDetailsLoading)
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 space-y-8">
          <div className="flex justify-between items-center">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[400px]">
            <Skeleton className="rounded-2xl h-full" />
            <Skeleton className="rounded-2xl h-full" />
          </div>
          <Skeleton className="h-[400px] w-full rounded-2xl" />
        </div>
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
            onGetFeedback={() =>
              feedbackMutation.mutate({
                id: threadId.current,
                actualDuration: Math.ceil(interviewTime / 60),
              })
            }
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
                <div className="flex flex-col gap-6">
                  {isCodingMode ? (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:h-[750px]">
                      <div className="lg:col-span-8 flex flex-col gap-4 order-2 lg:order-1 h-full">
                        <div className="flex-1 min-h-0">
                          <CodingEditor
                            initialLanguage={currentLanguage}
                            onSubmit={handleSubmitCode}
                          />
                        </div>
                      </div>
                      <div className="lg:col-span-4 flex flex-col gap-6 order-1 lg:order-2 h-full overflow-hidden">
                        <div className="aspect-video lg:h-48 flex-shrink-0">
                          <AIAvatar
                            isThinking={aiState === "thinking"}
                            isListening={aiState === "listening"}
                            isSpeaking={aiState === "speaking"}
                            volume={volume}
                          />
                        </div>
                        <div className="aspect-video lg:h-50 flex-shrink-0">
                          <CameraFeed
                            isMuted={isMuted}
                            isVideoEnabled={isVideoEnabled}
                          />
                        </div>
                        <div className="flex-1 min-h-0 overflow-hidden">
                          <TranscriptionChat
                            messages={messages}
                            partialTranscript={partialTranscript}
                            isTranscribing={
                              aiState === "thinking" && !partialTranscript
                            }
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <AIAvatar
                          isThinking={aiState === "thinking"}
                          isListening={aiState === "listening"}
                          isSpeaking={aiState === "speaking"}
                          volume={volume}
                        />
                        <CameraFeed
                          isMuted={isMuted}
                          isVideoEnabled={isVideoEnabled}
                        />
                      </div>
                      <div className="h-[500px]">
                        <TranscriptionChat
                          messages={messages}
                          partialTranscript={partialTranscript}
                          isTranscribing={
                            aiState === "thinking" && !partialTranscript
                          }
                        />
                      </div>
                    </div>
                  )}
                </div>
                <InterviewControls
                  isMuted={isMuted}
                  isVideoEnabled={isVideoEnabled}
                  isPaused={isPaused}
                  isCodingMode={isCodingMode}
                  onToggleMute={() => setIsMuted(!isMuted)}
                  onToggleVideo={() => setIsVideoEnabled(!isVideoEnabled)}
                  onTogglePause={handleTogglePause}
                  onToggleCodingMode={() => setIsCodingMode(!isCodingMode)}
                  onEndInterview={() => setShowStopModal(true)}
                  isCodingEnabled={isFeatureEnabled("coding_mode_enabled")}
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
            className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm flex items-center justify-center"
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
                Take a break. Your progress is saved. Click Resume when
                you&apos;re ready to continue.
              </p>
              <p className="text-sm text-muted-foreground mb-8">
                Time elapsed: {Math.floor(interviewTime / 60)}:
                {String(interviewTime % 60).padStart(2, "0")}
              </p>
              <Button
                size="lg"
                onClick={handleTogglePause}
                className="gap-2 w-full"
              >
                <Play className="w-5 h-5" />
                Resume Interview
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {(showStopModal ||
        showTimeUpModal ||
        showCompleteModal ||
        showDisconnectModal) && (
        <InterviewModals
          showStopModal={showStopModal}
          showTimeUpModal={showTimeUpModal}
          showCompleteModal={showCompleteModal}
          showDisconnectModal={showDisconnectModal}
          onCloseStop={() => setShowStopModal(false)}
          onConfirmStop={confirmStop}
          onCloseTimeUp={() => {
            setShowTimeUpModal(false);
            handleGetFeedbackAndRedirect();
          }}
          onCloseComplete={() => {
            setShowCompleteModal(false);
            handleGetFeedbackAndRedirect();
          }}
          onCloseDisconnect={() => {
            setShowDisconnectModal(false);
            router.push("/dashboard");
          }}
        />
      )}
    </div>
  );
}
