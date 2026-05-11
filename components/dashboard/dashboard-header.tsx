"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardHeaderProps {
  userName?: string;
}

export function DashboardHeader({ userName }: DashboardHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6"
    >
      <div>
        <h1 className="text-display-md font-semibold tracking-tight mb-2">
          Welcome back, {userName || "Practitioner"}!
        </h1>
        <p className="text-ink-muted text-body">
          Continue practicing and improving your interview skills
        </p>
      </div>
      <Link href="/interview-setup">
        <Button
          size="lg"
          className="gap-2 h-12 px-6 text-white shadow-apple-card hover:scale-[1.02] transition-transform"
        >
          <Plus className="w-5 h-5" />
          Start New Practice
        </Button>
      </Link>
    </motion.div>
  );
}
