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
        <div>
          <h2 className="text-4xl font-semibold tracking-[-0.03em] text-ink mb-3">Match Vault</h2>
          <p className="text-lg text-ink-secondary opacity-70">Review your past role alignments and AI-optimized resumes.</p>
        </div>
        <div className="bg-canvas-parchment border border-hairline px-4 py-2 rounded-full text-sm font-medium text-ink-secondary">
          {matches.length} Total Matches
        </div>
      </div>

      <div className="grid gap-6">
        {matches.map((match, index) => (
          <motion.div
            key={match._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="group hover:border-action-blue transition-all duration-300 overflow-hidden bg-white border-hairline rounded-[24px]">
              <CardContent className="p-0">
                <Link 
                  href={`/resume/jd-match/${match._id}`}
                  className="flex flex-col md:flex-row md:items-center justify-between p-8 w-full gap-8"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-canvas flex items-center justify-center group-hover:bg-action-blue/10 group-hover:text-action-blue transition-all duration-300 text-ink-secondary">
                      <Briefcase className="w-8 h-8" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <h3 className="font-semibold text-xl text-ink group-hover:text-action-blue transition-colors">
                          {match.jobTitle || "Target Role"}
                        </h3>
                        <div className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1.5">
                          <Target className="w-3.5 h-3.5" />
                          {match.matchScore}% Match
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-ink-secondary opacity-60">
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
                  
                  <div className="flex items-center gap-4 self-end md:self-center">
                    <span className="text-action-blue font-semibold text-sm opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0 duration-300">
                      Explore Alignment
                    </span>
                    <div className="w-12 h-12 rounded-full border border-hairline flex items-center justify-center group-hover:border-action-blue group-hover:bg-action-blue group-hover:text-white transition-all duration-300">
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </div>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
