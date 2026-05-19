"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { ArrowRight, CheckCircle2, Database, FileText, Loader2, Star, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Resume, useResumes, useSetDefaultResume, useUploadResume } from "@/hooks/use-resume";

const statusStyles: Record<string, string> = {
  completed: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700",
  processing: "border-action-blue/20 bg-action-blue/10 text-action-blue",
  pending: "border-amber-500/20 bg-amber-500/10 text-amber-700",
  failed: "border-red-500/20 bg-red-500/10 text-red-700",
};

const formatDate = (value?: string) => {
  if (!value) return "Recently saved";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently saved";
  return `${formatDistanceToNow(date, { addSuffix: true })}`;
};

const getPreview = (resume: Resume) => {
  const text = resume.resumeText?.replace(/\s+/g, " ").trim();
  if (!text) return "No preview text available yet.";
  return text.length > 170 ? `${text.slice(0, 170)}...` : text;
};

export function ResumeVaultContent() {
  const resumesQuery = useResumes();
  const setDefaultMutation = useSetDefaultResume();
  const uploadMutation = useUploadResume();
  const resumes = resumesQuery.data || [];
  const defaultResume = resumes.find((resume) => resume.isDefault);

  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const handleSetDefault = (resume: Resume) => {
    if (resume.isDefault || setDefaultMutation.isPending) return;

    setDefaultMutation.mutate(resume._id, {
      onSuccess: () => {
        toast.success(`"${resume.name}" is now your default resume.`);
        setIsDetailsOpen(false);
      },
      onError: (error: any) => toast.error(error?.message || "Failed to update default resume."),
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const uploadFile = (forceReextract = false) => {
      const formData = new FormData();
      formData.append("resume", file);
      formData.append("name", file.name);
      if (forceReextract) formData.append("forceReextract", "true");

      uploadMutation.mutate(formData, {
        onSuccess: (res: any) => {
          const data = res?.data || {};
          const status = data.extractionStatus;

          if (data.isDuplicate && !data.startedExtraction && !forceReextract) {
            if (status === "pending" || status === "processing") {
              toast.info("Extraction is already running in the background. We'll notify you when it's ready.");
              return;
            }

            const shouldReextract = window.confirm(
              status === "failed"
                ? "The previous extraction for this resume failed. Do you want to retry extraction in the background?"
                : "This resume has already been extracted. Do you want to extract it again?"
            );

            if (shouldReextract) {
              uploadFile(true);
              return;
            }

            toast.success("Using the existing extracted resume.");
            return;
          }

          toast.success(
            data.startedExtraction
              ? "Resume uploaded. Details are being extracted in the background; we'll notify you when it's ready."
              : "Resume uploaded!"
          );
        },
        onError: (error: any) => {
          toast.error(error.message || "Upload failed");
        },
      });
    };

    uploadFile(false);
  };

  return (
    <div className="w-full bg-canvas">
      {/* SECTION 1: EDITORIAL HERO (Pure White) */}
      <section className="relative min-h-[85vh] flex items-center border-b border-hairline overflow-hidden bg-canvas">
        <div className="mx-auto px-6 lg:px-12 w-full grid grid-cols-1 lg:grid-cols-2 gap-16 py-12 md:py-20">
          <div className="flex flex-col justify-center space-y-8 z-10">
            <div className="animate-in fade-in slide-in-from-left-4 duration-700 ease-out fill-mode-both">
              <div className="flex items-center gap-2 mb-6">
                <div className="h-[1px] w-8 bg-action-blue" />
                <span className="text-action-blue font-semibold tracking-wider text-xs uppercase">Resume Vault</span>
              </div>
              
              <h1 className="text-[56px] md:text-[72px] font-semibold leading-[1.05] tracking-[-0.03em] mb-8 text-ink">
                Your saved <br />
                <span className="text-ink/40">resume library.</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-ink/50 leading-relaxed max-w-[540px] font-medium mb-6 md:mb-12">
                Review every resume attached to your account and choose the default profile used across interview and resume tools.
              </p>
              
              <div className="flex flex-wrap gap-4 pt-4">
                <Button 
                  size="lg" 
                  className="rounded-pill w-full md:w-auto px-10 h-14 text-white text-lg font-semibold bg-action-blue hover:bg-action-blue-hover transition-all active:scale-95 group shadow-xl shadow-action-blue/20"
                  onClick={() => document.getElementById('resume-vault-grid')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <Database className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                  View Vault
                </Button>
              </div>
            </div>
          </div>

          <div className="relative aspect-[4/3] rounded-[32px] overflow-hidden bg-canvas-parchment border border-hairline group shadow-2xl animate-in fade-in zoom-in-95 duration-1000 ease-out fill-mode-both">
            <Image 
              src="/resume-hero.png" 
              alt="Resume Vault Ecosystem" 
              fill 
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              priority
            />
          </div>
        </div>
      </section>

      {/* SECTION 2: GRID */}
      <section id="resume-vault-grid" className="bg-canvas-parchment py-12 md:py-24 border-b border-hairline">
        <div className="mx-auto px-6 lg:px-12">
          <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="max-w-xl">
              <h2 className="text-4xl lg:text-5xl font-semibold tracking-[-0.03em] text-ink leading-tight mb-4">
                Saved resumes.
              </h2>
              <p className="text-lg text-ink/40 leading-relaxed">
                {resumes.length ? `${resumes.length} resume${resumes.length === 1 ? "" : "s"} in your vault` : "Upload a resume to start your vault"}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <label className="h-12 rounded-pill bg-action-blue px-8 text-white hover:bg-action-blue-hover text-base flex items-center justify-center cursor-pointer transition-colors shadow-sm">
                <Input
                  type="file"
                  className="hidden"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  disabled={uploadMutation.isPending}
                />
                {uploadMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="mr-2 h-4 w-4" />
                )}
                Upload Resume
              </label>
            </div>
          </div>

          {resumesQuery.isLoading ? (
            <div className="flex justify-center mt-8">
              <Loader2 className="h-6 w-6 animate-spin text-action-blue" />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
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
                    <Loader2 className="w-5 h-5 text-action-blue animate-spin" />
                  ) : (
                    <Upload className="w-5 h-5 text-action-blue" />
                  )}
                </div>
                <p className="text-sm font-semibold text-ink">Upload Resume</p>
              </label>

              {resumes.map((resume, index) => {
                const status = resume.extractionStatus || "pending";
                const isUpdating = setDefaultMutation.isPending && setDefaultMutation.variables === resume._id;

                return (
                  <div
                    key={resume._id}
                    onClick={() => {
                      setSelectedResume(resume);
                      setIsDetailsOpen(true);
                    }}
                    className={cn(
                      "group relative flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 min-h-[160px] animate-in fade-in slide-in-from-bottom-4 fill-mode-both",
                      resume.isDefault 
                        ? "border-action-blue bg-white shadow-xl shadow-action-blue/5" 
                        : "border-hairline bg-white/50 hover:border-action-blue/30 hover:bg-white",
                    )}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center transition-colors duration-300", resume.isDefault ? "bg-action-blue text-white" : "bg-action-blue/5 text-action-blue")}>
                          <FileText className="w-5 h-5" />
                        </div>
                        {resume.isDefault ? (
                          <CheckCircle2 className="w-4 h-4 text-action-blue" />
                        ) : isUpdating ? (
                          <Loader2 className="w-4 h-4 animate-spin text-action-blue" />
                        ) : (
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <Star className="w-4 h-4 text-action-blue/40 hover:text-action-blue" />
                          </div>
                        )}
                      </div>
                      <h3 className="text-sm font-semibold text-ink line-clamp-2 leading-tight mb-1">
                        {resume.name}
                      </h3>
                      <p className="text-[10px] text-ink/30 font-medium mb-3">
                        {formatDate(resume.updatedAt || resume.createdAt)}
                      </p>
                      
                      <Badge variant="outline" className={cn("text-[9px] px-1.5 py-0 rounded-pill capitalize inline-flex", statusStyles[status] || "border-hairline text-ink/50")}>
                        {status}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Resume Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] flex flex-col gap-0 p-0 overflow-hidden bg-white">
          <div className="p-6 border-b border-hairline flex-shrink-0">
            <DialogHeader>
              <div className="flex items-start justify-between">
                <div>
                  <DialogTitle className="text-xl font-semibold text-ink flex items-center gap-2">
                    {selectedResume?.name}
                    {selectedResume?.isDefault && (
                      <CheckCircle2 className="w-5 h-5 text-action-blue" />
                    )}
                  </DialogTitle>
                  <DialogDescription className="mt-1">
                    Uploaded on {formatDate(selectedResume?.createdAt)}
                  </DialogDescription>
                </div>
                <Badge variant="outline" className={cn("capitalize rounded-pill", statusStyles[selectedResume?.extractionStatus || "pending"] || "border-hairline text-ink/50")}>
                  {selectedResume?.extractionStatus || "pending"}
                </Badge>
              </div>
            </DialogHeader>
          </div>
          
          <div className="p-6 overflow-y-auto flex-1 bg-canvas/30">
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-ink/70">Parsed Content</h4>
              <div className="bg-white rounded-lg border border-hairline p-4 text-sm text-ink/80 whitespace-pre-wrap font-mono leading-relaxed h-[300px] overflow-y-auto">
                {selectedResume?.resumeText ? selectedResume.resumeText : "No text content has been extracted from this resume yet."}
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-hairline flex-shrink-0 bg-white flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsDetailsOpen(false)} className="rounded-pill">
              Close
            </Button>
            {!selectedResume?.isDefault && (
              <Button 
                onClick={() => selectedResume && handleSetDefault(selectedResume)}
                disabled={setDefaultMutation.isPending}
                className="rounded-pill bg-action-blue text-white hover:bg-action-blue-hover"
              >
                {setDefaultMutation.isPending && setDefaultMutation.variables === selectedResume?._id ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Star className="w-4 h-4 mr-2" />
                )}
                Set as Default
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
