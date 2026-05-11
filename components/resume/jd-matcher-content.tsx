"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSuspenseResumes, useJdMatch, useUploadResume } from "@/hooks/use-resume";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2, Upload, FileText, CheckCircle2, Wand2, AlignLeft, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";

import { JdMatcherSkeleton } from "./resume-skeletons";

import Image from "next/image";
import { useFeatureFlags } from "@/lib/feature-flags-context";
import { ShieldCheck } from "lucide-react";

export function JdMatcherContent() {
  const router = useRouter();
  const { isFeatureEnabled, isLoading } = useFeatureFlags();

  if (!isLoading && !isFeatureEnabled("jd_matcher_enabled")) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-canvas px-6 text-center">
        <div className="w-20 h-20 rounded-full bg-ink/5 flex items-center justify-center mb-8">
          <ShieldCheck className="w-10 h-10 text-ink/20" />
        </div>
        <h1 className="text-3xl font-semibold text-ink mb-4 tracking-tight">Feature Unavailable</h1>
        <p className="text-lg text-ink/40 max-w-md mb-10 leading-relaxed">
           The JD Matcher is currently under maintenance or disabled for your account. 
           Please check back later or contact support.
        </p>
        <Button 
          variant="outline" 
          className="rounded-pill border-hairline px-8 h-12"
          onClick={() => router.push("/resume")}
        >
          Back to Career Suite
        </Button>
      </div>
    );
  }
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [jdText, setJdText] = useState("");
  const [jdFile, setJdFile] = useState<File | null>(null);
  const [shouldUpdateEntireResume, setShouldUpdateEntireResume] = useState("false");

  const { data: resumes } = useSuspenseResumes();
  const uploadMutation = useUploadResume();
  const matchMutation = useJdMatch();

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("resume", file);
    formData.append("name", file.name);

    uploadMutation.mutate(formData, {
      onSuccess: (res: any) => {
        toast.success("Resume uploaded!");
        const id = res?.data?.id || res?.data?._id || res?._id;
        if (id) setSelectedResumeId(id);
      },
      onError: (error: any) => {
        toast.error(error.message || "Upload failed");
      },
    });
  };

  const handleRunMatch = () => {
    if (!selectedResumeId) {
      toast.error("Please select a resume");
      return;
    }
    if (!jdText && !jdFile) {
      toast.error("Please provide a job description");
      return;
    }

    const formData = new FormData();
    formData.append("resumeId", selectedResumeId);
    formData.append("shouldUpdateEntireResume", shouldUpdateEntireResume);
    if (jdFile) {
      formData.append("jdFile", jdFile);
    } else {
      formData.append("jobDescription", jdText);
    }

    matchMutation.mutate(formData, {
      onSuccess: (res: any) => {
        const jobId = res?.data?.jobId;
        toast.success(res.message || "Match analysis started in background!");
        if (jobId) {
          window.localStorage.setItem("lastResumeJobId", jobId);
        }
        router.push("/dashboard");
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to match JD");
      },
    });
  };

  return (
    <div className="w-full bg-canvas">
      <section className="relative min-h-[85vh] flex items-center border-b border-hairline overflow-hidden bg-canvas">
        <div className="mx-auto px-6 lg:px-12 w-full grid grid-cols-1 lg:grid-cols-2 gap-16 py-20">
          <div className="flex flex-col justify-center space-y-8 z-10">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="flex items-center gap-2 mb-6">
                <div className="h-[1px] w-8 bg-action-blue" />
                <span className="text-action-blue font-semibold tracking-wider text-xs uppercase">Precision Match</span>
              </div>
              <h1 className="text-[56px] md:text-[72px] font-semibold leading-[1.05] tracking-[-0.03em] mb-8 text-ink">
                Align with your <br />
                <span className="text-ink/40">dream role.</span>
              </h1>
              <p className="text-xl md:text-2xl text-ink/50 leading-relaxed max-w-[540px] font-medium mb-12">
                AI-powered resume optimization. Align your experience with job requirements for maximum ATS performance.
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative aspect-[4/3] rounded-[32px] overflow-hidden bg-canvas-parchment border border-hairline group shadow-2xl"
          >
            <Image
              src="/resume-matcher-hero.png"
              alt="JD Matcher"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              priority
            />
          </motion.div>
        </div>
      </section>

      {/* Step 1: Selection (Parchment Tile) */}
      <section className="bg-canvas-parchment py-24">
        <div className="mx-auto section-padding">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
            <div className="max-w-[600px]">
              <h2 className="text-4xl font-semibold tracking-[-0.02em] mb-4 text-ink">1. Select Your Base</h2>
              <p className="text-lg text-ink-secondary">
                Choose a resume from your vault or upload a new one to begin the optimization process.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {resumes?.map((resume: any) => (
              <motion.div
                key={resume._id}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedResumeId(resume._id)}
                className={`p-8 rounded-[24px] border-2 cursor-pointer transition-all duration-300 relative group flex flex-col justify-between h-[180px] ${
                  selectedResumeId === resume._id 
                    ? "border-action-blue bg-white shadow-xl shadow-action-blue/5" 
                    : "border-hairline bg-white/50 hover:bg-white hover:border-action-blue/30"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className={`p-3 rounded-xl ${selectedResumeId === resume._id ? "bg-action-blue/10 text-action-blue" : "bg-canvas text-ink-secondary"}`}>
                    <FileText className="w-6 h-6" />
                  </div>
                  {selectedResumeId === resume._id && (
                    <div className="bg-action-blue text-white p-1 rounded-full">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-ink truncate mb-1">{resume.name}</h3>
                  <p className="text-sm text-ink-secondary opacity-60">Last updated {new Date(resume.updatedAt).toLocaleDateString()}</p>
                </div>
              </motion.div>
            ))}

            <label className="p-8 rounded-[24px] border-2 border-dashed border-hairline hover:border-action-blue/50 hover:bg-white/80 cursor-pointer transition-all duration-300 flex flex-col items-center justify-center gap-4 text-center group h-[180px]">
              <Input
                type="file"
                className="hidden"
                accept=".pdf"
                onChange={handleResumeUpload}
                disabled={uploadMutation.isPending}
              />
              <div className="p-3 rounded-xl bg-canvas group-hover:bg-action-blue/10 group-hover:text-action-blue transition-colors">
                {uploadMutation.isPending ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <Upload className="w-6 h-6" />
                )}
              </div>
              <span className="font-semibold text-ink group-hover:text-action-blue transition-colors">Upload New</span>
            </label>
          </div>
        </div>
      </section>

      {/* Step 2: JD Input (Pure White Tile) */}
      <section className="bg-canvas py-24">
        <div className="mx-auto section-padding">
          <div className="max-w-[800px] mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-semibold tracking-[-0.02em] mb-4 text-ink">2. Target Job Description</h2>
              <p className="text-lg text-ink-secondary max-w-[600px] mx-auto">
                Paste the text or upload the JD file. Our AI will analyze the requirements to find the perfect alignment.
              </p>
            </div>

            <div className="space-y-8 bg-canvas-parchment/50 p-8 rounded-[32px] border border-hairline">
              <Textarea
                placeholder="Paste the job description here..."
                className="min-h-[300px] text-lg leading-relaxed bg-white border-hairline rounded-[24px] p-8 focus-visible:ring-action-blue/20 focus-visible:border-action-blue transition-all"
                value={jdText}
                onChange={(e) => {
                  setJdText(e.target.value);
                  if (e.target.value) setJdFile(null);
                }}
              />
              
              <div className="flex flex-col sm:flex-row items-center gap-6 pt-4 border-t border-hairline">
                <span className="text-sm font-semibold uppercase tracking-widest text-ink-secondary opacity-40">Or upload file</span>
                <div className="flex flex-1 items-center gap-4 w-full">
                  <Input
                    type="file"
                    accept=".pdf,.docx,.txt"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setJdFile(file);
                        setJdText("");
                      }
                    }}
                    className="flex-1 bg-white border-hairline rounded-xl h-12"
                  />
                  {jdFile && (
                    <Badge variant="secondary" className="bg-action-blue/10 text-action-blue border-transparent py-2 px-4 rounded-lg">
                      {jdFile.name}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Step 3: Strategy & Action (Parchment Tile) */}
      <section className="bg-canvas-parchment py-24">
        <div className="mx-auto section-padding text-center">
          <div className="max-w-[800px] mx-auto mb-16">
            <h2 className="text-4xl font-semibold tracking-[-0.02em] mb-4 text-ink">3. Choose Optimization Strategy</h2>
            <p className="text-lg text-ink-secondary">
              Select how deep you want the AI to go in aligning your profile with the role.
            </p>
          </div>

          <RadioGroup
            value={shouldUpdateEntireResume}
            onValueChange={setShouldUpdateEntireResume}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16"
          >
            <motion.div whileTap={{ scale: 0.98 }}>
              <RadioGroupItem value="false" id="bullets" className="peer sr-only" />
              <Label
                htmlFor="bullets"
                className="flex flex-col items-center p-10 rounded-[32px] border-2 border-hairline bg-white cursor-pointer transition-all duration-300 peer-data-[state=checked]:border-action-blue peer-data-[state=checked]:shadow-2xl peer-data-[state=checked]:shadow-action-blue/10 group h-full"
              >
                <div className="w-16 h-16 rounded-2xl bg-canvas flex items-center justify-center mb-6 group-hover:scale-110 transition-transform peer-data-[state=checked]:bg-action-blue/10 peer-data-[state=checked]:text-action-blue">
                  <AlignLeft className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-semibold mb-3 text-ink">Smart Bullets</h3>
                <p className="text-ink-secondary leading-relaxed opacity-70">
                  Rewrites key experience points to match keywords while maintaining your structure.
                </p>
              </Label>
            </motion.div>

            <motion.div whileTap={{ scale: 0.98 }}>
              <RadioGroupItem value="true" id="entire" className="peer sr-only" />
              <Label
                htmlFor="entire"
                className="flex flex-col items-center p-10 rounded-[32px] border-2 border-hairline bg-white cursor-pointer transition-all duration-300 peer-data-[state=checked]:border-action-blue peer-data-[state=checked]:shadow-2xl peer-data-[state=checked]:shadow-action-blue/10 group h-full"
              >
                <div className="w-16 h-16 rounded-2xl bg-canvas flex items-center justify-center mb-6 group-hover:scale-110 transition-transform peer-data-[state=checked]:bg-action-blue/10 peer-data-[state=checked]:text-action-blue">
                  <Sparkles className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-semibold mb-3 text-ink">Total Evolution</h3>
                <p className="text-ink-secondary leading-relaxed opacity-70">
                  Full top-to-bottom optimization for maximum ATS score and recruiter impact.
                </p>
              </Label>
            </motion.div>
          </RadioGroup>

          <Button
            size="lg"
            className="rounded-full text-white px-12 py-8 text-xl font-semibold bg-action-blue hover:bg-action-blue-hover transition-all active:scale-95 group shadow-xl shadow-action-blue/20"
            disabled={matchMutation.isPending}
            onClick={handleRunMatch}
          >
            {matchMutation.isPending ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin mr-3" />
                Processing Match...
              </>
            ) : (
              <>
                Align Resume Now
                <Sparkles className="w-6 h-6 ml-3 group-hover:rotate-12 transition-transform" />
              </>
            )}
          </Button>
        </div>
      </section>
    </div>
  );
}

