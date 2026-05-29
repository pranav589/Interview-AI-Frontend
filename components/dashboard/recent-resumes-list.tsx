"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Upload,
  Loader2,
  CheckCircle2,
  Star,
  Award,
  Zap,
  Sparkles,
  ArrowRight,
  Database,
  Search,
  Plus
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useSuspenseResumes, useSetDefaultResume, useUploadResume, Resume } from "@/hooks/use-resume";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  completed: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  processing: "border-primary/20 bg-primary/10 text-primary dark:text-primary-foreground",
  pending: "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  failed: "border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-400",
};

const formatDate = (value?: string) => {
  if (!value) return "Recently saved";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently saved";
  return `${formatDistanceToNow(date, { addSuffix: true })}`;
};

export function RecentResumesList() {
  const resumesQuery = useSuspenseResumes();
  const setDefaultMutation = useSetDefaultResume();
  const uploadMutation = useUploadResume();
  const resumes = resumesQuery.data || [];
  const defaultResume = resumes.find((r) => r.isDefault);

  const handleSetDefault = (resume: Resume, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (resume.isDefault || setDefaultMutation.isPending) return;

    setDefaultMutation.mutate(resume._id, {
      onSuccess: () => {
        toast.success(`"${resume.name}" is now your default resume.`);
      },
      onError: (error: any) => {
        toast.error(error?.message || "Failed to update default resume.");
      },
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
              toast.info("Extraction is already running in the background.");
              return;
            }

            const shouldReextract = window.confirm(
              status === "failed"
                ? "The previous extraction failed. Retry extraction in the background?"
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
              ? "Resume uploaded. Details are being extracted in the background."
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

  // Limit display to recent 3 resumes for dashboard clean aesthetic
  const displayedResumes = resumes.slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border pb-6">
        <div>
          <h2 className="text-tagline font-semibold tracking-tight">Recent Resumes</h2>
          <p className="text-caption text-muted-foreground">
            Manage your credentials, evaluate ATS metrics, and match matching job targets
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            asChild
            className={cn(
              "h-11 rounded-full px-5 text-sm font-semibold shadow-sm text-white",
              uploadMutation.isPending && "opacity-80 pointer-events-none"
            )}
            disabled={uploadMutation.isPending}
          >
            <label className="cursor-pointer flex items-center justify-center gap-2">
              <Input
                type="file"
                className="hidden"
                accept=".pdf"
                onChange={handleFileUpload}
                disabled={uploadMutation.isPending}
              />
              {uploadMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              Upload Resume
            </label>
          </Button>

          <Link href="/resume/vault">
            <Button variant="outline" className="h-11 rounded-full bg-secondary border-hairline font-semibold gap-2 px-5">
              <Database className="w-4 h-4 text-primary" />
              Manage Vault
            </Button>
          </Link>
        </div>
      </div>

      <div className="relative min-h-[250px]">
        {displayedResumes.length === 0 ? (
          <div className="text-center py-16 bg-muted/10 rounded-2xl border-2 border-dashed border-border/50">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center"
            >
              <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mb-6">
                <FileText className="w-8 h-8 text-primary/40 animate-pulse" />
              </div>
              <h3 className="text-xl font-bold mb-2">
                Your Resume Vault is empty
              </h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto text-sm leading-relaxed px-4">
                Upload your resume in PDF format to evaluate ATS readability, run custom JD target matching audit, or build dynamic profile versions.
              </p>

              <Button
                asChild
                className={cn(
                  "h-12 rounded-full px-8 text-base font-bold shadow-lg shadow-primary/10 text-white",
                  uploadMutation.isPending && "opacity-80 pointer-events-none"
                )}
                disabled={uploadMutation.isPending}
              >
                <label className="cursor-pointer flex items-center justify-center gap-2">
                  <Input
                    type="file"
                    className="hidden"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    disabled={uploadMutation.isPending}
                  />
                  {uploadMutation.isPending ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Plus className="h-5 w-5" />
                  )}
                  Upload Your First Resume
                </label>
              </Button>
            </motion.div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {displayedResumes.map((resume, index) => {
                const status = resume.extractionStatus || "pending";
                const isUpdating = setDefaultMutation.isPending && setDefaultMutation.variables === resume._id;

                return (
                  <motion.div
                    key={resume._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className={cn(
                      "border-hairline bg-parchment/40 dark:bg-ink/10 backdrop-blur-xl transition-all group relative overflow-hidden select-none hover:shadow-md hover:border-primary/20",
                      resume.isDefault && "border-primary/30 bg-white/70 dark:bg-ink/20"
                    )}>
                      <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-5">
                        <div className="flex items-start gap-4">
                          <div className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center transition-colors flex-shrink-0",
                            resume.isDefault
                              ? "bg-primary text-primary-foreground"
                              : "bg-primary/5 text-primary dark:bg-primary/10"
                          )}>
                            <FileText className="w-6 h-6" />
                          </div>

                          <div className="space-y-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-semibold text-base tracking-tight text-ink line-clamp-1 group-hover:text-primary transition-colors">
                                {resume.name}
                              </h3>
                              {resume.isDefault && (
                                <Badge className="bg-primary/10 hover:bg-primary/15 text-primary border-none font-semibold text-[10px] uppercase tracking-wider py-0.5 px-2.5 rounded-full flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  Default
                                </Badge>
                              )}
                            </div>

                            <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium">
                              <span>Saved {formatDate(resume.updatedAt || resume.createdAt)}</span>
                              <span className="text-hairline">•</span>
                              <Badge variant="outline" className={cn("text-[10px] px-2 py-0 rounded-full font-semibold capitalize", statusStyles[status] || "border-hairline text-ink/50")}>
                                {status}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center flex-wrap gap-2.5 md:self-center">
                          {/* Set Default Toggle */}
                          {!resume.isDefault && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => handleSetDefault(resume, e)}
                              disabled={setDefaultMutation.isPending}
                              className="rounded-full text-xs font-semibold gap-1.5 h-9 text-muted-foreground hover:text-primary transition-colors"
                              title="Set as Default Resume"
                            >
                              {isUpdating ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                              ) : (
                                <Star className="w-3.5 h-3.5" />
                              )}
                              Set Default
                            </Button>
                          )}

                          {/* ATS Review CTA */}
                          <Link href={`/resume/analyzer?resumeId=${resume._id}`}>
                            <Button variant="secondary" size="sm" className="rounded-full text-xs font-semibold gap-1.5 h-9 bg-parchment/60 hover:bg-parchment/100 dark:bg-ink/20 dark:hover:bg-ink/30 border border-hairline">
                              <Award className="w-3.5 h-3.5 text-cyan-500" />
                              ATS Audit
                            </Button>
                          </Link>

                          {/* JD Match CTA */}
                          <Link href={`/resume/jd-match?resumeId=${resume._id}`}>
                            <Button variant="secondary" size="sm" className="rounded-full text-xs font-semibold gap-1.5 h-9 bg-parchment/60 hover:bg-parchment/100 dark:bg-ink/20 dark:hover:bg-ink/30 border border-hairline">
                              <Zap className="w-3.5 h-3.5 text-rose-500" />
                              JD Match
                            </Button>
                          </Link>

                          {/* Open Builder CTA */}
                          <Link href={`/resume/builder?resumeId=${resume._id}`}>
                            <Button variant="secondary" size="sm" className="rounded-full text-xs font-semibold gap-1.5 h-9 bg-parchment/60 hover:bg-parchment/100 dark:bg-ink/20 dark:hover:bg-ink/30 border border-hairline">
                              <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
                              AI Editor
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {resumes.length > 3 && (
              <div className="flex justify-center pt-2">
                <Link href="/resume/vault">
                  <Button variant="ghost" className="text-sm font-semibold text-primary gap-1.5 hover:bg-primary/5 rounded-full px-6 py-2">
                    View remaining {resumes.length - 3} resume{resumes.length - 3 === 1 ? "" : "s"} in Vault
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
