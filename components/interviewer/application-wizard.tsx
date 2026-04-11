"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
import { useSubmitApplication } from "@/hooks/use-interviewer";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Upload,
  ClipboardCheck,
  BrainCircuit,
  Loader2,
} from "lucide-react";

const STEPS = [
  {
    id: "intro",
    title: "How it works",
    description: "Our AI will analyze your profile to verify your expertise.",
  },
  {
    id: "resume",
    title: "Experience",
    description: "We'll use your uploaded resume for the initial check.",
  },
  {
    id: "questions",
    title: "Interviewer DNA",
    description: "Tell us about your interviewing style.",
  },
  {
    id: "submitting",
    title: "Review & Submit",
    description: "Confirm your application details.",
  },
];

export function ApplicationWizard() {
  const { user, refreshUser } = useAuth();
  const [step, setStep] = useState(0);
  const { mutateAsync: submitApplication, isPending: isSubmitting } = useSubmitApplication();
  const router = useRouter();

  const [answers, setAnswers] = useState([
    "", // Q1: Dealing with a stuck candidate
    "", // Q2: Evaluating technical communication
    "", // Q3: Why do you want to be an interviewer?
  ]);

  const handleNext = () => setStep((s) => Math.min(STEPS.length - 1, s + 1));
  const handleBack = () => setStep((s) => Math.max(0, s - 1));

  const handleSubmit = async () => {
    try {
      await submitApplication({ answers });
      await refreshUser();
      setStep(STEPS.length); // Final success state
      setTimeout(() => router.push("/dashboard"), 3000);
    } catch (err) {
      console.error("Application failed", err);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 space-y-2">
                <BrainCircuit className="w-8 h-8 text-primary" />
                <h4 className="font-bold">AI Analysis</h4>
                <p className="text-xs text-muted-foreground">
                  AI reviews your resume to determine your expertise level.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 space-y-2">
                <ClipboardCheck className="w-8 h-8 text-primary" />
                <h4 className="font-bold">Peer Vetting</h4>
                <p className="text-xs text-muted-foreground">
                  Share your interview philosophy through few questions.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-primary" />
                <h4 className="font-bold">Verified Status</h4>
                <p className="text-xs text-muted-foreground">
                  Get matched with candidates seeking your specific experience.
                </p>
              </div>
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-6 py-4">
            {user?.hasResume ? (
              <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-emerald-700">
                    Resume Already Uploaded
                  </h4>
                  <p className="text-sm text-emerald-600/80">
                    We'll use your existing resume for the evaluation.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center p-8 border-2 border-dashed rounded-2xl space-y-4">
                <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
                <div>
                  <h4 className="font-bold">Resume Required</h4>
                  <p className="text-sm text-muted-foreground">
                    Please upload your resume in your profile settings first.
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => router.push("/profile")}
                >
                  Go to Profile
                </Button>
              </div>
            )}
          </div>
        );
      case 2:
        return (
          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>
                  Q1: A candidate is completely stuck. How do you help them
                  without giving the answer?
                </Label>
                <Textarea
                  placeholder="Describe your approach..."
                  className="min-h-[100px]"
                  value={answers[0]}
                  onChange={(e) =>
                    setAnswers([e.target.value, answers[1], answers[2]])
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>
                  Q2: What matters more to you: technical correctness or clean
                  communication? Why?
                </Label>
                <Textarea
                  placeholder="Your thoughts..."
                  className="min-h-[100px]"
                  value={answers[1]}
                  onChange={(e) =>
                    setAnswers([answers[0], e.target.value, answers[2]])
                  }
                />
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6 py-4">
            <div className="p-6 rounded-2xl bg-muted/50 border space-y-4">
              <h4 className="font-bold flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-primary" />
                Final Check
              </h4>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Resume is ready for AI analysis
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Interview philosophy shared
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Agreement to provide high-quality feedback
                </li>
              </ul>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="text-center py-20 space-y-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto text-white shadow-lg shadow-emerald-500/30"
            >
              <CheckCircle2 className="w-10 h-10" />
            </motion.div>
            <div>
              <h2 className="text-3xl font-bold">Application Received!</h2>
              <p className="text-muted-foreground mt-2">
                Our AI is now reviewing your profile. We'll update you in the
                dashboard soon.
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <Card className="max-w-3xl mx-auto shadow-2xl border-primary/5">
      <CardHeader className="border-b bg-primary/5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex gap-1">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 w-12 rounded-full transition-all duration-300 ${i <= step ? "bg-primary" : "bg-muted"}`}
              />
            ))}
          </div>
          <span className="text-xs font-bold text-primary uppercase tracking-widest">
            Step {Math.min(step + 1, STEPS.length)} of {STEPS.length}
          </span>
        </div>
        <CardTitle className="text-2xl">
          {STEPS[Math.min(step, STEPS.length - 1)].title}
        </CardTitle>
        <CardDescription>
          {STEPS[Math.min(step, STEPS.length - 1)].description}
        </CardDescription>
      </CardHeader>
      <CardContent>{renderStep()}</CardContent>
      {step < STEPS.length && (
        <CardFooter className="flex justify-between border-t py-4 bg-muted/20">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={step === 0 || isSubmitting}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button
            onClick={step === STEPS.length - 1 ? handleSubmit : handleNext}
            disabled={(step === 1 && !user?.hasResume) || isSubmitting}
            className="gap-2 px-8"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting...
              </>
            ) : step === STEPS.length - 1 ? (
              "Submit Application"
            ) : (
              <>
                Next
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
