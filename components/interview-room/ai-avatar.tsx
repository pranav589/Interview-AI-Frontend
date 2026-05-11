"use client";

import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Brain } from "lucide-react";

interface AIAvatarProps {
  isThinking: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  volume?: number;
}

export default function AIAvatar({
  isThinking,
  isListening,
  isSpeaking,
  volume = 0,
}: AIAvatarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="h-full max-h-[400px]"
    >
      <Card
        className="h-full overflow-hidden relative bg-tile-1 border-hairline shadow-none rounded-3xl flex flex-col items-center justify-center"
        aria-label={`AI Interviewer visual representation - currently ${isThinking ? "thinking" : isSpeaking ? "speaking" : isListening ? "listening" : "ready"}`}
      >
        <motion.div
          animate={{
            scale: isSpeaking ? [1, 1.05, 1] : 1,
            filter: isListening
              ? "drop-shadow(0 0 20px rgba(59, 130, 246, 0.5))"
              : "drop-shadow(0 0 0px)",
          }}
          transition={{
            duration: isSpeaking ? 0.8 : 0.3,
            repeat: isSpeaking ? Infinity : 0,
          }}
          className="relative"
        >
          {(isListening || isSpeaking) && (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 -m-6 sm:-m-12 rounded-full border-2 border-primary/30"
            />
          )}

          <motion.div
            className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center relative"
            whileHover={{ scale: 1.1 }}
          >
            <motion.div
              animate={{
                rotate: isThinking ? 360 : 0,
              }}
              transition={{
                duration: 3,
                repeat: isThinking ? Infinity : 0,
                ease: "linear",
              }}
              className="text-white"
            >
              <Brain className="w-12 h-12 sm:w-16 sm:h-16" />
            </motion.div>

            {isThinking && (
              <motion.div
                className="absolute inset-0 rounded-full bg-primary/20"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 text-center"
        >
          <p className="text-body font-semibold text-ink">
            {isThinking
              ? "Thinking..."
              : isSpeaking
                ? "Speaking..."
                : isListening
                  ? "Listening..."
                  : "Ready"}
          </p>
          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-caption text-ink-muted-80 mt-2"
          >
            {isThinking
              ? "Processing your response"
              : isSpeaking
                ? "Interviewer is speaking"
                : isListening
                  ? "Listening to you"
                  : "Start speaking when ready"}
          </motion.p>
        </motion.div>

        {(isSpeaking || isListening) && (
          <motion.div className="absolute bottom-4 sm:bottom-8 flex gap-1 items-center justify-center h-12">
            {[0, 1, 2, 3, 4].map((index) => (
              <motion.div
                key={index}
                animate={{
                  height: isSpeaking
                    ? [20, 50, 20]
                    : isListening
                      ? [10, 10 + volume * 0.5 + index * 2, 10]
                      : [10, 10, 10],
                }}
                transition={{
                  duration: isSpeaking ? 0.5 : 0.1,
                  repeat: Infinity,
                  delay: index * 0.05,
                }}
                className="w-1 rounded-full bg-primary"
              />
            ))}
          </motion.div>
        )}
      </Card>
    </motion.div>
  );
}
