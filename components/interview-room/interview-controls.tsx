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
} from "lucide-react";

interface InterviewControlsProps {
  isMuted: boolean;
  isVideoEnabled: boolean;
  isPaused: boolean;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onTogglePause: () => void;
  onEndInterview: () => void;
}

export default function InterviewControls({
  isMuted,
  isVideoEnabled,
  isPaused,
  onToggleMute,
  onToggleVideo,
  onTogglePause,
  onEndInterview,
}: InterviewControlsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="sticky bottom-6 z-50 flex flex-wrap items-center justify-center gap-4 p-4 rounded-2xl border bg-card/80 backdrop-blur-md shadow-lg"
    >
      <Button
        variant={isMuted ? "destructive" : "outline"}
        size="sm"
        onClick={onToggleMute}
        className="gap-2"
        aria-label={isMuted ? "Unmute microphone" : "Mute microphone"}
      >
        {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        {isMuted ? "Unmute" : "Mute"}
      </Button>

      <Button
        variant={!isVideoEnabled ? "destructive" : "outline"}
        size="sm"
        onClick={onToggleVideo}
        className="gap-2"
        aria-label={isVideoEnabled ? "Disable camera" : "Enable camera"}
      >
        {isVideoEnabled ? (
          <Video className="w-4 h-4" />
        ) : (
          <VideoOff className="w-4 h-4" />
        )}
        {isVideoEnabled ? "Camera On" : "Camera Off"}
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={onTogglePause}
        className="gap-2"
        aria-label={isPaused ? "Resume interview" : "Pause interview"}
      >
        {isPaused ? (
          <Play className="w-4 h-4" />
        ) : (
          <Pause className="w-4 h-4" />
        )}
        {isPaused ? "Resume" : "Pause"}
      </Button>

      <Button
        variant="destructive"
        size="sm"
        onClick={onEndInterview}
        className="gap-2"
        aria-label="End interview"
      >
        <Square className="w-4 h-4 fill-current" />
        End Interview
      </Button>
    </motion.div>
  );
}
