"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, RotateCcw, ChevronLeft, ChevronRight, MessageSquare, Plus } from "lucide-react";
import Link from "next/link";
import { useSuspenseInterviews } from "@/hooks/use-interviews";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import InterviewCard from "./interview-card";
import dynamic from "next/dynamic";
import { INTERVIEW_TYPES, DIFFICULTY_LEVELS } from "@/lib/constants";

const SampleReplay = dynamic(
  () => import("./sample-replay").then((mod) => mod.SampleReplay),
  { ssr: false }
);

export function RecentInterviewsList() {
  const [page, setPage] = useState(1);
  const [type, setType] = useState("all");
  const [difficulty, setDifficulty] = useState("all");

  const {
      data: interviewsResponse,
  } = useSuspenseInterviews({
    page,
    limit: 5,
    type: type !== "all" ? type : undefined,
    difficulty: difficulty !== "all" ? difficulty : undefined,
  });

  const interviews = interviewsResponse?.interviews;
  const pagination = interviewsResponse?.pagination;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border pb-6">
        <div>
          <h2 className="text-tagline font-semibold tracking-tight">Recent Interviews</h2>
          <p className="text-caption text-muted-foreground">
            History and detailed feedback from your sessions
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 mr-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filter:</span>
          </div>

          <Select
            value={type}
            onValueChange={(val) => {
              setType(val);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full sm:w-[140px] h-11 rounded-full bg-secondary border-hairline">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {INTERVIEW_TYPES.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={difficulty}
            onValueChange={(val) => {
              setDifficulty(val);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full sm:w-[140px] h-11 rounded-full bg-secondary border-hairline">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Difficulties</SelectItem>
              {DIFFICULTY_LEVELS.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {(type !== "all" || difficulty !== "all") && (
            <Button
              variant="ghost"
              size="sm"
              className="h-10 px-3 text-muted-foreground"
              onClick={() => {
                setType("all");
                setDifficulty("all");
                setPage(1);
              }}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          )}
        </div>
      </div>

      <div className="relative min-h-[300px]">
        {!Array.isArray(interviews) || interviews.length === 0 ? (
          <div className="text-center py-20 bg-muted/10 rounded-2xl border-2 border-dashed border-border/50">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center"
            >
              <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mb-6">
                <MessageSquare className="w-10 h-10 text-primary/40 animate-pulse" />
              </div>
              <h3 className="text-xl font-bold mb-2">
                {type !== "all" || difficulty !== "all"
                  ? "No results found"
                  : "Start your first interview"}
              </h3>
              <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
                {type !== "all" || difficulty !== "all"
                  ? "Try adjusting your filters to find what you're looking for."
                  : "Practice makes perfect. Start your first AI-powered interview practice session now."}
              </p>
              {type !== "all" || difficulty !== "all" ? (
                <Button
                  variant="outline"
                  onClick={() => {
                    setType("all");
                    setDifficulty("all");
                    setPage(1);
                  }}
                >
                  Clear All Filters
                </Button>
              ) : (
                <div className="space-y-12 w-full max-w-4xl mx-auto">
                  <Link href="/interview-setup">
                    <Button className="gap-2 h-12 px-8 font-bold text-lg">
                      <Plus className="w-5 h-5" />
                      Create Your First Interview
                    </Button>
                  </Link>

                  <div className="space-y-6">
                    <div className="flex items-center gap-3 justify-center text-muted-foreground mb-4">
                      <div className="h-[1px] w-12 bg-border" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">
                        See how it works
                      </span>
                      <div className="h-[1px] w-12 bg-border" />
                    </div>
                    <SampleReplay />
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 mb-8">
              {interviews.map((interview, index) => (
                <motion.div
                  key={interview._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <InterviewCard interview={interview} />
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-6 mt-12 py-4">
                <Button
                  variant="ghost"
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={page === 1}
                  className="gap-2"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Previous
                </Button>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-primary">{page}</span>
                  <span className="text-muted-foreground">/</span>
                  <span className="text-muted-foreground">
                    {pagination.totalPages}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  onClick={() =>
                    setPage((prev) =>
                      Math.min(pagination.totalPages, prev + 1),
                    )
                  }
                  disabled={page === pagination.totalPages}
                  className="gap-2"
                >
                  Next
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
