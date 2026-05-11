"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Square, Clock, AlertCircle } from "lucide-react";

interface InterviewModalsProps {
  showStopModal: boolean;
  showTimeUpModal: boolean;
  showCompleteModal: boolean;
  showDisconnectModal: boolean;
  onCloseStop: () => void;
  onConfirmStop: () => void;
  onCloseTimeUp: () => void;
  onCloseComplete: () => void;
  onCloseDisconnect: () => void;
}

export default function InterviewModals({
  showStopModal,
  showTimeUpModal,
  showCompleteModal,
  showDisconnectModal,
  onCloseStop,
  onConfirmStop,
  onCloseTimeUp,
  onCloseComplete,
  onCloseDisconnect,
}: InterviewModalsProps) {
  return (
    <>
      {/* Confirmation Modal */}
      <AnimatePresence>
        {showStopModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={onCloseStop}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative bg-card border rounded-xl p-8 max-w-md w-full shadow-lg"
            >
              <div className="text-center space-y-6">
                <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center text-destructive">
                  <Square size={32} className="fill-current" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold">Stop Interview?</h3>
                  <p className="text-muted-foreground">
                    Are you sure you want to end this session? You'll be able to
                    view your performance feedback before exiting.
                  </p>
                </div>
                <div className="flex flex-col gap-3 pt-4">
                  <Button
                    onClick={onConfirmStop}
                    variant="destructive"
                    size="lg"
                    className="w-full font-bold text-white"
                  >
                    Yes, End Session
                  </Button>
                  <Button
                    onClick={onCloseStop}
                    variant="ghost"
                    size="lg"
                    className="w-full"
                  >
                    Continue Interview
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Time's Up Modal */}
      <AnimatePresence>
        {showTimeUpModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="relative bg-card border rounded-xl p-8 max-w-md w-full shadow-lg"
            >
              <div className="text-center space-y-6">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                  <Clock size={32} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold">Time's Up!</h3>
                  <p className="text-muted-foreground">
                    The scheduled time for this interview has reached its limit.
                    Click below to generate and view your feedback.
                  </p>
                </div>
                <Button
                  onClick={onCloseTimeUp}
                  variant="default"
                  size="lg"
                  className="w-full font-bold"
                >
                  View Results
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Interview Complete Modal */}
      <AnimatePresence>
        {showCompleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="relative bg-card border rounded-xl p-8 max-w-md w-full shadow-lg"
            >
              <div className="text-center space-y-6">
                <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                  <div className="w-8 h-8 rounded-full border-2 border-current flex items-center justify-center">
                    <div className="w-4 h-2 border-b-2 border-l-2 -rotate-45 mb-1 ml-0.5" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold">Interview Complete!</h3>
                  <p className="text-muted-foreground">
                    Great job! You've successfully finished all the questions in
                    this session. Click below to see your detailed feedback and
                    scores.
                  </p>
                </div>
                <Button
                  onClick={onCloseComplete}
                  variant="default"
                  size="lg"
                  className="w-full font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  View Performance Feedback
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Disconnect Modal */}
      <AnimatePresence>
        {showDisconnectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="relative bg-card border rounded-xl p-8 max-w-md w-full shadow-lg"
            >
              <div className="text-center space-y-6">
                <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                  <AlertCircle size={32} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold">Session Disconnected</h3>
                  <p className="text-muted-foreground">
                    The connection to the interview server was lost. This can
                    happen due to network issues or if the session was ended by
                    the server.
                  </p>
                </div>
                <Button
                  onClick={onCloseDisconnect}
                  variant="default"
                  size="lg"
                  className="w-full text-white"
                >
                  Return to Dashboard
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
