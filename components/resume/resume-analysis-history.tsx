"use client";

import { useAnalyses } from "@/hooks/use-resume";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Calendar, ArrowRight, TrendingUp, Search } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";

export function ResumeAnalysisHistory() {
  const { data: analyses, isLoading } = useAnalyses();

  if (isLoading) {
    return (
      <div className={"space-y-6"}>
        <div className={"grid gap-4"}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className={"h-24 w-full rounded-lg"} />
          ))}
        </div>
      </div>
    );
  }

  if (!analyses || analyses.length === 0) {
    return null;
  }



  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h2 className="text-4xl font-semibold tracking-[-0.02em] text-ink flex items-center gap-3">
            <Search className="w-8 h-8 text-primary" />
            Previous Analyses
          </h2>
          <p className="text-lg text-ink/40">Your historical analysis reports and ATS scores.</p>
        </div>
        <Badge variant="outline" className="px-4 py-1.5 rounded-pill border-hairline text-ink/60 bg-canvas text-sm font-normal">
          {analyses.length} total reports
        </Badge>
      </div>

      <div className="grid gap-4">
        {analyses.map((analysis, index) => (
          <motion.div
            key={analysis._id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Link 
              href={`/resume/analyzer/${analysis._id}`}
              className="group block"
            >
              <div className="flex flex-col md:flex-row items-center justify-between p-6 bg-canvas border border-hairline rounded-[18px] hover:border-primary/50 transition-all duration-300 active:scale-[0.99]">
                <div className="flex items-center gap-6 w-full md:w-auto">
                  <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                    <FileText className="w-7 h-7 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-xl text-ink mb-2 group-hover:text-primary transition-colors">
                      {analysis.title || "Resume Analysis Report"}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-ink/40">
                      <span className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {formatDate(analysis.createdAt)}
                      </span>
                      <span className="flex items-center gap-2 font-medium text-emerald-600">
                        <TrendingUp className="w-4 h-4" />
                        ATS Score: {analysis.atsScore}%
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 md:mt-0 flex items-center gap-4 w-full md:w-auto justify-end">
                  <Button variant="ghost" className="rounded-pill text-primary font-medium hover:bg-primary/5 group/btn">
                    View Report
                    <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

