"use client";

import React from "react";
import { Check, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ResumeProgressBarProps {
  completionMap: Record<string, boolean>;
}

const FIELDS = [
  { key: "personalInfo", label: "Profile" },
  { key: "summary", label: "Summary" },
  { key: "experience", label: "Experience" },
  { key: "education", label: "Education" },
  { key: "skills", label: "Skills" },
  { key: "projects", label: "Projects" },
  { key: "certifications", label: "Certs" },
];

export function ResumeProgressBar({ completionMap }: ResumeProgressBarProps) {
  const completedCount = FIELDS.filter((f) => completionMap[f.key]).length;
  const progress = (completedCount / FIELDS.length) * 100;

  return (
    <div className="w-full bg-background backdrop-blur-md border-b border-black/5 py-4 px-6 sticky top-0 z-20">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-ink uppercase tracking-widest">
            Builder Progress
          </span>
          <span className="text-xs font-bold text-black/60">
            {completedCount} of {FIELDS.length} Sections
          </span>
        </div>

        <div className="relative h-1.5 w-full bg-black/5 rounded-full overflow-hidden mb-6">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ type: "spring", stiffness: 50, damping: 20 }}
            className="absolute top-0 left-0 h-full bg-blue-600 rounded-full"
          />
        </div>

        <div className="flex justify-between">
          {FIELDS.map((field, idx) => {
            const isComplete = completionMap[field.key];
            return (
              <div key={field.key} className="flex flex-col items-center gap-2 group">
                <div
                  className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300",
                    isComplete
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                      : "bg-ink/5 text-ink/20 group-hover:bg-ink/10"
                  )}
                >
                  {isComplete ? (
                    <Check className="w-3.5 h-3.5" strokeWidth={3} />
                  ) : (
                    <span className="text-[10px] font-bold">{idx + 1}</span>
                  )}
                </div>
                <span
                  className={cn(
                    "text-[10px] font-medium transition-colors duration-300",
                    isComplete ? "text-ink" : "text-ink/60"
                  )}
                >
                  {field.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
