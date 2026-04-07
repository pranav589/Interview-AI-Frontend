"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Rocket, 
  ChevronRight, 
  ChevronLeft, 
  Upload, 
  CheckCircle, 
  ArrowRight,
  ShieldCheck,
  Brain,
  Sparkles,
  PlayCircle
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface OnboardingWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OnboardingWizard({ isOpen, onClose }: OnboardingWizardProps) {
  const [step, setStep] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const { refreshUser, user } = useAuth();
  const router = useRouter();

  const handleNext = () => setStep((s) => s + 1);
  const handleBack = () => setStep((s) => s - 1);

  const handleTypeSelect = (type: string) => {
    setSelectedType(type.toLowerCase().replace(' ', '-'));
    handleNext();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      return toast.error("Please upload a PDF file.");
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("resume", file);
      await api.post("user/resume", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await refreshUser();
      setResumeUploaded(true);
      toast.success("Resume uploaded and analyzed!");
      setTimeout(handleNext, 1000);
    } catch (err) {
      toast.error("Failed to upload resume.");
    } finally {
      setIsUploading(false);
    }
  };

  const startFirstInterview = () => {
    onClose();
    const query = selectedType ? `?type=${selectedType}` : '';
    router.push(`/interview-setup${query}`);
  };

  const steps = [
    {
      id: 1,
      title: "Welcome to InterviewAI",
      description: "Let's get you ready for your dream job in 3 simple steps.",
      icon: <Sparkles className="w-12 h-12 text-primary animate-pulse" />,
      content: (
        <div className="space-y-6 py-6 text-center">
          <div className="flex justify-center mb-4">
             <div className="p-4 bg-primary/10 rounded-full">
                <Brain className="w-16 h-16 text-primary" />
             </div>
          </div>
          <div className="space-y-2">
            <h4 className="text-xl font-bold">Your AI Journey Starts Here</h4>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto">
              Our AI interviewer will help you master technical questions, behavioral patterns, and system design.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 text-left mt-8">
            <div className="p-3 bg-muted/50 rounded-xl border flex gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
              <div>
                <p className="text-xs font-bold">Privacy First</p>
                <p className="text-[10px] text-muted-foreground">Your data is secure and private.</p>
              </div>
            </div>
            <div className="p-3 bg-muted/50 rounded-xl border flex gap-3">
              <Sparkles className="w-5 h-5 text-violet-500 shrink-0" />
              <div>
                <p className="text-xs font-bold">Real-time STT</p>
                <p className="text-[10px] text-muted-foreground">Fastest speech-to-text response.</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 2,
      title: "Upload Your Resume",
      description: "We use your resume to tailor interview questions specifically to your experience.",
      icon: <Upload className="w-12 h-12 text-primary" />,
      content: (
        <div className="space-y-6 py-8">
          <div className="border-2 border-dashed rounded-2xl p-10 text-center space-y-4 hover:border-primary/50 transition-colors cursor-pointer relative overflow-hidden group">
            <input 
              type="file" 
              className="absolute inset-0 opacity-0 cursor-pointer z-10" 
              accept=".pdf"
              onChange={handleFileUpload}
              disabled={isUploading || resumeUploaded}
            />
            {resumeUploaded ? (
              <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="flex flex-col items-center">
                <CheckCircle className="w-12 h-12 text-emerald-500 mb-2" />
                <p className="font-bold text-emerald-600">Resume Ready!</p>
              </motion.div>
            ) : isUploading ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-medium">Analyzing experience...</p>
              </div>
            ) : (
              <div className="group-hover:scale-105 transition-transform duration-300">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
                <p className="font-bold text-lg">Click or drop PDF</p>
                <p className="text-xs text-muted-foreground">Max 2MB • PDF format only</p>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center hover:text-foreground cursor-pointer" onClick={handleNext}>
             <p>I'll do this later</p>
             <ArrowRight className="w-3 h-3" />
          </div>
        </div>
      )
    },
    {
      id: 3,
      title: "Choose Your Path",
      description: "Pick your first focus area to begin practicing.",
      icon: <Target className="w-12 h-12 text-primary" />,
      content: (
        <div className="grid grid-cols-1 gap-4 py-6">
           {[
             { title: 'Technical', desc: 'Coding, algorithms, and logic', icon: '💻' },
             { title: 'Behavioral', desc: 'Situational & soft-skill questions', icon: '🤝' },
             { title: 'System Design', desc: 'Scaling & architecture', icon: '🏗️' }
           ].map((item, i) => (
             <motion.div 
               key={i}
               whileHover={{ x: 5, backgroundColor: 'rgba(var(--primary-rgb), 0.05)' }}
               className="p-4 border rounded-xl flex items-center gap-4 cursor-pointer transition-colors group"
               onClick={() => handleTypeSelect(item.title)}
             >
               <div className="text-2xl w-12 h-12 flex items-center justify-center bg-muted rounded-full group-hover:bg-primary/10 transition-colors">
                  {item.icon}
               </div>
               <div>
                 <p className="font-bold">{item.title}</p>
                 <p className="text-xs text-muted-foreground">{item.desc}</p>
               </div>
               <ChevronRight className="w-4 h-4 ml-auto text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
             </motion.div>
           ))}
        </div>
      )
    },
    {
      id: 4,
      title: "Ready to Start!",
      description: "Your setup is complete. You are ready for your first AI interview session.",
      icon: <Rocket className="w-12 h-12 text-primary" />,
      content: (
        <div className="space-y-8 py-8 text-center">
          <div className="relative">
             <div className="w-32 h-32 bg-primary/20 rounded-full mx-auto flex items-center justify-center">
                <Rocket className="w-16 h-16 text-primary animate-bounce" />
             </div>
             <motion.div 
               animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
               transition={{ duration: 2, repeat: Infinity }}
               className="absolute inset-0 bg-primary/10 rounded-full"
             />
          </div>
          <div className="space-y-4">
             <h4 className="text-2xl font-black italic tracking-tighter uppercase">Clear for Takeoff</h4>
             <p className="text-muted-foreground text-sm max-w-sm mx-auto">
               You can now start your first practice session. Remember to be in a quiet place and use high-quality audio.
             </p>
          </div>
          <div className="flex flex-col gap-3">
            <Button size="lg" className="w-full h-14 text-lg font-bold gap-2" onClick={startFirstInterview}>
               <PlayCircle className="w-5 h-5" />
               Start First Interview
            </Button>
            <Button variant="ghost" onClick={onClose} className="text-muted-foreground">
               I'll explore the dashboard first
            </Button>
          </div>
        </div>
      )
    }
  ];

  const currentStep = steps.find((s) => s.id === step)!;

  return (
    <Dialog open={isOpen} onOpenChange={(v) => !isUploading && onClose()}>
      <DialogContent className="sm:max-w-xl p-0 overflow-hidden border-none shadow-2xl bg-background">
        <div className="relative h-2 w-full bg-muted">
           <motion.div 
             className="absolute top-0 left-0 h-full bg-primary"
             animate={{ width: `${(step / steps.length) * 100}%` }}
           />
        </div>
        
        <div className="p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <DialogHeader className="text-left">
                <DialogTitle className="text-2xl font-black tracking-tight flex items-center gap-3">
                   {currentStep.title}
                </DialogTitle>
                <DialogDescription className="text-base">
                  {currentStep.description}
                </DialogDescription>
              </DialogHeader>

              <div className="min-h-[300px]">
                {currentStep.content}
              </div>

              {step < steps.length && (
                <div className="flex justify-between items-center pt-6 border-t">
                  <Button
                    variant="ghost"
                    onClick={handleBack}
                    disabled={step === 1 || isUploading}
                    className="gap-2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Back
                  </Button>
                  <Button
                    onClick={handleNext}
                    disabled={isUploading}
                    className="gap-2 px-8"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Utility to find and iconify lucide-react names if needed, but here we used direct components.
import { Target } from "lucide-react";
