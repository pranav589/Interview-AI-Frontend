"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, Download, PlayCircle, Sparkles, Copy, Loader2, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useExportJdMatch, useJdMatchById } from "@/hooks/use-resume";
import { JdMatchResultSkeleton } from "./resume-skeletons";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function JdMatchResultContent() {
  const { id } = useParams();
  const router = useRouter();

  const { data: match, isLoading } = useJdMatchById(id as string);
  const exportMutation = useExportJdMatch();

  if (isLoading) return <JdMatchResultSkeleton />;
  if (!match) return (
    <div className="bg-canvas min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
      <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-8">
        <AlertCircle className="w-10 h-10 text-muted-foreground/40" />
      </div>
      <h2 className="text-display-md font-semibold text-ink">Analysis not found.</h2>
      <p className="text-body text-muted-foreground mt-4 max-w-sm">The match analysis you're looking for might have been moved or deleted.</p>
    </div>
  );

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const handleStartInterview = () => {
    const params = new URLSearchParams();
    params.append("jobTitle", match.jobTitle || "");
    params.append("company", match.company || "");
    params.append("jd", match.jobDescription || "");
    router.push(`/interview-setup?${params.toString()}`);
  };

  const handleDownload = () => {
    toast.info("Generating your optimized resume PDF...");
    exportMutation.mutate({ matchId: id as string }, {
      onSuccess: () => {
        toast.success("PDF generated successfully!");
      },
      onError: () => {
        toast.error("Failed to generate PDF. Please try again.");
      },
    });
  };

  const optimizedBullets = Array.isArray(match.updatedResumeSections)
    ? match.updatedResumeSections
    : Object.entries(match.updatedResumeSections || {}).map(([original, improved]) => ({
        original,
        improved,
      }));

  return (
    <div className="bg-canvas selection:bg-primary/10">
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-screen">
        
        {/* LEFT COLUMN: Metrics & Core Stats (4/12) */}
        <aside className="lg:col-span-4 border-r border-hairline bg-canvas flex flex-col">
          {/* Back Button */}
          <div className="px-8 pt-8 lg:px-12 lg:pt-12 pb-0">
            <Link href="/resume/jd-match">
              <Button 
                variant="ghost" 
                size="sm" 
                className="-ml-3 h-8 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-ink hover:bg-transparent"
              >
                <ChevronLeft className="mr-1 w-3.5 h-3.5" />
                Back to Matcher
              </Button>
            </Link>
          </div>

          {/* Match Score Hero */}
          <section className="p-8 lg:p-12 pt-4 lg:pt-6 border-b border-hairline bg-canvas">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge className="bg-primary/10 text-primary border-none rounded-pill px-3 py-0.5 text-[9px] font-bold uppercase tracking-widest">
                    Match Result
                  </Badge>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    {match.company || "Target Company"}
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <h1 className="text-6xl lg:text-7xl font-bold text-ink tracking-tighter tabular-nums">
                    {match.matchScore}%
                  </h1>
                  <span className="text-caption font-bold text-muted-foreground uppercase tracking-wider">Match Score</span>
                </div>
                <h2 className="text-xl font-semibold text-ink leading-tight">
                  {match.jobTitle || "Target Role"}
                </h2>
              </div>

              <div className="w-full bg-canvas-parchment rounded-pill p-0.5 overflow-hidden border border-hairline h-2.5 shadow-inner">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${match.matchScore}%` }}
                  transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full bg-primary rounded-pill"
                />
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <Button 
                  onClick={handleDownload} 
                  disabled={exportMutation.isPending}
                  className="w-full rounded-pill h-12 text-[11px] font-bold shadow-md bg-primary text-white hover:bg-primary/90 transition-all active:scale-95"
                >
                  {exportMutation.isPending ? "Generating PDF..." : "Download Optimized Resume"}
                  {exportMutation.isPending ? <Loader2 className="ml-2 w-3.5 h-3.5 animate-spin" /> : <Download className="ml-2 w-3.5 h-3.5" />}
                </Button>
                <Button 
                  onClick={handleStartInterview} 
                  variant="outline"
                  className="w-full rounded-pill h-12 text-[11px] font-bold border-hairline hover:bg-canvas-parchment transition-all active:scale-95"
                >
                  Start Interview Practice
                  <PlayCircle className="ml-2 w-3.5 h-3.5" />
                </Button>
              </div>
            </motion.div>
          </section>

          {/* Keywords & Gaps */}
          <section className="p-8 lg:p-12 border-b border-hairline bg-canvas-parchment/50 space-y-12">
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-ink">Matched Keywords</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {match.matchedKeywords.map((kw: string, i: number) => (
                  <Badge key={kw} className="bg-canvas border border-hairline text-emerald-700 py-1 px-3 rounded-pill text-[10px] font-semibold">
                    {kw}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-ink">Critical Gaps</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {match.missingKeywords.map((kw: string, i: number) => (
                  <Badge key={kw} className="bg-red-500/5 border border-red-500/10 text-red-700 py-1 px-3 rounded-pill text-[10px] font-semibold">
                    {kw}
                  </Badge>
                ))}
              </div>
            </div>
          </section>
        </aside>

        {/* RIGHT COLUMN: AI Optimization (8/12) */}
        <main className="lg:col-span-8 bg-canvas-parchment overflow-y-auto">
          {/* Optimization Header */}
          <section className="p-8 lg:p-16 lg:pb-0">
            <div className="max-w-3xl space-y-4">
              <div className="flex items-center gap-2 text-primary">
                <Sparkles className="w-5 h-5" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">AI Intelligence</span>
              </div>
              <h2 className="text-display-md font-semibold text-ink tracking-tight leading-tight">
                Optimized for maximum impact.
              </h2>
              <p className="text-body text-muted-foreground leading-relaxed">
                We've analyzed the job requirements and refined your content to align with what recruiters and ATS systems are looking for.
              </p>
            </div>
          </section>

          {/* Optimized Content Display */}
          <section className="p-8 lg:p-16 space-y-8">
            <div className="bg-canvas border border-hairline rounded-[32px] overflow-hidden shadow-sm">
              <div className="p-8 border-b border-hairline bg-canvas">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-ink">
                    {match.shouldUpdateEntireResume ? "Rewritten Resume" : "Optimized Bullet Points"}
                  </h3>
                  <Badge variant="outline" className="rounded-full px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Draft 01
                  </Badge>
                </div>
              </div>
              
              <div className="p-8 space-y-6">
                {match.shouldUpdateEntireResume ? (
                  <div className="relative group bg-canvas-parchment/30 rounded-2xl border border-hairline p-10">
                    <pre className="whitespace-pre-wrap font-sans text-[15px] leading-relaxed text-foreground/80 selection:bg-primary/20">
                      {match.updatedResumeSections}
                    </pre>
                    <Button 
                      variant="secondary" 
                      size="icon" 
                      className="absolute top-6 right-6 hover:bg-primary hover:text-white transition-all rounded-full shadow-lg"
                      onClick={() => copyToClipboard(match.updatedResumeSections)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <AnimatePresence>
                      {optimizedBullets.map((item: any, index: number) => (
                        <motion.div 
                          key={`${item.original}-${index}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 + index * 0.1 }}
                          className="group relative p-8 rounded-[24px] border border-hairline bg-canvas hover:border-primary/20 transition-all"
                        >
                          <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
                            <div>
                              <div className="text-[10px] font-black text-muted-foreground mb-3 uppercase tracking-[0.2em]">Original Context</div>
                              <p className="text-sm line-through text-muted-foreground/60 leading-relaxed">{item.original}</p>
                            </div>
                            <div className="pt-4 border-t border-hairline">
                              <div className="text-[10px] font-black text-primary mb-3 uppercase tracking-[0.2em] flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5" /> Improved for Impact
                              </div>
                              <p className="text-lg font-medium text-ink leading-relaxed">{item.improved}</p>
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all hover:bg-primary/10 text-primary rounded-full"
                            onClick={() => copyToClipboard(item.improved)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Section Feedback */}
          <section className="p-8 lg:p-16 pt-0 space-y-10">
            <div className="space-y-4">
              <h3 className="text-[10px] font-bold text-ink uppercase tracking-[0.2em]">Strategic Feedback</h3>
              <p className="text-sm text-muted-foreground max-w-xl">Deep-dive analysis into specific sections of your resume and how to bridge the gap.</p>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {match.sectionFeedback.map((fb: any, i: number) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  className="p-10 rounded-[32px] bg-canvas border border-hairline flex flex-col md:flex-row gap-10"
                >
                  <div className="md:w-1/3 space-y-3">
                    <Badge className="bg-primary/10 text-primary border-none rounded-pill px-3 py-0.5 text-[9px] font-bold uppercase tracking-widest">
                      {fb.section}
                    </Badge>
                    <h4 className="text-xl font-bold text-ink leading-tight">Potential Risk Identified</h4>
                  </div>
                  <div className="md:w-2/3 space-y-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-red-500">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Gap</span>
                      </div>
                      <p className="text-body text-muted-foreground leading-relaxed">{fb.gap}</p>
                    </div>
                    <div className="p-6 bg-primary/5 border border-primary/10 rounded-2xl space-y-2">
                      <div className="flex items-center gap-2 text-primary">
                        <Sparkles className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Strategic Recommendation</span>
                      </div>
                      <p className="text-body font-medium text-ink leading-relaxed italic">"{fb.suggestion}"</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
