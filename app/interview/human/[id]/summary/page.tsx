"use client";

import { useBookingDetails, useSubmitFeedback } from "@/hooks/use-interviewer";
import { Navbar } from "@/components/common/navbar";
import AuthWrapper from "@/components/auth/auth-wrapper";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import {
  CheckCircle2,
  FileText,
  Send,
  Star,
  ArrowRight,
  Loader2,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";

export default function InterviewSummaryPage() {
  const { id } = useParams() as { id: string };
  const { data, isLoading } = useBookingDetails(id);
  const { user } = useAuth();
  const [feedback, setFeedback] = useState("");
  const [score, setScore] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const router = useRouter();

  const { mutateAsync: submitFeedback, isPending: isSubmitting } = useSubmitFeedback();

  const booking = data?.booking;
  const isInterviewer = user?.id === booking?.interviewerId?._id;

  const handleSubmitFeedback = async () => {
    try {
      await submitFeedback({ id, feedback, score });
      setIsDone(true);
      toast.success("Feedback submitted!");
    } catch (err) {
      toast.error("Failed to submit feedback");
    }
  };

  if (isLoading)
    return (
      <div className="p-20 text-center uppercase tracking-widest text-xs animate-pulse">
        Calculating final report...
      </div>
    );

  return (
    <AuthWrapper>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container max-w-4xl mx-auto px-4 py-12">
          {isDone ? (
            <div className="text-center space-y-6 pt-20">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">
                  Thank you for your feedback!
                </h1>
                <p className="text-muted-foreground mt-2">
                  The candidate will be notified of your results.
                </p>
              </div>
              <Button onClick={() => router.push("/dashboard")}>
                Back to Dashboard
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-10 text-center">
                <h1 className="text-4xl font-extrabold tracking-tight mb-2">
                  Interview Session Ended
                </h1>
                <p className="text-muted-foreground">
                  Thank you for participating in the peer-to-peer practice
                  session.
                </p>
              </div>

              {isInterviewer && !booking.interviewerFeedback ? (
                <Card className="border-primary/10 shadow-2xl">
                  <CardHeader className="bg-primary/5">
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary" />
                      Interviewer Feedback
                    </CardTitle>
                    <CardDescription>
                      As the interviewer, please provide detailed feedback to
                      help the candidate improve.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 py-8">
                    <div className="space-y-4">
                      <Label className="text-lg font-bold">
                        How would you rate their performance?
                      </Label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Button
                            key={s}
                            variant={score >= s ? "default" : "outline"}
                            size="icon"
                            className="h-12 w-12"
                            onClick={() => setScore(s)}
                          >
                            <Star
                              className={`w-6 h-6 ${score >= s ? "fill-current" : ""}`}
                            />
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Label className="text-lg font-bold">
                        Detailed Feedback & Notes
                      </Label>
                      <Textarea
                        placeholder="What did they do well? What can be improved? Any specific technical highlights or gaps?"
                        className="min-h-[250px] text-base"
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                      />
                    </div>
                  </CardContent>
                  <div className="p-6 border-t bg-muted/20">
                    <Button
                      className="w-full h-14 text-lg font-bold gap-2"
                      onClick={handleSubmitFeedback}
                      disabled={!feedback || score === 0 || isSubmitting}
                    >
                      {isSubmitting
                        ? "Submitting..."
                        : "Finalize Report & Submit"}
                      <Send className="w-5 h-5" />
                    </Button>
                  </div>
                </Card>
              ) : booking.interviewerFeedback ? (
                <div className="space-y-8">
                  <Card className="border-primary/10 shadow-xl overflow-hidden">
                    <CardHeader className="bg-primary/5 border-b border-primary/10">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-2xl">
                            Session Report
                          </CardTitle>
                          <CardDescription>
                            Final evaluation from your peer session
                          </CardDescription>
                        </div>
                        <div className="flex gap-1 text-primary">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-6 h-6 ${booking.interviewerScore >= s ? "fill-current" : "opacity-20"}`}
                            />
                          ))}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="py-8 space-y-8">
                      <div className="space-y-4">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                          <MessageSquare className="w-5 h-5 text-primary" />
                          Interviewer Feedback
                        </h3>
                        <div className="p-6 bg-muted/30 rounded-2xl text-lg leading-relaxed italic text-muted-foreground border border-border/50">
                          "{booking.interviewerFeedback}"
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                          <FileText className="w-5 h-5 text-primary" />
                          Transcription Summary
                        </h3>
                        <div className="p-6 bg-muted/10 rounded-2xl text-sm text-muted-foreground border border-dashed border-border/50">
                          <p className="flex items-center gap-2">
                            {/* <Loader2 className="w-4 h-4 animate-spin" /> */}
                            Coming Soon..
                            {/* The session recording is being processed. The AI-generated transcription summary will be available here shortly. */}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                    <div className="p-6 border-t bg-muted/5 flex justify-center">
                      <Button
                        variant="outline"
                        onClick={() => router.push("/dashboard")}
                      >
                        Back to Dashboard
                      </Button>
                    </div>
                  </Card>
                </div>
              ) : (
                <Card className="border-primary/10 shadow-2xl overflow-hidden">
                  <div className="bg-muted/50 p-12 text-center space-y-6">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
                      <Loader2 className="w-10 h-10 animate-spin" />
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-2xl font-bold">
                        Reviewing in Progress
                      </h2>
                      <p className="text-muted-foreground">
                        The interviewer is currently writing your detailed
                        feedback.
                      </p>
                    </div>
                    <div className="pt-4">
                      <Button
                        variant="outline"
                        onClick={() => router.push("/dashboard")}
                      >
                        Wait in Dashboard
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </Card>
              )}
            </>
          )}
        </main>
      </div>
    </AuthWrapper>
  );
}
