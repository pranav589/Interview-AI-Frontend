import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Play, Video, Mic, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { LoadingButton } from "../common/loading-button";
import { VolumeMeter } from "./volume-meter";
import { useState, useEffect, useRef } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface InterviewSetupViewProps {
  interviewData: any;
  isCheckingPermissions: boolean;
  hasPermissions: boolean;
  permissionsError: string | null;
  isStartingInterview: boolean;
  isResuming?: boolean;
  onRequestPermissions: () => void;
  onStartInterview: () => void;
  onResetPermissions: () => void;
}

export default function InterviewSetupView({
  interviewData,
  isCheckingPermissions,
  hasPermissions,
  permissionsError,
  isStartingInterview,
  isResuming,
  onRequestPermissions,
  onStartInterview,
  onResetPermissions,
}: InterviewSetupViewProps) {
  const [volume, setVolume] = useState(0);
  const [voiceActivityTime, setVoiceActivityTime] = useState(0); // in ms
  const [voiceCheckPassed, setVoiceCheckPassed] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    let micStream: MediaStream | null = null;

    if (hasPermissions && !isStartingInterview) {
      const startVoiceCheck = async () => {
        try {
          micStream = await navigator.mediaDevices.getUserMedia({ 
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            } 
          });
          
          const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
          const audioContext = new AudioContextClass();
          const source = audioContext.createMediaStreamSource(micStream);
          const analyser = audioContext.createAnalyser();
          analyser.fftSize = 256;
          source.connect(analyser);

          audioContextRef.current = audioContext;
          analyserRef.current = analyser;

          const bufferLength = analyser.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);

          const updateVolume = () => {
            if (!analyserRef.current) return;
            analyserRef.current.getByteTimeDomainData(dataArray);
            
            let sum = 0;
            for (let i = 0; i < bufferLength; i++) {
              const v = (dataArray[i] - 128) / 128;
              sum += v * v;
            }
            const rms = Math.sqrt(sum / bufferLength);
            // Amplify for visual meter sensitivity
            const vol = Math.min(100, rms * 400); 
            setVolume(vol);

            if (vol > 12) { // Speech threshold
              setVoiceActivityTime(prev => {
                 const next = prev + 30; // approx per RAF
                 if (next >= 2000) setVoiceCheckPassed(true);
                 return next;
              });
            }

            animationFrameRef.current = requestAnimationFrame(updateVolume);
          };

          updateVolume();
        } catch (err) {
          console.error("Voice check failed:", err);
        }
      };

      startVoiceCheck();
    }

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
      if (micStream) micStream.getTracks().forEach(t => t.stop());
    };
  }, [hasPermissions, isStartingInterview]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-2xl mx-auto"
    >
      <Card>
        <CardContent className="pt-12 pb-12 text-center space-y-8">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-6xl"
          >
            🎤
          </motion.div>

          <div className="space-y-4">
            <h2 className="text-3xl font-bold">{isResuming ? 'Resume Your Interview' : 'Interview Practice Session'}</h2>
            {interviewData && (
              <p className="text-primary font-medium">
                {interviewData.jobTitle
                  ? `${interviewData.jobTitle} Interview`
                  : `${interviewData.interviewType} Interview`}{" "}
                • {interviewData.difficultyLevel} level
              </p>
            )}
            <p className="text-muted-foreground text-lg max-w-md mx-auto">
              We need your permission to access the camera and microphone for
              the interview.
            </p>
          </div>

          <div className="space-y-6 mb-8 text-left max-w-md mx-auto">
            {isCheckingPermissions ? (
              <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-xl space-y-6 bg-muted/30 shadow-inner">
                <div className="flex flex-col items-center gap-4 w-full">
                  <Skeleton className="w-16 h-16 rounded-full" />
                  <div className="space-y-2 w-full flex flex-col items-center">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-64" />
                  </div>
                </div>
                <div className="text-xs text-muted-foreground font-medium uppercase tracking-widest animate-pulse">
                  Initializing hardware check...
                </div>
              </div>
            ) : !hasPermissions ? (
              <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-xl space-y-4 bg-muted/50">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                  <Video className="w-6 h-6" />
                </div>
                <p className="text-sm font-medium text-center">
                  Click the button below to enable your camera and microphone.
                </p>
                <Button
                  onClick={onRequestPermissions}
                  variant="default"
                  size="sm"
                  className="text-white"
                >
                  Enable Camera & Mic
                </Button>
                {permissionsError && (
                  <div className="flex items-start gap-2 p-3 mt-2 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm leading-tight">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <p>{permissionsError}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 border border-emerald-500/20 shadow-sm">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold">Hardware Access Granted</p>
                    <p className="text-xs text-muted-foreground">
                      Camera & Microphone are ready
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 text-[10px] font-bold uppercase tracking-widest opacity-50 hover:opacity-100"
                    onClick={() => {
                       setVoiceCheckPassed(false);
                       setVoiceActivityTime(0);
                       onResetPermissions();
                    }}
                  >
                    Reset
                  </Button>
                </div>

                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-5 rounded-2xl bg-card border shadow-sm space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mic className={`w-4 h-4 ${volume > 5 ? 'text-primary' : 'text-muted-foreground'}`} />
                      <span className="text-sm font-semibold">Voice Check</span>
                    </div>
                    {voiceCheckPassed ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-500/10 text-emerald-600 rounded-full uppercase tracking-tighter">
                        Mic Quality: Excellent
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-yellow-400/10 text-yellow-600 rounded-full uppercase tracking-tighter animate-pulse">
                        Please speak...
                      </span>
                    )}
                  </div>
                  
                  <VolumeMeter volume={volume} />

                  {!voiceCheckPassed && (
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px] font-bold text-muted-foreground mb-1 uppercase tracking-widest">
                        <span>Calibrating...</span>
                        <span>{Math.round((voiceActivityTime / 2000) * 100)}%</span>
                      </div>
                      <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-primary"
                          animate={{ width: `${(voiceActivityTime / 2000) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </motion.div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4 max-w-xs mx-auto pt-4">
            <motion.div
              whileHover={
                !hasPermissions || isCheckingPermissions || !voiceCheckPassed ? {} : { scale: 1.02 }
              }
              whileTap={
                !hasPermissions || isCheckingPermissions || !voiceCheckPassed ? {} : { scale: 0.98 }
              }
            >
              <LoadingButton
                size="lg"
                onClick={onStartInterview}
                isLoading={isStartingInterview}
                disabled={!hasPermissions || !voiceCheckPassed}
                loadingText={isResuming ? "Resuming..." : "Starting..."}
                icon={<Play className="w-5 h-5 fill-current" />}
                className="w-full shadow-lg shadow-primary/20 text-white"
              >
                {isResuming ? 'Resume Interview Session' : 'Start Interview'}
              </LoadingButton>
              {!voiceCheckPassed && hasPermissions && (
                 <p className="text-[10px] text-center mt-3 text-muted-foreground font-medium uppercase tracking-widest animate-pulse">
                    Please test your microphone to continue
                 </p>
              )}
            </motion.div>

            <Link
              href="/dashboard"
              className="text-muted-foreground hover:text-foreground transition-colors text-sm"
            >
              Back to Dashboard
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
