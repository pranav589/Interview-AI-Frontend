"use client";

import { useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Mic, MicOff, Video, VideoOff } from "lucide-react";

interface CameraFeedProps {
  isMuted: boolean;
  isVideoEnabled: boolean;
}

export default function CameraFeed({
  isMuted,
  isVideoEnabled,
}: CameraFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    let isCancelled = false;
    let localStream: MediaStream | null = null;

    if (!isVideoEnabled) return;

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
          audio: isMuted ? false : audioConstraints,
        });

        if (isCancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        localStream = stream;
        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
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
    };
  }, [isVideoEnabled, isMuted]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="h-full max-h-[400px]"
    >
      <Card
        className="h-full overflow-hidden relative bg-black"
        aria-label="Your live camera feed"
      >
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
          {isVideoEnabled && (
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="flex items-center gap-2 bg-red-500/80 text-white px-3 py-1.5 rounded-full text-sm font-medium"
            >
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              Recording
            </motion.div>
          )}
          {isMuted && (
            <div className="bg-gray-800/80 text-white px-3 py-1.5 rounded-full flex items-center gap-2">
              <MicOff className="w-4 h-4" />
              <span className="text-sm">Muted</span>
            </div>
          )}
        </motion.div>
      </Card>
    </motion.div>
  );
}
