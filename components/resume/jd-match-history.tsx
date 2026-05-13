"use client";

import { useSuspenseJdMatches } from "@/hooks/use-resume";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Briefcase, Calendar, ArrowRight, Target, Building2 } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

export function JdMatchHistory() {
  const { data: matches } = useSuspenseJdMatches();

  if (!matches || matches.length === 0) {
    return null;
  }

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h2 className="text-4xl font-semibold tracking-[-0.02em] text-ink flex items-center gap-3">
            <Target className="w-8 h-8 text-action-blue" />
            Match Vault
          </h2>
          <p className="text-lg text-ink/40">Review your past role alignments and AI-optimized resumes.</p>
        </div>
        <Badge variant="outline" className="px-4 py-1.5 rounded-pill border-hairline text-ink/60 bg-canvas text-sm font-normal">
          {matches.length} total matches
        </Badge>
      </div>

      <div className="grid gap-4">
        {matches.map((match, index) => (
          <motion.div
            key={match._id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Link 
              href={`/resume/jd-match/${match._id}`}
              className="group block"
            >
              <div className="flex flex-col md:flex-row items-center justify-between p-6 bg-white border border-hairline rounded-[18px] hover:border-action-blue transition-all duration-300 active:scale-[0.99]">
                <div className="flex items-center gap-6 w-full md:w-auto">
                  <div className="w-14 h-14 rounded-2xl bg-action-blue/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                    <Briefcase className="w-7 h-7 text-action-blue" />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h3 className="font-semibold text-xl text-ink group-hover:text-action-blue transition-colors">
                        {match.jobTitle || "Target Role"}
                      </h3>
                      <div className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 uppercase tracking-wider">
                        <Target className="w-3 h-3" />
                        {match.matchScore}% Match
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-ink/40">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Building2 className="w-4 h-4" />
                        {match.company || "Company"}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        {formatDate(match.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 md:mt-0 flex items-center gap-4 w-full md:w-auto justify-end">
                  <Button variant="ghost" className="rounded-pill text-action-blue font-medium hover:bg-action-blue/5 group/btn">
                    Explore Alignment
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
