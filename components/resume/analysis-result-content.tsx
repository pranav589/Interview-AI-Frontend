"use client";

import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck,
  Download,
  ChevronLeft,
  Target,
} from "lucide-react";
import Link from "next/link";
import { useAnalysisById, useExportAnalysis } from "@/hooks/use-resume";
import { AnalysisResultSkeleton } from "./resume-skeletons";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function AnalysisResultContent() {
  const { id } = useParams();
  const { mutate: exportAnalysis, isPending: isExporting } = useExportAnalysis();
  const { data: analysis, isLoading } = useAnalysisById(id as string);

  const handleDownload = () => {
    if (!id) return;
    exportAnalysis(id as string, {
      onSuccess: () => {
        toast.success("Analysis report downloaded successfully.");
      },
      onError: (error: any) => {
        console.error(error);
        toast.error("Failed to download report. Please try again.");
      }
    });
  };

  if (isLoading) return <AnalysisResultSkeleton />;
  if (!analysis) return (
    <div className="bg-canvas min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
      <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-8">
        <AlertCircle className="w-10 h-10 text-muted-foreground/40" />
      </div>
      <h2 className="text-display-md font-semibold text-ink">Analysis not found.</h2>
      <p className="text-body text-muted-foreground mt-4 max-w-sm">The report you're looking for might have been moved or deleted.</p>
    </div>
  );

  const sectionOrder = [
    { key: "contact", label: "Contact Info" },
    { key: "summary", label: "Summary" },
    { key: "experience", label: "Experience" },
    { key: "education", label: "Education" },
    { key: "skills", label: "Skills" },
    { key: "projects", label: "Projects" },
    { key: "certifications", label: "Certs" },
  ];

  return (
    <div className="bg-canvas selection:bg-primary/10">
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-screen">
        
        {/* LEFT COLUMN: Metrics & Audit (4/12) */}
        <aside className="lg:col-span-4 border-r border-hairline bg-canvas flex flex-col h-full overflow-hidden">
          {/* Back Button */}
          <div className="px-8 pt-8 lg:px-12 lg:pt-12 pb-0">
            <Link href="/resume/analyzer">
              <Button 
                variant="ghost" 
                size="sm" 
                className="-ml-3 h-8 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-ink hover:bg-transparent"
              >
                <ChevronLeft className="mr-1 w-3.5 h-3.5" />
                Back to Analyzer
              </Button>
            </Link>
          </div>

          {/* ATS Score Hero */}
          <section className="p-8 lg:p-12 pt-4 lg:pt-6 border-b border-hairline bg-canvas">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <Badge className="bg-primary/10 text-primary border-none rounded-pill px-3 py-0.5 text-[9px] font-bold uppercase tracking-widest">
                  Audit Result
                </Badge>
                <div className="flex items-baseline gap-2">
                  <h1 className="text-6xl lg:text-7xl font-bold text-ink tracking-tighter">
                    {analysis.atsScore || 0}%
                  </h1>
                  <span className="text-caption font-bold text-muted-foreground uppercase tracking-wider">ATS Score</span>
                </div>
              </div>

              <div className="w-full bg-canvas-parchment rounded-pill p-0.5 overflow-hidden border border-hairline h-2.5 shadow-inner">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${analysis.atsScore || 0}%` }}
                  transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full bg-primary rounded-pill"
                />
              </div>

              <p className="text-caption font-medium text-ink leading-relaxed">
                {analysis.atsScore >= 80 ? "Exceptional. Your profile is optimized for elite-tier applications." : 
                 analysis.atsScore >= 60 ? "Strong. Targeted refinements will maximize your conversion rate." : 
                 "Needs Work. We've identified critical gaps in your resume structure."}
              </p>

              <div className="pt-2">
                <Button 
                  onClick={handleDownload} 
                  disabled={isExporting}
                  className="w-full rounded-pill text-base font-bold shadow-md bg-primary text-white hover:bg-primary/90 transition-all active:scale-95"
                >
                  {isExporting ? "Exporting..." : "Download Report"}
                  <Download className="ml-2 w-3.5 h-3.5" />
                </Button>
              </div>
            </motion.div>
          </section>

          {/* Structural Health & Keywords with Tabs */}
          <div className="flex-grow overflow-hidden flex flex-col bg-canvas-parchment/50">
            <Tabs defaultValue="audit" className="flex flex-col h-full">
              <div className="px-8 pt-6 pb-2">
                <TabsList className="bg-canvas border border-hairline rounded-pill p-1 h-auto w-full overflow-hidden">
                  <TabsTrigger 
                    value="audit" 
                    className="rounded-pill text-xs px-4 py-2 flex-1 font-bold uppercase tracking-wider"
                  >
                    Audit
                  </TabsTrigger>
                  <TabsTrigger 
                    value="keywords" 
                    className="rounded-pill text-xs px-4 py-2 flex-1 font-bold uppercase tracking-wider"
                  >
                    Keywords
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="flex-grow overflow-y-auto px-8 py-4">
                <TabsContent value="audit" className="m-0 space-y-6 focus-visible:outline-none">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                      <span className="text-xs font-bold uppercase tracking-widest text-ink">Structural Health</span>
                    </div>
                    <div className="grid grid-cols-1 gap-1.5">
                      {sectionOrder.map(({ key, label }, i) => {
                        const section = analysis.sections?.[key as keyof typeof analysis.sections];
                        if (!section) return null;

                        return (
                          <motion.div
                            key={key}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="flex items-center justify-between p-2.5 bg-canvas border border-hairline rounded-xl shadow-sm"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className={cn(
                                "w-1 h-1 rounded-full",
                                section.present ? "bg-primary" : "bg-destructive"
                              )} />
                              <span className="text-xs font-semibold text-ink truncate w-24 sm:w-28">{label}</span>
                            </div>
                            <div className="flex items-center gap-2.5">
                              <div className="w-10 sm:w-12 bg-canvas-parchment h-1 rounded-full overflow-hidden hidden sm:block">
                                <div 
                                  className={cn(
                                    "h-full rounded-full",
                                    section.score >= 80 ? "bg-primary" : section.score >= 60 ? "bg-primary/50" : "bg-destructive/50"
                                  )}
                                  style={{ width: `${section.score}%` }}
                                />
                              </div>
                              <span className="text-[10px] font-bold text-muted-foreground w-6 text-right">{section.score}</span>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="keywords" className="m-0 space-y-8 focus-visible:outline-none">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-xs font-bold uppercase tracking-widest text-ink">Keywords Found</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {(analysis.keywordsFound || []).map((kw: string) => (
                        <Badge key={kw} className="bg-canvas border border-hairline text-emerald-700 py-1 px-3 rounded-pill text-[10px] font-semibold">
                          {kw}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                      <span className="text-xs font-bold uppercase tracking-widest text-ink">Keywords Missing</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {(analysis.keywordsMissing || []).map((kw: string) => (
                        <Badge key={kw} className="bg-red-500/5 border border-red-500/10 text-red-700 py-1 px-3 rounded-pill text-[10px] font-semibold">
                          {kw}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </aside>

        {/* RIGHT COLUMN: Strategy & Insights (8/12) */}
        <main className="lg:col-span-8 bg-canvas-parchment flex flex-col h-full overflow-hidden">
          <Tabs defaultValue="roadmap" className="flex flex-col h-full">
            <div className="px-6 lg:px-8 py-6 bg-canvas-parchment border-b border-hairline">
              <TabsList className="bg-canvas border border-hairline rounded-pill p-1 h-auto w-full md:w-auto overflow-hidden">
                <TabsTrigger 
                  value="roadmap" 
                  className="rounded-pill text-sm md:text-lg px-4 md:px-16 py-2 md:py-2 flex-1 md:flex-none"
                >
                  Roadmap
                </TabsTrigger>
                <TabsTrigger 
                  value="analysis" 
                  className="rounded-pill text-sm md:text-lg px-4 md:px-16 py-2 md:py-2 flex-1 md:flex-none"
                >
                  Insights
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-grow overflow-y-auto">
              <TabsContent value="roadmap" className="m-0 focus-visible:outline-none">
                <section className="p-6 lg:p-8 space-y-10">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-primary">
                      <Target className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-[0.2em]">Execution Roadmap</span>
                    </div>
                    <h2 className="text-3xl font-semibold text-ink tracking-tight leading-tight">
                      Your path to the interview.
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(analysis.topRecommendations || []).map((rec: string, i: number) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-start gap-4 p-6 rounded-2xl bg-canvas border border-hairline group hover:border-primary/30 transition-all shadow-sm"
                      >
                        <div className="w-8 h-8 rounded-full bg-ink text-white flex items-center justify-center text-xs font-bold shrink-0 group-hover:bg-primary transition-colors">
                          {i + 1}
                        </div>
                        <p className="text-sm text-ink font-medium leading-relaxed pt-0.5">{rec}</p>
                      </motion.div>
                    ))}
                  </div>
                </section>
              </TabsContent>

              <TabsContent value="analysis" className="m-0 focus-visible:outline-none">
                <section className="p-6 lg:p-8 lg:pb-24 grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Strengths */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                      </div>
                      <h3 className="text-xs font-bold text-ink uppercase tracking-wider">Top Strengths</h3>
                    </div>
                    <div className="space-y-3">
                      {(analysis.overallPositives || []).map((text: string, i: number) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="p-5 bg-canvas border border-hairline rounded-2xl shadow-sm"
                        >
                          <p className="text-sm text-ink font-medium leading-relaxed">{text}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Gaps */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-destructive/10 rounded-xl flex items-center justify-center">
                        <AlertCircle className="w-4 h-4 text-destructive" />
                      </div>
                      <h3 className="text-xs font-bold text-ink uppercase tracking-wider">Critical Gaps</h3>
                    </div>
                    <div className="space-y-3">
                      {(analysis.overallNegatives || []).map((text: string, i: number) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + i * 0.1 }}
                          className="p-5 bg-canvas border border-hairline rounded-2xl shadow-sm"
                        >
                          <p className="text-sm text-ink font-medium leading-relaxed">{text}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </section>
              </TabsContent>
            </div>
          </Tabs>
        </main>

      </div>
    </div>
  );
}
