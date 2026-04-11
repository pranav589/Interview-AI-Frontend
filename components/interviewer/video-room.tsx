"use client";

import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Video, MessageSquare, Shield } from "lucide-react";
import { VideoSDKMeeting } from "@videosdk.live/rtc-js-prebuilt";

export function VideoRoom({
  roomId,
  token,
  participantName,
  isInterviewer,
  onLeave,
}: {
  roomId: string;
  token: string | undefined;
  participantName: string;
  isInterviewer: boolean;
  onLeave: (duration?: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isJoining, setIsJoining] = useState(true);
  const [startTime, setStartTime] = useState<number | null>(null);

  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current || !containerRef.current) return;
    initializedRef.current = true;

    console.log("VideoRoom: Initializing with", { roomId, hasToken: !!token });

    if (!roomId || !token) {
      console.error("VideoRoom: Missing roomId or token");
      setIsJoining(false);
      return;
    }

    try {
      const config = {
        name: participantName,
        meetingId: roomId,
        apiKey: process.env.NEXT_PUBLIC_VIDEOSDK_API_KEY || "",
        containerId: containerRef.current.id,
        token: token,

        micEnabled: true,
        webcamEnabled: true,
        participantCanToggleSelfWebcam: true,
        participantCanToggleSelfMic: true,

        realtimeTranscription: {
          enabled: false,
          displayWidget: false,
        },

        chatEnabled: true,
        screenShareEnabled: true,
        whiteboardEnabled: false,
        raiseHandEnabled: true,

        recordingEnabled:
          process.env.NEXT_PUBLIC_VIDEOSDK_ENABLE_RECORDING === "true",
        recordingWebhookUrl: "",
        recordingAWSDirPath: "",

        containerPadding: "0",
        layout: {
          type: "GRID", // "SPOTLIGHT" | "SIDEBAR" | "GRID"
          priority: "SPEAKER", // "SPEAKER" | "RECENT_SPEAKER"
          gridSize: 12,
        },

        branding: {
          enabled: true,
          logoURL: "",
          name: "Interview AI",
          poweredBy: false,
        },

        permissions: {
          askToJoin: false,
          toggleParticipantWebcam: true,
          toggleParticipantMic: true,
          removeParticipant: true,
          endMeeting: true,
          drawOnWhiteboard: true,
          toggleRecording: true,
        },

        leftScreen: {
          action: "onLeave",
          rejoinEnabled: false,
        },
      };

      const meeting = new VideoSDKMeeting();
      meeting.init(config as any);
      console.log("VideoRoom: SDK initialized");
      
      // Set start time when user is ready to join
      setStartTime(Date.now());
      
      // We set joining to false after a slight delay to allow the prebuilt UI to mount
      setTimeout(() => setIsJoining(false), 2000);
    } catch (error) {
      console.error("VideoRoom: Failed to initialize SDK", error);
      setIsJoining(false);
    }

    return () => {
      // Cleanup
    };
  }, [roomId, token, participantName, onLeave]);

  return (
    <div className="flex flex-col h-[calc(100vh-250px)] min-h-[600px] w-full gap-6">
      <div className="flex-1 flex gap-6">
        <div className="flex-[3] relative rounded-2xl overflow-hidden border-2 border-primary/10 shadow-lg bg-card/50">
          {!roomId && !isJoining && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 z-10 space-y-4 p-8 text-center">
              <Shield className="w-12 h-12 text-destructive mb-2" />
              <p className="font-bold uppercase tracking-widest text-sm text-foreground">
                Room Initialization Failed
              </p>
              <p className="text-muted-foreground text-xs max-w-xs">
                The video room could not be generated. Please contact support or
                try re-booking.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onLeave()}
                className="mt-4"
              >
                Go Back
              </Button>
            </div>
          )}
          {isJoining && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 z-10 space-y-4">
              <div className="relative">
                <Loader2 className="w-16 h-16 text-primary animate-spin" />
                <Shield className="w-6 h-6 text-primary absolute inset-0 m-auto" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-primary font-bold tracking-[0.2em] uppercase text-xs animate-pulse">Initializing encrypted tunnel</p>
                <p className="text-muted-foreground text-[10px] uppercase tracking-widest font-medium opacity-50">Secure connection established</p>
              </div>
            </div>
          )}

          <div
            id="videosdk-container"
            ref={containerRef}
            className="w-full h-full"
          />
        </div>

        <div className="flex-1 space-y-6">
          <Card className="h-full border-border bg-card shadow-xl">
            <div className="p-6 h-full flex flex-col">
              <div className="flex items-center gap-2 mb-6 text-primary">
                <Shield className="w-5 h-5" />
                <h3 className="font-bold uppercase tracking-wider text-xs">
                  Interview Guard Active
                </h3>
              </div>

              <div className="flex-1 space-y-6">
                <div>
                  <h4 className="font-bold mb-2 text-foreground">
                    Instructions
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-3">
                    <li className="flex gap-2">
                      <span className="text-primary font-bold">•</span>
                      Ensure your microphone is calibrated.
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary font-bold">•</span>
                      The interview is private and session will be summarized by
                      AI.
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary font-bold">•</span>
                      Press "Leave" when you're finished.
                    </li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                  <div className="flex items-center gap-2 text-primary mb-2">
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase">Pro Tip</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed italic text-center">
                    "Relax and be authentic. This is a practice session designed
                    for growth."
                  </p>
                </div>
              </div>

              <div className="mt-auto pt-6 border-t">
                <Button
                  variant="destructive"
                  className="w-full text-xs font-bold uppercase tracking-widest"
                  onClick={() => {
                    const duration = startTime ? Math.round((Date.now() - startTime) / 60000) : 0;
                    onLeave(duration);
                  }}
                >
                  Emergency Exit
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
