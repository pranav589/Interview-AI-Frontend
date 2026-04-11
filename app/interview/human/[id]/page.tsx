"use client";

import { useBookingDetails, useCompleteBooking } from "@/hooks/use-interviewer";
import { Navbar } from "@/components/common/navbar";
import AuthWrapper from "@/components/auth/auth-wrapper";
import { VideoRoom } from "@/components/interviewer/video-room";
import { useParams, useRouter } from "next/navigation";
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  Clock,
  Shield,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function HumanInterviewRoomPage() {
  const { id } = useParams() as { id: string };
  const { data, isLoading, isError } = useBookingDetails(id);
  const completeBooking = useCompleteBooking();
  const { user } = useAuth();
  const router = useRouter();

  const booking = data?.booking;
  const videoSDKToken = data?.videoSDKToken;
  const isInterviewer = user?.id === booking?.interviewerId?._id;

  const handleLeave = async (duration?: number) => {
    if (isInterviewer) {
      completeBooking.mutate({
        id,
        actualDuration: duration || 0,
      });
    }
    router.push(`/interview/human/${id}/summary`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
        <div className="relative">
          <Loader2 className="w-16 h-16 text-primary animate-spin" />
          <Shield className="w-6 h-6 text-primary absolute inset-0 m-auto" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-primary font-bold tracking-[0.2em] uppercase text-xs animate-pulse">
            Initializing encrypted tunnel
          </p>
          <p className="text-muted-foreground text-[10px] uppercase tracking-widest font-medium opacity-50">
            Secure connection established
          </p>
        </div>
      </div>
    );
  }

  if (isError || !booking || !booking.roomUrl || !videoSDKToken) {
    return (
      <div className="min-h-screen bg-background p-8 flex items-center justify-center">
        <Card className="max-w-md w-full border-destructive/20 bg-destructive/5">
          <CardHeader className="text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <CardTitle className="text-destructive">Access Denied</CardTitle>
            <CardDescription>
              {!booking?.roomUrl || !videoSDKToken
                ? "Interview credentials could not be generated. Please contact support."
                : "We couldn't connect you to this interview session. Please verify your booking and try again."}
            </CardDescription>
            <div className="pt-6">
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard")}
              >
                Return to Dashboard
              </Button>
            </div>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Access Control: Block candidate from re-joining completed interview
  if (booking.status === "completed" && !isInterviewer) {
    return (
      <div className="min-h-screen bg-background p-8 flex items-center justify-center">
        <Card className="max-w-md w-full border-primary/20 bg-primary/5">
          <CardHeader className="text-center">
            <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-4" />
            <CardTitle>Session Finished</CardTitle>
            <CardDescription>
              This interview has already been completed. You can view your
              feedback and transcription on the summary page.
            </CardDescription>
            <div className="pt-6">
              <Button
                className="w-full"
                onClick={() => router.push(`/interview/human/${id}/summary`)}
              >
                View Feedback & Summary
              </Button>
            </div>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Time-based Access Control: Block joining before start time
  const now = new Date();
  const startTime = new Date(booking.startTime);
  if (now < startTime) {
    return (
      <div className="min-h-screen bg-background p-8 flex items-center justify-center">
        <Card className="max-w-md w-full border-amber-500/20 bg-amber-500/5">
          <CardHeader className="text-center">
            <Clock className="w-12 h-12 text-amber-500 mx-auto mb-4 animate-pulse" />
            <div className="flex justify-center mb-4">
              <Badge className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/10 border-amber-500/20 px-4 py-1">
                Live Soon
              </Badge>
            </div>
            <CardTitle>Interview Not Live Yet</CardTitle>
            <CardDescription className="text-muted-foreground mt-2">
              This session is scheduled to start at{" "}
              <span className="text-foreground font-bold">
                {format(startTime, "PPP p")}
              </span>
              . Please come back at the scheduled time.
            </CardDescription>
            <div className="pt-8">
              <Button
                variant="outline"
                className="w-full h-12 font-bold"
                onClick={() => router.push("/dashboard")}
              >
                Return to Dashboard
              </Button>
            </div>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <AuthWrapper>
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <main className="container max-w-7xl mx-auto px-4 py-8">
          <div className="flex justify-between items-end mb-8">
            <div className="space-y-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">
                  Live Session
                </span>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight">
                Peer Interview: {booking.interviewerId?.name} &{" "}
                {booking.candidateId?.name}
              </h1>
              <p className="text-muted-foreground text-sm">
                Session will end automatically when both parties leave.
              </p>
            </div>
          </div>

          <VideoRoom
            roomId={booking.roomUrl}
            token={videoSDKToken}
            participantName={user?.name || "Participant"}
            isInterviewer={isInterviewer}
            onLeave={handleLeave}
          />
        </main>
      </div>
    </AuthWrapper>
  );
}
