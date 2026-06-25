"use client";

import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Mic, MicOff, Video, VideoOff, Shield } from "lucide-react";
import { api } from "@/lib/api";

interface CameraFeedProps {
  isMuted: boolean;
  isVideoEnabled: boolean;
  interviewId?: string;
  isProctoringEnabled?: boolean;
  isInterviewActive?: boolean;
  isPaused?: boolean;
  onVideoUploadStart?: () => void;
  onVideoUploadComplete?: (success: boolean) => void;
}

export default function CameraFeed({
  isMuted,
  isVideoEnabled,
  interviewId,
  isProctoringEnabled = false,
  isInterviewActive = false,
  isPaused = false,
  onVideoUploadStart,
  onVideoUploadComplete,
}: CameraFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [isRecorderReady, setIsRecorderReady] = useState(false);

  useEffect(() => {
    let isCancelled = false;
    let localStream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        const audioConstraints = {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
          sampleRate: 16000,
        };

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 } },
          audio: audioConstraints,
        });

        if (isCancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        localStream = stream;
        streamRef.current = stream;

        // Set initial track states
        stream.getAudioTracks().forEach((track) => {
          track.enabled = !isMuted;
        });
        stream.getVideoTracks().forEach((track) => {
          track.enabled = isVideoEnabled;
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        // Set up Web Audio API mixing for system + microphone audio
        try {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          const audioContext = new AudioContextClass();
          const dest = audioContext.createMediaStreamDestination();

          const micSource = audioContext.createMediaStreamSource(stream);
          micSource.connect(dest);

          (window as any).ttsAudioContext = audioContext;
          (window as any).ttsAudioDestination = dest;

          // Mix camera video tracks with AudioContext destination audio tracks
          const mixedStream = new MediaStream();
          stream.getVideoTracks().forEach((track) => mixedStream.addTrack(track));
          dest.stream.getAudioTracks().forEach((track) => mixedStream.addTrack(track));

          let mimeType = "video/webm;codecs=vp8";
          if (typeof MediaRecorder !== "undefined") {
            if (!MediaRecorder.isTypeSupported(mimeType)) {
              mimeType = "video/webm";
              if (!MediaRecorder.isTypeSupported(mimeType)) {
                mimeType = "video/mp4";
              }
            }
          }

          const options = { mimeType };
          const recorder = new MediaRecorder(mixedStream, options);
          mediaRecorderRef.current = recorder;
          chunksRef.current = [];
          setIsRecorderReady(true);

          recorder.ondataavailable = (event) => {
            if (event.data && event.data.size > 0) {
              chunksRef.current.push(event.data);
            }
          };

          recorder.onstop = async () => {
            if (chunksRef.current.length === 0) return;
            const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
            const extension = recorder.mimeType.includes("mp4") ? "mp4" : "webm";
            const file = new File([blob], `interview-${interviewId}.${extension}`, { type: recorder.mimeType });
            
            const formData = new FormData();
            formData.append("video", file);

            if (onVideoUploadStart) {
              onVideoUploadStart();
            }

            try {
              await api.post(`interview/${interviewId}/video`, formData, {
                headers: {
                  "Content-Type": "multipart/form-data",
                },
              });
              console.log("[VideoRecorder] Video uploaded successfully");
              if (onVideoUploadComplete) {
                onVideoUploadComplete(true);
              }
            } catch (err) {
              console.error("[VideoRecorder] Failed to upload video:", err);
              if (onVideoUploadComplete) {
                onVideoUploadComplete(false);
              }
            }
          };
        } catch (err) {
          console.error("[VideoRecorder] Error setting up audio mixing context:", err);
        }
      } catch (error) {
        if (!isCancelled) {
          console.error("Error accessing camera:", error);
        }
      }
    };

    startCamera();

    return () => {
      isCancelled = true;
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        try {
          mediaRecorderRef.current.stop();
        } catch (err) {
          console.error("Error stopping recorder:", err);
        }
      }
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      // Clean up global references
      if ((window as any).ttsAudioContext) {
        try {
          (window as any).ttsAudioContext.close();
        } catch (e) {}
        delete (window as any).ttsAudioContext;
      }
      delete (window as any).ttsAudioDestination;
    };
  }, []); // Run once on mount

  // Handle dynamic changes to mute and video status by modifying track state
  useEffect(() => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !isMuted;
      });
    }
  }, [isMuted]);

  useEffect(() => {
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = isVideoEnabled;
      });
    }
  }, [isVideoEnabled]);

  // Handle start, pause, resume, and stop events of the MediaRecorder based on interview lifecycle
  useEffect(() => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || !interviewId || !isProctoringEnabled || !isRecorderReady) return;

    if (isInterviewActive && !isPaused) {
      if (recorder.state === "inactive") {
        chunksRef.current = [];
        // Resume AudioContext if browser autoplay policy suspended it
        const audioContext = (window as any).ttsAudioContext as AudioContext;
        if (audioContext && audioContext.state === "suspended") {
          audioContext.resume();
        }
        recorder.start(1000);
        console.log("[VideoRecorder] Recording started");
      } else if (recorder.state === "paused") {
        recorder.resume();
        console.log("[VideoRecorder] Recording resumed");
      }
    } else if (isInterviewActive && isPaused) {
      if (recorder.state === "recording") {
        recorder.pause();
        console.log("[VideoRecorder] Recording paused");
      }
    } else if (!isInterviewActive) {
      if (recorder.state === "recording" || recorder.state === "paused") {
        recorder.stop();
        console.log("[VideoRecorder] Recording stopped");
      }
    }
  }, [isProctoringEnabled, isInterviewActive, isPaused, interviewId, isRecorderReady]);

  // Proctoring: Capturing snapshots and window focus events
  useEffect(() => {
    if (!isProctoringEnabled || !interviewId) return;

    let active = true;
    let timer: NodeJS.Timeout;

    const captureAndUpload = async (trigger: "random" | "tab-switch" | "start" | "finish") => {
      if (!active) return;
      const video = videoRef.current;
      if (!video) return;

      if (video.readyState < 2) {
        // If video is not ready, wait for playing event or retry after 1s
        const handlePlay = () => {
          video.removeEventListener("playing", handlePlay);
          clearTimeout(retryTimeout);
          captureAndUpload(trigger);
        };
        const retryTimeout = setTimeout(() => {
          video.removeEventListener("playing", handlePlay);
          captureAndUpload(trigger);
        }, 1000);
        video.addEventListener("playing", handlePlay);
        return;
      }

      try {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const base64Image = canvas.toDataURL("image/jpeg", 0.5); // Compress to keep size low (50% quality)

        await api.post(`interview/${interviewId}/snapshot`, {
          image: base64Image,
          trigger,
        });
        
        console.log(`[Proctor] Snapshot uploaded with trigger: ${trigger}`);
      } catch (err) {
        console.error("[Proctor] Failed to capture snapshot:", err);
      }
    };

    const logEvent = async (event: string, details: string) => {
      try {
        await api.post(`interview/${interviewId}/proctor-log`, { event, details });
      } catch (err) {
        console.error("[Proctor] Failed to write proctor log:", err);
      }
    };

    // Schedule random snapshots
    const scheduleNext = () => {
      const delay = Math.floor(Math.random() * (240000 - 120000 + 1)) + 120000; // 2 to 4 minutes
      timer = setTimeout(async () => {
        if (!active) return;
        await captureAndUpload("random");
        scheduleNext();
      }, delay);
    };

    // Trigger initial "start" snapshot
    captureAndUpload("start");
    logEvent("interview_start", "Candidate started the proctored interview session.");

    scheduleNext();

    // Listen to visibility changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        logEvent("tab_switch", "Candidate switched tabs or minimized the window.");
      }
    };

    // Listen to fullscreen changes
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        logEvent("fullscreen_exit", "Candidate exited fullscreen mode.");
      }
    };

    // Listen to clipboard copy/paste
    const handleCopy = () => {
      logEvent("clipboard_copy", "Candidate attempted copy operation.");
    };

    const handlePaste = () => {
      logEvent("clipboard_paste", "Candidate attempted paste operation.");
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("copy", handleCopy);
    document.addEventListener("paste", handlePaste);

    return () => {
      captureAndUpload("finish");
      active = false;
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("paste", handlePaste);
      logEvent("session_suspended", "Proctored session suspended or paused.");
    };
  }, [isProctoringEnabled, interviewId]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="h-full max-h-[400px]"
    >
      <Card
        className="h-full overflow-hidden relative bg-muted border-hairline shadow-none rounded-3xl"
        aria-label="Your live camera feed"
      >
        {isProctoringEnabled && (
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-yellow-500 text-black px-3 py-1.5 rounded-full text-[10px] uppercase font-bold tracking-widest border border-yellow-600 shadow-md">
            <Shield className="w-3.5 h-3.5 animate-pulse" />
            <span>Proctored Mode Active</span>
          </div>
        )}
        {isVideoEnabled ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            aria-label="Candidate camera preview"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center flex-col gap-4 bg-muted">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-6xl"
            >
              📹
            </motion.div>
            <p className="text-muted-foreground">Camera is disabled</p>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="absolute top-4 right-4 flex gap-2"
        >
          {isProctoringEnabled && isInterviewActive && !isPaused && (
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="flex items-center gap-2 bg-destructive text-white px-3 py-1.5 rounded-full text-xs font-semibold"
            >
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              Recording
            </motion.div>
          )}
          {isMuted && (
            <div className="bg-surface-chip-translucent backdrop-blur-md text-ink px-3 py-1.5 rounded-full flex items-center gap-2 text-xs font-semibold border border-white/20">
              <MicOff className="w-3.5 h-3.5" />
              <span>Muted</span>
            </div>
          )}
        </motion.div>
      </Card>
    </motion.div>
  );
}
