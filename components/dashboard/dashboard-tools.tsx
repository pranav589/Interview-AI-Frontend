"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { FileText, Sparkles, Target, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const tools = [
  {
    title: "Resume Intelligence",
    description:
      "Audit your story with ATS analysis, matching, and professional building tools.",
    href: "/resume",
    icon: FileText,
    color: "text-action-blue",
    bgColor: "bg-action-blue/5",
    borderColor: "hover:border-action-blue/30",
    shadowColor: "hover:shadow-action-blue/10",
    tags: ["ATS Audit", "JD Matcher", "Builder"],
  },
  {
    title: "AI Interview Mock",
    description:
      "Practice with our adaptive AI that simulates real-world interview scenarios.",
    href: "/interview-setup",
    icon: Sparkles,
    color: "text-purple-500",
    bgColor: "bg-purple-500/5",
    borderColor: "hover:border-purple-500/30",
    shadowColor: "hover:shadow-purple-500/10",
    tags: ["Real-time", "Feedback", "Adaptive"],
  },
  {
    title: "Targeted JD Analysis",
    description:
      "Map your skills against any job description to find critical gaps instantly.",
    href: "/resume/jd-match",
    icon: Target,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/5",
    borderColor: "hover:border-emerald-500/30",
    shadowColor: "hover:shadow-emerald-500/10",
    tags: ["Skill Mapping", "Gap Analysis"],
  },
];

export function DashboardTools() {
  return (
    <section className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-display-xs font-semibold tracking-tight text-ink">
            Career Arsenal
          </h2>
          <p className="text-ink-muted text-sm mt-1">
            Specialized tools to elevate your professional narrative
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool, index) => (
          <motion.div
            key={tool.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <Link
              href={tool.href}
              className={cn(
                "group relative block h-full p-8 rounded-3xl bg-canvas border border-hairline transition-all duration-500",
                "hover:-translate-y-1 shadow-sm",
                tool.borderColor,
                tool.shadowColor,
              )}
            >
              <div className="flex flex-col h-full space-y-6">
                <div className="flex items-start justify-between">
                  <div className={cn("p-3 rounded-2xl", tool.bgColor)}>
                    <tool.icon className={cn("w-6 h-6", tool.color)} />
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <ArrowRight className="w-5 h-5 text-ink-muted" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-ink group-hover:text-action-blue transition-colors">
                    {tool.title}
                  </h3>
                  <p className="text-ink-muted text-sm leading-relaxed">
                    {tool.description}
                  </p>
                </div>

                <div className="pt-4 mt-auto flex flex-wrap gap-2">
                  {tool.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-full bg-canvas-parchment border border-hairline text-[10px] font-medium text-ink/60 uppercase tracking-wider"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div
                className={cn(
                  "absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 bg-gradient-to-br from-transparent to-canvas-parchment/50",
                )}
              />
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
