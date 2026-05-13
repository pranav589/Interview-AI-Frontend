"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useResumes, useAnalyzeResume, useUploadResume } from "@/hooks/use-resume";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Search, Loader2, Upload, FileText, CheckCircle2, ArrowRight, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { useFeatureFlags } from "@/lib/feature-flags-context";

export function ResumeAnalyzerContent() {
  const router = useRouter();
  const { isFeatureEnabled, isLoading } = useFeatureFlags();
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);

  if (!isLoading && !isFeatureEnabled("resume_analyzer_enabled")) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-canvas px-6 text-center">
        <div className="w-20 h-20 rounded-full bg-ink/5 flex items-center justify-center mb-8">
          <ShieldCheck className="w-10 h-10 text-ink/20" />
        </div>
        <h1 className="text-3xl font-semibold text-ink mb-4 tracking-tight">Feature Unavailable</h1>
        <p className="text-lg text-ink/40 max-w-md mb-10 leading-relaxed">
          The Resume Analyzer is currently under maintenance or disabled for your account. 
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

  const { data: resumes } = useResumes();
  const uploadMutation = useUploadResume();
  const analyzeMutation = useAnalyzeResume();

  const handleAnalyze = () => {
    if (!selectedResumeId) return;
    analyzeMutation.mutate(selectedResumeId, {
      onSuccess: (res: any) => {
        const jobId = res?.data?.jobId;
        toast.success(res.message || "Analysis started in background!");
        if (jobId) {
          window.localStorage.setItem("lastResumeJobId", jobId);
        }
        router.push("/dashboard");
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to analyze resume");
      },
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

  return (
    <div className="w-full bg-canvas">
      {/* SECTION 1: EDITORIAL HERO (Pure White) */}
      <section className="relative min-h-[85vh] flex items-center border-b border-hairline overflow-hidden bg-canvas">
        <div className="mx-auto px-6 lg:px-12 w-full grid grid-cols-1 lg:grid-cols-2 gap-16 py-12 md:py-20">
          <div className="flex flex-col justify-center space-y-8 z-10">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="flex items-center gap-2 mb-6">
                <div className="h-[1px] w-8 bg-action-blue" />
                <span className="text-action-blue font-semibold tracking-wider text-xs uppercase">Diagnostic Engine</span>
              </div>
              
              <h1 className="text-[56px] md:text-[72px] font-semibold leading-[1.05] tracking-[-0.03em] mb-8 text-ink">
                Audit your story. <br />
                <span className="text-ink/40">Master the ATS.</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-ink/50 leading-relaxed max-w-[540px] font-medium mb-6 md:mb-12">
                Recruiter-grade semantic auditing for your professional narrative. Get a high-performance assessment of your resume's structural integrity.
              </p>
              
              <div className="flex flex-wrap gap-4 pt-4">
                <Button 
                  size="lg" 
                  className="rounded-pill w-full md:w-auto px-10 h-14 text-white text-lg font-semibold bg-action-blue hover:bg-action-blue-hover transition-all active:scale-95 group shadow-xl shadow-action-blue/20"
                  onClick={() => document.getElementById('resume-selection')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <Search className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                  Start Audit
                </Button>
                {/* <Button 
                  variant="outline" 
                  className="rounded-pill border-hairline bg-canvas hover:bg-canvas-parchment px-10 h-14 text-lg font-normal transition-all active:scale-95"
                >
                  View Sample
                </Button> */}
              </div>
            </motion.div>
          </div>

          <motion.div 
            className="relative aspect-[4/3] rounded-[32px] overflow-hidden bg-canvas-parchment border border-hairline group shadow-2xl"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <Image 
              src="/resume-analyzer-hero.png" 
              alt="Resume Diagnostic Logic" 
              fill 
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              priority
            />
          </motion.div>
        </div>
      </section>

      {/* SECTION 2: SELECTION & HISTORY (Parchment Section) - High Density Grid */}
      <section id="resume-selection" className="bg-canvas-parchment py-12 md:py-24 border-b border-hairline">
        <div className="mx-auto px-6 lg:px-12">
          <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="max-w-xl">
              <h2 className="text-4xl lg:text-5xl font-semibold tracking-[-0.03em] text-ink leading-tight mb-4">
                Select source material.
              </h2>
              <p className="text-lg text-ink/40 leading-relaxed">
                Choose a version from your vault or upload a new PDF to begin.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {/* Upload Card - Compact */}
            <label className="group relative flex flex-col items-center justify-center p-4 rounded-xl border-2 border-hairline border-dashed bg-white/50 hover:bg-white hover:border-action-blue/50 cursor-pointer transition-all duration-300 min-h-[160px]">
              <Input
                type="file"
                className="hidden"
                accept=".pdf"
                onChange={handleFileUpload}
                disabled={uploadMutation.isPending}
              />
              <div className="w-10 h-10 rounded-full bg-action-blue/5 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-500">
                {uploadMutation.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin text-action-blue" />
                ) : (
                  <Upload className="w-5 h-5 text-action-blue" />
                )}
              </div>
              <p className="text-sm font-semibold text-ink">Upload PDF</p>
            </label>

            {/* Resume Cards - Compact */}
            {resumes?.map((resume: any, index: number) => (
              <motion.div
                key={resume._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.5 }}
                onClick={() => setSelectedResumeId(resume._id)}
                className={`group relative flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 min-h-[160px] ${
                  selectedResumeId === resume._id 
                  ? "border-action-blue bg-white shadow-xl shadow-action-blue/5" 
                  : "border-hairline bg-white/50 hover:border-action-blue/30 hover:bg-white"
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors duration-300 ${
                      selectedResumeId === resume._id ? "bg-action-blue text-white" : "bg-action-blue/5 text-action-blue"
                    }`}>
                      <FileText className="w-5 h-5" />
                    </div>
                    {selectedResumeId === resume._id && (
                      <CheckCircle2 className="w-4 h-4 text-action-blue" />
                    )}
                  </div>
                  <h3 className="text-sm font-semibold text-ink line-clamp-2 leading-tight mb-1">
                    {resume.name}
                  </h3>
                  <p className="text-[10px] text-ink/30 font-medium">
                    {new Date(resume.updatedAt || resume.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-16 flex justify-center">
            <Button
              size="lg"
              disabled={!selectedResumeId || analyzeMutation.isPending}
              onClick={handleAnalyze}
              className="rounded-pill px-12 py-8 text-white text-xl font-semibold bg-action-blue hover:bg-action-blue-hover transition-all active:scale-95 disabled:opacity-30 shadow-xl shadow-action-blue/20"
            >
              {analyzeMutation.isPending ? (
                <>
                  <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  Analyze Now
                  <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
