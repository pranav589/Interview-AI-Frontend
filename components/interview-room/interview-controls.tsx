"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Play,
  Pause,
  Square,
  Code2,
} from "lucide-react";

interface InterviewControlsProps {
  isMuted: boolean;
  isVideoEnabled: boolean;
  isPaused: boolean;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onTogglePause: () => void;
  onEndInterview: () => void;
  isCodingMode: boolean;
  onToggleCodingMode: () => void;
  isCodingEnabled?: boolean;
}

export default function InterviewControls({
  isMuted,
  isVideoEnabled,
  isPaused,
  onToggleMute,
  onToggleVideo,
  onTogglePause,
  onEndInterview,
  isCodingMode,
  onToggleCodingMode,
  isCodingEnabled = true,
}: InterviewControlsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="sticky bottom-8 z-50 flex items-center justify-center gap-3 px-6 py-3 rounded-full border border-hairline bg-parchment/80 backdrop-blur-xl shadow-none mx-auto w-fit"
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleMute}
        className={`w-11 h-11 rounded-full transition-all active:scale-95 ${
          isMuted ? "bg-destructive text-white" : "bg-surface-chip-translucent text-ink"
        }`}
        aria-label={isMuted ? "Unmute microphone" : "Mute microphone"}
      >
        {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleVideo}
        className={`w-11 h-11 rounded-full transition-all active:scale-95 ${
          !isVideoEnabled ? "bg-destructive text-white" : "bg-surface-chip-translucent text-ink"
        }`}
        aria-label={isVideoEnabled ? "Disable camera" : "Enable camera"}
      >
        {isVideoEnabled ? (
          <Video className="w-5 h-5" />
        ) : (
          <VideoOff className="w-5 h-5" />
        )}
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={onTogglePause}
        className={`w-11 h-11 rounded-full transition-all active:scale-95 ${
          isPaused ? "bg-primary text-white" : "bg-surface-chip-translucent text-ink"
        }`}
        aria-label={isPaused ? "Resume interview" : "Pause interview"}
      >
        {isPaused ? (
          <Play className="w-5 h-5" />
        ) : (
          <Pause className="w-5 h-5" />
        )}
      </Button>

      {isCodingEnabled && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCodingMode}
          className={`w-11 h-11 rounded-full transition-all active:scale-95 ${
            isCodingMode ? "bg-ink text-white" : "bg-surface-chip-translucent text-ink"
          }`}
          aria-label={isCodingMode ? "Hide code editor" : "Show code editor"}
        >
          <Code2 className="w-5 h-5" />
        </Button>
      )}

      <div className="w-px h-6 bg-hairline mx-1" />

      <Button
        variant="ghost"
        size="icon"
        onClick={onEndInterview}
        className="w-11 h-11 rounded-full bg-destructive text-white transition-all active:scale-95"
        aria-label="End interview"
      >
        <Square className="w-5 h-5 fill-current" />
      </Button>
    </motion.div>
  );
}
